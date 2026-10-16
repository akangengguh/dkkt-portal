"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

type GalleryItem = {
  id: string;
  title: string;
  category: string;
  komite: string;
  image: string;
  description: string;
};

type PublicGalleryItem = {
  id: string;
  title: string;
  description: string | null;
  type: string;
  fileUrl: string | null;
  committee: { name: string; slug: string } | null;
};

const komiteNames: Record<string, string> = {
  teater: "Komite Seni Teater",
  tari: "Komite Seni Tari",
  musik: "Komite Seni Musik",
  "seni-rupa": "Komite Seni Rupa",
  sastra: "Komite Seni Sastra",
  "film-fotografi": "Komite Seni Film dan Fotografi",
  budaya: "Komite Budaya",
};

const kategori = [
  "Semua",
  "Teater",
  "Tari",
  "Musik",
  "Seni Rupa",
  "Sastra",
  "Budaya",
  "Film",
];

const categoryByCommittee: Record<string, string> = {
  teater: "Teater",
  tari: "Tari",
  musik: "Musik",
  "seni-rupa": "Seni Rupa",
  sastra: "Sastra",
  "film-fotografi": "Film",
  budaya: "Budaya",
};

export default function GallerySection() {
  const searchParams = useSearchParams();

  const komiteFilter = searchParams.get("komite");

  const [filter, setFilter] = useState("Semua");
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [selected, setSelected] =
    useState<GalleryItem | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadGallery() {
      try {
        const response = await fetch("/api/public/gallery", {
          cache: "no-store",
        });
        const result = await response.json() as {
          success?: boolean;
          data?: PublicGalleryItem[];
        };

        if (!response.ok || result.success !== true) {
          throw new Error("Gagal mengambil galeri.");
        }

        const photos = (Array.isArray(result.data) ? result.data : [])
          .filter((item) => item.type === "PHOTO" && Boolean(item.fileUrl))
          .map((item) => ({
            id: item.id,
            title: item.title,
            category: item.committee
              ? categoryByCommittee[item.committee.slug] || "Umum"
              : "Umum",
            komite: item.committee?.slug || "",
            image: item.fileUrl!,
            description: item.description || "Dokumentasi kegiatan DKKT Kota Tasikmalaya.",
          }));

        if (!cancelled) setGallery(photos);
      } catch {
        if (!cancelled) {
          setGallery([]);
          setLoadError(true);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void loadGallery();
    return () => {
      cancelled = true;
    };
  }, []);

  /*
   * ==========================================================
   * KOMITE AKTIF
   * ==========================================================
   */
  const activeKomiteName =
    komiteFilter && komiteNames[komiteFilter]
      ? komiteNames[komiteFilter]
      : null;

  /*
   * ==========================================================
   * FILTER GALERI
   * ==========================================================
   */
  const filteredGallery = useMemo(() => {
    let result = [...gallery];

    /*
     * Filter berdasarkan komite dari URL
     */
    if (komiteFilter) {
      result = result.filter(
        (item) => item.komite === komiteFilter
      );
    }

    /*
     * Filter berdasarkan kategori tombol
     */
    if (filter !== "Semua") {
      result = result.filter(
        (item) => item.category === filter
      );
    }

    return result;
  }, [komiteFilter, filter]);

  return (
    <section className="relative overflow-hidden bg-[#050505] py-20 md:py-24">

      {/* =====================================================
          BACKGROUND
      ===================================================== */}
      <div className="pointer-events-none absolute left-[-120px] top-24 h-72 w-72 rounded-full bg-amber-500/5 blur-[120px]" />

      <div className="pointer-events-none absolute bottom-20 right-[-100px] h-80 w-80 rounded-full bg-orange-500/5 blur-[140px]" />

      <div className="relative mx-auto max-w-7xl px-6">

        {/* =====================================================
            HEADER
        ===================================================== */}
        <div className="mb-8 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-amber-400">
              {activeKomiteName
                ? "Galeri Komite"
                : "Galeri DKKT"}
            </p>

            <h2 className="mt-3 text-4xl font-black leading-tight text-white md:text-5xl">
              {activeKomiteName
                ? `Dokumentasi ${activeKomiteName.replace(
                    "Komite ",
                    ""
                  )}`
                : "Dokumentasi Kegiatan"}
            </h2>

            <div className="mt-4 h-1 w-20 rounded-full bg-amber-400" />

            <p className="mt-5 max-w-3xl text-base leading-8 text-gray-400 md:text-lg">
              {activeKomiteName
                ? `Arsip visual kegiatan ${activeKomiteName} dan berbagai karya serta aktivitas yang menjadi bagian dari ekosistem DKKT Kota Tasikmalaya.`
                : "Arsip visual perjalanan seni dan kebudayaan Kota Tasikmalaya melalui foto, pertunjukan, komunitas, dan berbagai momen penting DKKT."}
            </p>
          </div>

          <Link
            href="/galeri"
            className="inline-flex w-fit items-center rounded-xl border border-amber-500 px-5 py-3 text-sm font-semibold text-amber-400 transition hover:bg-amber-500 hover:text-black"
          >
            Semua Galeri →
          </Link>
        </div>

        {/* =====================================================
            KOMITE ACTIVE
        ===================================================== */}
        {activeKomiteName && (
          <div className="mb-8 inline-flex items-center gap-3 rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-2">
            <span className="h-2 w-2 rounded-full bg-amber-400" />

            <span className="text-sm font-semibold text-amber-300">
              {activeKomiteName}
            </span>
          </div>
        )}

        {/* =====================================================
            MEDIA INFO
        ===================================================== */}
        <div className="mb-8 flex flex-wrap gap-3">
          <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-gray-400">
            📷 Foto
          </span>

          <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-gray-400">
            🎬 Video
          </span>

          <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-gray-400">
            🗂 Arsip
          </span>
        </div>

        {/* =====================================================
            FILTER KATEGORI
        ===================================================== */}
        <div className="mb-8 flex flex-wrap gap-3">
          {kategori.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setFilter(item)}
              className={`rounded-full border px-5 py-2.5 text-sm font-semibold transition-all duration-300 ${
                filter === item
                  ? "border-amber-400 bg-amber-400 text-black shadow-[0_0_20px_rgba(245,158,11,0.15)]"
                  : "border-white/10 bg-white/5 text-gray-300 hover:border-amber-400 hover:text-amber-300"
              }`}
            >
              {item}
            </button>
          ))}
        </div>

        {/* =====================================================
            INFO HASIL
        ===================================================== */}
        <div className="mb-8 flex flex-col gap-3 rounded-2xl border border-white/10 bg-[#0D0D0D] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">

          <div>
            <p className="text-sm text-gray-500">
              Menampilkan dokumentasi
            </p>

            <p className="mt-1 font-semibold text-white">
              {activeKomiteName ??
                "Seluruh Galeri DKKT"}
            </p>
          </div>

          <span className="inline-flex w-fit rounded-full border border-amber-500/20 bg-amber-500/10 px-4 py-2 text-sm text-amber-300">
            {loading ? "Memuat…" : filteredGallery.length} Dokumentasi
          </span>

        </div>

        {/* =====================================================
            GALLERY GRID
        ===================================================== */}
        {loading ? (
          <div className="rounded-3xl border border-white/10 bg-[#111111] p-12 text-center text-gray-400">
            Memuat dokumentasi galeri...
          </div>
        ) : loadError ? (
          <div role="alert" className="rounded-3xl border border-red-500/20 bg-red-500/5 p-10 text-center text-red-300">
            Galeri belum dapat dimuat. Coba muat ulang halaman.
          </div>
        ) : filteredGallery.length > 0 ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">

            {filteredGallery.map(
              (item, index) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSelected(item)}
                  className="group relative overflow-hidden rounded-2xl border border-white/10 bg-[#111111] text-left transition-all duration-300 hover:-translate-y-1 hover:border-amber-400/60 hover:shadow-[0_0_30px_rgba(245,158,11,0.10)]"
                >

                  {/* Image */}
                  <div className="relative aspect-[4/3] overflow-hidden">

                    <img
                      src={item.image}
                      alt={item.title}
                      className="h-full w-full object-cover transition duration-700 ease-out group-hover:scale-105"
                    />

                    {/* Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/10 to-transparent" />

                    {/* Category */}
                    <div className="absolute left-4 top-4">
                      <span className="rounded-full bg-amber-500 px-3 py-1 text-xs font-semibold text-black">
                        {item.category}
                      </span>
                    </div>

                    {/* Preview Icon */}
                    <div className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-black/40 text-sm text-white opacity-0 backdrop-blur transition duration-300 group-hover:opacity-100">
                      +
                    </div>

                    {/* Bottom */}
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <h3 className="text-base font-bold leading-6 text-white md:text-lg">
                        {item.title}
                      </h3>

                      <p className="mt-1 text-xs text-gray-300">
                        DKKT Kota Tasikmalaya
                      </p>
                    </div>
                  </div>
                </button>
              )
            )}

          </div>
        ) : (
          /* ===================================================
             EMPTY STATE
          =================================================== */
          <div className="rounded-3xl border border-dashed border-amber-500/30 bg-[#111111] p-12 text-center">

            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/10 text-3xl">
              📷
            </div>

            <h3 className="mt-5 text-2xl font-black text-white">
              Belum Ada Dokumentasi
            </h3>

            <p className="mx-auto mt-3 max-w-xl leading-7 text-gray-400">
              Belum tersedia dokumentasi untuk komite
              atau kategori yang dipilih.
            </p>

          </div>
        )}

        {/* =====================================================
            FOOTER
        ===================================================== */}
        <div className="mt-10 flex flex-col gap-4 border-t border-white/10 pt-6 sm:flex-row sm:items-center sm:justify-between">

          <div>
            <p className="text-sm text-gray-500">
              Menampilkan
            </p>

            <p className="mt-1 font-semibold text-white">
              {filteredGallery.length} dokumentasi
              {filter !== "Semua" && (
                <>
                  {" "}
                  kategori {filter}
                </>
              )}
            </p>
          </div>

          <Link
            href="/galeri"
            className="font-semibold text-amber-400 transition hover:text-amber-300"
          >
            Jelajahi Arsip Lengkap →
          </Link>

        </div>
      </div>

      {/* =====================================================
          LIGHTBOX
      ===================================================== */}
      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4 sm:p-6"
          onClick={() => setSelected(null)}
        >

          <div
            className="relative w-full max-w-6xl"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            {/* Close */}
            <button
              type="button"
              onClick={() => setSelected(null)}
              aria-label="Tutup preview"
              className="absolute right-3 top-3 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-black/70 text-2xl text-white backdrop-blur transition hover:bg-amber-500 hover:text-black"
            >
              ×
            </button>

            {/* Image */}
            <div className="overflow-hidden rounded-3xl border border-white/10 bg-[#0D0D0D]">

              <img
                src={selected.image}
                alt={selected.title}
                className="max-h-[75vh] w-full object-contain"
              />

              {/* Info */}
              <div className="border-t border-white/10 p-6 text-center">

                <span className="rounded-full bg-amber-500 px-3 py-1 text-xs font-semibold text-black">
                  {selected.category}
                </span>

                <h3 className="mt-4 text-2xl font-black text-white md:text-3xl">
                  {selected.title}
                </h3>

                <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-gray-400">
                  {selected.description}
                </p>

                <p className="mt-2 text-xs text-gray-500">
                  {komiteNames[selected.komite] ??
                    selected.komite}
                </p>

              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}