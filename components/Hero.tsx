import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-[#080808] py-20 md:py-24">
      {/* =====================================================
          BACKGROUND
      ===================================================== */}
      <div className="pointer-events-none absolute left-[-160px] top-0 h-[360px] w-[360px] rounded-full bg-amber-500/10 blur-[120px]" />

      <div className="pointer-events-none absolute right-[-120px] bottom-0 h-[320px] w-[320px] rounded-full bg-orange-500/10 blur-[120px]" />

      <div className="relative mx-auto max-w-7xl px-6">
        <div className="max-w-4xl">
          {/* =================================================
              EYEBROW
          ================================================= */}
          <p className="text-xs font-semibold uppercase tracking-[0.4em] text-amber-400">
            Website Resmi
          </p>

          {/* =================================================
              TITLE
          ================================================= */}
          <h1 className="mt-4 text-4xl font-black leading-[1.05] tracking-tight text-white md:text-5xl lg:text-6xl">
            Dewan Kesenian dan
            <span className="block text-amber-400">
              Kebudayaan
            </span>
            <span className="block text-white">
              Kota Tasikmalaya
            </span>
          </h1>

          {/* Accent */}
          <div className="mt-6 h-1 w-20 rounded-full bg-amber-400" />

          {/* =================================================
              DESCRIPTION
          ================================================= */}
          <p className="mt-6 max-w-3xl text-base leading-8 text-gray-300 md:text-lg">
            Wadah kolaborasi seniman, budayawan, komunitas, dan
            masyarakat dalam menjaga, mengembangkan, serta
            memajukan seni budaya Kota Tasikmalaya.
          </p>

          {/* =================================================
              CTA
          ================================================= */}
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/berita"
              className="rounded-xl bg-amber-500 px-6 py-3 text-sm font-semibold text-black transition hover:-translate-y-0.5 hover:bg-amber-400"
            >
              Berita Terbaru
            </Link>

            <Link
              href="/agenda"
              className="rounded-xl border border-amber-500 px-6 py-3 text-sm font-semibold text-amber-400 transition hover:bg-amber-500 hover:text-black"
            >
              Agenda Kegiatan
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}