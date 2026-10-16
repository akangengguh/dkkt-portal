import Link from "next/link";
import SectionTitle from "./SectionTitle";
import CommitteeCard from "./CommitteeCard";
import { db } from "@/lib/db";

export default async function Committees() {
  const komite = (await db.orm.public.Committee.where({ isActive: true }).all())
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((item) => ({
      title: item.name,
      desc: item.description || "Informasi komite belum tersedia.",
      icon: item.icon || "✦",
      link: `/komite/${item.slug}`,
    }));
  return (
    <section className="relative overflow-hidden bg-[#050505] py-20 md:py-24">
      {/* =====================================================
          BACKGROUND GLOW
      ===================================================== */}
      <div className="pointer-events-none absolute left-[-120px] top-20 h-80 w-80 rounded-full bg-amber-500/5 blur-[130px]" />

      <div className="pointer-events-none absolute bottom-0 right-[-120px] h-96 w-96 rounded-full bg-orange-500/5 blur-[150px]" />

      <div className="relative mx-auto max-w-7xl px-6">
        {/* =====================================================
            HEADER
        ===================================================== */}
        <div className="mb-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <SectionTitle
              title={`${komite.length} Komite Seni DKKT`}
              subtitle="Ekosistem Kesenian & Kebudayaan"
            />

            <p className="mt-5 max-w-3xl text-base leading-8 text-gray-400 md:text-lg">
              Komite menjadi ruang pengembangan berbagai disiplin
              seni dan kebudayaan sekaligus menjadi penghubung antara
              pelaku seni, komunitas, dan masyarakat Kota Tasikmalaya.
            </p>
          </div>

          {/* Tombol semua komite */}
          <Link
            href="/komite"
            className="inline-flex w-fit shrink-0 items-center rounded-xl border border-amber-500/50 bg-amber-500/5 px-5 py-3 text-sm font-semibold text-amber-400 transition-all duration-300 hover:border-amber-400 hover:bg-amber-500 hover:text-black"
          >
            Lihat Semua Komite
            <span className="ml-2 transition-transform duration-300 group-hover:translate-x-1">
              →
            </span>
          </Link>
        </div>

        {/* =====================================================
            GRID KOMITE
        ===================================================== */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {komite.map((item, index) => (
            <div
              key={item.title}
              className="relative"
            >
              {/* Nomor kecil */}
              <div className="pointer-events-none absolute right-5 top-4 z-20 text-[10px] font-bold tracking-[0.25em] text-gray-700">
                0{index + 1}
              </div>

              <CommitteeCard
                title={item.title}
                desc={item.desc}
                icon={item.icon}
                link={item.link}
              />
            </div>
          ))}
        </div>

        {/* =====================================================
            FOOTER INFO
        ===================================================== */}
        <div className="mt-10 flex flex-col gap-4 border-t border-white/5 pt-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-400">
              {komite.length} Komite
            </p>

            <p className="mt-2 text-sm text-gray-500">
              Komite aktif sesuai susunan yang tersimpan di CMS DKKT.
            </p>
          </div>

          <Link
            href="/komite"
            className="text-sm font-semibold text-gray-400 transition hover:text-amber-400"
          >
            Jelajahi Ekosistem Komite →
          </Link>
        </div>
      </div>
    </section>
  );
}