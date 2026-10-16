import { NextResponse } from "next/server";

import { requireAdminPermission } from "@/lib/admin";
import { adminApiError } from "@/lib/admin-api";
import { nowInstant } from "@/lib/dates";
import { db } from "@/lib/db";

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    await requireAdminPermission("committee.update");
    const { id } = await context.params;
    const body = await request.json();
    const artistId = typeof body.artistId === "string" ? body.artistId.trim() : "";
    const committee = await db.orm.public.Committee.first({ id });
    if (!committee) return NextResponse.json({ success: false, message: "Komite tidak ditemukan." }, { status: 404 });

    if (!artistId) {
      const updated = await db.orm.public.Committee.where({ id }).update({ chairmanArtistId: null, chairman: null, updatedAt: nowInstant() });
      return NextResponse.json({ success: true, data: updated });
    }

    const artist = await db.orm.public.Artist.first({ id: artistId });
    if (!artist || !artist.isActive || artist.registrationStatus !== "ACTIVE") {
      return NextResponse.json({ success: false, message: "Ketua harus dipilih dari seniman aktif dan terverifikasi." }, { status: 400 });
    }

    const updated = await db.orm.public.Committee.where({ id }).update({ chairmanArtistId: artist.id, chairman: artist.name, updatedAt: nowInstant() });
    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    return adminApiError(error, "Gagal memperbarui ketua komite.");
  }
}
