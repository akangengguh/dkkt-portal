import { NextResponse } from "next/server";

import {
  requireAdminPermission,
} from "@/lib/admin";
import { adminApiError } from "@/lib/admin-api";

import { db } from "@/lib/db";

/*
 * ============================================================
 * DEFAULT KATEGORI AGENDA
 * ============================================================
 */
const defaultCategories = [
  {
    name: "Pertunjukan",
    slug: "pertunjukan",
    description:
      "Pertunjukan seni dan budaya.",
  },
  {
    name: "Festival",
    slug: "festival",
    description:
      "Festival seni dan kebudayaan.",
  },
  {
    name: "Workshop",
    slug: "workshop",
    description:
      "Workshop dan pelatihan.",
  },
  {
    name: "Diskusi",
    slug: "diskusi",
    description:
      "Diskusi, seminar, dan forum kebudayaan.",
  },
  {
    name: "Pameran",
    slug: "pameran",
    description:
      "Pameran seni dan kebudayaan.",
  },
  {
    name: "Kegiatan Budaya",
    slug: "kegiatan-budaya",
    description:
      "Kegiatan budaya lainnya.",
  },
];

/*
 * ============================================================
 * GET OPTIONS
 * ============================================================
 */
export async function GET() {
  try {
    await requireAdminPermission(
      "agenda.view",
    );

    /*
     * --------------------------------------------------------
     * AMBIL DATA AWAL
     * --------------------------------------------------------
     */
    let categories =
      await db.orm.public.AgendaCategory.all();

    /*
     * --------------------------------------------------------
     * JIKA KATEGORI MASIH KOSONG,
     * BUAT KATEGORI DASAR OTOMATIS.
     * --------------------------------------------------------
     */
    if (
      !Array.isArray(categories) ||
      categories.length === 0
    ) {
      for (
        let index = 0;
        index <
        defaultCategories.length;
        index++
      ) {
        const item =
          defaultCategories[
            index
          ];

        const existing =
          await db.orm.public.AgendaCategory.first(
            {
              slug: item.slug,
            },
          );

        if (!existing) {
          await db.orm.public.AgendaCategory.create(
            {
              name: item.name,

              slug: item.slug,

              description:
                item.description,

              sortOrder:
                index,

              isActive:
                true,
            },
          );
        }
      }

      categories =
        await db.orm.public.AgendaCategory.all();
    }

    /*
     * --------------------------------------------------------
     * KOMITE
     * --------------------------------------------------------
     */
    const committees =
      await db.orm.public.Committee.all();

    /*
     * --------------------------------------------------------
     * HANYA DATA AKTIF
     * --------------------------------------------------------
     */
    const activeCategories =
      (
        Array.isArray(
          categories,
        )
          ? categories
          : []
      )
        .filter(
          (item) =>
            item.isActive !== false,
        )
        .sort(
          (a, b) =>
            Number(
              a.sortOrder ?? 0,
            ) -
            Number(
              b.sortOrder ?? 0,
            ),
        );

    const activeCommittees =
      (
        Array.isArray(
          committees,
        )
          ? committees
          : []
      )
        .filter(
          (item) =>
            item.isActive !== false,
        )
        .sort(
          (a, b) =>
            Number(
              a.sortOrder ?? 0,
            ) -
            Number(
              b.sortOrder ?? 0,
            ),
        );

    return NextResponse.json({
      success: true,

      categories:
        activeCategories,

      committees:
        activeCommittees,
    });
  } catch (error) {
    const response = adminApiError(error, "Gagal mengambil kategori dan komite.");
    return NextResponse.json(
      { ...(await response.json()), categories: [], committees: [] },
      { status: response.status },
    );
  }
}