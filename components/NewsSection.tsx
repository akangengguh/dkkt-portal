import SectionTitle from "./SectionTitle";
import FeaturedNews from "./FeaturedNews";
import NewsCard from "./NewsCard";

export default function NewsSection() {
  const news = [
    {
      title: "Gempungan Seniman II Tahun 2026 Resmi Digelar",
      category: "Budaya",
      date: "31 Agustus 2026",
      image: "/gallery/news1.jpg",
    },
    {
      title: "Anugerah Budaya Kota Tasikmalaya 2026 Dibuka",
      category: "DKKT",
      date: "29 Agustus 2026",
      image: "/gallery/news2.jpg",
    },
    {
      title: "Workshop Fotografi Heritage Bersama DKKT",
      category: "Fotografi",
      date: "24 Agustus 2026",
      image: "/gallery/news3.jpg",
    },
  ];

  return (
    <section className="bg-[#070707] py-28">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-14 flex items-end justify-between">
          <SectionTitle
            title="Berita & Artikel"
            subtitle="Majalah Digital DKKT"
          />

          <a
            href="/berita"
            className="hidden font-semibold text-amber-400 hover:text-amber-300 md:block"
          >
            Lihat Semua →
          </a>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <FeaturedNews
              title="Festival Teater Tasikmalaya 2026 Menghidupkan Panggung Kota"
              category="Teater"
              date="1 September 2026"
              image="/gallery/featured.jpg"
              excerpt="Festival Teater Tasikmalaya menjadi momentum kolaborasi seniman lintas generasi dalam memperkuat identitas budaya kota melalui pertunjukan, diskusi, dan edukasi publik."
            />
          </div>

          <div className="space-y-5">
            {news.map((item) => (
              <NewsCard key={item.title} {...item} />
            ))}

            <a
              href="/berita"
              className="block rounded-xl border border-amber-500/30 py-4 text-center font-semibold text-amber-400 transition hover:bg-amber-500 hover:text-black"
            >
              Jelajahi Semua Berita
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}