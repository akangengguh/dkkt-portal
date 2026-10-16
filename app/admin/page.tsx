import Link from "next/link";

import BackupButton from "@/components/admin/BackupButton";
import { requireAdmin } from "@/lib/admin";
import { getDashboardStats } from "@/lib/dashboard";
import { hasAnyPermission, hasPermission } from "@/lib/permissions";

export default async function AdminDashboardPage() {
  const session = await requireAdmin();

  const [stats, canCreateNews, canViewReports] = await Promise.all([
    getDashboardStats(session.userId),
    hasPermission({ userId: session.userId, permission: "news.create" }),
    hasAnyPermission(session.userId, ["artist.view", "group.view", "committee.view"]),
  ]);
  const cards = [
    { label: "Berita", key: "news", href: "/admin/berita" },
    { label: "Agenda", key: "agendas", href: "/admin/agenda" },
    { label: "Galeri", key: "gallery", href: "/admin/galeri" },
    { label: "Dokumen", key: "documents", href: "/admin/dokumen" },
    { label: "Media", key: "media", href: "/admin/media" },
    { label: "Pengguna", key: "users", href: "/admin/pengguna" },
  ];
  const visibleCards = cards.filter((item) => stats[item.key as keyof typeof stats] !== undefined);
  const summary = [
    { label: "Komite aktif", value: stats.committees },
    { label: "Pesan kontak", value: stats.contactMessages },
    { label: "Dokumen publik", value: stats.documents },
  ].filter((item): item is { label: string; value: number } => item.value !== undefined);

  return (
    <div className="mx-auto max-w-7xl pb-20">
      <section className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-amber-400">
            CMS DKKT
          </p>
          <h1 className="mt-2 text-3xl font-black text-white md:text-4xl">
            Dashboard Admin
          </h1>
        </div>

        <div className="flex flex-wrap gap-3">
          {session.roles.includes("SUPER_ADMIN") && <BackupButton />}
          {canCreateNews && <Link href="/admin/berita/tambah" className="inline-flex items-center justify-center rounded-xl bg-amber-500 px-5 py-3 text-sm font-bold text-black">+ Tambah Berita</Link>}
        </div>
      </section>

      <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {visibleCards.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className="rounded-2xl border border-white/10 bg-[#0b0b0b] p-5 transition hover:border-amber-400/40"
          >
            <p className="text-xs uppercase tracking-[0.2em] text-gray-600">{item.label}</p>
            <p className="mt-2 text-3xl font-black text-white">{stats[item.key as keyof typeof stats]}</p>
            <p className="mt-1 text-sm text-gray-500">Lihat modul</p>
          </Link>
        ))}
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-3xl border border-white/10 bg-[#0b0b0b] p-6">
          <h2 className="text-xl font-black text-white">Akses Cepat</h2>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {visibleCards.filter((item) => ["news", "agendas", "gallery", "documents"].includes(item.key)).map((item) => <Link key={item.key} href={item.href} className="rounded-2xl border border-white/10 bg-white/2 p-4 text-sm text-gray-300 hover:border-amber-400/30 hover:text-amber-300">Kelola {item.label}</Link>)}
            {canViewReports && <Link href="/admin/laporan" className="rounded-2xl border border-white/10 bg-white/2 p-4 text-sm text-gray-300 hover:border-amber-400/30 hover:text-amber-300">Cetak laporan</Link>}
          </div>
        </div>

        <div className="rounded-3xl border border-amber-500/20 bg-amber-500/5 p-6">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-400">
            Ringkasan
          </p>
          <div className="mt-4 space-y-4 text-sm text-gray-300">
            {summary.map((item) => <div key={item.label} className="flex items-center justify-between border-b border-white/10 pb-3 last:border-0 last:pb-0"><span>{item.label}</span><span className="font-bold text-white">{item.value}</span></div>)}
          </div>
        </div>
      </section>
    </div>
  );
}
