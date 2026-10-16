import { NextResponse } from "next/server";

import { requireAdminPermission } from "@/lib/admin";
import { adminApiError } from "@/lib/admin-api";
import { nowInstant } from "@/lib/dates";
import { db } from "@/lib/db";

function text(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export async function GET() {
  try {
    await requireAdminPermission("settings.view");
    const settings = await db.orm.public.SiteSetting.all();

    return NextResponse.json({
      success: true,
      data: settings.sort((a, b) => a.key.localeCompare(b.key)),
    });
  } catch (error) {
    return adminApiError(error, "Gagal mengambil pengaturan.");
  }
}

export async function PATCH(request: Request) {
  try {
    await requireAdminPermission("settings.update");

    const body = await request.json();
    const id = text(body.id);
    const key = text(body.key);
    const value = typeof body.value === "string" ? body.value : String(body.value ?? "");
    const description = typeof body.description === "string" ? body.description : "";

    if (!id && !key) {
      return NextResponse.json(
        { success: false, message: "Pengaturan yang akan diubah wajib ditentukan." },
        { status: 400 },
      );
    }

    let setting;

    if (id) {
      setting = (await db.orm.public.SiteSetting.where({ id }).all())[0];
    }

    if (!setting && key) {
      setting = (await db.orm.public.SiteSetting.where({ key }).all())[0];
    }

    if (!setting) {
      return NextResponse.json(
        { success: false, message: "Pengaturan tidak ditemukan." },
        { status: 404 },
      );
    }

    const updated = await db.orm.public.SiteSetting.where({ id: setting.id }).update({
      key: key || setting.key,
      value,
      description: description || setting.description || "",
      updatedAt: nowInstant(),
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    return adminApiError(error, "Gagal memperbarui pengaturan.");
  }
}
