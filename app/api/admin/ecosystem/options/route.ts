import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/admin";
import { adminApiError } from "@/lib/admin-api";
import { db } from "@/lib/db";
import { requireAnyPermission } from "@/lib/permissions";

export async function GET() {
  try {
    const session = await requireAdmin();
    await requireAnyPermission(session.userId, ["artist.view", "artist.create", "group.view", "group.create"]);
    const committees = await db.orm.public.Committee.all();
    return NextResponse.json({
      success: true,
      committees: committees.filter((item) => item.isActive).sort((a, b) => a.sortOrder - b.sortOrder),
    });
  } catch (error) { return adminApiError(error, "Gagal mengambil opsi ekosistem."); }
}