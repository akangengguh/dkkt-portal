import { NextResponse } from "next/server";

import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const [committees, artists] = await Promise.all([
    db.orm.public.Committee.where({ isActive: true }).all(),
    db.orm.public.Artist.where({ isActive: true, registrationStatus: "ACTIVE" }).all(),
  ]);
  const artistMap = new Map(artists.map((artist) => [artist.id, artist]));
  const data = committees
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((committee) => {
      const chairman = committee.chairmanArtistId ? artistMap.get(committee.chairmanArtistId) : undefined;
      return {
        ...committee,
        chairman: chairman?.name || null,
        chairmanRegistrationNumber: chairman?.registrationNumber || null,
        chairmanPhoto: chairman?.photo || null,
      };
    });
  return NextResponse.json({ success: true, data });
}
