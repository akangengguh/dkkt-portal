import { NextResponse } from "next/server";

import { db } from "@/lib/db";

export async function GET() {
  try {
    const sections = await db.orm.public.OrganizationSection
      .where({ isActive: true })
      .all();

    const members = await db.orm.public.OrganizationMember
      .where({ isActive: true })
      .all();

    const memberMap = new Map<string, typeof members>();

    for (const member of members) {
      const list = memberMap.get(member.sectionId) || [];
      list.push(member);
      memberMap.set(member.sectionId, list);
    }

    const artists = await db.orm.public.Artist
      .where({ isActive: true, registrationStatus: "ACTIVE" })
      .all();
    const artistMap = new Map(artists.map((artist) => [artist.id, artist]));
    const data = sections
      .filter((section) => section.name.trim().toLowerCase() !== "pembina")
      .map((section) => ({
        ...section,
        members: (memberMap.get(section.id) || [])
          .flatMap((member) => {
            const artist = member.artistId ? artistMap.get(member.artistId) : undefined;
            if (!artist) return [];
            return [{
              ...member,
              name: artist.name,
              photo: artist.photo,
              biography: artist.biography || artist.discipline,
              registrationNumber: artist.registrationNumber,
            }];
          })
          .sort((a, b) => a.sortOrder - b.sortOrder),
      }))
      .sort((a, b) => a.sortOrder - b.sortOrder);

    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Gagal mengambil data organisasi.",
      },
      { status: 500 },
    );
  }
}
