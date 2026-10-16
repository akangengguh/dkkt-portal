"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";

import NewsSection from "@/components/NewsSection";
import PageHero from "@/components/PageHero";

const komiteData: Record<
  string,
  {
    name: string;
    shortName: string;
    description: string;
  }
> = {
  teater: {
    name: "Komite Seni Teater",
    shortName: "Seni Teater",
    description:
      "Publikasi kegiatan, pertunjukan, program, dan perkembangan Komite Seni Teater DKKT Kota Tasikmalaya.",
  },

  tari: {
    name: "Komite Seni Tari",
    shortName: "Seni Tari",
    description:
      "Publikasi pertunjukan, kegiatan, karya, dan perkembangan Komite Seni Tari DKKT Kota Tasikmalaya.",
  },

  musik: {
    name: "Komite Seni Musik",
    shortName: "Seni Musik",
    description:
      "Publikasi kegiatan, pertunjukan, karya, dan perkembangan Komite Seni Musik DKKT Kota Tasikmalaya.",
  },

  "seni-rupa": {
    name: "Komite Seni Rupa",
    shortName: "Seni Rupa",
    description:
      "Publikasi kegiatan, karya, pameran, program, dan perkembangan Komite Seni Rupa DKKT Kota Tasikmalaya.",
  },

  sastra: {
    name: "Komite Seni Sastra",
    shortName: "Seni Sastra",
    description:
      "Publikasi karya, kegiatan literasi, puisi, diskusi, dan perkembangan Komite Seni Sastra DKKT Kota Tasikmalaya.",
  },

  "film-fotografi": {
    name: "Komite Seni Film dan Fotografi",
    shortName: "Film & Fotografi",
    description:
      "Publikasi kegiatan perfilman, fotografi, dokumentasi visual, dan perkembangan Komite Seni Film dan Fotografi DKKT.",
  },

  budaya: {
    name: "Komite Budaya",
    shortName: "Budaya",
    description:
      "Publikasi kegiatan, tradisi, program, kajian, dan perkembangan Komite Budaya DKKT Kota Tasikmalaya.",
  },
};

function BeritaContent() {
  const searchParams = useSearchParams();

  const komiteSlug = searchParams.get("komite");

  const selectedKomite =
    komiteSlug && komiteData[komiteSlug]
      ? komiteData[komiteSlug]
      : null;

  return (
    <main className="min-h-screen bg-black text-white">
      {/* =====================================================
          HERO
      ===================================================== */}
      <PageHero
        eyebrow={
          selectedKomite
            ? "Publikasi Komite"
            : "Majalah Digital DKKT"
        }
        title="Berita &"
        highlight={
          selectedKomite
            ? selectedKomite.shortName
            : "Artikel Budaya"
        }
        description={
          selectedKomite
            ? selectedKomite.description
            : "Portal berita resmi Dewan Kesenian dan Kebudayaan Kota Tasikmalaya yang menyajikan informasi kegiatan, festival, seni, budaya, dan artikel inspiratif."
        }
      >
        {selectedKomite && (
          <div className="inline-flex items-center gap-3 rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-2">
            <span className="h-2 w-2 rounded-full bg-amber-400" />

            <span className="text-sm font-semibold text-amber-300">
              {selectedKomite.name}
            </span>
          </div>
        )}
      </PageHero>

      {/* =====================================================
          NEWS
      ===================================================== */}
      <NewsSection />
    </main>
  );
}

function BeritaLoading() {
  return (
    <main className="min-h-screen bg-black text-white">
      <section className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-amber-400 border-t-transparent" />

          <p className="mt-4 text-sm text-gray-400">
            Memuat berita DKKT...
          </p>
        </div>
      </section>
    </main>
  );
}

export default function BeritaPage() {
  return (
    <Suspense fallback={<BeritaLoading />}>
      <BeritaContent />
    </Suspense>
  );
}