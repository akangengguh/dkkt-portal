import { Temporal } from "temporal-polyfill/full";

import { NextResponse } from "next/server";

import {
  requireAdminPermission,
} from "@/lib/admin";
import { adminApiError } from "@/lib/admin-api";

import { db } from "@/lib/db";

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

function now() {
  return Temporal.Now.instant();
}

function isValidRegistrationUrl(value: string | null) {
  if (!value) {
    return true;
  }

  try {
    const url = new URL(value);

    return (
      url.protocol === "https:" ||
      url.protocol === "http:"
    );
  } catch {
    return false;
  }
}

function toInstant(
  value: string | null,
) {
  if (!value) {
    return null;
  }

  /*
   * HTML date:
   * 2026-09-06
   *
   * HTML datetime-local:
   * 2026-09-06T19:00
   */
  try {
    if (value.includes("T")) {
      return Temporal.Instant.from(
        `${value}:00+07:00`,
      );
    }

    return Temporal.Instant.from(
      `${value}T00:00:00+07:00`,
    );
  } catch {
    return null;
  }
}

async function workflowLog({
  agendaId,
  actorId,
  action,
  note,
}: {
  agendaId: string;
  actorId: string;
  action: string;
  note?: string | null;
}) {
  try {
    await db.orm.public.AgendaWorkflowLog.create(
      {
        agendaId,
        actorId,
        action,
        note:
          note || null,
      },
    );
  } catch (error) {
    console.error(
      "AGENDA_WORKFLOW_LOG_ERROR:",
      error,
    );
  }
}

async function auditLog({
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
      entity: "Agenda",
      entityId,
      message,
    });
  } catch (error) {
    console.error(
      "AGENDA_AUDIT_LOG_ERROR:",
      error,
    );
  }
}

export async function GET(
  _request: Request,
  context: RouteContext,
) {
  try {
    await requireAdminPermission(
      "agenda.view",
    );

    const { id } =
      await context.params;

    const agenda =
      await db.orm.public.Agenda.first({
        id,
      });

    if (!agenda) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Agenda tidak ditemukan.",
        },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,

      data: {
        id:
          agenda.id,

        title:
          agenda.title,

        slug:
          agenda.slug,

        description:
          agenda.description,

        excerpt:
          agenda.excerpt,

        image:
          agenda.image,

        status:
          agenda.status,

        isFeatured:
          agenda.isFeatured,

        isPublished:
          agenda.isPublished,

        committeeId:
          agenda.committeeId,

        categoryId:
          agenda.categoryId,

        startDate:
          agenda.startDate.toString(),

        endDate:
          agenda.endDate
            ? agenda.endDate.toString()
            : null,

        startTime:
          agenda.startTime,

        endTime:
          agenda.endTime,

        location:
          agenda.location,

        address:
          agenda.address,

        registrationUrl:
          agenda.registrationUrl,

        registrationText:
          agenda.registrationText,

        contactName:
          agenda.contactName,

        contactPhone:
          agenda.contactPhone,

        contactEmail:
          agenda.contactEmail,

        organizer:
          agenda.organizer,

        target:
          agenda.target,

        notes:
          agenda.notes,

        createdById:
          agenda.createdById,

        publishedById:
          agenda.publishedById,

        publishedAt:
          agenda.publishedAt
            ? agenda.publishedAt.toString()
            : null,

        rejectionReason:
          agenda.rejectionReason ??
          null,

        rejectedById:
          agenda.rejectedById ??
          null,

        rejectedAt:
          agenda.rejectedAt
            ? agenda.rejectedAt.toString()
            : null,

        reviewedById:
          agenda.reviewedById ??
          null,

        reviewedAt:
          agenda.reviewedAt
            ? agenda.reviewedAt.toString()
            : null,
      },
    });
  } catch (error) {
    return adminApiError(error, "Gagal mengambil agenda.");
  }
}

