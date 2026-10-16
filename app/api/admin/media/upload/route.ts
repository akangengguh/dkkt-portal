import crypto from "crypto";

import { NextResponse } from "next/server";

import { requireAuth } from "@/lib/admin";
import { adminApiError } from "@/lib/admin-api";
import { requirePermission } from "@/lib/permissions";
import { persistUploadedFile } from "@/lib/storage";

export const runtime = "nodejs";

const IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

const DOCUMENT_TYPES = new Set([
  "application/pdf",
]);

const EXTENSIONS: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
  "application/pdf": ".pdf",
};

const UPLOAD_CONFIG = {
  news: { types: IMAGE_TYPES, maxSize: 5 * 1024 * 1024 },
  agenda: { types: IMAGE_TYPES, maxSize: 5 * 1024 * 1024 },
  artist: { types: IMAGE_TYPES, maxSize: 5 * 1024 * 1024 },
  group: { types: IMAGE_TYPES, maxSize: 5 * 1024 * 1024 },
  gallery: { types: IMAGE_TYPES, maxSize: 10 * 1024 * 1024 },
  document: { types: DOCUMENT_TYPES, maxSize: 15 * 1024 * 1024 },
} as const;

type UploadScope = keyof typeof UPLOAD_CONFIG;

function getScope(value: FormDataEntryValue | null): UploadScope {
  return typeof value === "string" && value in UPLOAD_CONFIG
    ? (value as UploadScope)
    : "news";
}

function hasValidSignature(type: string, bytes: Uint8Array) {
  const ascii = String.fromCharCode(...bytes);
  if (type === "image/jpeg") return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  if (type === "image/png") return ascii.startsWith("\x89PNG\r\n\x1a\n");
  if (type === "image/webp") return ascii.startsWith("RIFF") && ascii.slice(8, 12) === "WEBP";
  if (type === "image/gif") return ascii.startsWith("GIF87a") || ascii.startsWith("GIF89a");
  if (type === "application/pdf") return ascii.startsWith("%PDF-");
  return false;
}

export async function POST(request: Request) {
  try {
    const session = await requireAuth();
    const contentLength = Number(request.headers.get("content-length") || 0);
    if (Number.isFinite(contentLength) && contentLength > 16 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, message: "Ukuran upload melebihi batas yang diizinkan." },
        { status: 413 },
      );
    }

    const formData = await request.formData();
    const file = formData.get("file");
    const scope = getScope(formData.get("scope"));
    const intent = formData.get("intent") === "update" ? "update" : "create";
    const permission = {
      news: `news.${intent}`,
      agenda: `agenda.${intent}`,
      artist: `artist.${intent}`,
      group: `group.${intent}`,
      gallery: `gallery.${intent}`,
      document: `document.${intent}`,
    }[scope];
    await requirePermission(session.userId, permission);
    const config = UPLOAD_CONFIG[scope];

    if (!(file instanceof File)) {
      return NextResponse.json(
        { success: false, message: "File tidak ditemukan." },
        { status: 400 },
      );
    }

    if (!config.types.has(file.type) || !EXTENSIONS[file.type]) {
      return NextResponse.json(
        { success: false, message: "Format file tidak didukung." },
        { status: 400 },
      );
    }

    if (file.size > config.maxSize) {
      return NextResponse.json(
        {
          success: false,
          message: `Ukuran file maksimal ${config.maxSize / 1024 / 1024} MB.`,
        },
        { status: 400 },
      );
    }

    const signature = new Uint8Array(await file.slice(0, 12).arrayBuffer());
    if (!hasValidSignature(file.type, signature)) {
      return NextResponse.json(
        { success: false, message: "Isi file tidak sesuai dengan format yang dipilih." },
        { status: 400 },
      );
    }

    const fileName = `${crypto.randomUUID()}${EXTENSIONS[file.type]}`;
    const url = await persistUploadedFile({
      file,
      scope,
      fileName,
    });

    return NextResponse.json({
      success: true,
      url,
      fileName,
      originalName: file.name,
      mimeType: file.type,
      size: file.size,
    });
  } catch (error) {
    return adminApiError(error, "Gagal mengunggah file.");
  }
}
