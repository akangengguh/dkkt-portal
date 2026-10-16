import { Temporal } from "temporal-polyfill/full";

import { NextResponse } from "next/server";

import {
  requireAdminPermission,
} from "@/lib/admin";
import { adminApiError } from "@/lib/admin-api";

import { db } from "@/lib/db";
import { canAccessNews, canCreateCommitteeNews, getUserRoles } from "@/lib/permissions";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

function cleanString(value: unknown) {
  return typeof value === "string"
    ? value.trim()
    : "";
}

/*
 * ============================================================
 * CURRENT TIME
 *
 * Prisma 8 pada project ini menggunakan
 * Temporal.Instant untuk DateTime.
 * ============================================================
 */
function now() {
  return Temporal.Now.instant();
}

/*
 * ============================================================
 * WORKFLOW LOG
 * ============================================================
 */
async function createWorkflowLog({
  newsId,
  actorId,
  action,
  note,
}: {
  newsId: string;
  actorId: string;
  action: string;
  note?: string | null;
}) {
  try {
    await db.orm.public.NewsWorkflowLog.create({
      newsId,
      actorId,
      action,
      note: note || null,
    });
  } catch (error) {
    /*
     * Error log workflow tidak boleh menggagalkan
     * operasi utama.
     */
    console.error(
      "NEWS_WORKFLOW_LOG_ERROR:",
      error,
    );
  }
}

/*
 * ============================================================
 * AUDIT LOG
 * ============================================================
 */
async function createAuditLog({
  userId,
  action,
  entityId,
  message,
}: {
  userId: string;
  action: string;
  entityId: string;
  message: string;
}) {
  try {
    await db.orm.public.AuditLog.create({
      userId,
      action,
      entity: "News",
      entityId,
      message,
    });
  } catch (error) {
    /*
     * Audit log tidak boleh menggagalkan operasi utama.
     */
    console.error(
      "NEWS_AUDIT_LOG_ERROR:",
      error,
    );
  }
}

/*
 * ============================================================
 * GET
 *
 * Dipakai oleh:
 * - Edit berita
 * - Internal CMS
 *
 * DRAFT / REJECTED tetap boleh dibaca
 * selama user mempunyai permission news.view.
 * ============================================================
 */
export async function GET(
  _request: Request,
  context: RouteContext,
) {
  try {
    const session = await requireAdminPermission(
      "news.view",
    );

    const { id } =
      await context.params;

    const news =
      await db.orm.public.News.first({
        id,
      });

    if (!news) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Berita tidak ditemukan.",
        },
        { status: 404 },
      );
    }

    if (!(await canAccessNews(session.userId, news, "view"))) {
      return NextResponse.json(
        { success: false, message: "Berita tidak ditemukan." },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,

      data: {
        id:
          news.id,

        title:
          news.title,

        slug:
          news.slug,

        subtitle:
          news.subtitle,

        excerpt:
          news.excerpt,

        content:
          news.content,

        featuredImage:
          news.featuredImage,

        status:
          news.status,

        isFeatured:
          news.isFeatured,

        isPublished:
          news.isPublished,

        categoryId:
          news.categoryId,

        committeeId:
          news.committeeId,

        createdById:
          news.createdById,

        createdAt:
          news.createdAt.toString(),

        updatedAt:
          news.updatedAt.toString(),

        publishedAt:
          news.publishedAt
            ? news.publishedAt.toString()
            : null,

        /*
         * REVIEW / REJECTION
         */
        rejectionReason:
          news.rejectionReason ??
          null,

        rejectedById:
          news.rejectedById ??
          null,

        rejectedAt:
          news.rejectedAt
            ? news.rejectedAt.toString()
            : null,

        reviewedById:
          news.reviewedById ??
          null,

        reviewedAt:
          news.reviewedAt
            ? news.reviewedAt.toString()
            : null,
      },
    });
  } catch (error) {
    return adminApiError(error, "Gagal mengambil berita.");
  }
}

/*
 * ============================================================
 * PATCH
 *
 * Mendukung:
 *
 * 1. Edit berita
 * 2. Publish
 * 3. Unpublish
 * 4. Unggulkan
 * 5. Batalkan unggulan
 * 6. Tolak
 * 7. Restore REJECTED -> DRAFT
 * ============================================================
 */
