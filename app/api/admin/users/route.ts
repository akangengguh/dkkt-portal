import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

import { requireSuperAdmin } from "@/lib/admin";
import { adminApiError } from "@/lib/admin-api";
import { nowInstant } from "@/lib/dates";
import { db } from "@/lib/db";

const managedRoles = [
  "SUPER_ADMIN",
  "ADMINISTRATOR",
  "EDITOR",
  "NEWS_EDITOR",
  "KOMITE_EDITOR",
] as const;

function text(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export async function POST(request: Request) {
  try {
    await requireSuperAdmin();
    const body = await request.json();
    const artistId = text(body.artistId);
    const roleName = text(body.roleName);
    const password = typeof body.password === "string" ? body.password : "";
    const requestedCommitteeIds: string[] = Array.isArray(body.committeeIds)
      ? Array.from(new Set<string>(body.committeeIds.map(text).filter(Boolean)))
      : [];
    const committeeIds = roleName === "KOMITE_EDITOR" ? requestedCommitteeIds : [];

    if (!artistId || !managedRoles.includes(roleName as (typeof managedRoles)[number])) {
      return NextResponse.json(
        { success: false, message: "Pilih seniman dan role akses yang valid." },
        { status: 400 },
      );
    }

    const artist = await db.orm.public.Artist.first({ id: artistId });
    if (!artist || !artist.isActive || artist.registrationStatus !== "ACTIVE") {
      return NextResponse.json(
        { success: false, message: "Akses hanya dapat diberikan kepada seniman aktif dan terverifikasi." },
        { status: 400 },
      );
    }
    if (!artist.email) {
      return NextResponse.json(
        { success: false, message: "Lengkapi email pada profil seniman sebelum mengaktifkan akses login." },
        { status: 400 },
      );
    }
    if (roleName === "KOMITE_EDITOR" && committeeIds.length === 0) {
      return NextResponse.json(
        { success: false, message: "Pilih minimal satu komite untuk role Komite." },
        { status: 400 },
      );
    }

    const [role, assignedArtistAccount, users, committees] = await Promise.all([
      db.orm.public.Role.first({ name: roleName }),
      db.orm.public.User.first({ artistId }),
      db.orm.public.User.all(),
      db.orm.public.Committee.all(),
    ]);
    const emailAccount = users.find(
      (user) => user.email.toLowerCase() === artist.email!.toLowerCase(),
    );
    if (!role) {
      return NextResponse.json(
        { success: false, message: "Role belum tersedia. Jalankan seed permission terlebih dahulu." },
        { status: 409 },
      );
    }

    const invalidCommittee = committeeIds.some(
      (id) => !committees.some((committee) => committee.id === id && committee.isActive),
    );
    if (invalidCommittee) {
      return NextResponse.json(
        { success: false, message: "Daftar komite tidak valid atau tidak aktif." },
        { status: 400 },
      );
    }

    if (emailAccount?.artistId && emailAccount.artistId !== artist.id) {
      return NextResponse.json(
        { success: false, message: "Email profil seniman sudah terhubung ke profil lain." },
        { status: 409 },
      );
    }

    const account = assignedArtistAccount || emailAccount;
    const isNewAccount = !account;
    if (isNewAccount && password.length < 12) {
      return NextResponse.json(
        { success: false, message: "Sandi awal akun baru minimal 12 karakter." },
        { status: 400 },
      );
    }

    if (account && roleName !== "SUPER_ADMIN") {
      const currentRoles = await db.orm.public.UserRole.where({ userId: account.id }).all();
      const superAdminRole = await db.orm.public.Role.first({ name: "SUPER_ADMIN" });
      if (superAdminRole && currentRoles.some((item) => item.roleId === superAdminRole.id)) {
        const superAdminAssignments = await db.orm.public.UserRole
          .where({ roleId: superAdminRole.id })
          .all();
        if (superAdminAssignments.length <= 1) {
          return NextResponse.json(
            { success: false, message: "Role Super Admin terakhir tidak dapat diturunkan." },
            { status: 409 },
          );
        }
      }
    }

    const username = account?.username || artist.registrationNumber;
    const usernameAccount = await db.orm.public.User.first({ username });
    if (usernameAccount && usernameAccount.id !== account?.id) {
      return NextResponse.json(
        { success: false, message: "Nomor registrasi sudah dipakai sebagai username akun lain." },
        { status: 409 },
      );
    }

    const passwordHash = isNewAccount ? await bcrypt.hash(password, 12) : null;
    const userId = await db.transaction(async (tx) => {
      let userId = account?.id;
      if (account) {
        await tx.orm.public.User.where({ id: account.id }).update({
          artistId: artist.id,
          name: artist.name,
          email: artist.email!.toLowerCase(),
          username: account.username || username,
          status: "ACTIVE",
          updatedAt: nowInstant(),
        });
      } else {
        const created = await tx.orm.public.User.create({
          artistId: artist.id,
          name: artist.name,
          username,
          email: artist.email!.toLowerCase(),
          passwordHash: passwordHash!,
          status: "ACTIVE",
        });
        userId = created.id;
      }

      if (!userId) throw new Error("Akun login gagal disiapkan.");
      await tx.orm.public.UserRole.where({ userId }).delete();
      await tx.orm.public.UserRole.create({ userId, roleId: role.id });
      await tx.orm.public.CommitteeUser.where({ userId }).delete();

      if (roleName === "KOMITE_EDITOR") {
        for (const committeeId of committeeIds) {
          await tx.orm.public.CommitteeUser.create({
            userId,
            committeeId,
            accessLevel: "EDITOR",
          });
        }
      }

      return userId;
    });

    return NextResponse.json({
      success: true,
      message: isNewAccount ? "Akun login dan hak akses berhasil diaktifkan." : "Hak akses akun berhasil diperbarui.",
      data: {
        userId,
        artistId: artist.id,
        name: artist.name,
        email: artist.email.toLowerCase(),
        username,
        roleName,
        committeeIds: roleName === "KOMITE_EDITOR" ? committeeIds : [],
        isNewAccount,
      },
    });
  } catch (error) {
    return adminApiError(error, "Gagal mengaktifkan akses CMS untuk seniman.");
  }
}