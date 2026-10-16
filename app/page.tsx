import { Suspense } from "react";

import HighlightSlider from "@/components/HighlightSlider";
import Hero from "@/components/Hero";
import Stats from "@/components/Stats";
import Chairman from "@/components/Chairman";
import Committees from "@/components/Committees";
import NewsSection from "@/components/NewsSection";
import AgendaTimeline from "@/components/AgendaTimeline";
import GallerySection from "@/components/GallerySection";

export const dynamic = "force-dynamic";

function LoadingSection({
  text,
}: {
  text: string;
}) {
  return (
    <section className="flex min-h-[320px] items-center justify-center bg-black text-white">
      <div className="text-center">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-amber-400 border-t-transparent" />

        <p className="mt-4 text-sm text-gray-400">
          {text}
        </p>
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white">
      {/* =====================================================
          HIGHLIGHT
      ===================================================== */}
      <HighlightSlider />

      {/* =====================================================
          IDENTITAS DKKT
      ===================================================== */}
      <Hero />

      {/* =====================================================
          STATISTIK
      ===================================================== */}
      <Stats />

      {/* =====================================================
          SAMBUTAN KETUA
      ===================================================== */}
      <Chairman />

      {/* =====================================================
          7 KOMITE
      ===================================================== */}
      <Committees />

      {/* =====================================================
          BERITA
      ===================================================== */}
      <Suspense
        fallback={
          <LoadingSection text="Memuat berita DKKT..." />
        }
      >
        <NewsSection mode="home" />
      </Suspense>

      {/* =====================================================
          AGENDA
      ===================================================== */}
      <Suspense
        fallback={
          <LoadingSection text="Memuat agenda DKKT..." />
        }
      >
        <AgendaTimeline mode="home" />
      </Suspense>

      {/* =====================================================
          GALERI
      ===================================================== */}
      <Suspense
        fallback={
          <LoadingSection text="Memuat galeri DKKT..." />
        }
      >
        <GallerySection />
      </Suspense>
    </main>
  );
}