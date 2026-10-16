export type GalleryItem = {
  slug: string;
  title: string;
  category: string;
  komite: string;
  image: string;
  description: string;
};

export const gallery: GalleryItem[] = [
  // ==========================================================
  // 01. TEATER
  // ==========================================================
  {
    slug: "festival-teater-tasikmalaya",
    title: "Festival Teater Tasikmalaya",
    category: "Teater",
    komite: "teater",
    image: "/gallery/galeri1.jpeg",
    description:
      "Dokumentasi Festival Teater Tasikmalaya sebagai bagian dari perkembangan seni pertunjukan Kota Tasikmalaya.",
  },

  // ==========================================================
  // 02. TARI
  // ==========================================================
  {
    slug: "tari-tradisional-sunda",
    title: "Tari Tradisional Sunda",
    category: "Tari",
    komite: "tari",
    image: "/gallery/galeri2.jpeg",
    description:
      "Dokumentasi pertunjukan tari tradisional Sunda dan pelestarian seni tari di Kota Tasikmalaya.",
  },

  // ==========================================================
  // 03. SENI RUPA
  // ==========================================================
  {
    slug: "pameran-seni-rupa",
    title: "Pameran Seni Rupa",
    category: "Seni Rupa",
    komite: "seni-rupa",
    image: "/gallery/galeri3.png",
    description:
      "Dokumentasi pameran dan karya seni rupa sebagai bagian dari perkembangan seni visual Kota Tasikmalaya.",
  },

  // ==========================================================
  // 04. MUSIK
  // ==========================================================
  {
    slug: "pagelaran-musik-budaya",
    title: "Pagelaran Musik Budaya",
    category: "Musik",
    komite: "musik",
    image: "/gallery/galeri4.png",
    description:
      "Dokumentasi pagelaran musik budaya dan kreativitas musisi Kota Tasikmalaya.",
  },

  // ==========================================================
  // 05. BUDAYA
  // ==========================================================
  {
    slug: "ritual-dan-tradisi-budaya",
    title: "Ritual & Tradisi Budaya",
    category: "Budaya",
    komite: "budaya",
    image: "/gallery/galeri5.jpeg",
    description:
      "Dokumentasi tradisi, ritual, dan berbagai praktik kebudayaan masyarakat Kota Tasikmalaya.",
  },

  // ==========================================================
  // 06. FILM & FOTOGRAFI
  // ==========================================================
  {
    slug: "workshop-fotografi-heritage",
    title: "Workshop Fotografi Heritage",
    category: "Film",
    komite: "film-fotografi",
    image: "/gallery/galeri6.jpeg",
    description:
      "Dokumentasi kegiatan fotografi dan eksplorasi visual terhadap sejarah serta warisan budaya.",
  },

  // ==========================================================
  // 07. SASTRA
  // ==========================================================
  {
    slug: "komunitas-sastra-tasik",
    title: "Komunitas Sastra Tasik",
    category: "Sastra",
    komite: "sastra",
    image: "/gallery/galeri7.jpeg",
    description:
      "Dokumentasi aktivitas komunitas sastra dan pengembangan budaya literasi Kota Tasikmalaya.",
  },

  // ==========================================================
  // 08. BUDAYA
  // ==========================================================
  {
    slug: "anugerah-budaya-2026",
    title: "Anugerah Budaya 2026",
    category: "Budaya",
    komite: "budaya",
    image: "/gallery/galeri8.webp",
    description:
      "Dokumentasi Anugerah Budaya sebagai bentuk apresiasi terhadap pelaku seni dan kebudayaan.",
  },
];

/*
 * ============================================================
 * GET GALERI BERDASARKAN SLUG
 * ============================================================
 */
export function getGalleryBySlug(slug: string) {
  return gallery.find(
    (item) => item.slug === slug
  );
}

/*
 * ============================================================
 * GET GALERI BERDASARKAN KOMITE
 * ============================================================
 */
export function getGalleryByKomite(
  komite: string
) {
  return gallery.filter(
    (item) => item.komite === komite
  );
}

/*
 * ============================================================
 * GET GALERI TERBARU
 * ============================================================
 */
export function getLatestGallery(limit = 6) {
  return gallery.slice(0, limit);
}