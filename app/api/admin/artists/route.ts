import { NextResponse } from "next/server";

import { requireAdminPermission } from "@/lib/admin";
import { adminApiError } from "@/lib/admin-api";
import { nowInstant, toInstant } from "@/lib/dates";
import { db } from "@/lib/db";

function text(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export async function GET() {
  try {
    await requireAdminPermission("artist.view");
    const data = await db.orm.public.Artist.all();
    return NextResponse.json({ success: true, data: data.sort((a, b) => a.sortOrder - b.sortOrder) });
  } catch (error) { return adminApiError(error, "Gagal mengambil seniman."); }
}

export async function POST(request: Request) {
  try {
    await requireAdminPermission("artist.create");
    const body = await request.json();
    const name = text(body.name);
    const slug = slugify(text(body.slug) || name);
    const committeeId = text(body.committeeId) || null;

    if (!name || !slug) return NextResponse.json({ success: false, message: "Nama dan slug wajib diisi." }, { status: 400 });

    const artist = await db.transaction(async (tx) => {
      const committee = committeeId ? (await tx.orm.public.Committee.where({ id: committeeId }).all())[0] : null;
      const year = new Date().getFullYear();
      const committeeCode = committee ? String(Math.max(0, committee.sortOrder + 1)).padStart(2, "0") : "00";
      const scopeKey = `ARTIST:${committeeId || "UMUM"}:${year}`;
      const sequence = (await tx.orm.public.RegistrationSequence.where({ scopeKey }).all())[0];
      const nextNumber = (sequence?.lastNumber || 0) + 1;
      if (sequence) {
        await tx.orm.public.RegistrationSequence.where({ id: sequence.id }).update({ lastNumber: nextNumber, updatedAt: nowInstant() });
      } else {
        await tx.orm.public.RegistrationSequence.create({ scopeKey, category: "ARTIST", committeeId, year, lastNumber: nextNumber });
      }

      return tx.orm.public.Artist.create({
        registrationNumber: `1${year}${committeeCode}${String(nextNumber).padStart(4, "0")}`,
        registrationStatus: "PENDING",
        name,
        slug,
        committeeId,
        discipline: text(body.discipline) || null,
        biography: text(body.biography) || null,
        photo: text(body.photo) || null,
        email: text(body.email) || null,
        phone: text(body.phone) || null,
        website: text(body.website) || null,
        birthPlace: text(body.birthPlace) || null,
        birthDate: toInstant(body.birthDate),
        gender: text(body.gender) || null,
        address: text(body.address) || null,
        skNumber: text(body.skNumber) || null,
        skDate: toInstant(body.skDate),
        skFileUrl: text(body.skFileUrl) || null,
        sortOrder: Number.isInteger(body.sortOrder) ? body.sortOrder : 0,
        isFeatured: body.isFeatured === true,
        isActive: body.isActive !== false,
        registeredAt: nowInstant(),
        verifiedAt: null,
        verifiedBy: null,
        cardIssuedAt: null,
        cardFileUrl: null,
      });
    });

    return NextResponse.json({ success: true, data: artist }, { status: 201 });
  } catch (error) { return adminApiError(error, "Gagal menyimpan seniman."); }
}