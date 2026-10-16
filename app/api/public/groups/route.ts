import { NextResponse } from "next/server";

import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const groups = await db.orm.public.CulturalGroup.all();
  return NextResponse.json({ success: true, data: groups.filter((item) => item.isActive && item.registrationStatus === "ACTIVE").sort((a, b) => a.sortOrder - b.sortOrder) });
}