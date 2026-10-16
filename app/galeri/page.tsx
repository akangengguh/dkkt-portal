"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";

import PageHero from "@/components/PageHero";
import PremiumGallery from "@/components/PremiumGallery";

type KomiteInfo = {
  name: string;
  shortName: string;
  description: string;
};

const komiteData: Record<string, KomiteInfo> = {
  teater: {
    name: "Komite Seni Teater",
    shortName: "Seni Teater",
    description:
      "Arsip visual kegiatan, pertunjukan, latihan, festival, dan berbagai aktivitas Komite Seni Teater DKKT Kota Tasikmalaya.",
  },

  tari: {
    name: "Komite Seni Tari",
    shortName: "Seni Tari",
    description:
      "Arsip visual pertunjukan, latihan, karya, dan berbagai kegiatan Komite Seni Tari DKKT Kota Tasikmalaya.",
  },

  musik: {
    name: "Komite Seni Musik",
    shortName: "Seni Musik",
    description:
      "Arsip visual pertunjukan, festival, karya, dan berbagai kegiatan Komite Seni Musik DKKT Kota Tasikmalaya.",
  },

  "seni-rupa": {
    name: "Komite Seni Rupa",
    shortName: "Seni Rupa",
    description:
      "Arsip visual pameran, karya, workshop, dan berbagai kegiatan Komite Seni Rupa DKKT Kota Tasikmalaya.",
  },

  sastra: {
    name: "Komite Seni Sastra",
    shortName: "Seni Sastra",
    description:
      "Arsip visual kegiatan literasi, diskusi, pertunjukan, dan karya Komite Seni Sastra DKKT Kota Tasikmalaya.",
  },

  "film-fotografi": {
    name: "Komite Seni Film dan Fotografi",
    shortName: "Film & Fotografi",
    description:
      "Arsip visual kegiatan fotografi, perfilman, dokumentasi, workshop, dan program Komite Seni Film dan Fotografi DKKT.",
  },

  budaya: {
    name: "Komite Budaya",
    shortName: "Budaya",
    description:
      "Arsip visual tradisi, ritual, kegiatan budaya, kajian, dan berbagai program Komite Budaya DKKT Kota Tasikmalaya.",
  },
};

function GaleriContent() {
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
            ? "Galeri Komite"
            : "Pusat Dokumentasi DKKT"
        }
        title="Dokumentasi"
        highlight={
          selectedKomite
            ? selectedKomite.shortName
            : "Seni & Budaya"
        }
        description={
          selectedKomite
            ? selectedKomite.description
            : "Arsip visual perjalanan seni dan kebudayaan Kota Tasikmalaya yang mencakup foto, video dokumenter, dan publikasi resmi DKKT."
        }
      >
        {selectedKomite ? (
          <div className="inline-flex items-center gap-3 rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-2">
            <span className="h-2 w-2 rounded-full bg-amber-400" />

            <span className="text-sm font-semibold text-amber-300">
              {selectedKomite.name}
            </span>
          </div>
        ) : (
          <div className="flex flex-wrap gap-4 text-sm text-gray-300">
            <span>📷 Foto</span>
            <span>🎬 Video</span>
            <span>🗂 Arsip Digital</span>
          </div>
        )}
      </PageHero>

      {/* =====================================================
          GALLERY
      ===================================================== */}
      <PremiumGallery />
    </main>
  );
}

function GaleriLoading() {
  return (
    <main className="min-h-screen bg-black text-white">
      <section className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-amber-400 border-t-transparent" />

          <p className="mt-4 text-sm text-gray-400">
            Memuat galeri DKKT...
          </p>
        </div>
      </section>
    </main>
  );
}

export default function GaleriPage() {
  return (
    <Suspense fallback={<GaleriLoading />}>
      <GaleriContent />
    </Suspense>
  );
}