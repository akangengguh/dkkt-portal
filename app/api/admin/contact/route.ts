import { NextResponse } from "next/server";

import { requireAdminPermission } from "@/lib/admin";
import { adminApiError } from "@/lib/admin-api";
import { nowInstant } from "@/lib/dates";
import { db } from "@/lib/db";

const statuses = new Set(["UNREAD", "READ", "REPLIED", "ARCHIVED"]);

function text(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export async function GET(request: Request) {
  try {
    await requireAdminPermission("contact.view");

    const status = new URL(request.url).searchParams.get("status");
    const messages = await db.orm.public.ContactMessage.all();
    const data = messages
      .filter((item) => !status || !statuses.has(status) || item.status === status)
      .sort(
        (a, b) =>
          new Date(String(b.createdAt)).getTime() -
          new Date(String(a.createdAt)).getTime(),
      );

    return NextResponse.json({ success: true, data });
  } catch (error) {
    return adminApiError(error, "Gagal mengambil pesan.");
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await requireAdminPermission("contact.update");
    const body = await request.json();
    const id = text(body.id);
    const status = text(body.status).toUpperCase();

    if (!id || !statuses.has(status)) {
      return NextResponse.json(
        { success: false, message: "Pesan dan status yang valid wajib dipilih." },
        { status: 400 },
      );
    }

    const existing = (await db.orm.public.ContactMessage.where({ id }).all())[0];
    if (!existing) {
      return NextResponse.json(
        { success: false, message: "Pesan tidak ditemukan." },
        { status: 404 },
      );
    }

    const updated = await db.orm.public.ContactMessage.where({ id }).update({
        status,
        repliedAt: status === "REPLIED" ? nowInstant() : existing.repliedAt,
        repliedBy: status === "REPLIED" ? session.userId : existing.repliedBy,
        updatedAt: nowInstant(),
      });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    return adminApiError(error, "Gagal mengubah status pesan.");
  }
}