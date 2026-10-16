import { Temporal } from "temporal-polyfill/full";

import { NextResponse } from "next/server";

import {
  requireAdminPermission,
} from "@/lib/admin";
import { adminApiError } from "@/lib/admin-api";

import { db } from "@/lib/db";

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
 * CONVERT HTML DATE → TEMPORAL.INSTANT
 * ============================================================
 */
function isValidRegistrationUrl(value: string) {
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

function parseDate(
  value: string,
) {
  if (!value) {
    return null;
  }

  try {
    /*
     * Input:
     * 2026-09-06
     *
     * Disimpan sebagai:
     * 2026-09-06T00:00:00+07:00
     */
    return Temporal.Instant.from(
      `${value}T00:00:00+07:00`,
    );
  } catch {
    return null;
  }
}

/*
 * ============================================================
 * GET
 * ============================================================
 */
export async function GET() {
  try {
    await requireAdminPermission(
      "agenda.view",
    );

    const agenda =
      await db.orm.public.Agenda.all();

    return NextResponse.json({
      success: true,
      data: agenda,
    });
  } catch (error) {
    return adminApiError(error, "Gagal mengambil agenda.");
  }
}

/*
 * ============================================================
 * POST
 *
 * Editor hanya membuat DRAFT.
 * ============================================================
 */
export async function POST(
  request: Request,
) {
  try {
    const session =
      await requireAdminPermission(
        "agenda.create",
      );

    const body =
      await request.json();

    /*
     * --------------------------------------------------------
     * BASIC DATA
     * --------------------------------------------------------
     */
    const title =
      cleanString(body.title);

    const slugInput =
      cleanString(body.slug);

    const description =
      cleanString(
        body.description,
      );

    const excerpt =
      cleanString(body.excerpt);

    const image =
      cleanString(body.image);

    const committeeId =
      cleanString(
        body.committeeId,
      ) || null;

    const categoryId =
      cleanString(
        body.categoryId,
      ) || null;

    const startDateInput =
      cleanString(
        body.startDate,
      );

    const endDateInput =
      cleanString(
        body.endDate,
      );

    const startTime =
      cleanString(
        body.startTime,
      );

    const endTime =
      cleanString(
        body.endTime,
      );

    const location =
      cleanString(
        body.location,
      );

    const address =
      cleanString(
        body.address,
      );

    const registrationUrl =
      cleanString(
        body.registrationUrl,
      );

    const registrationText =
      cleanString(
        body.registrationText,
      );

    const contactName =
      cleanString(
        body.contactName,
      );

    const contactPhone =
      cleanString(
        body.contactPhone,
      );

    const contactEmail =
      cleanString(
        body.contactEmail,
      );

    const organizer =
      cleanString(
        body.organizer,
      );

    const target =
      cleanString(
        body.target,
      );

    const notes =
      cleanString(
        body.notes,
      );

    /*
     * --------------------------------------------------------
     * VALIDATION
     * --------------------------------------------------------
     */
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

    if (!startDateInput) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Tanggal mulai wajib diisi.",
        },
        { status: 400 },
      );
    }

    /*
     * --------------------------------------------------------
     * PARSE START DATE
     * --------------------------------------------------------
     */
    const startDate =
      parseDate(
        startDateInput,
      );

    if (!startDate) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Tanggal mulai tidak valid.",
        },
        { status: 400 },
      );
    }

    /*
     * --------------------------------------------------------
     * PARSE END DATE
     * --------------------------------------------------------
     */
    let endDate =
      null;

    if (endDateInput) {
      endDate =
        parseDate(
          endDateInput,
        );

      if (!endDate) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Tanggal selesai tidak valid.",
          },
          { status: 400 },
        );
      }
    }

    if (
      endDate &&
      Temporal.Instant.compare(endDate, startDate) < 0
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

    /*
     * --------------------------------------------------------
     * SLUG
     * --------------------------------------------------------
     */
    const slug =
      makeSlug(
        slugInput || title,
      );

    if (!slug) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Slug agenda tidak valid.",
        },
        { status: 400 },
      );
    }

    /*
     * --------------------------------------------------------
     * CEK DUPLIKAT
     * --------------------------------------------------------
     */
    const duplicate =
      await db.orm.public.Agenda.first({
        slug,
      });

    if (duplicate) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Slug agenda sudah digunakan.",
        },
        { status: 409 },
      );
    }

    /*
     * --------------------------------------------------------
     * CREATE
     *
     * SELALU DRAFT
     * --------------------------------------------------------
     */
    const agenda =
      await db.orm.public.Agenda.create({
        title,

        slug,

        description,

        excerpt:
          excerpt || null,

        image:
          image || null,

        status:
          "DRAFT",

        isFeatured:
          false,

        isPublished:
          false,

        committeeId,

        categoryId,

        startDate,

        endDate,

        startTime:
          startTime || null,

        endTime:
          endTime || null,

        location:
          location || null,

        address:
          address || null,

        registrationUrl:
          registrationUrl || null,

        registrationText:
          registrationText || null,

        contactName:
          contactName || null,

        contactPhone:
          contactPhone || null,

        contactEmail:
          contactEmail || null,

        organizer:
          organizer || null,

        target:
          target || null,

        notes:
          notes || null,

        createdById:
          session.userId,

        updatedById:
          null,

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
     * --------------------------------------------------------
     * WORKFLOW LOG
     * --------------------------------------------------------
     */
    try {
      await db.orm.public.AgendaWorkflowLog.create(
        {
          agendaId:
            agenda.id,

          actorId:
            session.userId,

          action:
            "CREATED",

          note:
            "Agenda dibuat sebagai Draft oleh Editor.",
        },
      );
    } catch (error) {
      console.error(
        "CREATE_AGENDA_WORKFLOW_LOG_ERROR:",
        error,
      );
    }

    /*
     * --------------------------------------------------------
     * AUDIT LOG
     * --------------------------------------------------------
     */
    try {
      await db.orm.public.AuditLog.create({
        userId:
          session.userId,

        action:
          "CREATE",

        entity:
          "Agenda",

        entityId:
          agenda.id,

        message:
          `Membuat agenda sebagai Draft: ${agenda.title}`,
      });
    } catch (error) {
      console.error(
        "CREATE_AGENDA_AUDIT_ERROR:",
        error,
      );
    }

    return NextResponse.json(
      {
        success: true,

        message:
          "Agenda berhasil disimpan sebagai Draft.",

        data: {
          id:
            agenda.id,

          slug:
            agenda.slug,

          status:
            agenda.status,

          isPublished:
            agenda.isPublished,

          isFeatured:
            agenda.isFeatured,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    return adminApiError(error, "Gagal membuat agenda.");
  }
}
