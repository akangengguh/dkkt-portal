import Link from "next/link";
import { connection } from "next/server";

import { db } from "@/lib/db";

export default async function KelompokPage() {
  await connection();
  const groups = (await db.orm.public.CulturalGroup.all()).filter((item) => item.isActive && item.registrationStatus === "ACTIVE").sort((a, b) => a.sortOrder - b.sortOrder);

  return <main className="min-h-screen bg-black text-white"><section className="mx-auto max-w-7xl px-6 pb-20 pt-[150px]"><p className="text-xs font-bold uppercase tracking-[0.3em] text-amber-400">Ekosistem DKKT</p><h1 className="mt-3 text-4xl font-black md:text-5xl">Kelompok & Sanggar</h1><p className="mt-4 max-w-2xl text-base leading-8 text-gray-400">Jelajahi komunitas, kelompok seni, dan sanggar yang aktif di Kota Tasikmalaya.</p><Link href="/" className="mt-6 inline-flex rounded-xl border border-white/10 px-5 py-3 text-sm font-semibold text-gray-300 hover:border-amber-400/40 hover:text-amber-300">Kembali ke Beranda</Link><div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">{groups.length === 0 ? <div className="col-span-full rounded-3xl border border-dashed border-white/10 p-12 text-center text-gray-500">Belum ada kelompok yang dipublikasikan.</div> : groups.map((group) => <article key={group.id} className="rounded-3xl border border-white/10 bg-[#0b0b0b] p-6"><p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-400">{group.groupType}</p><h2 className="mt-3 text-xl font-black">{group.name}</h2><p className="mt-3 line-clamp-4 text-sm leading-7 text-gray-400">{group.description || "Profil kelompok DKKT."}</p><div className="mt-5 border-t border-white/10 pt-4 text-sm text-gray-500">Pimpinan: <span className="text-gray-300">{group.leader || "Belum diisi"}</span></div></article>)}</div></section></main>;
}
