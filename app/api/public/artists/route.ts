import { NextResponse } from "next/server";

import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const artists = await db.orm.public.Artist.all();
  return NextResponse.json({ success: true, data: artists.filter((item) => item.isActive && item.registrationStatus === "ACTIVE").sort((a, b) => a.sortOrder - b.sortOrder) });
}