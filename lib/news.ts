export type NewsItem = {
  slug: string;
  title: string;
  subtitle: string;
  category: string;
  date: string;
  readTime: string;
  views: string;
  image: string;
  komite: string;
  excerpt: string;
  content: string[];
  gallery: string[];
};

export const news: NewsItem[] = [
  // ==========================================================
  // 01. FESTIVAL TEATER
  // ==========================================================
  {
    slug: "festival-teater-tasikmalaya-2026",
    title: "Festival Teater Tasikmalaya 2026",
    subtitle: "Menghidupkan Panggung Kota",
    category: "Teater",
    date: "1 September 2026",
    readTime: "5 Menit Baca",
    views: "1.248",
    image: "/gallery/featured.jpg",
    komite: "teater",

    excerpt:
      "Festival Teater Tasikmalaya 2026 menjadi momentum penting dalam mempertemukan seniman lintas generasi untuk merawat identitas budaya kota melalui pertunjukan, diskusi, dan edukasi publik.",

    content: [
      "Festival Teater Tasikmalaya 2026 menjadi momentum penting dalam mempertemukan seniman lintas generasi untuk merawat identitas budaya kota melalui pertunjukan, diskusi, dan edukasi publik.",

      "Dewan Kesenian dan Kebudayaan Kota Tasikmalaya menghadirkan festival ini sebagai ruang kolaborasi kreatif yang mempertemukan komunitas seni, akademisi, pelajar, serta masyarakat umum dalam satu panggung budaya yang inklusif dan berkelanjutan.",

      "Selama tiga hari penyelenggaraan, berbagai pertunjukan teater modern dan tradisional dipentaskan, dilengkapi workshop penyutradaraan, penulisan naskah, kelas akting, hingga forum diskusi mengenai masa depan ekosistem seni pertunjukan di Tasikmalaya.",

      "Festival ini bukan hanya menjadi ruang apresiasi seni, tetapi juga menjadi wadah regenerasi pelaku budaya melalui pendidikan, dokumentasi, dan kolaborasi lintas komunitas.",

      "DKKT berharap Festival Teater Tasikmalaya menjadi agenda budaya tahunan yang mampu menggerakkan ekonomi kreatif, memperluas jejaring komunitas seni, serta memperkenalkan Tasikmalaya sebagai kota budaya yang aktif melahirkan karya-karya baru.",

      "Melalui semangat kolaborasi, seluruh elemen masyarakat diajak untuk terus menjaga, mengembangkan, dan memajukan kebudayaan sebagai fondasi pembangunan peradaban yang berkelanjutan.",
    ],

    gallery: [
      "/gallery/galeri1.jpeg",
      "/gallery/galeri2.jpeg",
      "/gallery/galeri5.jpeg",
    ],
  },

  // ==========================================================
  // 02. GEMPUNGAN SENIMAN
  // ==========================================================
  {
    slug: "gempungan-seniman-ii-tahun-2026-resmi-digelar",
    title: "Gempungan Seniman II Tahun 2026 Resmi Digelar",
    subtitle: "Ruang Pertemuan Kreatif Seniman Tasikmalaya",
    category: "Budaya",
    date: "31 Agustus 2026",
    readTime: "4 Menit Baca",
    views: "892",
    image: "/gallery/news1.jpg",
    komite: "budaya",

    excerpt:
      "Gempungan Seniman II Tahun 2026 menjadi ruang pertemuan dan kolaborasi para pelaku seni dan budaya Kota Tasikmalaya.",

    content: [
      "Gempungan Seniman II Tahun 2026 resmi digelar sebagai ruang pertemuan para pelaku seni, budaya, komunitas, dan masyarakat Kota Tasikmalaya.",

      "Kegiatan ini menjadi momentum untuk memperluas jejaring, memperkuat komunikasi antarkomunitas, serta membuka ruang pertukaran gagasan mengenai perkembangan seni dan kebudayaan.",

      "Gempungan Seniman menghadirkan suasana pertemuan yang terbuka dan kolaboratif dengan semangat mempertemukan berbagai latar belakang pelaku seni dan budaya.",

      "DKKT mendorong kegiatan semacam ini agar terus berkembang menjadi bagian dari ekosistem kebudayaan Kota Tasikmalaya.",
    ],

    gallery: [
      "/gallery/news1.jpg",
    ],
  },

  // ==========================================================
  // 03. ANUGERAH BUDAYA
  // ==========================================================
  {
    slug: "anugerah-budaya-kota-tasikmalaya-2026-dibuka",
    title: "Anugerah Budaya Kota Tasikmalaya 2026 Dibuka",
    subtitle: "Memberikan Apresiasi kepada Pelaku Budaya",
    category: "DKKT",
    date: "29 Agustus 2026",
    readTime: "4 Menit Baca",
    views: "764",
    image: "/gallery/news2.webp",
    komite: "budaya",

    excerpt:
      "Anugerah Budaya Kota Tasikmalaya 2026 dibuka sebagai bentuk penghargaan terhadap tokoh dan pelaku budaya yang berkontribusi bagi perkembangan kebudayaan.",

    content: [
      "Anugerah Budaya Kota Tasikmalaya 2026 dibuka untuk memberikan apresiasi terhadap tokoh, komunitas, dan pelaku budaya yang telah memberikan kontribusi bagi perkembangan kebudayaan Kota Tasikmalaya.",

      "Program ini menjadi bagian dari upaya memperkuat penghargaan publik terhadap karya, dedikasi, dan perjalanan para pelaku budaya di Kota Tasikmalaya.",

      "Anugerah Budaya diharapkan menjadi ruang dokumentasi sekaligus pengingat bahwa kemajuan kebudayaan dibangun melalui kerja panjang para seniman, budayawan, komunitas, dan masyarakat.",

      "Melalui Anugerah Budaya, DKKT berharap semakin banyak generasi muda mengenal, menghargai, dan melanjutkan kerja kebudayaan di Kota Tasikmalaya.",
    ],

    gallery: [
      "/gallery/news2.webp",
      "/gallery/galeri8.webp",
    ],
  },

  // ==========================================================
  // 04. WORKSHOP FOTOGRAFI
  // ==========================================================
  {
    slug: "workshop-fotografi-heritage-bersama-dkkt",
    title: "Workshop Fotografi Heritage Bersama DKKT",
    subtitle: "Merekam Warisan Budaya Melalui Fotografi",
    category: "Fotografi",
    date: "24 Agustus 2026",
    readTime: "3 Menit Baca",
    views: "611",
    image: "/gallery/news3.jpg",
    komite: "film-fotografi",

    excerpt:
      "Workshop Fotografi Heritage mengajak peserta mengenal teknik dokumentasi visual untuk merekam warisan budaya Kota Tasikmalaya.",

    content: [
      "Workshop Fotografi Heritage menjadi ruang pembelajaran bagi peserta untuk mengenal fotografi sebagai media dokumentasi kebudayaan.",

      "Peserta diajak memahami bagaimana sebuah foto dapat merekam sejarah, lingkungan, tradisi, serta kehidupan masyarakat secara lebih bermakna.",

      "Fotografi tidak hanya menjadi medium visual, tetapi juga dapat berfungsi sebagai arsip perjalanan kebudayaan suatu daerah.",

      "Dokumentasi visual menjadi bagian penting dalam membangun arsip kebudayaan yang dapat diwariskan kepada generasi berikutnya.",
    ],

    gallery: [
      "/gallery/news3.jpg",
      "/gallery/galeri6.jpeg",
    ],
  },

  // ==========================================================
  // 05. FESTIVAL TARI
  // ==========================================================
  {
    slug: "festival-tari-nusantara-meriahkan-alun-alun",
    title: "Festival Tari Nusantara Meriahkan Alun-alun",
    subtitle: "Ragam Gerak dalam Harmoni Kebudayaan",
    category: "Tari",
    date: "20 Agustus 2026",
    readTime: "3 Menit Baca",
    views: "540",
    image: "/gallery/galeri2.jpeg",
    komite: "tari",

    excerpt:
      "Festival Tari Nusantara menghadirkan pertunjukan tari sebagai ruang apresiasi sekaligus pelestarian budaya.",

    content: [
      "Festival Tari Nusantara menghadirkan berbagai karya tari sebagai bagian dari upaya memperkenalkan dan melestarikan kekayaan seni pertunjukan.",

      "Kegiatan ini mempertemukan seniman tari, komunitas, generasi muda, dan masyarakat dalam ruang apresiasi yang terbuka.",

      "Pertunjukan tari menjadi ruang pertemuan antara tradisi dan kreativitas generasi baru dalam menjaga keberlanjutan seni tari.",

      "DKKT mendorong pengembangan seni tari agar tetap berakar pada tradisi sekaligus terbuka terhadap inovasi.",
    ],

    gallery: [
      "/gallery/galeri2.jpeg",
      "/gallery/galeri4.png",
    ],
  },

  // ==========================================================
  // 06. PAMERAN SENI RUPA
  // ==========================================================
  {
    slug: "pameran-seni-rupa-pelajar-kota-tasikmalaya",
    title: "Pameran Seni Rupa Pelajar Kota Tasikmalaya",
    subtitle: "Mendorong Regenerasi Seniman Muda",
    category: "Seni Rupa",
    date: "18 Agustus 2026",
    readTime: "3 Menit Baca",
    views: "486",
    image: "/gallery/galeri3.png",
    komite: "seni-rupa",

    excerpt:
      "Pameran Seni Rupa Pelajar menjadi ruang bagi generasi muda untuk menampilkan gagasan, karya, dan kreativitas visual.",

    content: [
      "Pameran Seni Rupa Pelajar Kota Tasikmalaya menjadi ruang bagi pelajar untuk menampilkan karya dan mengembangkan keberanian berekspresi melalui seni visual.",

      "Kegiatan ini juga menjadi bagian dari proses regenerasi seniman dengan memberikan pengalaman berkarya dan berinteraksi dengan publik.",

      "Ruang pamer menjadi sarana penting untuk mempertemukan karya pelajar dengan masyarakat sekaligus memperkenalkan potensi seni visual generasi muda.",

      "DKKT mendorong agar ruang apresiasi untuk pelajar terus diperluas sebagai bagian dari pembangunan ekosistem seni yang berkelanjutan.",
    ],

    gallery: [
      "/gallery/galeri3.png",
      "/gallery/galeri6.jpeg",
    ],
  },

  // ==========================================================
  // 07. MALAM PUISI
  // ==========================================================
  {
    slug: "komunitas-sastra-gelar-malam-puisi",
    title: "Komunitas Sastra Gelar Malam Puisi",
    subtitle: "Sastra sebagai Ruang Dialog",
    category: "Sastra",
    date: "15 Agustus 2026",
    readTime: "3 Menit Baca",
    views: "421",
    image: "/gallery/galeri7.jpeg",
    komite: "sastra",

    excerpt:
      "Malam Puisi menjadi ruang pertemuan bagi penulis, pembaca, dan komunitas sastra untuk memperkuat budaya literasi.",

    content: [
      "Malam Puisi mempertemukan penulis, penyair, pembaca, dan komunitas sastra dalam suasana apresiasi yang terbuka.",

      "Sastra memiliki peran penting sebagai medium refleksi sosial, pengembangan literasi, dan dokumentasi pengalaman masyarakat.",

      "Pertemuan antarpegiat sastra membuka ruang dialog mengenai karya, gagasan, bahasa, dan kehidupan masyarakat Kota Tasikmalaya.",

      "Kegiatan ini menjadi salah satu ruang yang mendukung tumbuhnya ekosistem sastra Kota Tasikmalaya.",
    ],

    gallery: [
      "/gallery/galeri7.jpeg",
    ],
  },
];

/*
 * ============================================================
 * GET BERITA BERDASARKAN SLUG
 * ============================================================
 */
export function getNewsBySlug(slug: string) {
  return news.find((item) => item.slug === slug);
}

/*
 * ============================================================
 * GET BERITA BERDASARKAN KOMITE
 * ============================================================
 */
export function getNewsByKomite(komite: string) {
  return news.filter(
    (item) => item.komite === komite
  );
}

/*
 * ============================================================
 * GET BERITA TERBARU
 * ============================================================
 */
export function getLatestNews(limit = 3) {
  return news.slice(0, limit);
}

/*
 * ============================================================
 * GET BERITA TERKAIT
 * ============================================================
 */
export function getRelatedNews(
  currentSlug: string,
  komite: string,
  limit = 3
) {
  const sameKomite = news.filter(
    (item) =>
      item.slug !== currentSlug &&
      item.komite === komite
  );

  if (sameKomite.length >= limit) {
    return sameKomite.slice(0, limit);
  }

  const fallback = news.filter(
    (item) =>
      item.slug !== currentSlug &&
      !sameKomite.some(
        (related) => related.slug === item.slug
      )
  );

  return [...sameKomite, ...fallback].slice(0, limit);
}