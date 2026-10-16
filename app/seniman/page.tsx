import Link from "next/link";
import { connection } from "next/server";

import { db } from "@/lib/db";

export default async function SenimanPage() {
  await connection();
  const artists = (await db.orm.public.Artist.all()).filter((item) => item.isActive && item.registrationStatus === "ACTIVE").sort((a, b) => a.sortOrder - b.sortOrder);

  return <main className="min-h-screen bg-black text-white"><section className="mx-auto max-w-7xl px-6 pb-20 pt-[150px]"><p className="text-xs font-bold uppercase tracking-[0.3em] text-amber-400">Ekosistem DKKT</p><h1 className="mt-3 text-4xl font-black md:text-5xl">Seniman & Budayawan</h1><p className="mt-4 max-w-2xl text-base leading-8 text-gray-400">Kenali para pelaku seni dan budaya yang menjadi bagian dari ekosistem DKKT Kota Tasikmalaya.</p><Link href="/" className="mt-6 inline-flex rounded-xl border border-white/10 px-5 py-3 text-sm font-semibold text-gray-300 hover:border-amber-400/40 hover:text-amber-300">Kembali ke Beranda</Link><div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">{artists.length === 0 ? <div className="col-span-full rounded-3xl border border-dashed border-white/10 p-12 text-center text-gray-500">Belum ada profil seniman yang dipublikasikan.</div> : artists.map((artist) => <article key={artist.id} className="rounded-3xl border border-white/10 bg-[#0b0b0b] p-6"><div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl bg-amber-500/10 text-2xl">{artist.photo ? <img src={artist.photo} alt={artist.name} className="h-full w-full object-cover" /> : "✦"}</div><h2 className="mt-5 text-xl font-black">{artist.name}</h2><p className="mt-2 text-sm font-semibold text-amber-300">{artist.discipline || "Seniman & Budayawan"}</p><p className="mt-3 line-clamp-4 text-sm leading-7 text-gray-400">{artist.biography || "Profil seniman DKKT."}</p></article>)}</div></section></main>;
}
