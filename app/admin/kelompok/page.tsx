import Link from "next/link";

import EcosystemActions from "@/components/admin/EcosystemActions";
import EcosystemExcelTools from "@/components/admin/EcosystemExcelTools";
import AdminListSearch from "@/components/admin/AdminListSearch";
import PrintReportButton from "@/components/admin/PrintReportButton";
import { requireAdmin } from "@/lib/admin";
import { db } from "@/lib/db";
import { hasPermission } from "@/lib/permissions";
import { matchesSearch } from "@/lib/search";

function formatDate(value: unknown) {
  if (!value) return "-";
  return new Date(String(value)).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });
}

function statusClass(status: string) {
  if (status === "ACTIVE") return "border-emerald-400/20 bg-emerald-400/5 text-emerald-300";
  if (status === "VERIFIED") return "border-sky-400/20 bg-sky-400/5 text-sky-300";
  if (status === "REJECTED" || status === "EXPIRED") return "border-red-400/20 bg-red-400/5 text-red-300";
  return "border-amber-400/20 bg-amber-400/5 text-amber-300";
}

const statusLabel: Record<string, string> = {
  PENDING: "Menunggu verifikasi",
  VERIFIED: "Terverifikasi · menunggu kartu",
  ACTIVE: "Aktif · kartu diterbitkan",
  REJECTED: "Ditolak",
  EXPIRED: "Kedaluwarsa",
};

