import { NextResponse } from "next/server";

import { requireAdminPermission } from "@/lib/admin";
import { adminApiError } from "@/lib/admin-api";
import { nowInstant } from "@/lib/dates";
import { db } from "@/lib/db";

function text(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function isPembina(value: string) {
  return value.trim().toLowerCase() === "pembina";
}

export async function GET(_: Request, context: { params: Promise<{ id: string }> }) {
  try {
    await requireAdminPermission("organization.view");
    const { id } = await context.params;
    const section = await db.orm.public.OrganizationSection.first({ id });
    if (!section || isPembina(section.name)) {
      return NextResponse.json({ success: false, message: "Bagian organisasi tidak ditemukan." }, { status: 404 });
    }

    const [members, artists] = await Promise.all([
      db.orm.public.OrganizationMember.where({ sectionId: id }).all(),
      db.orm.public.Artist.all(),
    ]);
    const artistMap = new Map(artists.map((artist) => [artist.id, artist]));
    const resolvedMembers = members.map((member) => {
      const artist = member.artistId ? artistMap.get(member.artistId) : undefined;
      return {
        ...member,
        name: artist?.name || member.name,
        photo: artist?.photo || member.photo,
        biography: artist?.discipline || member.biography,
        registrationNumber: artist?.registrationNumber || null,
      };
    }).sort((a, b) => a.sortOrder - b.sortOrder);

    return NextResponse.json({ success: true, data: { ...section, members: resolvedMembers } });
  } catch (error) {
    return adminApiError(error, "Gagal mengambil bagian organisasi.");
  }
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    await requireAdminPermission("organization.update");
    const { id } = await context.params;
    const body = await request.json();
    const section = await db.orm.public.OrganizationSection.first({ id });
    if (!section) return NextResponse.json({ success: false, message: "Bagian organisasi tidak ditemukan." }, { status: 404 });
    if (isPembina(section.name)) return NextResponse.json({ success: false, message: "Bagian Pembina ditetapkan secara resmi dan tidak dikelola melalui CMS." }, { status: 400 });

    const name = text(body.name);
    const slug = slugify(text(body.slug) || name);
    if (!name || !slug) return NextResponse.json({ success: false, message: "Nama dan slug wajib diisi." }, { status: 400 });
    if (isPembina(name)) return NextResponse.json({ success: false, message: "Nama Pembina ditetapkan secara resmi dan tidak dapat dimasukkan melalui CMS." }, { status: 400 });

    const members = (Array.isArray(body.members) ? body.members : [])
      .filter((member: Record<string, unknown>) => member.artistId || text(member.name) || text(member.position));
    const [allArtists, existingMembers] = await Promise.all([
      db.orm.public.Artist.all(),
      db.orm.public.OrganizationMember.where({ sectionId: id }).all(),
    ]);
    const artistMap = new Map(allArtists.map((artist) => [artist.id, artist]));
    const existingMemberMap = new Map(existingMembers.map((member) => [member.id, member]));

    for (const member of members) {
      const artistId = text(member.artistId);
      const memberId = text(member.id);
      const existing = memberId ? existingMemberMap.get(memberId) : undefined;
      const effectiveArtistId = artistId || existing?.artistId || "";
      const artist = effectiveArtistId ? artistMap.get(effectiveArtistId) : undefined;
      if (!artist || !artist.isActive || artist.registrationStatus !== "ACTIVE") {
        return NextResponse.json({ success: false, message: "Pilih seniman aktif dan terverifikasi untuk setiap anggota struktur." }, { status: 400 });
      }
    }

    const updated = await db.transaction(async (tx) => {
      await tx.orm.public.OrganizationSection.where({ id }).update({
        name,
        slug,
        description: text(body.description) || null,
        sortOrder: Number.isInteger(body.sortOrder) ? body.sortOrder : 0,
        isActive: body.isActive !== false,
        updatedAt: nowInstant(),
      });

      const transactionMembers = await tx.orm.public.OrganizationMember.where({ sectionId: id }).all();
      const transactionMemberMap = new Map(transactionMembers.map((member) => [member.id, member]));
      const retainedIds = new Set<string>();

      for (const rawMember of members) {
        const memberId = text(rawMember.id);
        const artistId = text(rawMember.artistId);
        const existing = memberId ? transactionMemberMap.get(memberId) : undefined;
        const artist = artistId ? artistMap.get(artistId) : undefined;
        const effectiveArtistId = artist?.id || existing?.artistId;
        const effectiveArtist = effectiveArtistId ? artistMap.get(effectiveArtistId) : undefined;
        if (!effectiveArtist) throw new Error("Pilih seniman aktif dan terverifikasi untuk setiap anggota struktur.");
        const position = text(rawMember.position) || existing?.position || "Anggota";
        const sortOrder = Number.isInteger(rawMember.sortOrder) ? Number(rawMember.sortOrder) : existing?.sortOrder || 0;
        const isActive = rawMember.isActive !== false;

        if (existing) {
          await tx.orm.public.OrganizationMember.where({ id: existing.id }).update({
            artistId: effectiveArtist.id,
            name: effectiveArtist.name,
            position,
            photo: effectiveArtist.photo || null,
            biography: effectiveArtist.biography || effectiveArtist.discipline || null,
            sortOrder,
            isActive,
            updatedAt: nowInstant(),
          });
          retainedIds.add(existing.id);
        } else {
          const created = await tx.orm.public.OrganizationMember.create({
            sectionId: id,
            artistId: effectiveArtist.id,
            name: effectiveArtist.name,
            position,
            photo: effectiveArtist.photo || null,
            biography: effectiveArtist.biography || effectiveArtist.discipline || null,
            sortOrder,
            isActive,
          });
          retainedIds.add(created.id);
        }
      }

      for (const member of transactionMembers) {
        if (!retainedIds.has(member.id)) await tx.orm.public.OrganizationMember.where({ id: member.id }).delete();
      }
      return tx.orm.public.OrganizationSection.first({ id });
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    return adminApiError(error, "Gagal memperbarui bagian organisasi.");
  }
}

export async function DELETE(_: Request, context: { params: Promise<{ id: string }> }) {
  try {
    await requireAdminPermission("organization.delete");
    const { id } = await context.params;
    const section = await db.orm.public.OrganizationSection.first({ id });
    if (!section) return NextResponse.json({ success: false, message: "Bagian organisasi tidak ditemukan." }, { status: 404 });
    if (isPembina(section.name)) return NextResponse.json({ success: false, message: "Bagian Pembina ditetapkan secara resmi dan tidak dapat dihapus dari CMS." }, { status: 400 });
    await db.orm.public.OrganizationSection.where({ id }).delete();
    return NextResponse.json({ success: true });
  } catch (error) {
    return adminApiError(error, "Gagal menghapus bagian organisasi.");
  }
}