import { NextResponse } from "next/server";

import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const [items, albums, committees] = await Promise.all([
      db.orm.public.GalleryItem.all(),
      db.orm.public.GalleryAlbum.all(),
      db.orm.public.Committee.all(),
    ]);
    const activeAlbums = new Set(albums.filter((item) => item.isActive).map((item) => item.id));
    const committeeMap = new Map(committees.map((item) => [item.id, { name: item.name, slug: item.slug }]));

    return NextResponse.json({
      success: true,
      data: items.filter((item) => item.isActive && activeAlbums.has(item.albumId)).map((item) => ({
        ...item,
        committee: item.committeeId ? committeeMap.get(item.committeeId) ?? null : null,
      })),
    });
  } catch {
    return NextResponse.json({ success: false, message: "Gagal mengambil galeri.", data: [] }, { status: 500 });
  }
}
