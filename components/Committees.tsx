import SectionTitle from "./SectionTitle";
import CommitteeCard from "./CommitteeCard";

export default function Committees() {
  const komite = [
    {
      title: "Komite Teater",
      desc: "Mengembangkan seni pertunjukan, drama, dan teater Kota Tasikmalaya.",
      icon: "🎭",
      link: "/komite/teater",
    },
    {
      title: "Komite Tari",
      desc: "Melestarikan tari tradisional dan mendorong kreasi tari kontemporer.",
      icon: "💃",
      link: "/komite/tari",
    },
    {
      title: "Komite Musik",
      desc: "Mewadahi musisi tradisi, modern, dan lintas genre budaya.",
      icon: "🎵",
      link: "/komite/musik",
    },
    {
      title: "Komite Sastra",
      desc: "Menghidupkan literasi, puisi, naskah, dan karya sastra daerah.",
      icon: "📖",
      link: "/komite/sastra",
    },
    {
      title: "Komite Seni Rupa",
      desc: "Ruang bagi pelukis, pematung, ilustrator, dan seniman visual.",
      icon: "🎨",
      link: "/komite/rupa",
    },
    {
      title: "Film & Fotografi",
      desc: "Dokumentasi visual, perfilman, dan fotografi budaya Tasikmalaya.",
      icon: "📷",
      link: "/komite/film",
    },
    {
      title: "Komite Budaya",
      desc: "Menjaga adat, tradisi, bahasa, dan warisan budaya lokal.",
      icon: "🏛️",
      link: "/komite/budaya",
    },
  ];

  return (
    <section className="bg-[#050505] py-28">
      <div className="mx-auto max-w-7xl px-6">
        <SectionTitle
          title="Tujuh Komite Seni DKKT"
          subtitle="Ekosistem Kesenian & Kebudayaan"
        />

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {komite.map((item) => (
            <CommitteeCard
              key={item.title}
              title={item.title}
              desc={item.desc}
              icon={item.icon}
              link={item.link}
            />
          ))}
        </div>
      </div>
    </section>
  );
}