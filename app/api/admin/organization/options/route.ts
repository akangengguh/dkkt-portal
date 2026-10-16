import { NextResponse } from "next/server";

import { requireAdminPermission } from "@/lib/admin";
import { adminApiError } from "@/lib/admin-api";
import { db } from "@/lib/db";

export async function GET() {
  try {
    await requireAdminPermission("organization.view");
    const artists = await db.orm.public.Artist.all();
    const data = artists
      .filter((artist) => artist.isActive && artist.registrationStatus === "ACTIVE")
      .sort((a, b) => a.registrationNumber.localeCompare(b.registrationNumber))
      .map((artist) => ({
        id: artist.id,
        registrationNumber: artist.registrationNumber,
        name: artist.name,
        photo: artist.photo,
        discipline: artist.discipline,
      }));
    return NextResponse.json({ success: true, artists: data });
  } catch (error) {
    return adminApiError(error, "Gagal mengambil daftar seniman terverifikasi.");
  }
}
