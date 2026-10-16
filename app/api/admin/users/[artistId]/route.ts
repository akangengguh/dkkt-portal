import { NextResponse } from "next/server";

import { requireSuperAdmin } from "@/lib/admin";
import { adminApiError } from "@/lib/admin-api";
import { nowInstant } from "@/lib/dates";
import { db } from "@/lib/db";

export async function DELETE(_: Request, context: { params: Promise<{ artistId: string }> }) {
  try {
    await requireSuperAdmin();
    const { artistId } = await context.params;
    const [artist, users] = await Promise.all([
      db.orm.public.Artist.first({ id: artistId }),
      db.orm.public.User.all(),
    ]);
    if (!artist) {
      return NextResponse.json({ success: false, message: "Seniman tidak ditemukan." }, { status: 404 });
    }

    const user = users.find(
      (item) => item.artistId === artistId || (artist.email && item.email.toLowerCase() === artist.email.toLowerCase()),
    );
    if (!user) {
      return NextResponse.json({ success: false, message: "Akun login seniman ini tidak ditemukan." }, { status: 404 });
    }

    const [roles, superAdminRole] = await Promise.all([
      db.orm.public.UserRole.where({ userId: user.id }).all(),
      db.orm.public.Role.first({ name: "SUPER_ADMIN" }),
    ]);
    if (superAdminRole && roles.some((item) => item.roleId === superAdminRole.id)) {
      const [assignments, allUsers] = await Promise.all([
        db.orm.public.UserRole.where({ roleId: superAdminRole.id }).all(),
        db.orm.public.User.all(),
      ]);
      const activeSuperAdmins = assignments.filter((assignment) =>
        allUsers.some((candidate) => candidate.id === assignment.userId && candidate.status === "ACTIVE"),
      );
      if (activeSuperAdmins.length <= 1) {
        return NextResponse.json(
          { success: false, message: "Super Admin aktif terakhir tidak dapat dinonaktifkan." },
          { status: 409 },
        );
      }
    }

    await db.transaction(async (tx) => {
      await tx.orm.public.UserRole.where({ userId: user.id }).delete();
      await tx.orm.public.CommitteeUser.where({ userId: user.id }).delete();
      await tx.orm.public.User.where({ id: user.id }).update({
        status: "INACTIVE",
        updatedAt: nowInstant(),
      });
    });

    return NextResponse.json({ success: true, message: "Akses CMS dicabut; akun dan riwayat audit tetap disimpan." });
  } catch (error) {
    return adminApiError(error, "Gagal mencabut akses CMS.");
  }
}