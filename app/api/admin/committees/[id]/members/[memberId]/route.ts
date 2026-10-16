import { NextResponse } from "next/server";

import { requireAdminPermission } from "@/lib/admin";
import { adminApiError } from "@/lib/admin-api";
import { nowInstant } from "@/lib/dates";
import { db } from "@/lib/db";
import { canManageCommittee } from "@/lib/permissions";

type RouteContext = { params: Promise<{ id: string; memberId: string }> };

function text(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

async function verifyMemberAccess(userId: string, committeeId: string, memberId: string) {
  const committee = await db.orm.public.Committee.first({ id: committeeId });
  if (!committee) return { status: 404, message: "Komite tidak ditemukan." };
  if (!(await canManageCommittee(userId, committeeId))) {
    return { status: 403, message: "Akun ini tidak ditugaskan untuk mengelola anggota komite tersebut." };
  }
  const member = await db.orm.public.CommitteeMember.first({ id: memberId, committeeId });
  if (!member) return { status: 404, message: "Anggota komite tidak ditemukan." };
  return { member };
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const session = await requireAdminPermission("committee.member.manage");
    const { id, memberId } = await context.params;
    const access = await verifyMemberAccess(session.userId, id, memberId);
    if ("status" in access) {
      return NextResponse.json({ success: false, message: access.message }, { status: access.status });
    }

    const body = await request.json();
    const name = body.name === undefined ? access.member.name : text(body.name);
    const position = body.position === undefined ? access.member.position : text(body.position);
    if (!name || !position) {
      return NextResponse.json({ success: false, message: "Nama dan jabatan anggota wajib diisi." }, { status: 400 });
    }

    const updated = await db.orm.public.CommitteeMember.where({ id: memberId, committeeId: id }).update({
      name,
      position,
      photo: body.photo === undefined ? access.member.photo : text(body.photo) || null,
      biography: body.biography === undefined ? access.member.biography : text(body.biography) || null,
      sortOrder: Number.isInteger(body.sortOrder) ? Number(body.sortOrder) : access.member.sortOrder,
      isActive: typeof body.isActive === "boolean" ? body.isActive : access.member.isActive,
      updatedAt: nowInstant(),
    });
    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    return adminApiError(error, "Gagal memperbarui anggota komite.");
  }
}

export async function DELETE(_: Request, context: RouteContext) {
  try {
    const session = await requireAdminPermission("committee.member.manage");
    const { id, memberId } = await context.params;
    const access = await verifyMemberAccess(session.userId, id, memberId);
    if ("status" in access) {
      return NextResponse.json({ success: false, message: access.message }, { status: access.status });
    }

    await db.orm.public.CommitteeMember.where({ id: memberId, committeeId: id }).delete();
    return NextResponse.json({ success: true });
  } catch (error) {
    return adminApiError(error, "Gagal menghapus anggota komite.");
  }
}