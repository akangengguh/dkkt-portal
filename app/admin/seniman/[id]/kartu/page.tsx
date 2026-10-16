import Link from "next/link";

import RegistrationCard from "@/components/RegistrationCard";
import { requirePermissionPage } from "@/lib/admin";
import { db } from "@/lib/db";
import { hasPermission } from "@/lib/permissions";

export default async function KartuSenimanPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await requirePermissionPage("artist.view");
  const { id } = await params;
  const artist = await db.orm.public.Artist.first({ id });
  if (!artist) return <div className="p-10 text-center text-white">Data seniman tidak ditemukan.</div>;
  if (!["VERIFIED", "ACTIVE"].includes(artist.registrationStatus)) return <main className="mx-auto max-w-xl p-8 text-white"><h1 className="text-2xl font-bold">Kartu belum dapat diterbitkan</h1><p className="mt-3 text-gray-400">Pendaftaran masih berstatus {artist.registrationStatus}. Verifikasi pendaftaran terlebih dahulu.</p><Link href="/admin/seniman" className="mt-6 inline-flex rounded-lg bg-amber-400 px-4 py-2 font-semibold text-black">Kembali ke pendaftaran</Link></main>;
  const committee = artist.committeeId ? await db.orm.public.Committee.first({ id: artist.committeeId }) : null;
  const canIssue = await hasPermission({ userId: session.userId, permission: "artist.verify" });
  return <><RegistrationCard id={artist.id} kind="artist" canIssue={canIssue} category="INDIVIDUAL" name={artist.name} registrationNumber={artist.registrationNumber} status={artist.registrationStatus} committee={committee?.name || "Umum"} subtitle={artist.discipline || "Seniman & Budayawan"} secondary={artist.gender || undefined} photo={artist.photo} registeredAt={artist.registeredAt} /><Link href="/admin/seniman" className="fixed left-6 top-6 rounded-lg bg-white px-4 py-2 text-sm font-semibold shadow print:hidden">Kembali</Link></>;
}