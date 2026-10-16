import Link from "next/link";
import { Temporal } from "temporal-polyfill";
import { db } from "@/lib/db";

type StatItem = {
  angka: string;
  label: string;
  description: string;
  href: string;
  icon: string;
};

export default async function Stats() {
  const now = new Date();
  const year = now.getUTCFullYear();
  const startOfYear = Temporal.Instant.from(`${year}-01-01T00:00:00Z`);
  const startOfNextYear = Temporal.Instant.from(`${year + 1}-01-01T00:00:00Z`);

  const [artists, groups, committees, agendas] = await Promise.all([
    db.orm.public.Artist
      .where({ isActive: true, registrationStatus: "ACTIVE" })
      .select("id")
      .all(),
    db.orm.public.CulturalGroup
      .where({ isActive: true, registrationStatus: "ACTIVE" })
      .select("id")
      .all(),
    db.orm.public.Committee
      .where({ isActive: true })
      .select("id")
      .all(),
    db.orm.public.Agenda
      .where((agenda) => agenda.startDate.gte(startOfYear))
      .where((agenda) => agenda.startDate.lt(startOfNextYear))
      .select("isPublished", "status")
      .all(),
  ]);

  const data: StatItem[] = [
    {
      angka: artists.length.toLocaleString("id-ID"),
      label: "Seniman & Pelaku Seni",
      description: "Pelaku seni yang aktif dan terverifikasi di CMS DKKT.",
      href: "/seniman",
      icon: "✦",
    },
    {
      angka: groups.length.toLocaleString("id-ID"),
      label: "Komunitas",
      description: "Komunitas aktif dan terverifikasi yang tercatat di CMS.",
      href: "/kelompok",
      icon: "◈",
    },
    {
      angka: committees.length.toLocaleString("id-ID"),
      label: "Komite DKKT",
      description: "Komite aktif yang menggerakkan berbagai bidang seni dan kebudayaan.",
      href: "/komite",
      icon: "◎",
    },
    {
      angka: agendas
        .filter((agenda) => agenda.isPublished || agenda.status === "PUBLISHED")
        .length
        .toLocaleString("id-ID"),
      label: `Agenda ${year}`,
      description: `Agenda yang telah dipublikasikan pada tahun ${year}.`,
      href: "/agenda",
      icon: "◷",
    },
  ];

  return (
    <section className="relative overflow-hidden bg-black px-6 py-16 md:py-20">
      {/* =====================================================
          BACKGROUND ACCENT
      ===================================================== */}
      <div className="pointer-events-none absolute left-[-120px] top-10 h-64 w-64 rounded-full bg-amber-500/5 blur-[110px]" />

      <div className="pointer-events-none absolute bottom-0 right-[-100px] h-72 w-72 rounded-full bg-orange-500/5 blur-[120px]" />

      <div className="relative mx-auto max-w-7xl">
        {/* ===================================================
            HEADER
        =================================================== */}
        <div className="mb-9 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-amber-400">
              Sekilas DKKT
            </p>

            <h2 className="mt-2 text-3xl font-black tracking-tight text-white md:text-4xl">
              Ekosistem dalam Angka
            </h2>

            <div className="mt-4 h-1 w-16 rounded-full bg-amber-400" />
          </div>

          <p className="max-w-2xl text-sm leading-7 text-gray-500 md:text-right">
            Gambaran singkat mengenai pelaku seni, komunitas, struktur
            organisasi, dan aktivitas DKKT dalam mengembangkan ekosistem
            seni dan kebudayaan Kota Tasikmalaya.
          </p>
        </div>

        {/* ===================================================
            STAT CARDS
        =================================================== */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {data.map((item, index) => (
            <Link
              key={item.label}
              href={item.href}
              className="group relative overflow-hidden rounded-2xl border border-white/10 bg-[#0D0D0D] p-5 transition-all duration-300 hover:-translate-y-1 hover:border-amber-400/50 hover:bg-[#111111] hover:shadow-[0_12px_35px_rgba(245,158,11,0.08)]"
            >
              {/* Glow */}
              <div className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-amber-400/5 blur-3xl transition duration-500 group-hover:bg-amber-400/15" />

              <div className="relative z-10">
                {/* Top */}
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold tracking-[0.28em] text-gray-600">
                    0{index + 1}
                  </span>

                  <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-amber-500/20 bg-amber-500/5 text-sm text-amber-400 transition-all duration-300 group-hover:border-amber-400/50 group-hover:bg-amber-500 group-hover:text-black">
                    {item.icon}
                  </span>
                </div>

                {/* Number */}
                <div className="mt-6">
                  <span className="text-4xl font-black tracking-tight text-amber-400 md:text-[42px]">
                    {item.angka}
                  </span>
                </div>

                {/* Label */}
                <h3 className="mt-3 text-sm font-bold uppercase leading-5 tracking-[0.08em] text-white">
                  {item.label}
                </h3>

                {/* Description */}
                <p className="mt-3 min-h-[48px] text-sm leading-6 text-gray-500">
                  {item.description}
                </p>

                {/* CTA */}
                <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-4">
                  <span className="text-xs font-semibold uppercase tracking-[0.12em] text-amber-400 transition group-hover:text-amber-300">
                    Jelajahi
                  </span>

                  <span className="text-sm text-gray-600 transition duration-300 group-hover:translate-x-1 group-hover:text-amber-400">
                    →
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* ===================================================
            BOTTOM INFO
        =================================================== */}
        <div className="mt-6 flex flex-col gap-2 border-t border-white/5 pt-5 md:flex-row md:items-center md:justify-between">
          <p className="text-xs text-gray-600">
            Informasi singkat ekosistem Dewan Kesenian dan Kebudayaan
            Kota Tasikmalaya.
          </p>

          <Link
            href="/profil"
            className="text-xs font-semibold uppercase tracking-[0.14em] text-gray-500 transition hover:text-amber-400"
          >
            Mengenal DKKT →
          </Link>
        </div>
      </div>
    </section>
  );
}