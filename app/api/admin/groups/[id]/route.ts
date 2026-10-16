import { NextResponse } from "next/server";

import { requireAdminPermission } from "@/lib/admin";
import { adminApiError } from "@/lib/admin-api";
import { nowInstant, toInstant } from "@/lib/dates";
import { db } from "@/lib/db";

const GROUP_TYPES = new Set([
  "Sanggar",
  "Komunitas",
  "Group",
  "Asosiasi / Himpunan Profesi",
  "Padepokan",
  "Lainnya",
]);

function text(value: unknown) { return typeof value === "string" ? value.trim() : ""; }
function slugify(value: string) { return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""); }
function integer(value: unknown) { if (typeof value === "number" && Number.isInteger(value)) return value; if (typeof value === "string" && value.trim() !== "") { const parsed = Number(value); return Number.isInteger(parsed) ? parsed : null; } return null; }

export async function GET(_: Request, context: { params: Promise<{ id: string }> }) {
  try {
    await requireAdminPermission("group.view");
    const { id } = await context.params;
    const group = (await db.orm.public.CulturalGroup.where({ id }).all())[0];
    if (!group) return NextResponse.json({ success: false, message: "Kelompok tidak ditemukan." }, { status: 404 });
    return NextResponse.json({ success: true, data: group });
  } catch (error) { return adminApiError(error, "Gagal mengambil kelompok."); }
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const action = text(body.action);

    if (action) {
      const session = await requireAdminPermission("group.verify");
      const existing = await db.orm.public.CulturalGroup.first({ id });
      if (!existing) return NextResponse.json({ success: false, message: "Kelompok tidak ditemukan." }, { status: 404 });

      if (action === "verify") {
        if (existing.registrationStatus !== "PENDING") return NextResponse.json({ success: false, message: "Hanya pendaftaran PENDING yang dapat diverifikasi." }, { status: 409 });
        const updated = await db.orm.public.CulturalGroup.where({ id }).update({ registrationStatus: "VERIFIED", verifiedAt: nowInstant(), verifiedBy: session.userId, updatedAt: nowInstant() });
        return NextResponse.json({ success: true, data: updated });
      }

      if (action === "issue-card") {
        if (!["VERIFIED", "ACTIVE"].includes(existing.registrationStatus)) return NextResponse.json({ success: false, message: "Verifikasi pendaftaran sebelum menerbitkan kartu." }, { status: 409 });
        const updated = await db.orm.public.CulturalGroup.where({ id }).update({ registrationStatus: "ACTIVE", cardIssuedAt: existing.cardIssuedAt ?? nowInstant(), updatedAt: nowInstant() });
        return NextResponse.json({ success: true, data: updated });
      }

      return NextResponse.json({ success: false, message: "Tindakan pendaftaran tidak dikenal." }, { status: 400 });
    }

    await requireAdminPermission("group.update");
    const name = text(body.name);
    const slug = slugify(text(body.slug) || name);
    const committeeId = text(body.committeeId) || null;
    const groupType = text(body.groupType) || "Sanggar";
    if (!name || !slug) return NextResponse.json({ success: false, message: "Nama dan slug wajib diisi." }, { status: 400 });
    if (!GROUP_TYPES.has(groupType)) return NextResponse.json({ success: false, message: "Jenis kelompok tidak valid." }, { status: 400 });
    const existing = await db.orm.public.CulturalGroup.first({ id });
    if (!existing) return NextResponse.json({ success: false, message: "Kelompok tidak ditemukan." }, { status: 404 });
    const updated = await db.orm.public.CulturalGroup.where({ id }).update({ name, slug, committeeId, groupType, description: text(body.description) || null, leader: text(body.leader) || null, address: text(body.address) || null, email: text(body.email) || null, phone: text(body.phone) || null, website: text(body.website) || null, logo: text(body.logo) || null, establishedDate: toInstant(body.establishedDate), memberCount: integer(body.memberCount), skNumber: body.skNumber === undefined ? existing.skNumber : text(body.skNumber) || null, skDate: body.skDate === undefined ? existing.skDate : toInstant(body.skDate), skFileUrl: body.skFileUrl === undefined ? existing.skFileUrl : text(body.skFileUrl) || null, sortOrder: Number.isInteger(body.sortOrder) ? body.sortOrder : 0, isFeatured: body.isFeatured === true, isActive: body.isActive !== false, updatedAt: nowInstant() });
    return NextResponse.json({ success: true, data: updated });
  } catch (error) { return adminApiError(error, "Gagal mengubah kelompok."); }
}

export async function DELETE(_: Request, context: { params: Promise<{ id: string }> }) {
  try {
    await requireAdminPermission("group.delete");
    const { id } = await context.params;
    await db.orm.public.CulturalGroup.where({ id }).delete();
    return NextResponse.json({ success: true });
  } catch (error) { return adminApiError(error, "Gagal menghapus kelompok."); }
}