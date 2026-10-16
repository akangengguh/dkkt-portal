import { NextResponse } from "next/server";

import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(_: Request, context: { params: Promise<{ slug: string }> }) {
  const { slug } = await context.params;
  const committee = await db.orm.public.Committee.first({ slug, isActive: true });
  if (!committee) return NextResponse.json({ success: false, message: "Komite tidak ditemukan." }, { status: 404 });

  const [members, artists] = await Promise.all([
    db.orm.public.CommitteeMember.where({ committeeId: committee.id, isActive: true }).all(),
    db.orm.public.Artist.where({ isActive: true, registrationStatus: "ACTIVE" }).all(),
  ]);
  const artistMap = new Map(artists.map((artist) => [artist.id, artist]));
  const chairman = committee.chairmanArtistId ? artistMap.get(committee.chairmanArtistId) : undefined;
  const data = {
    ...committee,
    chairman: chairman?.name || null,
    chairmanRegistrationNumber: chairman?.registrationNumber || null,
    chairmanPhoto: chairman?.photo || null,
    members: members.sort((a, b) => a.sortOrder - b.sortOrder),
  };
  return NextResponse.json({ success: true, data });
}
