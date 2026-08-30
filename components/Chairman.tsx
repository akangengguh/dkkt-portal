import SectionTitle from "./SectionTitle";

export default function Chairman() {
  return (
    <section className="relative overflow-hidden bg-[#080808] py-28">
      {/* Background Glow */}
      <div className="absolute left-0 top-1/2 h-96 w-96 -translate-y-1/2 rounded-full bg-amber-500/10 blur-3xl" />
      <div className="absolute right-0 top-20 h-72 w-72 rounded-full bg-orange-500/10 blur-3xl" />

      <div className="relative mx-auto grid max-w-7xl items-center gap-16 px-6 lg:grid-cols-2">

        {/* FOTO KETUA */}
        <div className="relative">
          {/* Frame Glow */}
          <div className="absolute -inset-3 rounded-[32px] bg-gradient-to-br from-amber-400/30 via-transparent to-orange-500/20 blur-xl" />

          <div className="relative overflow-hidden rounded-[28px] border border-amber-500/30 bg-neutral-900 shadow-[0_0_60px_rgba(245,158,11,0.15)]">
            <img
              src="/images/ketua-dkkt.jpg"
              alt="Tatang Suprihatna Sumpena"
              className="h-[620px] w-full object-cover transition duration-700 hover:scale-105"
            />
          </div>
        </div>

        {/* KONTEN */}
        <div>

          <SectionTitle
            title="Tabik Semesta! Salam Budaya!"
            subtitle="Sambutan Ketua DKKT"
          />

          <div className="mt-8 space-y-7 text-xl leading-9 text-gray-200">

            <p>
              Panggung telah dibuka, lampu sorot menyala. Selamat datang di
              Portal Resmi <strong className="text-white">Dewan Kesenian dan Kebudayaan Kota Tasikmalaya (DKKT)</strong>,
              rumah bersama bagi seluruh insan seni, budaya, akademisi, komunitas,
              dan masyarakat.
            </p>

            <p>
              Sebagai seniman teater dan sutradara, saya meyakini bahwa seni bukan
              sekadar tontonan. Seni adalah ruang dialog, pendidikan, identitas,
              sekaligus kekuatan yang mampu membentuk karakter dan peradaban sebuah kota.
            </p>

            <p>
              DKKT hadir untuk merentangkan panggung kolaborasi. Melalui inovasi digital,
              pelestarian budaya, dan pemberdayaan komunitas, kita menjaga akar tradisi
              sembari melahirkan karya-karya kreatif yang relevan dengan perkembangan zaman.
            </p>

            {/* QUOTE */}
            <blockquote className="my-8 rounded-r-2xl border-l-4 border-amber-400 bg-amber-500/5 px-6 py-5 italic text-xl text-amber-200">
              “Budaya yang besar lahir dari masyarakat yang mau berkarya,
              berkolaborasi, dan saling menghidupkan.”
            </blockquote>

            <p>
              Mari jadikan Tasikmalaya sebagai kota yang tidak hanya dikenal karena
              warisan budayanya, tetapi juga karena keberanian melahirkan karya terbaik
              untuk Indonesia.
            </p>

          </div>

          {/* IDENTITAS */}
          <div className="mt-12 border-l-4 border-amber-400 pl-5">
            <h3 className="text-3xl font-bold text-white">
              Tatang Suprihatna Sumpena, S.Sn.
            </h3>

            <p className="mt-2 text-lg text-amber-300">
              Ketua Dewan Kesenian dan Kebudayaan Kota Tasikmalaya
            </p>

            {/* Upload nanti ke public/images/signature.png */}
            <img
              src="/images/signature.png"
              alt="Tanda Tangan Ketua"
              className="mt-5 h-16 object-contain"
            />
          </div>

          {/* BUTTON */}
          <div className="mt-10 flex gap-4">
            <a
              href="/profil"
              className="rounded-xl bg-amber-500 px-7 py-4 font-semibold text-black transition hover:scale-105 hover:bg-amber-400"
            >
              Profil DKKT
            </a>

            <a
              href="/berita"
              className="rounded-xl border border-amber-400 px-7 py-4 font-semibold text-amber-300 transition hover:bg-amber-400 hover:text-black"
            >
              Lihat Kegiatan
            </a>
          </div>

        </div>
      </div>
    </section>
  );
}