export default async function AdminKelompokPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string | string[] }>;
}) {
  const params = await searchParams;
  const query = typeof params.q === "string" ? params.q.trim() : "";
  const session = await requireAdmin();
  const [canView, canCreate, canUpdate, canDelete, canVerify] = await Promise.all([
    hasPermission({ userId: session.userId, permission: "group.view" }),
    hasPermission({ userId: session.userId, permission: "group.create" }),
    hasPermission({ userId: session.userId, permission: "group.update" }),
    hasPermission({ userId: session.userId, permission: "group.delete" }),
    hasPermission({ userId: session.userId, permission: "group.verify" }),
  ]);
  if (!canView) return <section className="rounded-xl border border-red-500/20 bg-red-500/5 p-8"><h1 className="text-2xl font-bold text-white">Akses ditolak</h1><p className="mt-2 text-gray-400">Anda tidak memiliki akses ke modul Kelompok.</p><Link href="/admin" className="mt-5 inline-flex rounded-lg bg-amber-400 px-4 py-2 font-semibold text-black">Kembali</Link></section>;

  const allGroups = (await db.orm.public.CulturalGroup.all()).sort((a, b) => new Date(String(b.registeredAt)).getTime() - new Date(String(a.registeredAt)).getTime());
  const groups = allGroups.filter((group) => matchesSearch(query, [group.name, group.registrationNumber, group.groupType, group.leader, group.email, group.phone, group.registrationStatus]));
  const pending = allGroups.filter((item) => item.registrationStatus === "PENDING").length;
  const verified = allGroups.filter((item) => item.registrationStatus === "VERIFIED").length;
  const active = allGroups.filter((item) => item.registrationStatus === "ACTIVE").length;

  return (
    <main className="mx-auto max-w-7xl pb-16">
      <header className="flex flex-wrap items-end justify-between gap-5 border-b border-white/10 pb-6">
        <div><p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-300">CMS DKKT</p><h1 className="mt-2 text-3xl font-bold text-white">Kelompok / Sanggar</h1><p className="mt-2 text-sm text-gray-400">Antrean pendaftaran, verifikasi dokumen, dan penerbitan kartu kelompok.</p></div>
        <div className="flex flex-wrap items-start gap-3"><PrintReportButton href="/admin/laporan?category=group" /><EcosystemExcelTools kind="group" canCreate={canCreate} canUpdate={canUpdate} /><Link href="/admin" className="rounded-lg border border-white/15 px-4 py-2.5 text-sm font-semibold text-gray-300">Kembali</Link>{canCreate && <Link href="/admin/kelompok/tambah" className="rounded-lg bg-amber-400 px-4 py-2.5 text-sm font-bold text-black">Tambah pendaftaran</Link>}</div>
      </header>

      <section className="grid gap-4 border-b border-white/10 py-6 sm:grid-cols-4">
        {[{ label: "Total pendaftaran", value: groups.length }, { label: "Menunggu verifikasi", value: pending }, { label: "Terverifikasi · kartu belum terbit", value: verified }, { label: "Aktif", value: active }].map((item) => <div key={item.label}><p className="text-xs text-gray-500">{item.label}</p><p className="mt-1 text-2xl font-bold text-white">{item.value}</p></div>)}
      </section>

      <section className="mt-6 overflow-hidden rounded-xl border border-white/10">
        <div className="space-y-4 border-b border-white/10 px-5 py-4"><div><h2 className="font-semibold text-white">Daftar pendaftaran</h2><p className="mt-1 text-xs text-gray-500">Urut terbaru dahulu. Pendaftaran pending tidak ditampilkan ke publik.</p></div><AdminListSearch query={query} clearHref="/admin/kelompok" placeholder="Nama, nomor registrasi, jenis, pemimpin, status" resultCount={groups.length} /></div>
        {groups.length === 0 ? <p className="px-5 py-12 text-center text-sm text-gray-500">{query ? "Tidak ada pendaftaran yang cocok dengan pencarian." : "Belum ada pendaftaran."}</p> : <div className="overflow-x-auto"><table className="min-w-full text-left text-sm"><thead className="bg-white/3 text-xs text-gray-400"><tr><th className="px-5 py-3">Kelompok / sanggar</th><th className="px-5 py-3">No. registrasi</th><th className="px-5 py-3">Tanggal masuk</th><th className="px-5 py-3">Status</th><th className="px-5 py-3">Tindakan</th></tr></thead><tbody>{groups.map((group) => <tr key={group.id} className="border-t border-white/10 align-middle"><td className="px-5 py-4"><p className="font-semibold text-white">{group.name}</p><p className="mt-1 text-xs text-gray-500">{group.groupType}{group.leader ? ` · ${group.leader}` : ""}</p></td><td className="px-5 py-4 font-mono text-xs text-gray-300">{group.registrationNumber}</td><td className="px-5 py-4 text-gray-400">{formatDate(group.registeredAt)}</td><td className="px-5 py-4"><span className={`inline-flex rounded-full border px-2.5 py-1 text-xs ${statusClass(group.registrationStatus)}`}>{statusLabel[group.registrationStatus] || group.registrationStatus}</span></td><td className="px-5 py-4"><EcosystemActions kind="group" id={group.id} status={group.registrationStatus} canUpdate={canUpdate} canDelete={canDelete} canVerify={canVerify} /></td></tr>)}</tbody></table></div>}
      </section>

      <section className="report-print" aria-label="Laporan kelompok dan sanggar">
        <header>
          <p>Dewan Kesenian dan Kebudayaan Kota Tasikmalaya</p>
          <h1>Laporan Data Kelompok / Sanggar</h1>
          <p>Dicetak: {new Date().toLocaleString("id-ID")}</p>
        </header>
        <div className="report-summary">
          <p>Jumlah kelompok / sanggar: <strong>{allGroups.length}</strong></p>
          <p>Menunggu verifikasi: <strong>{pending}</strong></p>
          <p>Terverifikasi: <strong>{verified}</strong></p>
          <p>Aktif: <strong>{active}</strong></p>
        </div>
        <table>
          <thead>
            <tr><th>No.</th><th>Kelompok / sanggar</th><th>Jenis / pemimpin</th><th>No. registrasi</th><th>Tanggal masuk</th><th>Status</th></tr>
          </thead>
          <tbody>
            {allGroups.map((group, index) => (
              <tr key={group.id}>
                <td>{index + 1}</td>
                <td>{group.name}</td>
                <td>{[group.groupType, group.leader].filter(Boolean).join(" / ") || "-"}</td>
                <td>{group.registrationNumber}</td>
                <td>{formatDate(group.registeredAt)}</td>
                <td>{statusLabel[group.registrationStatus] || group.registrationStatus}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </main>
  );
}