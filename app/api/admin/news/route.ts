import "temporal-polyfill/full/global";

import { NextResponse } from "next/server";

import {
  requireAdminPermission,
} from "@/lib/admin";
import { adminApiError } from "@/lib/admin-api";

import { db } from "@/lib/db";
import { canCreateCommitteeNews, getUserRoles } from "@/lib/permissions";

function cleanString(value: unknown) {
  return typeof value === "string"
    ? value.trim()
    : "";
}

function makeSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

/*
 * ============================================================
 * POST
 *
 * Editor HANYA membuat DRAFT.
 *
 * Editor tidak boleh:
 * - Publish
 * - Unpublish
 * - Featured
 * ============================================================
 */
export async function POST(
  request: Request,
) {
  try {
    const session =
      await requireAdminPermission(
        "news.create",
      );

    const body =
      await request.json();

    const title =
      cleanString(body.title);

    const slugInput =
      cleanString(body.slug);

    const subtitle =
      cleanString(body.subtitle);

    const excerpt =
      cleanString(body.excerpt);

    const content =
      cleanString(body.content);

    const featuredImage =
      cleanString(body.featuredImage);

    const categoryId =
      cleanString(body.categoryId) ||
      null;

    const committeeId =
      cleanString(body.committeeId) ||
      null;

    const userRoles = await getUserRoles(session.userId);
    const isCommitteeEditor = userRoles.some((role) => ["KOMITE_EDITOR", "KOMITE_MANAGER"].includes(role));
    if (
      isCommitteeEditor &&
      (!committeeId || !(await canCreateCommitteeNews(session.userId, committeeId)))
    ) {
      return NextResponse.json(
        { success: false, message: "Berita harus ditautkan ke komite aktif yang ditugaskan kepada Anda." },
        { status: 403 },
      );
    }

    if (!title) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Judul berita wajib diisi.",
        },
        { status: 400 },
      );
    }

    if (!content) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Isi berita wajib diisi.",
        },
        { status: 400 },
      );
    }

    const slug =
      makeSlug(
        slugInput || title,
      );

    if (!slug) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Slug berita tidak valid.",
        },
        { status: 400 },
      );
    }

    /*
     * ========================================================
     * CEK SLUG
     * ========================================================
     */
    const existing =
      await db.orm.public.News.first({
        slug,
      });

    if (existing) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Slug sudah digunakan. Silakan gunakan slug lain.",
        },
        { status: 409 },
      );
    }

    /*
     * ========================================================
     * CREATE
     *
     * SELALU DRAFT
     * ========================================================
     */
    const news =
      await db.orm.public.News.create({
        title,
        slug,

        subtitle:
          subtitle || null,

        excerpt:
          excerpt || null,

        content,

        featuredImage:
          featuredImage || null,

        status: "DRAFT",

        isFeatured: false,

        isPublished: false,

        categoryId,

        committeeId,

        createdById:
          session.userId,

        publishedById:
          null,

        publishedAt:
          null,

        rejectionReason:
          null,

        rejectedById:
          null,

        rejectedAt:
          null,

        reviewedById:
          null,

        reviewedAt:
          null,
      });

    /*
     * ========================================================
     * WORKFLOW LOG
     * ========================================================
     */
    try {
      await db.orm.public.NewsWorkflowLog.create(
        {
          newsId: news.id,

          actorId:
            session.userId,

          action:
            "CREATED",

          note:
            "Berita dibuat sebagai Draft oleh Editor.",
        },
      );
    } catch (error) {
      console.error(
        "CREATE_NEWS_WORKFLOW_LOG_ERROR:",
        error,
      );
    }

    /*
     * ========================================================
     * AUDIT LOG
     * ========================================================
     */
    try {
      await db.orm.public.AuditLog.create({
        userId:
          session.userId,

        action:
          "CREATE",

        entity:
          "News",

        entityId:
          news.id,

        message:
          `Membuat berita sebagai Draft: ${news.title}`,
      });
    } catch (error) {
      console.error(
        "CREATE_NEWS_AUDIT_ERROR:",
        error,
      );
    }

    return NextResponse.json(
      {
        success: true,

        message:
          "Berita berhasil disimpan sebagai Draft.",

        data: {
          id:
            news.id,

          slug:
            news.slug,

          status:
            news.status,

          isPublished:
            news.isPublished,

          isFeatured:
            news.isFeatured,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    return adminApiError(error, "Gagal membuat berita.");
  }
}