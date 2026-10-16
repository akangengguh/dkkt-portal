import Link from "next/link";
import { notFound } from "next/navigation";

import Navbar from "@/components/Navbar";
import PageHero from "@/components/PageHero";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function KomiteDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const committee = await db.orm.public.Committee.first({ slug, isActive: true });
  if (!committee) notFound();

  const [artists, members] = await Promise.all([
    db.orm.public.Artist.where({ isActive: true, registrationStatus: "ACTIVE" }).all(),
    db.orm.public.CommitteeMember.where({ committeeId: committee.id, isActive: true }).all(),
  ]);
  const artistMap = new Map(artists.map((artist) => [artist.id, artist]));
  const chair = committee.chairmanArtistId ? artistMap.get(committee.chairmanArtistId) : undefined;

  return (
    <main className="min-h-screen bg-black text-white">
      <Navbar />
      <PageHero eyebrow="Komite DKKT" title={committee.name} highlight={committee.shortName || "Seni & Kebudayaan"} description={committee.description || "Informasi komite belum tersedia."}>
        <div className="flex flex-wrap gap-4"><Link href="/komite" className="rounded-xl border border-amber-500 px-6 py-3 font-semibold text-amber-400 transition hover:bg-amber-500 hover:text-black">Semua Komite</Link><Link href="/profil#struktur" className="rounded-xl border border-white/15 px-6 py-3 font-semibold text-gray-200">Struktur DKKT</Link></div>
      </PageHero>

      <section className="border-y border-white/10 py-16">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 lg:grid-cols-[0.7fr_1.3fr]">
          <div className="flex min-h-56 items-center justify-center rounded-2xl border border-amber-400/20 bg-amber-400/5 text-7xl">{committee.icon || "✦"}</div>
          <div className="self-center"><p className="text-xs font-bold uppercase tracking-[0.25em] text-amber-400">Ketua Komite</p>{chair ? <div className="mt-4 flex items-center gap-4">{chair.photo ? <img src={chair.photo} alt={chair.name} className="h-16 w-16 rounded-xl object-cover" /> : <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-white/5 font-bold text-amber-300">{chair.name.slice(0, 1)}</div>}<div><h2 className="text-2xl font-bold">{chair.name}</h2><p className="mt-1 font-mono text-sm text-amber-300">NTA / No. registrasi: {chair.registrationNumber}</p><p className="mt-1 text-sm text-gray-400">{chair.discipline || "Seniman & Budayawan"}</p></div></div> : <p className="mt-4 text-lg text-gray-400">Ketua belum ditentukan.</p>}<p className="mt-6 max-w-3xl leading-7 text-gray-400">{committee.description || "Informasi komite belum tersedia."}</p></div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="border-b border-white/10 pb-5"><p className="text-xs font-bold uppercase tracking-[0.25em] text-amber-400">Susunan</p><h2 className="mt-2 text-2xl font-bold">Anggota Komite</h2></div>
        {members.length === 0 ? <p className="py-10 text-sm text-gray-500">Belum ada anggota komite yang dimasukkan melalui CMS.</p> : <div className="divide-y divide-white/10">{members.sort((a, b) => a.sortOrder - b.sortOrder).map((member) => <div key={member.id} className="flex items-center gap-4 py-5">{member.photo ? <img src={member.photo} alt={member.name} className="h-12 w-12 rounded-lg object-cover" /> : <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-white/5 text-amber-300">{member.name.slice(0, 1)}</div>}<div><p className="font-semibold text-white">{member.name}</p><p className="mt-1 text-sm text-amber-300">{member.position}</p></div></div>)}</div>}
      </section>
    </main>
  );
}