import Link from "next/link";

import PageHero from "@/components/PageHero";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function KomitePage() {
  const [committees, artists] = await Promise.all([
    db.orm.public.Committee.where({ isActive: true }).all(),
    db.orm.public.Artist.where({ isActive: true, registrationStatus: "ACTIVE" }).all(),
  ]);
  const artistMap = new Map(artists.map((artist) => [artist.id, artist]));
  const sortedCommittees = committees.sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <main className="min-h-screen bg-black text-white">
      <PageHero eyebrow="Komite DKKT" title="Ruang Pengembangan" highlight="Seni & Budaya" description="Daftar komite aktif DKKT. Nama, deskripsi, dan ketua mengikuti data yang dikelola pada CMS." />
      <section className="border-y border-amber-500/20 bg-[#090909] py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-10"><p className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-400">Bidang aktif</p><h2 className="mt-3 text-3xl font-black">Komite DKKT</h2><p className="mt-3 text-sm text-gray-400">{sortedCommittees.length} komite terdaftar di CMS.</p></div>
          {sortedCommittees.length === 0 ? <p className="border-t border-white/10 py-12 text-center text-gray-500">Belum ada komite aktif.</p> : <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{sortedCommittees.map((committee, index) => {
            const chair = committee.chairmanArtistId ? artistMap.get(committee.chairmanArtistId) : undefined;
            return <Link key={committee.id} href={`/komite/${committee.slug}`} className="group border-t border-white/10 py-6 transition hover:border-amber-400/50">
              <div className="flex items-start justify-between gap-4"><span className="text-3xl">{committee.icon || "✦"}</span><span className="font-mono text-xs text-gray-600">{String(index + 1).padStart(2, "0")}</span></div>
              <h3 className="mt-5 text-xl font-bold text-white group-hover:text-amber-300">{committee.name}</h3>
              <p className="mt-3 line-clamp-3 text-sm leading-6 text-gray-400">{committee.description || "Informasi komite belum tersedia."}</p>
              <div className="mt-5 border-t border-white/10 pt-4"><p className="text-xs text-gray-500">Ketua komite</p><p className="mt-1 font-semibold text-gray-200">{chair?.name || "Belum ditentukan"}</p>{chair && <p className="mt-1 font-mono text-xs text-amber-300">{chair.registrationNumber}</p>}</div>
              <p className="mt-5 text-sm font-semibold text-amber-400">Lihat profil komite →</p>
            </Link>;
          })}</div>}
        </div>
      </section>
      <section className="py-12"><div className="mx-auto max-w-7xl px-6"><Link href="/profil#struktur" className="text-sm font-semibold text-amber-400 hover:text-amber-300">Lihat struktur organisasi DKKT →</Link></div></section>
    </main>
  );
}