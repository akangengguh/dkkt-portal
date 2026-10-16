import Link from "next/link";

import PageHero from "@/components/PageHero";
import { db } from "@/lib/db";

type Person = { jabatan: string; nama: string; photo?: string | null; registrationNumber?: string | null };

const pembina: Person[] = [
  { jabatan: "Ketua", nama: "Wali Kota Tasikmalaya" },
  { jabatan: "Anggota", nama: "Wakil Wali Kota Tasikmalaya" },
  { jabatan: "Anggota", nama: "Ketua DPRD Kota Tasikmalaya" },
  { jabatan: "Anggota", nama: "Kepala Kepolisian Resor Tasikmalaya Kota" },
  { jabatan: "Anggota", nama: "Komandan Kodim Distrik Militer 0612 Tasikmalaya" },
  { jabatan: "Anggota", nama: "Kepala Kejaksaan Negeri Kota Tasikmalaya" },
  { jabatan: "Anggota", nama: "Ketua Pengadilan Negeri Kota Tasikmalaya" },
  { jabatan: "Anggota", nama: "Komandan Sub Komando Garnisun Tetap 0612/Tasikmalaya" },
  { jabatan: "Anggota", nama: "Sekretaris Daerah Kota Tasikmalaya" },
];

function PersonCard({ person }: { person: Person }) {
  return <article className="flex items-center gap-4 border-t border-white/10 py-4">{person.photo ? <img src={person.photo} alt={person.nama} className="h-12 w-12 rounded-lg object-cover" /> : <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 font-bold text-amber-300">{person.nama.slice(0, 1)}</div>}<div><p className="text-xs font-bold uppercase tracking-wide text-amber-300">{person.jabatan}</p><h3 className="mt-1 font-semibold text-white">{person.nama}</h3>{person.registrationNumber && <p className="mt-1 font-mono text-xs text-gray-500">NTA / No. registrasi: {person.registrationNumber}</p>}</div></article>;
}

export const dynamic = "force-dynamic";

export default async function ProfilPage() {
  const [sections, committees, artists] = await Promise.all([
    db.orm.public.OrganizationSection.where({ isActive: true }).all(),
    db.orm.public.Committee.where({ isActive: true }).all(),
    db.orm.public.Artist.where({ isActive: true, registrationStatus: "ACTIVE" }).all(),
  ]);
  const artistsById = new Map(artists.map((artist) => [artist.id, artist]));
  const members = await db.orm.public.OrganizationMember.where({ isActive: true }).all();
  const membersBySection = new Map<string, typeof members>();
  for (const member of members) {
    const sectionMembers = membersBySection.get(member.sectionId) || [];
    sectionMembers.push(member);
    membersBySection.set(member.sectionId, sectionMembers);
  }
  const structure = sections
    .filter((section) => section.name.trim().toLowerCase() !== "pembina")
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((section) => ({
      ...section,
      members: (membersBySection.get(section.id) || [])
        .flatMap((member) => {
          const artist = member.artistId ? artistsById.get(member.artistId) : undefined;
          if (!artist) return [];
          return [{
            jabatan: member.position,
            nama: artist.name,
            photo: artist.photo,
            registrationNumber: artist.registrationNumber,
          }];
        })
        .sort((a, b) => a.jabatan.localeCompare(b.jabatan)),
    }));
  const sortedCommittees = committees.sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <main className="min-h-screen bg-[#050505] text-white">
      <PageHero eyebrow="Profil Resmi DKKT" title="Dewan Kesenian dan" highlight="Kebudayaan Kota Tasikmalaya" description="Struktur organisasi, Pembina, dan komite DKKT Kota Tasikmalaya." />

      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="mb-8"><p className="text-xs font-bold uppercase tracking-[0.25em] text-amber-400">Struktur Organisasi</p><h2 className="mt-2 text-3xl font-black">Kepengurusan DKKT 2025–2030</h2><p className="mt-3 text-sm text-gray-400">Data pengurus mengikuti input CMS dan profil seniman terdaftar.</p></div>
        <div className="mb-8 border-y border-white/10 py-5"><p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-300">Pembina · unsur tetap</p><div className="mt-3 grid gap-x-8 md:grid-cols-2">{pembina.map((person) => <PersonCard key={`${person.jabatan}-${person.nama}`} person={person} />)}</div></div>
        {structure.length === 0 ? <p className="py-10 text-center text-gray-500">Struktur organisasi belum dimasukkan melalui CMS.</p> : <div className="space-y-8">{structure.map((section) => <section key={section.id} className="border-b border-white/10 pb-6"><h3 className="text-xl font-bold text-white">{section.name}</h3>{section.description && <p className="mt-2 text-sm text-gray-400">{section.description}</p>}<div className="mt-3 grid gap-x-8 md:grid-cols-2">{section.members.map((person, index) => <PersonCard key={`${section.id}-${index}`} person={person} />)}</div>{section.members.length === 0 && <p className="mt-4 text-sm text-gray-500">Belum ada anggota pada bagian ini.</p>}</section>)}</div>}
        <Link href="/admin/organisasi" className="mt-7 inline-flex text-sm font-semibold text-amber-400 hover:text-amber-300">Kelola struktur organisasi →</Link>
      </section>

      <section className="border-y border-white/10 bg-[#090909] py-16">
        <div className="mx-auto max-w-7xl px-6"><div className="mb-8"><p className="text-xs font-bold uppercase tracking-[0.25em] text-amber-400">Bidang Seni & Kebudayaan</p><h2 className="mt-2 text-3xl font-black">Komite DKKT</h2></div><div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{sortedCommittees.map((committee) => { const artist = committee.chairmanArtistId ? artistsById.get(committee.chairmanArtistId) : undefined; return <Link key={committee.id} href={`/komite/${committee.slug}`} className="border-t border-white/10 py-5 transition hover:border-amber-400/50"><div className="flex items-center gap-3"><span className="text-2xl">{committee.icon || "✦"}</span><h3 className="font-bold text-white">{committee.name}</h3></div><p className="mt-3 line-clamp-3 text-sm leading-6 text-gray-400">{committee.description || "Informasi komite belum tersedia."}</p><p className="mt-4 text-sm text-gray-300">Ketua: {artist?.name || "Belum ditentukan"}</p>{artist && <p className="mt-1 font-mono text-xs text-amber-300">{artist.registrationNumber}</p>}</Link>; })}</div></div>
      </section>
    </main>
  );
}