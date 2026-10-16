import { NextResponse } from "next/server";

import { requireAdminPermission } from "@/lib/admin";
import { adminApiError } from "@/lib/admin-api";
import { db } from "@/lib/db";

function text(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export async function GET() {
  try {
    await requireAdminPermission("organization.view");

    const sections = (await db.orm.public.OrganizationSection.all()).filter((section) => section.name.trim().toLowerCase() !== "pembina");
    const members = await db.orm.public.OrganizationMember.all();

    const memberMap = new Map<string, typeof members>();
    for (const member of members) {
      const group = memberMap.get(member.sectionId) || [];
      group.push(member);
      memberMap.set(member.sectionId, group);
    }

    const artists = await db.orm.public.Artist.all();
    const artistMap = new Map(artists.map((artist) => [artist.id, artist]));
    const data = sections
      .map((section) => ({
        ...section,
        members: (memberMap.get(section.id) || [])
          .map((member) => {
            const artist = member.artistId ? artistMap.get(member.artistId) : undefined;
            return {
              ...member,
              name: artist?.name || member.name,
              photo: artist?.photo || member.photo,
              biography: artist?.discipline || member.biography,
              registrationNumber: artist?.registrationNumber || null,
            };
          })
          .sort((a, b) => a.sortOrder - b.sortOrder),
      }))
      .sort((a, b) => a.sortOrder - b.sortOrder);

    return NextResponse.json({ success: true, data });
  } catch (error) {
    return adminApiError(error, "Gagal mengambil struktur organisasi.");
  }
}

export async function POST(request: Request) {
  try {
    await requireAdminPermission("organization.create");

    const body = await request.json();
    const name = text(body.name);
    const slug = slugify(text(body.slug) || name);

    if (name.trim().toLowerCase() === "pembina") {
      return NextResponse.json({ success: false, message: "Bagian Pembina ditetapkan secara resmi dan tidak dikelola melalui CMS." }, { status: 400 });
    }

    if (!name || !slug) {
      return NextResponse.json(
        {
          success: false,
          message: "Nama dan slug wajib diisi.",
        },
        { status: 400 },
      );
    }

    const members = Array.isArray(body.members) ? body.members.filter((member: Record<string, unknown>) => member.artistId || text(member.name) || text(member.position)) : [];
    const artists = await db.orm.public.Artist.all();
    const artistMap = new Map(artists.map((artist) => [artist.id, artist]));
    for (const member of members) {
      const artist = artistMap.get(text(member?.artistId));
      if (!artist || !artist.isActive || artist.registrationStatus !== "ACTIVE") {
        return NextResponse.json({ success: false, message: "Pilih seniman aktif dan terverifikasi untuk setiap anggota struktur." }, { status: 400 });
      }
    }

    const section = await db.transaction(async (tx) => {
      const createdSection = await tx.orm.public.OrganizationSection.create({
        name,
        slug,
        description: text(body.description) || null,
        sortOrder: Number.isInteger(body.sortOrder) ? body.sortOrder : 0,
        isActive: body.isActive !== false,
      });

      for (const rawMember of members) {
        const memberPosition = text(rawMember?.position);
        const artist = artistMap.get(text(rawMember?.artistId));
        if (!artist) throw new Error("Pilih seniman aktif dan terverifikasi untuk setiap anggota struktur.");

        await tx.orm.public.OrganizationMember.create({
          sectionId: createdSection.id,
          artistId: artist.id,
          name: artist.name,
          position: memberPosition || "Anggota",
          photo: artist.photo || null,
          biography: artist.biography || artist.discipline || null,
          sortOrder: Number.isInteger(rawMember?.sortOrder)
            ? Number(rawMember.sortOrder)
            : 0,
          isActive: rawMember?.isActive !== false,
        });
      }

      return createdSection;
    });

    return NextResponse.json({ success: true, data: section }, { status: 201 });
  } catch (error) {
    return adminApiError(error, "Gagal menyimpan struktur organisasi.");
  }
}
