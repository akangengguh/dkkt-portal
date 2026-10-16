import Link from "next/link";
import { connection } from "next/server";

import { db } from "@/lib/db";

async function getStats() {
  const [news, agenda, gallery, documents, committees] = await Promise.all([
    db.orm.public.News.all(),
    db.orm.public.Agenda.all(),
    db.orm.public.GalleryItem.all(),
    db.orm.public.Document.all(),
    db.orm.public.Committee.all(),
  ]);

  return {
    news: news.length,
    agenda: agenda.length,
    gallery: gallery.length,
    documents: documents.length,
    committees: committees.length,
  };
}

export default async function DashboardPage() {
  await connection();
  const stats = await getStats();

  const cards = [
    { label: "Berita", value: stats.news, href: "/berita" },
    { label: "Agenda", value: stats.agenda, href: "/agenda" },
    { label: "Galeri", value: stats.gallery, href: "/galeri" },
    { label: "Dokumen", value: stats.documents, href: "/dokumen" },
  ];

  return (
    <main className="min-h-screen bg-black text-white">
      <section className="mx-auto max-w-7xl px-6 pb-20 pt-[150px]">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-amber-400">
              Dashboard
            </p>
            <h1 className="mt-3 text-4xl font-black md:text-5xl">
              DKKT Portal
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-8 text-gray-400">
              Ringkasan konten dan aktivitas utama portal seni & budaya Kota Tasikmalaya.
            </p>
          </div>

          <Link
            href="/admin"
            className="inline-flex items-center justify-center rounded-xl bg-amber-500 px-5 py-3 text-sm font-bold text-black"
          >
            Kelola CMS
          </Link>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {cards.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="rounded-3xl border border-white/10 bg-[#0b0b0b] p-5 transition hover:border-amber-400/40"
            >
              <p className="text-xs uppercase tracking-[0.2em] text-gray-600">{item.label}</p>
              <p className="mt-3 text-3xl font-black text-white">{item.value}</p>
              <p className="mt-2 text-sm text-gray-500">Lihat halaman</p>
            </Link>
          ))}

          <div className="rounded-3xl border border-white/10 bg-[#0b0b0b] p-5">
            <p className="text-xs uppercase tracking-[0.2em] text-gray-600">Komite</p>
            <p className="mt-3 text-3xl font-black text-white">{stats.committees}</p>
            <p className="mt-2 text-sm text-gray-500">Kelompok terdaftar</p>
          </div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-3xl border border-white/10 bg-[#0b0b0b] p-6">
            <h2 className="text-xl font-black text-white">Pintasan Portal</h2>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <Link href="/berita" className="rounded-2xl border border-white/10 bg-white/2 p-4 text-sm text-gray-300 hover:border-amber-400/30 hover:text-amber-300">
                Berita & Informasi
              </Link>
              <Link href="/agenda" className="rounded-2xl border border-white/10 bg-white/2 p-4 text-sm text-gray-300 hover:border-amber-400/30 hover:text-amber-300">
                Agenda & Kegiatan
              </Link>
              <Link href="/galeri" className="rounded-2xl border border-white/10 bg-white/2 p-4 text-sm text-gray-300 hover:border-amber-400/30 hover:text-amber-300">
                Galeri Visual
              </Link>
              <Link href="/dokumen" className="rounded-2xl border border-white/10 bg-white/2 p-4 text-sm text-gray-300 hover:border-amber-400/30 hover:text-amber-300">
                Dokumen & Arsip
              </Link>
            </div>
          </div>

          <div className="rounded-3xl border border-amber-500/20 bg-amber-500/5 p-6">
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-amber-400">
              Status Sistem
            </p>
            <h2 className="mt-3 text-2xl font-black text-white">Portal aktif</h2>
            <p className="mt-3 text-sm leading-7 text-gray-300">
              Semua modul utama yang sudah dibangun dapat digunakan melalui portal dan CMS. Data diambil langsung dari database Prisma yang terhubung ke aplikasi ini.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
