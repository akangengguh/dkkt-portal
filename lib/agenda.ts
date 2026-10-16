export type AgendaItem = {
  slug: string;

  // Identitas waktu
  date: string;
  month: string;
  bulan: string;
  year: string;
  day: string;

  // Informasi utama
  title: string;
  category: string;
  status: string;
  color: string;

  // Lokasi & waktu
  time: string;
  location: string;
  address: string;

  // Organisasi
  komite: string;
  organizer: string;

  // Deskripsi
  description: string;

  // Peserta
  target: string;

  // Pendaftaran
  registration: boolean;
  registrationText: string;

  // Kontak
  contact: string;

  // Visual
  image: string;
  gallery: string[];

  // Catatan
  notes?: string;
};

export const agenda: AgendaItem[] = [
  // ==========================================================
  // 01. FESTIVAL TEATER
  // ==========================================================
  {
    slug: "festival-teater-tasikmalaya-2026",

    date: "01",
    month: "SEP",
    bulan: "September",
    year: "2026",
    day: "Selasa",

    title: "Festival Teater Tasikmalaya 2026",
    category: "Festival",

    status: "Berlangsung",
    color: "bg-green-500",

    time: "19.30 WIB",

    location: "Gedung Kesenian Kota Tasikmalaya",

    address:
      "Gedung Kesenian Kota Tasikmalaya, Kota Tasikmalaya",

    komite: "teater",

    organizer:
      "Komite Seni Teater DKKT",

    description:
      "Festival Teater Tasikmalaya 2026 menjadi ruang pertemuan seniman, komunitas, pelajar, akademisi, dan masyarakat melalui pertunjukan, diskusi, serta kegiatan pengembangan seni teater.",

    target:
      "Seniman, komunitas teater, pelajar, mahasiswa, akademisi, dan masyarakat umum.",

    registration: false,

    registrationText:
      "Informasi pendaftaran peserta atau penonton mengikuti ketentuan panitia.",

    contact:
      "Sekretariat Komite Seni Teater DKKT",

    image:
      "/gallery/featured.jpg",

    gallery: [
      "/gallery/galeri1.jpeg",
      "/gallery/galeri2.jpeg",
      "/gallery/galeri5.jpeg",
    ],

    notes:
      "Informasi susunan acara, pengisi acara, dan ketentuan teknis dapat diperbarui sesuai informasi resmi panitia.",
  },

  // ==========================================================
  // 02. ANUGERAH BUDAYA
  // ==========================================================
  {
    slug: "anugerah-budaya-kota-tasikmalaya-2026",

    date: "07",
    month: "SEP",
    bulan: "September",
    year: "2026",
    day: "Senin",

    title: "Anugerah Budaya Kota Tasikmalaya 2026",
    category: "Budaya",

    status: "Pendaftaran",
    color: "bg-blue-500",

    time: "09.00 WIB",

    location: "Sekretariat DKKT",

    address:
      "Sekretariat Dewan Kesenian dan Kebudayaan Kota Tasikmalaya",

    komite: "budaya",

    organizer:
      "Dewan Kesenian dan Kebudayaan Kota Tasikmalaya",

    description:
      "Anugerah Budaya Kota Tasikmalaya menjadi bagian dari upaya memberikan apresiasi terhadap tokoh, komunitas, dan pihak yang berkontribusi terhadap perkembangan seni dan kebudayaan Kota Tasikmalaya.",

    target:
      "Seniman, budayawan, komunitas, lembaga, tokoh masyarakat, dan pihak yang memiliki kontribusi terhadap kebudayaan.",

    registration: true,

    registrationText:
      "Pendaftaran dan pengusulan calon penerima Anugerah Budaya mengikuti ketentuan resmi panitia.",

    contact:
      "Panitia Anugerah Budaya Kota Tasikmalaya 2026",

    image:
      "/gallery/news2.webp",

    gallery: [
      "/gallery/news2.webp",
      "/gallery/galeri8.webp",
    ],

    notes:
      "Dokumen persyaratan, kategori penghargaan, dan mekanisme pengusulan dapat ditambahkan ketika informasi resmi tersedia.",
  },

  // ==========================================================
  // 03. WORKSHOP FOTOGRAFI
  // ==========================================================
  {
    slug: "workshop-fotografi-heritage",

    date: "21",
    month: "SEP",
    bulan: "September",
    year: "2026",
    day: "Senin",

    title: "Workshop Fotografi Heritage",
    category: "Workshop",

    status: "Terjadwal",
    color: "bg-gray-500",

    time: "13.00 WIB",

    location: "Museum Kota Tasikmalaya",

    address:
      "Museum Kota Tasikmalaya",

    komite: "film-fotografi",

    organizer:
      "Komite Seni Film dan Fotografi DKKT",

    description:
      "Workshop fotografi heritage menjadi ruang pembelajaran dan eksplorasi dokumentasi visual terhadap sejarah, lingkungan, dan warisan budaya Kota Tasikmalaya.",

    target:
      "Fotografer, pelajar, mahasiswa, komunitas kreatif, pegiat budaya, dan masyarakat umum.",

    registration: true,

    registrationText:
      "Pendaftaran workshop mengikuti informasi dan ketentuan resmi panitia.",

    contact:
      "Komite Seni Film dan Fotografi DKKT",

    image:
      "/gallery/news3.jpg",

    gallery: [
      "/gallery/news3.jpg",
      "/gallery/galeri6.jpeg",
    ],

    notes:
      "Materi workshop, fasilitator, dan ketentuan peserta dapat diperbarui sesuai informasi resmi kegiatan.",
  },

  // ==========================================================
  // 04. FESTIVAL MUSIK
  // ==========================================================
  {
    slug: "festival-musik-tradisi-sunda",

    date: "05",
    month: "OCT",
    bulan: "Oktober",
    year: "2026",
    day: "Senin",

    title: "Festival Musik Tradisi Sunda",
    category: "Festival",

    status: "Terjadwal",
    color: "bg-purple-500",

    time: "18.30 WIB",

    location: "Taman Kota Tasikmalaya",

    address:
      "Taman Kota Tasikmalaya",

    komite: "musik",

    organizer:
      "Komite Seni Musik DKKT",

    description:
      "Festival Musik Tradisi Sunda menghadirkan ruang apresiasi terhadap musik tradisional dan kreativitas musisi dalam menjaga keberlanjutan seni musik Sunda.",

    target:
      "Musisi, komunitas musik, pelajar, mahasiswa, budayawan, dan masyarakat umum.",

    registration: false,

    registrationText:
      "Informasi keikutsertaan dan pendaftaran akan disampaikan oleh panitia apabila diperlukan.",

    contact:
      "Komite Seni Musik DKKT",

    image:
      "/gallery/galeri4.png",

    gallery: [
      "/gallery/galeri4.png",
      "/gallery/galeri5.jpeg",
    ],

    notes:
      "Informasi pengisi acara, susunan pertunjukan, dan ketentuan teknis dapat ditambahkan kemudian.",
  },
];

/*
 * ============================================================
 * GET AGENDA BERDASARKAN SLUG
 * ============================================================
 */
export function getAgendaBySlug(slug: string) {
  return agenda.find(
    (item) => item.slug === slug
  );
}

/*
 * ============================================================
 * GET AGENDA BERDASARKAN KOMITE
 * ============================================================
 */
export function getAgendaByKomite(komite: string) {
  return agenda.filter(
    (item) => item.komite === komite
  );
}

/*
 * ============================================================
 * GET AGENDA TERDEKAT
 * ============================================================
 */
export function getLatestAgenda(limit = 3) {
  return agenda.slice(0, limit);
}