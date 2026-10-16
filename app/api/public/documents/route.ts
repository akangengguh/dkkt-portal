import { NextResponse } from "next/server";

import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const documents = await db.orm.public.Document.all();

    return NextResponse.json({
      success: true,
      data: documents
        .filter((item) => item.isPublished)
        .sort((a, b) => a.sortOrder - b.sortOrder),
    });
  } catch {
    return NextResponse.json(
      { success: false, message: "Gagal mengambil dokumen.", data: [] },
      { status: 500 },
    );
  }
}
