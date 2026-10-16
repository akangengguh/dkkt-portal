import Link from "next/link";

import { requireAdminPermission } from "@/lib/admin";
import { db } from "@/lib/db";
import AdminListSearch from "@/components/admin/AdminListSearch";
import { matchesSearch } from "@/lib/search";

type SearchParams = {
  entity?: string;
  q?: string;
};

function formatDate(value: unknown) {
  return new Date(String(value)).toLocaleString("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default async function AdminAuditLogPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  await requireAdminPermission("audit.view");

  const params = await searchParams;
  const entity = typeof params.entity === "string" ? params.entity.trim() : "";
  const query = typeof params.q === "string" ? params.q.trim() : "";
  const [logs, users] = await Promise.all([
    db.orm.public.AuditLog.all(),
    db.orm.public.User.all(),
  ]);
  const userMap = new Map(users.map((user) => [user.id, user.name]));
  const entities = [...new Set(logs.map((log) => log.entity))].sort();
  const filteredLogs = logs
    .filter((log) => !entity || log.entity === entity)
    .filter((log) => matchesSearch(query, [log.action, log.entity, log.entityId, log.message, log.ipAddress, userMap.get(log.userId || "")]))
    .sort((a, b) => new Date(String(b.createdAt)).getTime() - new Date(String(a.createdAt)).getTime());

  return (
    <div className="mx-auto max-w-7xl pb-20">
      <section className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-amber-400">CMS DKKT</p>
          <h1 className="mt-2 text-3xl font-black text-white md:text-4xl">Audit Log</h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-gray-400">Riwayat perubahan dan aktivitas penting yang dilakukan di dalam CMS.</p>
        </div>
        <Link href="/admin" className="inline-flex items-center justify-center rounded-xl border border-white/10 px-5 py-3 text-sm font-semibold text-gray-300 hover:border-amber-400/40 hover:text-amber-300">Kembali ke Dashboard</Link>
      </section>

      <section className="mt-8 grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-[#0b0b0b] p-5"><p className="text-xs uppercase tracking-[0.2em] text-gray-600">Total Aktivitas</p><p className="mt-2 text-3xl font-black text-white">{logs.length}</p><p className="mt-1 text-sm text-gray-500">Semua catatan</p></div>
        <div className="rounded-2xl border border-white/10 bg-[#0b0b0b] p-5"><p className="text-xs uppercase tracking-[0.2em] text-gray-600">Entitas</p><p className="mt-2 text-3xl font-black text-amber-300">{entities.length}</p><p className="mt-1 text-sm text-gray-500">Jenis data berubah</p></div>
        <div className="rounded-2xl border border-white/10 bg-[#0b0b0b] p-5"><p className="text-xs uppercase tracking-[0.2em] text-gray-600">Ditampilkan</p><p className="mt-2 text-3xl font-black text-emerald-300">{filteredLogs.length}</p><p className="mt-1 text-sm text-gray-500">Sesuai filter</p></div>
      </section>

      <section className="mt-8 overflow-hidden rounded-3xl border border-white/10 bg-[#0b0b0b]">
        <div className="flex flex-col gap-4 border-b border-white/10 px-6 py-5 md:flex-row md:items-center md:justify-between">
          <div><h2 className="text-lg font-black text-white">Aktivitas Terbaru</h2><p className="mt-1 text-sm text-gray-500">Catatan disusun dari yang paling baru.</p></div>
          <div className="flex flex-wrap items-center gap-3"><AdminListSearch query={query} clearHref={entity ? `/admin/audit-log?entity=${encodeURIComponent(entity)}` : "/admin/audit-log"} placeholder="Cari aktivitas, pengguna, detail" resultCount={filteredLogs.length} /><form method="GET" className="flex items-center gap-2">{query && <input type="hidden" name="q" value={query} />}<label htmlFor="entity" className="sr-only">Entitas</label><select id="entity" name="entity" defaultValue={entity} className="rounded-xl border border-white/10 bg-[#111] px-3 py-2 text-sm text-white"><option value="">Semua entitas</option>{entities.map((item) => <option key={item} value={item}>{item}</option>)}</select><button type="submit" className="rounded-xl bg-amber-500 px-4 py-2 text-sm font-bold text-black">Filter</button></form></div>
        </div>

        {filteredLogs.length === 0 ? <div className="px-6 py-16 text-center text-gray-500">Belum ada catatan audit untuk filter ini.</div> : <div className="overflow-x-auto"><table className="min-w-full text-left text-sm"><thead className="border-b border-white/10 bg-white/2 text-gray-300"><tr><th className="px-6 py-4 font-semibold">Waktu</th><th className="px-6 py-4 font-semibold">Aktivitas</th><th className="px-6 py-4 font-semibold">Entitas</th><th className="px-6 py-4 font-semibold">Pengguna</th><th className="px-6 py-4 font-semibold">Detail</th></tr></thead><tbody>{filteredLogs.map((log) => <tr key={log.id} className="border-b border-white/10 text-gray-300 last:border-b-0"><td className="whitespace-nowrap px-6 py-4 text-gray-400">{formatDate(log.createdAt)}</td><td className="px-6 py-4 font-semibold text-white">{log.action}</td><td className="px-6 py-4"><span className="rounded-full border border-amber-500/20 bg-amber-500/5 px-2.5 py-1 text-xs font-semibold text-amber-300">{log.entity}</span></td><td className="px-6 py-4 text-gray-400">{log.userId ? userMap.get(log.userId) || "Pengguna dihapus" : "Sistem"}</td><td className="max-w-md px-6 py-4 text-gray-500">{log.message || log.entityId || "-"}</td></tr>)}</tbody></table></div>}
      </section>
    </div>
  );
}