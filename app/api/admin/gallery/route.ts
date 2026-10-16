import { NextResponse } from "next/server";

import { requireAdminPermission } from "@/lib/admin";
import { adminApiError } from "@/lib/admin-api";
import { nowInstant, toInstant } from "@/lib/dates";
import { db } from "@/lib/db";

function text(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function isYouTubeVideoUrl(value: string) {
  try {
    const url = new URL(value);
    const host = url.hostname.toLowerCase().replace(/^www\./, "");
    const pathParts = url.pathname.split("/").filter(Boolean);
    const videoId = host === "youtu.be"
      ? pathParts[0]
      : url.searchParams.get("v") || (pathParts[0] && ["embed", "live", "shorts"].includes(pathParts[0]) ? pathParts[1] : "");
    return url.protocol === "https:" && ["youtube.com", "m.youtube.com", "youtu.be"].includes(host) && /^[\w-]{11}$/.test(videoId || "");
  } catch {
    return false;
  }
}

function isUploadedGalleryPhoto(value: string) {
  return /^\/uploads\/gallery\/[0-9a-f-]{36}\.(jpg|png|webp|gif)$/i.test(value);
}

export async function GET() {
  try {
    await requireAdminPermission("gallery.view");
    const [items, albums, committees] = await Promise.all([
      db.orm.public.GalleryItem.all(),
      db.orm.public.GalleryAlbum.all(),
      db.orm.public.Committee.all(),
    ]);

    return NextResponse.json({ success: true, data: items, albums, committees });
  } catch (error) { return adminApiError(error, "Gagal mengambil galeri."); }
}

export async function POST(request: Request) {
  try {
    await requireAdminPermission("gallery.create");
    const body = await request.json();
    const title = text(body.title);
    const type = text(body.type).toUpperCase();
    const fileUrl = text(body.fileUrl);
    const externalUrl = text(body.externalUrl);
    const mimeType = text(body.mimeType);

    if (!title || !["PHOTO", "VIDEO"].includes(type)) {
      return NextResponse.json({ success: false, message: "Judul dan jenis media wajib diisi." }, { status: 400 });
    }
    if (type === "PHOTO" && (!isUploadedGalleryPhoto(fileUrl) || !mimeType.startsWith("image/"))) {
      return NextResponse.json({ success: false, message: "Foto harus dipilih dari perangkat dan diunggah melalui pemilih file." }, { status: 400 });
    }
    if (type === "VIDEO" && !isYouTubeVideoUrl(externalUrl)) {
      return NextResponse.json({ success: false, message: "Video harus menggunakan tautan video YouTube yang valid dari kanal DKKT." }, { status: 400 });
    }

    let albumId = text(body.albumId);
    if (!albumId) {
      const albumTitle = text(body.albumTitle) || "Dokumentasi DKKT";
      const slug = slugify(albumTitle) || "dokumentasi-dkkt";
      const existing = await db.orm.public.GalleryAlbum.first({ slug });
      const album = existing ?? await db.orm.public.GalleryAlbum.create({ title: albumTitle, slug, description: null, coverImage: null, sortOrder: 0, isActive: true });
      albumId = album.id;
    }

    const item = await db.orm.public.GalleryItem.create({
      albumId,
      committeeId: text(body.committeeId) || null,
      mediaId: null,
      type,
      title,
      description: text(body.description) || null,
      fileUrl: type === "PHOTO" ? fileUrl : null,
      thumbnailUrl: text(body.thumbnailUrl) || null,
      externalUrl: type === "VIDEO" ? externalUrl : null,
      mimeType: type === "PHOTO" ? mimeType : null,
      width: null,
      height: null,
      duration: null,
      eventDate: null,
      sortOrder: Number.isInteger(body.sortOrder) ? body.sortOrder : 0,
      isActive: body.isActive !== false,
    });

    return NextResponse.json({ success: true, data: item }, { status: 201 });
  } catch (error) { return adminApiError(error, "Gagal menyimpan galeri."); }
}

export async function PATCH(request: Request) {
  try {
    await requireAdminPermission("gallery.update");
    const body = await request.json();
    const id = text(body.id);
    const existing = id ? await db.orm.public.GalleryItem.first({ id }) : null;
    if (!existing) return NextResponse.json({ success: false, message: "Item galeri tidak ditemukan." }, { status: 404 });

    const title = body.title === undefined ? existing.title : text(body.title);
    const type = body.type === undefined ? existing.type : text(body.type).toUpperCase();
    const fileUrl = body.fileUrl === undefined ? existing.fileUrl : text(body.fileUrl) || null;
    const externalUrl = body.externalUrl === undefined ? existing.externalUrl : text(body.externalUrl) || null;
    const mimeType = body.mimeType === undefined ? existing.mimeType : text(body.mimeType) || null;
    if (!title || !["PHOTO", "VIDEO"].includes(type)) {
      return NextResponse.json({ success: false, message: "Judul dan jenis media wajib diisi." }, { status: 400 });
    }
    if (type === "PHOTO" && (!fileUrl || !isUploadedGalleryPhoto(fileUrl) || (mimeType && !mimeType.startsWith("image/")))) {
      return NextResponse.json({ success: false, message: "Foto harus dipilih dari perangkat dan diunggah melalui pemilih file." }, { status: 400 });
    }
    if (type === "VIDEO" && !isYouTubeVideoUrl(externalUrl || "")) {
      return NextResponse.json({ success: false, message: "Video harus menggunakan tautan video YouTube yang valid dari kanal DKKT." }, { status: 400 });
    }

    let albumId = body.albumId === undefined ? existing.albumId : text(body.albumId);
    if (!albumId && body.albumTitle !== undefined) {
      const albumTitle = text(body.albumTitle) || "Dokumentasi DKKT";
      const slug = slugify(albumTitle) || "dokumentasi-dkkt";
      const album = await db.orm.public.GalleryAlbum.first({ slug }) ?? await db.orm.public.GalleryAlbum.create({ title: albumTitle, slug, description: null, coverImage: null, sortOrder: 0, isActive: true });
      albumId = album.id;
    }

    if (!albumId) return NextResponse.json({ success: false, message: "Album wajib dipilih atau dibuat." }, { status: 400 });
    const updated = await db.orm.public.GalleryItem.where({ id }).update({
      albumId,
      committeeId: body.committeeId === undefined ? existing.committeeId : text(body.committeeId) || null,
      type,
      title,
      description: body.description === undefined ? existing.description : text(body.description) || null,
      fileUrl: type === "PHOTO" ? fileUrl : null,
      thumbnailUrl: body.thumbnailUrl === undefined ? existing.thumbnailUrl : text(body.thumbnailUrl) || null,
      externalUrl: type === "VIDEO" ? externalUrl : null,
      mimeType: type === "PHOTO" ? mimeType : null,
      eventDate: body.eventDate === undefined ? existing.eventDate : toInstant(body.eventDate),
      sortOrder: Number.isInteger(body.sortOrder) ? body.sortOrder : existing.sortOrder,
      isActive: typeof body.isActive === "boolean" ? body.isActive : existing.isActive,
      updatedAt: nowInstant(),
    });
    return NextResponse.json({ success: true, data: updated });
  } catch (error) { return adminApiError(error, "Gagal mengubah galeri."); }
}

export async function DELETE(request: Request) {
  try {
    await requireAdminPermission("gallery.delete");
    const id = new URL(request.url).searchParams.get("id")?.trim();
    if (!id) return NextResponse.json({ success: false, message: "ID item galeri wajib diisi." }, { status: 400 });
    const existing = await db.orm.public.GalleryItem.first({ id });
    if (!existing) return NextResponse.json({ success: false, message: "Item galeri tidak ditemukan." }, { status: 404 });
    await db.orm.public.GalleryItem.where({ id }).delete();
    return NextResponse.json({ success: true });
  } catch (error) { return adminApiError(error, "Gagal menghapus galeri."); }
}