export async function PATCH(
  request: Request,
  context: RouteContext,
) {
  try {
    /*
     * Default permission:
     * user minimal harus mempunyai news.update.
     */
    const session =
      await requireAdminPermission(
        "news.update",
      );

    const { id } =
      await context.params;

    /*
     * ========================================================
     * CARI BERITA
     * ========================================================
     */
    const existing =
      await db.orm.public.News.first({
        id,
      });

    if (!existing) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Berita tidak ditemukan.",
        },
        { status: 404 },
      );
    }

    if (!(await canAccessNews(session.userId, existing, "edit"))) {
      return NextResponse.json(
        { success: false, message: "Berita tidak ditemukan atau tidak dapat diubah oleh akun ini." },
        { status: 404 },
      );
    }

    /*
     * ========================================================
     * BODY
     * ========================================================
     */
    const body =
      await request.json();

    const userRoles = await getUserRoles(session.userId);
    const isCommitteeEditor = userRoles.some((role) => ["KOMITE_EDITOR", "KOMITE_MANAGER"].includes(role));
    const requestedCommitteeId = body.committeeId === undefined
      ? existing.committeeId
      : cleanString(body.committeeId) || null;
    if (
      isCommitteeEditor &&
      (!requestedCommitteeId || !(await canCreateCommitteeNews(session.userId, requestedCommitteeId)))
    ) {
      return NextResponse.json(
        { success: false, message: "Berita hanya dapat ditautkan ke komite aktif yang ditugaskan kepada Anda." },
        { status: 403 },
      );
    }

    /*
     * ========================================================
     * IDENTIFIKASI FIELD
     * ========================================================
     */

    const hasPublishField =
      Object.prototype.hasOwnProperty.call(
        body,
        "publish",
      );

    const hasFeaturedField =
      Object.prototype.hasOwnProperty.call(
        body,
        "featured",
      );

    const hasRejectField =
      Object.prototype.hasOwnProperty.call(
        body,
        "reject",
      );

    const hasContentField =
      body.title !== undefined ||
      body.slug !== undefined ||
      body.subtitle !== undefined ||
      body.excerpt !== undefined ||
      body.content !== undefined ||
      body.featuredImage !== undefined ||
      body.categoryId !== undefined ||
      body.committeeId !== undefined;

    /*
     * ========================================================
     * REQUESTED VALUE
     * ========================================================
     */

    const requestedPublish =
      hasPublishField
        ? body.publish === true
        : existing.isPublished;

    const requestedFeatured =
      hasFeaturedField
        ? body.featured === true
        : existing.isFeatured;

    const requestedReject =
      hasRejectField &&
      body.reject === true;

    /*
     * ========================================================
     * PERMISSION KURATOR
     *
     * Publish:
     * - Publish
     * - Unpublish
     * - Tolak
     * - Featured
     *
     * membutuhkan news.publish.
     * ========================================================
     */
    const curatorActionRequested =
      hasPublishField ||
      hasFeaturedField ||
      hasRejectField;

    if (curatorActionRequested) {
      try {
        await requireAdminPermission(
          "news.publish",
        );
      } catch {
        return NextResponse.json(
          {
            success: false,
            message:
              "Anda tidak mempunyai permission Kurator untuk melakukan tindakan ini.",
          },
          { status: 403 },
        );
      }
    }

    /*
     * ========================================================
     * DATA BERITA
     * ========================================================
     */

    const title =
      body.title !== undefined
        ? cleanString(body.title)
        : existing.title;

    const slug =
      body.slug !== undefined
        ? cleanString(body.slug)
        : existing.slug;

    const subtitle =
      body.subtitle !== undefined
        ? cleanString(
            body.subtitle,
          ) || null
        : existing.subtitle;

    const excerpt =
      body.excerpt !== undefined
        ? cleanString(
            body.excerpt,
          ) || null
        : existing.excerpt;

    const content =
      body.content !== undefined
        ? cleanString(
            body.content,
          )
        : existing.content;

    const featuredImage =
      body.featuredImage !== undefined
        ? cleanString(
            body.featuredImage,
          ) || null
        : existing.featuredImage;

    const categoryId =
      body.categoryId !== undefined
        ? cleanString(
            body.categoryId,
          ) || null
        : existing.categoryId;

    const committeeId =
      body.committeeId !== undefined
        ? cleanString(
            body.committeeId,
          ) || null
        : existing.committeeId;

    /*
     * ========================================================
     * VALIDASI DATA
     * ========================================================
     */

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

    if (!slug) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Slug berita wajib diisi.",
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

    /*
     * ========================================================
     * VALIDASI REJECTION
     * ========================================================
     */

    const rejectionReason =
      cleanString(
        body.rejectionReason,
      );

    if (requestedReject) {
      /*
       * Alasan wajib dan minimal 10 karakter.
       */
      if (
        rejectionReason.length < 10
      ) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Alasan penolakan minimal 10 karakter.",
          },
          { status: 400 },
        );
      }

      /*
       * Berita published tidak boleh langsung ditolak.
       */
      if (
        existing.isPublished ||
        existing.status ===
          "PUBLISHED"
      ) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Berita yang sudah diterbitkan tidak dapat ditolak. Gunakan Unpublish terlebih dahulu.",
          },
          { status: 400 },
        );
      }
    }

    /*
     * ========================================================
     * CEK SLUG DUPLIKAT
     * ========================================================
     */

    const duplicate =
      await db.orm.public.News.first({
        slug,
      });

    if (
      duplicate &&
      duplicate.id !== id
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Slug sudah digunakan oleh berita lain.",
        },
        { status: 409 },
      );
    }

    /*
     * ========================================================
     * STATE LAMA
     * ========================================================
     */

    let newStatus =
      existing.status ||
      "DRAFT";

    let newIsPublished =
      existing.isPublished;

    let newPublishedById =
      existing.publishedById;

    let newPublishedAt =
      existing.publishedAt;

    let newRejectionReason =
      existing.rejectionReason;

    let newRejectedById =
      existing.rejectedById;

    let newRejectedAt =
      existing.rejectedAt;

    let newReviewedById =
      existing.reviewedById;

    let newReviewedAt =
      existing.reviewedAt;

    const currentTime =
      now();

    /*
     * ========================================================
     * CASE A
     *
     * TOLAK
     * ========================================================
     *
     * DRAFT
     *   ↓
     * REJECTED
     */
    if (requestedReject) {
      newStatus =
        "REJECTED";

      newIsPublished =
        false;

      newPublishedById =
        null;

      newPublishedAt =
        null;

      newRejectionReason =
        rejectionReason;

      newRejectedById =
        session.userId;

      newRejectedAt =
        currentTime;

      newReviewedById =
        session.userId;

      newReviewedAt =
        currentTime;
    }

    /*
     * ========================================================
     * CASE B
     *
     * PUBLISH / UNPUBLISH
     * ========================================================
     */
    else if (
      hasPublishField
    ) {
      /*
       * ------------------------------------------------------
       * PUBLISH
       * ------------------------------------------------------
       */
      if (requestedPublish) {
        /*
         * ====================================================
         * PENTING:
         *
         * REJECTED tidak boleh langsung Publish.
         *
         * Harus:
         *
         * REJECTED
         *     ↓
         * EDITOR EDIT
         *     ↓
         * DRAFT
         *     ↓
         * KURATOR PUBLISH
         * ====================================================
         */
        if (
          existing.status ===
          "REJECTED"
        ) {
          return NextResponse.json(
            {
              success: false,
              message:
                "Berita yang ditolak harus diperbaiki oleh Editor terlebih dahulu sebelum diterbitkan.",
            },
            { status: 400 },
          );
        }

        /*
         * ----------------------------------------------------
         * PUBLISH
         * ----------------------------------------------------
         */
        newStatus =
          "PUBLISHED";

        newIsPublished =
          true;

        newPublishedById =
          session.userId;

        newPublishedAt =
          currentTime;

        newReviewedById =
          session.userId;

        newReviewedAt =
          currentTime;

        /*
         * Setelah publish,
         * rejection aktif dihapus.
         */
        newRejectionReason =
          null;

        newRejectedById =
          null;

        newRejectedAt =
          null;
      }

      /*
       * ------------------------------------------------------
       * UNPUBLISH
       * ------------------------------------------------------
       */
      else {
        newStatus =
          "DRAFT";

        newIsPublished =
          false;

        newPublishedById =
          null;

        newPublishedAt =
          null;
      }
    }

    /*
     * ========================================================
     * CASE C
     *
     * EDIT BERITA REJECTED
     * ========================================================
     *
     * REJECTED
     *    ↓
     * EDITOR EDIT
     *    ↓
     * DRAFT
     */
    else if (
      hasContentField &&
      existing.status ===
        "REJECTED"
    ) {
      newStatus =
        "DRAFT";

      newIsPublished =
        false;

      /*
       * Clear rejection aktif.
       */
      newRejectionReason =
        null;

      newRejectedById =
        null;

      newRejectedAt =
        null;
    }

    /*
     * ========================================================
     * CASE D
     *
     * EDIT BIASA
     * ========================================================
     */
    else if (
      hasContentField
    ) {
      /*
       * Status existing dipertahankan.
       */
      newStatus =
        existing.status ||
        "DRAFT";
    }

    /*
     * ========================================================
     * UPDATE DATABASE
     * ========================================================
     */
    const updated =
      await db.orm.public.News
        .where({ id })
        .update({
          title,
          slug,
          subtitle,
          excerpt,
          content,
          featuredImage,

          status:
            newStatus,

          isFeatured:
            requestedFeatured,

          isPublished:
            newIsPublished,

          categoryId,
          committeeId,

          publishedById:
            newPublishedById,

          publishedAt:
            newPublishedAt,

          rejectionReason:
            newRejectionReason,

          rejectedById:
            newRejectedById,

          rejectedAt:
            newRejectedAt,

          reviewedById:
            newReviewedById,

          reviewedAt:
            newReviewedAt,

          updatedById:
            session.userId,
        });

    if (!updated) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Gagal memperbarui berita.",
        },
        { status: 500 },
      );
    }

    /*
     * ========================================================
     * WORKFLOW ACTION
     * ========================================================
     */

    let workflowAction =
      "UPDATED";

    let workflowNote =
      `Memperbarui berita: ${updated.title}`;

    /*
     * REJECT
     */
    if (requestedReject) {
      workflowAction =
        "REJECTED";

      workflowNote =
        rejectionReason;
    }

    /*
     * PUBLISH
     */
    else if (
      hasPublishField &&
      requestedPublish
    ) {
      workflowAction =
        "PUBLISHED";

      workflowNote =
        "Berita diterbitkan setelah proses review Kurator.";
    }

    /*
     * UNPUBLISH
     */
    else if (
      hasPublishField &&
      !requestedPublish
    ) {
      workflowAction =
        "UNPUBLISHED";

      workflowNote =
        "Publikasi berita dibatalkan dan berita dikembalikan ke Draft.";
    }

    /*
     * FEATURED
     */
    else if (
      hasFeaturedField
    ) {
      workflowAction =
        requestedFeatured
          ? "FEATURED"
          : "UNFEATURED";

      workflowNote =
        requestedFeatured
          ? "Berita dijadikan unggulan."
          : "Status unggulan berita dibatalkan.";
    }

    /*
     * RESTORE
     */
    else if (
      hasContentField &&
      existing.status ===
        "REJECTED"
    ) {
      workflowAction =
        "RESTORED";

      workflowNote =
        "Editor memperbaiki berita yang sebelumnya ditolak dan mengembalikannya ke Draft.";
    }

    /*
     * ========================================================
     * WRITE WORKFLOW LOG
     * ========================================================
     */
    await createWorkflowLog({
      newsId:
        id,

      actorId:
        session.userId,

      action:
        workflowAction,

      note:
        workflowNote,
    });

    /*
     * ========================================================
     * AUDIT ACTION
     * ========================================================
     */

    let auditAction =
      "UPDATE";

    let auditMessage =
      `Memperbarui berita: ${updated.title}`;

    /*
     * REJECT
     */
    if (requestedReject) {
      auditAction =
        "REJECT";

      auditMessage =
        `Mengembalikan berita "${updated.title}" kepada Editor. Alasan: ${rejectionReason}`;
    }

    /*
     * PUBLISH
     */
    else if (
      hasPublishField &&
      requestedPublish
    ) {
      auditAction =
        "PUBLISH";

      auditMessage =
        `Menerbitkan berita: ${updated.title}`;
    }

    /*
     * UNPUBLISH
     */
    else if (
      hasPublishField &&
      !requestedPublish
    ) {
      auditAction =
        "UNPUBLISH";

      auditMessage =
        `Membatalkan publikasi berita: ${updated.title}`;
    }

    /*
     * FEATURED
     */
    else if (
      hasFeaturedField
    ) {
      auditAction =
        requestedFeatured
          ? "FEATURE"
          : "UNFEATURE";

      auditMessage =
        requestedFeatured
          ? `Menjadikan berita unggulan: ${updated.title}`
          : `Membatalkan berita unggulan: ${updated.title}`;
    }

    /*
     * RESTORE
     */
    else if (
      hasContentField &&
      existing.status ===
        "REJECTED"
    ) {
      auditAction =
        "RESTORE";

      auditMessage =
        `Editor memperbaiki berita dan mengembalikannya ke Draft: ${updated.title}`;
    }

    /*
     * ========================================================
     * WRITE AUDIT LOG
     * ========================================================
     */
    await createAuditLog({
      userId:
        session.userId,

      action:
        auditAction,

      entityId:
        id,

      message:
        auditMessage,
    });

    /*
     * ========================================================
     * RESPONSE MESSAGE
     * ========================================================
     */

    let responseMessage =
      "Berita berhasil diperbarui.";

    /*
     * REJECT
     */
    if (requestedReject) {
      responseMessage =
        "Berita berhasil dikembalikan kepada Editor.";
    }

    /*
     * PUBLISH
     */
    else if (
      hasPublishField &&
      requestedPublish
    ) {
      responseMessage =
        "Berita berhasil diterbitkan.";
    }

    /*
     * UNPUBLISH
     */
    else if (
      hasPublishField &&
      !requestedPublish
    ) {
      responseMessage =
        "Publikasi berita berhasil dibatalkan.";
    }

    /*
     * FEATURED
     */
    else if (
      hasFeaturedField
    ) {
      responseMessage =
        requestedFeatured
          ? "Berita berhasil dijadikan unggulan."
          : "Status unggulan berita berhasil dibatalkan.";
    }

    /*
     * RESTORE
     */
    else if (
      hasContentField &&
      existing.status ===
        "REJECTED"
    ) {
      responseMessage =
        "Perbaikan berhasil disimpan. Berita kembali menjadi Draft.";
    }

    /*
     * ========================================================
     * FINAL RESPONSE
     * ========================================================
     */
    return NextResponse.json({
      success: true,

      message:
        responseMessage,

      data: {
        id:
          updated.id,

        slug:
          updated.slug,

        status:
          updated.status,

        isPublished:
          updated.isPublished,

        isFeatured:
          updated.isFeatured,

        rejectionReason:
          updated.rejectionReason ??
          null,

        rejectedAt:
          updated.rejectedAt
            ? updated.rejectedAt.toString()
            : null,

        reviewedAt:
          updated.reviewedAt
            ? updated.reviewedAt.toString()
            : null,
      },
    });
  } catch (error) {
    return adminApiError(error, "Gagal memperbarui berita.");
  }
}

