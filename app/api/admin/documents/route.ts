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
    await requireAdminPermission("document.view");
    const documents = await db.orm.public.Document.all();

    return NextResponse.json({
      success: true,
      data: documents.sort((a, b) => a.sortOrder - b.sortOrder),
    });
  } catch (error) { return adminApiError(error, "Gagal mengambil dokumen."); }
}

export async function POST(request: Request) {
  try {
    await requireAdminPermission("document.create");
    const body = await request.json();
    const title = text(body.title);
    const fileUrl = text(body.fileUrl);

    if (!title || !fileUrl) {
      return NextResponse.json({ success: false, message: "Judul dan file dokumen wajib diisi." }, { status: 400 });
    }

    const document = await db.orm.public.Document.create({
      title,
      fileUrl,
      documentNumber: text(body.documentNumber) || null,
      documentType: text(body.documentType) || null,
      description: text(body.description) || null,
      fileName: text(body.fileName) || null,
      mimeType: text(body.mimeType) || null,
      fileSize: typeof body.fileSize === "number" ? body.fileSize : null,
      isPublished: body.isPublished === true,
      publishedAt: body.isPublished === true ? nowInstant() : null,
      sortOrder: Number.isInteger(body.sortOrder) ? body.sortOrder : 0,
    });

    return NextResponse.json({ success: true, data: document }, { status: 201 });
  } catch (error) { return adminApiError(error, "Gagal menyimpan dokumen."); }
}

export async function PATCH(request: Request) {
  try {
    await requireAdminPermission("document.update");
    const body = await request.json();
    const id = text(body.id);
    const existing = id ? await db.orm.public.Document.first({ id }) : null;
    if (!existing) return NextResponse.json({ success: false, message: "Dokumen tidak ditemukan." }, { status: 404 });

    const title = body.title === undefined ? existing.title : text(body.title);
    const fileUrl = body.fileUrl === undefined ? existing.fileUrl : text(body.fileUrl);
    if (!title || !fileUrl) return NextResponse.json({ success: false, message: "Judul dan file dokumen wajib diisi." }, { status: 400 });

    const isPublished = typeof body.isPublished === "boolean" ? body.isPublished : existing.isPublished;
    const fileSize = body.fileSize === undefined ? existing.fileSize : body.fileSize === null ? null : Number(body.fileSize);
    if (fileSize !== null && (!Number.isInteger(fileSize) || fileSize < 0)) {
      return NextResponse.json({ success: false, message: "Ukuran file dokumen tidak valid." }, { status: 400 });
    }
    const updated = await db.orm.public.Document.where({ id }).update({
      title,
      fileUrl,
      documentNumber: body.documentNumber === undefined ? existing.documentNumber : text(body.documentNumber) || null,
      documentType: body.documentType === undefined ? existing.documentType : text(body.documentType) || null,
      description: body.description === undefined ? existing.description : text(body.description) || null,
      fileName: body.fileName === undefined ? existing.fileName : text(body.fileName) || null,
      mimeType: body.mimeType === undefined ? existing.mimeType : text(body.mimeType) || null,
      fileSize,
      isPublished,
      publishedAt: isPublished ? existing.publishedAt ?? nowInstant() : null,
      sortOrder: Number.isInteger(body.sortOrder) ? body.sortOrder : existing.sortOrder,
      updatedAt: nowInstant(),
    });
    return NextResponse.json({ success: true, data: updated });
  } catch (error) { return adminApiError(error, "Gagal mengubah dokumen."); }
}

export async function DELETE(request: Request) {
  try {
    await requireAdminPermission("document.delete");
    const id = new URL(request.url).searchParams.get("id")?.trim();
    if (!id) return NextResponse.json({ success: false, message: "ID dokumen wajib diisi." }, { status: 400 });
    const existing = await db.orm.public.Document.first({ id });
    if (!existing) return NextResponse.json({ success: false, message: "Dokumen tidak ditemukan." }, { status: 404 });
    await db.orm.public.Document.where({ id }).delete();
    return NextResponse.json({ success: true });
  } catch (error) { return adminApiError(error, "Gagal menghapus dokumen."); }
}