export async function PATCH(
  request: Request,
  context: RouteContext,
) {
  try {
    const session =
      await requireAdminPermission(
        "agenda.update",
      );

    const { id } =
      await context.params;

    const existing =
      await db.orm.public.Agenda.first({
        id,
      });

    if (!existing) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Agenda tidak ditemukan.",
        },
        { status: 404 },
      );
    }

    const body =
      await request.json();

    const hasPublish =
      Object.prototype.hasOwnProperty.call(
        body,
        "publish",
      );

    const hasFeatured =
      Object.prototype.hasOwnProperty.call(
        body,
        "featured",
      );

    const hasReject =
      Object.prototype.hasOwnProperty.call(
        body,
        "reject",
      );

    const hasContent =
      body.title !== undefined ||
      body.slug !== undefined ||
      body.description !== undefined ||
      body.excerpt !== undefined ||
      body.image !== undefined ||
      body.committeeId !== undefined ||
      body.categoryId !== undefined ||
      body.startDate !== undefined ||
      body.endDate !== undefined ||
      body.startTime !== undefined ||
      body.endTime !== undefined ||
      body.location !== undefined ||
      body.address !== undefined ||
      body.registrationUrl !== undefined ||
      body.registrationText !== undefined ||
      body.contactName !== undefined ||
      body.contactPhone !== undefined ||
      body.contactEmail !== undefined ||
      body.organizer !== undefined ||
      body.target !== undefined ||
      body.notes !== undefined;

    const requestedPublish =
      hasPublish
        ? body.publish === true
        : existing.isPublished;

    const requestedFeatured =
      hasFeatured
        ? body.featured === true
        : existing.isFeatured;

    const requestedReject =
      hasReject &&
      body.reject === true;

    if (
      hasPublish ||
      hasFeatured ||
      hasReject
    ) {
      try {
        await requireAdminPermission(
          "agenda.publish",
        );
      } catch {
        return NextResponse.json(
          {
            success: false,
            message:
              "Anda tidak mempunyai permission Kurator.",
          },
          { status: 403 },
        );
      }
    }

    const title =
      body.title !== undefined
        ? cleanString(body.title)
        : existing.title;

    const slug =
      body.slug !== undefined
        ? cleanString(body.slug)
        : existing.slug;

    const description =
      body.description !== undefined
        ? cleanString(
            body.description,
          )
        : existing.description;

    const excerpt =
      body.excerpt !== undefined
        ? cleanString(
            body.excerpt,
          ) || null
        : existing.excerpt;

    const image =
      body.image !== undefined
        ? cleanString(
            body.image,
          ) || null
        : existing.image;

    const committeeId =
      body.committeeId !== undefined
        ? cleanString(
            body.committeeId,
          ) || null
        : existing.committeeId;

    const categoryId =
      body.categoryId !== undefined
        ? cleanString(
            body.categoryId,
          ) || null
        : existing.categoryId;

    const startDateInput =
      body.startDate !== undefined
        ? cleanString(
            body.startDate,
          )
        : "";

    const endDateInput =
      body.endDate !== undefined
        ? cleanString(
            body.endDate,
          )
        : "";

    let newStartDate =
      existing.startDate;

    if (startDateInput) {
      const parsed =
        toInstant(
          startDateInput,
        );

      if (!parsed) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Tanggal mulai tidak valid.",
          },
          { status: 400 },
        );
      }

      newStartDate =
        parsed;
    }

    let newEndDate =
      existing.endDate;

    if (
      body.endDate !== undefined
    ) {
      if (
        endDateInput
      ) {
        const parsed =
          toInstant(
            endDateInput,
          );

        if (!parsed) {
          return NextResponse.json(
            {
              success: false,
              message:
                "Tanggal selesai tidak valid.",
            },
            { status: 400 },
          );
        }

        newEndDate =
          parsed;
      } else {
        newEndDate =
          null;
      }
    }

    if (
      newEndDate &&
      Temporal.Instant.compare(
        newEndDate,
        newStartDate,
      ) < 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Tanggal selesai tidak boleh lebih awal dari tanggal mulai.",
        },
        { status: 400 },
      );
    }

    const startTime =
      body.startTime !== undefined
        ? cleanString(
            body.startTime,
          ) || null
        : existing.startTime;

    const endTime =
      body.endTime !== undefined
        ? cleanString(
            body.endTime,
          ) || null
        : existing.endTime;

    const location =
      body.location !== undefined
        ? cleanString(
            body.location,
          ) || null
        : existing.location;

    const address =
      body.address !== undefined
        ? cleanString(
            body.address,
          ) || null
        : existing.address;

    const registrationUrl =
      body.registrationUrl !== undefined
        ? cleanString(
            body.registrationUrl,
          ) || null
        : existing.registrationUrl;

    const registrationText =
      body.registrationText !== undefined
        ? cleanString(
            body.registrationText,
          ) || null
        : existing.registrationText;

    if (!isValidRegistrationUrl(registrationUrl)) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Tautan pendaftaran harus berupa URL http atau https yang valid.",
        },
        { status: 400 },
      );
    }

    const contactName =
      body.contactName !== undefined
        ? cleanString(
            body.contactName,
          ) || null
        : existing.contactName;

    const contactPhone =
      body.contactPhone !== undefined
        ? cleanString(
            body.contactPhone,
          ) || null
        : existing.contactPhone;

    const contactEmail =
      body.contactEmail !== undefined
        ? cleanString(
            body.contactEmail,
          ) || null
        : existing.contactEmail;

    const organizer =
      body.organizer !== undefined
        ? cleanString(
            body.organizer,
          ) || null
        : existing.organizer;

    const target =
      body.target !== undefined
        ? cleanString(
            body.target,
          ) || null
        : existing.target;

    const notes =
      body.notes !== undefined
        ? cleanString(
            body.notes,
          ) || null
        : existing.notes;

    if (!title) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Judul agenda wajib diisi.",
        },
        { status: 400 },
      );
    }

    if (!description) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Deskripsi agenda wajib diisi.",
        },
        { status: 400 },
      );
    }

    if (!slug) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Slug agenda wajib diisi.",
        },
        { status: 400 },
      );
    }

    if (requestedReject) {
      const rejectionReason =
        cleanString(
          body.rejectionReason,
        );

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

      if (
        existing.isPublished ||
        existing.status ===
          "PUBLISHED"
      ) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Agenda yang sudah diterbitkan harus di-Unpublish terlebih dahulu.",
          },
          { status: 400 },
        );
      }
    }

    if (
      hasPublish &&
      requestedPublish &&
      existing.status ===
        "REJECTED"
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Agenda yang ditolak harus diperbaiki Editor terlebih dahulu sebelum diterbitkan.",
        },
        { status: 400 },
      );
    }

    const duplicate =
      await db.orm.public.Agenda.first({
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
            "Slug agenda sudah digunakan oleh agenda lain.",
        },
        { status: 409 },
      );
    }

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
        cleanString(
          body.rejectionReason,
        );

      newRejectedById =
        session.userId;

      newRejectedAt =
        currentTime;

      newReviewedById =
        session.userId;

      newReviewedAt =
        currentTime;
    } else if (
      hasPublish
    ) {
      if (
        requestedPublish
      ) {
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

        newRejectionReason =
          null;

        newRejectedById =
          null;

        newRejectedAt =
          null;
      } else {
        newStatus =
          "DRAFT";

        newIsPublished =
          false;

        newPublishedById =
          null;

        newPublishedAt =
          null;
      }
    } else if (
      hasContent &&
      existing.status ===
        "REJECTED"
    ) {
      newStatus =
        "DRAFT";

      newIsPublished =
        false;

      newRejectionReason =
        null;

      newRejectedById =
        null;

      newRejectedAt =
        null;
    }

    const updated =
      await db.orm.public.Agenda
        .where({ id })
        .update({
          title,
          slug,
          description,
          excerpt,
          image,

          status:
            newStatus,

          isFeatured:
            requestedFeatured,

          isPublished:
            newIsPublished,

          committeeId,
          categoryId,

          startDate:
            newStartDate,

          endDate:
            newEndDate,

          startTime,
          endTime,

          location,
          address,

          registrationUrl,
          registrationText,

          contactName,
          contactPhone,
          contactEmail,

          organizer,
          target,
          notes,

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
            "Gagal memperbarui agenda.",
        },
        { status: 500 },
      );
    }

    let action =
      "UPDATED";

    let note =
      `Memperbarui agenda: ${updated.title}`;

    if (requestedReject) {
      action =
        "REJECTED";

      note =
        cleanString(
          body.rejectionReason,
        );
    } else if (
      hasPublish &&
      requestedPublish
    ) {
      action =
        "PUBLISHED";

      note =
        "Agenda diterbitkan setelah review Kurator.";
    } else if (
      hasPublish &&
      !requestedPublish
    ) {
      action =
        "UNPUBLISHED";

      note =
        "Publikasi agenda dibatalkan.";
    } else if (
      hasFeatured
    ) {
      action =
        requestedFeatured
          ? "FEATURED"
          : "UNFEATURED";

      note =
        requestedFeatured
          ? "Agenda dijadikan unggulan."
          : "Agenda tidak lagi menjadi unggulan.";
    } else if (
      hasContent &&
      existing.status ===
        "REJECTED"
    ) {
      action =
        "RESTORED";

      note =
        "Editor memperbaiki agenda yang ditolak dan mengembalikannya ke Draft.";
    }

    await workflowLog({
      agendaId:
        id,

      actorId:
        session.userId,

      action,
      note,
    });

    let auditAction =
      "UPDATE";

    let auditMessage =
      `Memperbarui agenda: ${updated.title}`;

    if (requestedReject) {
      auditAction =
        "REJECT";

      auditMessage =
        `Mengembalikan agenda "${updated.title}" kepada Editor. Alasan: ${cleanString(
          body.rejectionReason,
        )}`;
    } else if (
      hasPublish &&
      requestedPublish
    ) {
      auditAction =
        "PUBLISH";

      auditMessage =
        `Menerbitkan agenda: ${updated.title}`;
    } else if (
      hasPublish &&
      !requestedPublish
    ) {
      auditAction =
        "UNPUBLISH";

      auditMessage =
        `Membatalkan publikasi agenda: ${updated.title}`;
    } else if (
      hasFeatured
    ) {
      auditAction =
        requestedFeatured
          ? "FEATURE"
          : "UNFEATURE";
    } else if (
      hasContent &&
      existing.status ===
        "REJECTED"
    ) {
      auditAction =
        "RESTORE";
    }

    await auditLog({
      userId:
        session.userId,

      action:
        auditAction,

      entityId:
        id,

      message:
        auditMessage,
    });

    return NextResponse.json({
      success: true,

      message:
        requestedReject
          ? "Agenda berhasil dikembalikan kepada Editor."
          : hasPublish &&
              requestedPublish
            ? "Agenda berhasil diterbitkan."
            : hasPublish &&
                !requestedPublish
              ? "Publikasi agenda berhasil dibatalkan."
              : hasFeatured
                ? requestedFeatured
                  ? "Agenda berhasil dijadikan unggulan."
                  : "Status unggulan berhasil dibatalkan."
                : hasContent &&
                    existing.status ===
                      "REJECTED"
                  ? "Perbaikan berhasil disimpan. Agenda kembali menjadi Draft."
                  : "Agenda berhasil diperbarui.",

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
    return adminApiError(error, "Gagal memperbarui agenda.");
  }
}

export async function DELETE(
  _request: Request,
  context: RouteContext,
) {
  try {
    const session =
      await requireAdminPermission(
        "agenda.delete",
      );

    const { id } =
      await context.params;

    const existing =
      await db.orm.public.Agenda.first({
        id,
      });

    if (!existing) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Agenda tidak ditemukan.",
        },
        { status: 404 },
      );
    }

    const deleted =
      await db.orm.public.Agenda
        .where({ id })
        .delete();

    if (!deleted) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Gagal menghapus agenda.",
        },
        { status: 500 },
      );
    }

    await auditLog({
      userId:
        session.userId,

      action:
        "DELETE",

      entityId:
        id,

      message:
        `Menghapus agenda: ${existing.title}`,
    });

    return NextResponse.json({
      success: true,

      message:
        "Agenda berhasil dihapus.",
    });
  } catch (error) {
    return adminApiError(error, "Gagal menghapus agenda.");
  }
}
