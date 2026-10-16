import { NextResponse } from "next/server";

import { requireAdminPermission } from "@/lib/admin";
import { adminApiError } from "@/lib/admin-api";
import { nowInstant, toInstant } from "@/lib/dates";
import { db } from "@/lib/db";

function text(value: unknown) { return typeof value === "string" ? value.trim() : ""; }
function slugify(value: string) { return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""); }

export async function GET(_: Request, context: { params: Promise<{ id: string }> }) {
  try {
    await requireAdminPermission("artist.view");
    const { id } = await context.params;
    const artist = (await db.orm.public.Artist.where({ id }).all())[0];
    if (!artist) return NextResponse.json({ success: false, message: "Seniman tidak ditemukan." }, { status: 404 });
    return NextResponse.json({ success: true, data: artist });
  } catch (error) { return adminApiError(error, "Gagal mengambil seniman."); }
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const action = text(body.action);

    if (action) {
      const session = await requireAdminPermission("artist.verify");
      const existing = await db.orm.public.Artist.first({ id });
      if (!existing) return NextResponse.json({ success: false, message: "Seniman tidak ditemukan." }, { status: 404 });

      if (action === "verify") {
        if (existing.registrationStatus !== "PENDING") return NextResponse.json({ success: false, message: "Hanya pendaftaran PENDING yang dapat diverifikasi." }, { status: 409 });
        const updated = await db.orm.public.Artist.where({ id }).update({ registrationStatus: "VERIFIED", verifiedAt: nowInstant(), verifiedBy: session.userId, updatedAt: nowInstant() });
        return NextResponse.json({ success: true, data: updated });
      }

      if (action === "issue-card") {
        if (!["VERIFIED", "ACTIVE"].includes(existing.registrationStatus)) return NextResponse.json({ success: false, message: "Verifikasi pendaftaran sebelum menerbitkan kartu." }, { status: 409 });
        const updated = await db.orm.public.Artist.where({ id }).update({ registrationStatus: "ACTIVE", cardIssuedAt: existing.cardIssuedAt ?? nowInstant(), updatedAt: nowInstant() });
        return NextResponse.json({ success: true, data: updated });
      }

      return NextResponse.json({ success: false, message: "Tindakan pendaftaran tidak dikenal." }, { status: 400 });
    }

    await requireAdminPermission("artist.update");
    const name = text(body.name);
    const slug = slugify(text(body.slug) || name);
    const committeeId = text(body.committeeId) || null;
    if (!name || !slug) return NextResponse.json({ success: false, message: "Nama dan slug wajib diisi." }, { status: 400 });
    const existing = await db.orm.public.Artist.first({ id });
    if (!existing) return NextResponse.json({ success: false, message: "Seniman tidak ditemukan." }, { status: 404 });
    const updated = await db.orm.public.Artist.where({ id }).update({ name, slug, committeeId, discipline: text(body.discipline) || null, biography: text(body.biography) || null, photo: text(body.photo) || null, email: text(body.email) || null, phone: text(body.phone) || null, website: text(body.website) || null, birthPlace: text(body.birthPlace) || null, birthDate: toInstant(body.birthDate), gender: text(body.gender) || null, address: text(body.address) || null, skNumber: body.skNumber === undefined ? existing.skNumber : text(body.skNumber) || null, skDate: body.skDate === undefined ? existing.skDate : toInstant(body.skDate), skFileUrl: body.skFileUrl === undefined ? existing.skFileUrl : text(body.skFileUrl) || null, sortOrder: Number.isInteger(body.sortOrder) ? body.sortOrder : 0, isFeatured: body.isFeatured === true, isActive: body.isActive !== false, updatedAt: nowInstant() });
    return NextResponse.json({ success: true, data: updated });
  } catch (error) { return adminApiError(error, "Gagal mengubah seniman."); }
}

export async function DELETE(_: Request, context: { params: Promise<{ id: string }> }) {
  try {
    await requireAdminPermission("artist.delete");
    const { id } = await context.params;
    await db.orm.public.Artist.where({ id }).delete();
    return NextResponse.json({ success: true });
  } catch (error) { return adminApiError(error, "Gagal menghapus seniman."); }
}