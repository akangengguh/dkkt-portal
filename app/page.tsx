import Navbar from "@/components/Navbar";
export default function Home() {
  return (
    <>
    <Navbar />
    <main className="min-h-screen bg-neutral-950 text-white">
      {/* HERO */}
      <section className="relative flex min-h-screen items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-black via-neutral-900 to-amber-950" />

        <div className="relative z-10 mx-auto max-w-5xl px-6 text-center">
          <p className="mb-4 text-amber-400 tracking-[0.3em] uppercase">
            Website Resmi
          </p>
          <h1 className="text-5xl md:text-7xl font-bold leading-tight">
            Dewan Kesenian dan
            <span className="block text-amber-400">
              Kebudayaan
            </span>
            Kota Tasikmalaya
          </h1>

          <p className="mt-8 text-lg text-gray-300 max-w-3xl mx-auto">
            Wadah kolaborasi seniman, budayawan, komunitas, dan masyarakat
            dalam menjaga, mengembangkan, serta memajukan seni budaya
            Kota Tasikmalaya.
          </p>

          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <button className="rounded-xl bg-amber-500 px-8 py-4 font-semibold text-black hover:bg-amber-400">
              Berita Terbaru
            </button>

            <button className="rounded-xl border border-white/20 px-8 py-4 hover:bg-white/10">
              Agenda Kegiatan
            </button>
          </div>
        </div>
      </section>

      {/* TENTANG */}
      <section className="bg-white text-black py-20">
        <div className="mx-auto max-w-5xl px-6 text-center">
          <h2 className="text-4xl font-bold">
            Tentang DKKT
          </h2>

          <div className="mx-auto mt-4 h-1 w-24 bg-amber-500" />

          <p className="mt-8 text-lg leading-9 text-gray-700">
            Dewan Kesenian dan Kebudayaan Kota Tasikmalaya merupakan
            lembaga independen yang menjadi mitra strategis pemerintah
            dalam pelestarian, pembinaan, dokumentasi, dan promosi seni
            serta kebudayaan Kota Tasikmalaya.
          </p>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/10 bg-black py-8 text-center text-gray-400">
        © 2026 DKKT — Dewan Kesenian dan Kebudayaan Kota Tasikmalaya
      </footer>
       </main>
    </>
  );
}