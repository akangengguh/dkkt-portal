import { NextResponse } from "next/server";

import { requireAdminPermission } from "@/lib/admin";
import { adminApiError } from "@/lib/admin-api";
import { db } from "@/lib/db";
import { canManageCommittee } from "@/lib/permissions";

type RouteContext = { params: Promise<{ id: string }> };

function text(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

async function verifyCommitteeAccess(userId: string, committeeId: string) {
  const committee = await db.orm.public.Committee.first({ id: committeeId });
  if (!committee) return { status: 404, message: "Komite tidak ditemukan." };
  if (!(await canManageCommittee(userId, committeeId))) {
    return { status: 403, message: "Akun ini tidak ditugaskan untuk mengelola anggota komite tersebut." };
  }
  return null;
}

export async function GET(_: Request, context: RouteContext) {
  try {
    const session = await requireAdminPermission("committee.view");
    const { id } = await context.params;
    const accessError = await verifyCommitteeAccess(session.userId, id);
    if (accessError) {
      return NextResponse.json({ success: false, message: accessError.message }, { status: accessError.status });
    }

    const members = await db.orm.public.CommitteeMember.where({ committeeId: id }).all();
    return NextResponse.json({ success: true, data: members.sort((a, b) => a.sortOrder - b.sortOrder) });
  } catch (error) {
    return adminApiError(error, "Gagal mengambil anggota komite.");
  }
}

export async function POST(request: Request, context: RouteContext) {
  try {
    const session = await requireAdminPermission("committee.member.manage");
    const { id } = await context.params;
    const accessError = await verifyCommitteeAccess(session.userId, id);
    if (accessError) {
      return NextResponse.json({ success: false, message: accessError.message }, { status: accessError.status });
    }

    const body = await request.json();
    const name = text(body.name);
    const position = text(body.position);
    if (!name || !position) {
      return NextResponse.json({ success: false, message: "Nama dan jabatan anggota wajib diisi." }, { status: 400 });
    }

    const member = await db.orm.public.CommitteeMember.create({
      committeeId: id,
      name,
      position,
      photo: text(body.photo) || null,
      biography: text(body.biography) || null,
      sortOrder: Number.isInteger(body.sortOrder) ? Number(body.sortOrder) : 0,
      isActive: true,
    });
    return NextResponse.json({ success: true, data: member }, { status: 201 });
  } catch (error) {
    return adminApiError(error, "Gagal menambahkan anggota komite.");
  }
}