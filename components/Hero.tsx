export default function Hero() {
  return (
    <section className="relative flex min-h-[calc(100vh-88px)] items-center justify-center overflow-hidden bg-[#0B0B0B] pt-24">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-neutral-950 to-amber-950" />

      {/* Glow Effect */}
      <div className="absolute -left-20 top-16 h-72 w-72 rounded-full bg-amber-500/20 blur-3xl" />
      <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-orange-600/10 blur-3xl" />

      {/* Watermark */}
      <div className="absolute inset-0 flex items-center justify-center opacity-5">
        <img
          src="/logo/logo-dkkt.png"
          alt="Watermark DKKT"
          className="w-72 md:w-[420px] object-contain"
        />
      </div>

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-6xl px-6 py-12 text-center">
        <p className="mb-4 text-xs md:text-sm uppercase tracking-[0.45em] text-amber-400">
          WEBSITE RESMI
        </p>

        <h1 className="text-4xl sm:text-5xl md:text-7xl font-black leading-tight text-white">
          Dewan Kesenian dan
          <span className="block text-amber-400">Kebudayaan</span>
          Kota Tasikmalaya
        </h1>

        <p className="mx-auto mt-8 max-w-3xl text-base md:text-lg leading-8 text-gray-300">
          Wadah kolaborasi seniman, budayawan, komunitas, dan masyarakat dalam
          menjaga, mengembangkan, serta memajukan seni budaya Kota Tasikmalaya.
        </p>

        {/* CTA */}
        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <a
            href="/berita"
            className="rounded-xl bg-amber-500 px-8 py-4 font-semibold text-black transition hover:scale-105 hover:bg-amber-400"
          >
            Berita Terbaru
          </a>

          <a
            href="/agenda"
            className="rounded-xl border border-white/30 px-8 py-4 font-semibold text-white transition hover:border-amber-400 hover:text-amber-400"
          >
            Agenda Kegiatan
          </a>
        </div>
      </div>
    </section>
  );
}