/*
 * ============================================================
 * DELETE
 * ============================================================
 */
export async function DELETE(
  _request: Request,
  context: RouteContext,
) {
  try {
    const session =
      await requireAdminPermission(
        "news.delete",
      );

    const { id } =
      await context.params;

    /*
     * ========================================================
     * CARI BERITA
     * ========================================================
     */
    const existing =
      await db.orm.public.News.first({
        id,
      });

    if (!existing) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Berita tidak ditemukan.",
        },
        { status: 404 },
      );
    }

    if (!(await canAccessNews(session.userId, existing, "edit"))) {
      return NextResponse.json(
        { success: false, message: "Berita tidak ditemukan atau tidak dapat dihapus oleh akun ini." },
        { status: 404 },
      );
    }

    /*
     * ========================================================
     * DELETE
     * ========================================================
     */
    const deleted =
      await db.orm.public.News
        .where({ id })
        .delete();

    if (!deleted) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Gagal menghapus berita.",
        },
        { status: 500 },
      );
    }

    /*
     * ========================================================
     * AUDIT
     * ========================================================
     */
    await createAuditLog({
      userId:
        session.userId,

      action:
        "DELETE",

      entityId:
        id,

      message:
        `Menghapus berita: ${existing.title}`,
    });

    /*
     * ========================================================
     * RESPONSE
     * ========================================================
     */
    return NextResponse.json({
      success: true,

      message:
        "Berita berhasil dihapus.",
    });
  } catch (error) {
    return adminApiError(error, "Gagal menghapus berita.");
  }
}