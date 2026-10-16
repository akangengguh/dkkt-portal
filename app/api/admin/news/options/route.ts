import "temporal-polyfill/full/global";

import { NextResponse } from "next/server";

import { requireAdminPermission } from "@/lib/admin";
import { adminApiError } from "@/lib/admin-api";
import { db } from "@/lib/db";
import { getAccessibleCommitteeIds, getUserRoles } from "@/lib/permissions";

export async function GET() {
  try {
    const session = await requireAdminPermission("news.view");
    const roles = await getUserRoles(session.userId);
    const isCommitteeEditor = roles.some((role) => ["KOMITE_EDITOR", "KOMITE_MANAGER"].includes(role));
    const committeeIds = isCommitteeEditor
      ? new Set(await getAccessibleCommitteeIds(session.userId) || [])
      : null;

    const [categories, committees] =
      await Promise.all([
        db.orm.public.NewsCategory.all(),
        db.orm.public.Committee.all(),
      ]);

    const sortedCategories =
      [...categories].sort(
        (a, b) =>
          a.sortOrder - b.sortOrder,
      );

    const sortedCommittees =
      [...committees]
        .filter(
          (item) => item.isActive && (!committeeIds || committeeIds.has(item.id)),
        )
        .sort(
          (a, b) =>
            a.sortOrder - b.sortOrder,
        );

    return NextResponse.json({
      success: true,
      categories: sortedCategories.map(
        (item) => ({
          id: item.id,
          name: item.name,
        }),
      ),
      committees: sortedCommittees.map(
        (item) => ({
          id: item.id,
          name: item.name,
          slug: item.slug,
        }),
      ),
    });
  } catch (error) {
    return adminApiError(error, "Gagal mengambil opsi berita.");
  }
}