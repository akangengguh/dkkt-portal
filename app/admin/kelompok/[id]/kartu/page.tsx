import Link from "next/link";

import RegistrationCard from "@/components/RegistrationCard";
import { requirePermissionPage } from "@/lib/admin";
import { db } from "@/lib/db";
import { hasPermission } from "@/lib/permissions";

export default async function KartuKelompokPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await requirePermissionPage("group.view");
  const { id } = await params;
  const group = await db.orm.public.CulturalGroup.first({ id });
  if (!group) return <div className="p-10 text-center text-white">Data kelompok tidak ditemukan.</div>;
  if (!["VERIFIED", "ACTIVE"].includes(group.registrationStatus)) return <main className="mx-auto max-w-xl p-8 text-white"><h1 className="text-2xl font-bold">Kartu belum dapat diterbitkan</h1><p className="mt-3 text-gray-400">Pendaftaran masih berstatus {group.registrationStatus}. Verifikasi pendaftaran terlebih dahulu.</p><Link href="/admin/kelompok" className="mt-6 inline-flex rounded-lg bg-amber-400 px-4 py-2 font-semibold text-black">Kembali ke pendaftaran</Link></main>;
  const committee = group.committeeId ? await db.orm.public.Committee.first({ id: group.committeeId }) : null;
  const canIssue = await hasPermission({ userId: session.userId, permission: "group.verify" });
  return <><RegistrationCard id={group.id} kind="group" canIssue={canIssue} category="GROUP" name={group.name} registrationNumber={group.registrationNumber} status={group.registrationStatus} committee={committee?.name || "Umum"} subtitle={group.groupType} secondary={group.leader || undefined} photo={group.logo} registeredAt={group.registeredAt} /><Link href="/admin/kelompok" className="fixed left-6 top-6 rounded-lg bg-white px-4 py-2 text-sm font-semibold shadow print:hidden">Kembali</Link></>;
}