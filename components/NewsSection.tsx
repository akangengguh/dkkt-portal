"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

type NewsItem = {
  id: string;
  title: string;
  slug: string;
  subtitle: string;
  excerpt: string;
  content: string;
  image: string;
  category: string;
  komite: string;
  komiteName: string;
  date: string;
  publishedAt: string | null;
  isFeatured: boolean;
};

type NewsSectionProps = {
  mode?: "home" | "page";
};

const komiteNames: Record<
  string,
  string
> = {
  teater: "Komite Seni Teater",
  "seni-rupa": "Komite Seni Rupa",
  sastra: "Komite Seni Sastra",
  musik: "Komite Seni Musik",
  tari: "Komite Seni Tari",
  "film-fotografi":
    "Komite Seni Film dan Fotografi",
  budaya: "Komite Budaya",
};

export default function NewsSection({
  mode = "page",
}: NewsSectionProps) {
  const isHome = mode === "home";

  const searchParams = useSearchParams();

  const komiteFilter =
    searchParams.get("komite");

  const [news, setNews] =
    useState<NewsItem[]>([]);

  const [search, setSearch] =
    useState("");

  const [page, setPage] =
    useState(1);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  /*
   * ==========================================================
   * LOAD BERITA
   * ==========================================================
   */
  useEffect(() => {
    let cancelled = false;

    async function loadNews() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          "/api/public/news",
          {
            method: "GET",
            cache: "no-store",
          },
        );

        const result =
          await response.json();

        if (!response.ok) {
          throw new Error(
            result.message ||
              "Gagal mengambil berita.",
          );
        }

        if (!cancelled) {
          setNews(
            Array.isArray(result.data)
              ? result.data
              : [],
          );
        }
      } catch (error) {
        if (!cancelled) {
          setError(
            error instanceof Error
              ? error.message
              : "Gagal mengambil berita.",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadNews();

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
    komiteFilter &&
    komiteNames[komiteFilter]
      ? komiteNames[komiteFilter]
      : null;

  /*
   * ==========================================================
   * FILTER
   * ==========================================================
   */
  const filteredNews = useMemo(() => {
    let result = [...news];

    /*
     * Komite
     */
    if (komiteFilter) {
      result = result.filter(
        (item) =>
          item.komite ===
          komiteFilter,
      );
    }

    /*
     * Search
     */
    const keyword =
      search.trim().toLowerCase();

    if (keyword) {
      result = result.filter(
        (item) =>
          [
            item.title,
            item.subtitle,
            item.excerpt,
            item.category,
            item.komiteName,
          ]
            .join(" ")
            .toLowerCase()
            .includes(keyword),
      );
    }

    return result;
  }, [
    news,
    komiteFilter,
    search,
  ]);

  /*
   * ==========================================================
   * HOME
   * ==========================================================
   */
  const homeFeatured =
    filteredNews.find(
      (item) => item.isFeatured,
    ) ??
    filteredNews[0] ??
    null;

  const homeSideNews =
    filteredNews
      .filter(
        (item) =>
          !homeFeatured ||
          item.id !==
            homeFeatured.id,
      )
      .slice(0, 3);

  /*
   * ==========================================================
   * PAGE
   * ==========================================================
   */
  const perPage = 6;

  const totalPage = Math.max(
    1,
    Math.ceil(
      filteredNews.length /
        perPage,
    ),
  );

  const safePage = Math.min(
    page,
    totalPage,
  );

  const currentNews =
    filteredNews.slice(
      (safePage - 1) * perPage,
      safePage * perPage,
    );

  const pageFeatured =
    !komiteFilter && page === 1
      ? homeFeatured
      : currentNews[0] ?? null;

  const sidebarNews =
    currentNews
      .filter(
        (item) =>
          !pageFeatured ||
          item.id !==
            pageFeatured.id,
      )
      .slice(0, 3);

  const allNewsHref =
    komiteFilter
      ? `/berita?komite=${encodeURIComponent(
          komiteFilter,
        )}`
      : "/berita";

  /*
   * ==========================================================
   * LOADING
   * ==========================================================
   */
  if (loading) {
    return (
      <section className="bg-[#070707] py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex min-h-[320px] items-center justify-center">
            <div className="text-center">
              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-amber-400 border-t-transparent" />

              <p className="mt-4 text-sm text-gray-500">
                Memuat berita DKKT...
              </p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  /*
   * ==========================================================
   * ERROR
   * ==========================================================
   */
  if (error) {
    return (
      <section className="bg-[#070707] py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="rounded-3xl border border-red-500/20 bg-red-500/5 p-10 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/10 text-2xl">
              !
            </div>

            <h2 className="mt-5 text-2xl font-black text-white">
              Berita belum dapat dimuat
            </h2>

            <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-gray-500">
              {error}
            </p>

            <button
              type="button"
              onClick={() =>
                window.location.reload()
              }
              className="mt-6 rounded-xl bg-amber-500 px-5 py-3 text-sm font-bold text-black transition hover:bg-amber-400"
            >
              Muat Ulang
            </button>
          </div>
        </div>
      </section>
    );
  }

  /*
   * ==========================================================
   * HOME VIEW
   * ==========================================================
   */
  if (isHome) {
    return (
      <section className="relative overflow-hidden bg-[#070707] py-20 md:py-24">
        <div className="pointer-events-none absolute left-[-120px] top-20 h-72 w-72 rounded-full bg-amber-500/5 blur-[120px]" />

        <div className="pointer-events-none absolute bottom-0 right-[-100px] h-80 w-80 rounded-full bg-orange-500/5 blur-[140px]" />

        <div className="relative mx-auto max-w-7xl px-6">
          {/* HEADER */}
          <div className="mb-9 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-amber-400">
                Majalah Digital DKKT
              </p>

              <h2 className="mt-3 text-4xl font-black leading-tight text-white md:text-5xl">
                Berita & Artikel
              </h2>

              <div className="mt-4 h-1 w-20 rounded-full bg-amber-400" />

              <p className="mt-4 max-w-2xl text-base leading-7 text-gray-400">
                Kabar terbaru tentang kegiatan, karya,
                dan perkembangan seni budaya Kota
                Tasikmalaya.
              </p>
            </div>

            <Link
              href={allNewsHref}
              className="inline-flex w-fit items-center rounded-xl border border-amber-500 px-5 py-3 text-sm font-semibold text-amber-400 transition hover:bg-amber-500 hover:text-black"
            >
              Lihat Semua Berita →
            </Link>
          </div>

          {activeKomiteName && (
            <div className="mb-7 inline-flex items-center gap-3 rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-2">
              <span className="h-2 w-2 rounded-full bg-amber-400" />

              <span className="text-sm font-semibold text-amber-300">
                {activeKomiteName}
              </span>
            </div>
          )}

          {!homeFeatured ? (
            <div className="rounded-3xl border border-dashed border-amber-500/30 bg-[#111111] p-12 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/10 text-3xl">
                📰
              </div>

              <h3 className="mt-5 text-2xl font-black text-white">
                Belum Ada Berita
              </h3>

              <p className="mt-3 text-gray-400">
                Belum tersedia publikasi
                yang sudah diterbitkan.
              </p>
            </div>
          ) : (
            <div className="grid gap-6 lg:grid-cols-[1.55fr_0.85fr]">
              {/* FEATURED */}
              <Link
                href={`/berita/${homeFeatured.slug}`}
                className="group overflow-hidden rounded-3xl border border-white/10 bg-[#111111] transition duration-300 hover:-translate-y-1 hover:border-amber-400/60"
              >
                <div className="overflow-hidden">
                  <img
                    src={homeFeatured.image}
                    alt={homeFeatured.title}
                    className="h-[420px] w-full object-cover transition duration-700 group-hover:scale-105"
                  />
                </div>

                <div className="p-7">
                  <div className="flex flex-wrap gap-3">
                    <span className="rounded-full border border-amber-500/20 bg-amber-500/5 px-3 py-1 text-xs font-semibold text-amber-300">
                      {homeFeatured.category}
                    </span>

                    {homeFeatured.komiteName && (
                      <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-gray-400">
                        {homeFeatured.komiteName}
                      </span>
                    )}
                  </div>

                  <h3 className="mt-5 text-3xl font-black leading-tight text-white transition group-hover:text-amber-300 md:text-4xl">
                    {homeFeatured.title}
                  </h3>

                  {homeFeatured.subtitle && (
                    <p className="mt-4 text-base leading-7 text-gray-400">
                      {homeFeatured.subtitle}
                    </p>
                  )}

                  <p className="mt-5 text-sm text-gray-500">
                    📅 {homeFeatured.date}
                  </p>

                  <span className="mt-6 inline-flex font-semibold text-amber-400">
                    Baca Selengkapnya →
                  </span>
                </div>
              </Link>

              {/* SIDEBAR */}
              <div className="space-y-4">
                {homeSideNews.map(
                  (item) => (
                    <Link
                      key={item.id}
                      href={`/berita/${item.slug}`}
                      className="group block overflow-hidden rounded-2xl border border-white/10 bg-[#111111] transition hover:-translate-y-1 hover:border-amber-400/50"
                    >
                      <div className="grid grid-cols-[120px_1fr]">
                        <div className="overflow-hidden">
                          <img
                            src={item.image}
                            alt={item.title}
                            className="h-full min-h-[130px] w-full object-cover transition duration-500 group-hover:scale-105"
                          />
                        </div>

                        <div className="p-5">
                          <p className="text-xs font-semibold uppercase tracking-widest text-amber-400">
                            {item.category}
                          </p>

                          <h3 className="mt-2 line-clamp-3 text-lg font-bold leading-7 text-white group-hover:text-amber-300">
                            {item.title}
                          </h3>

                          <p className="mt-3 text-xs text-gray-500">
                            📅 {item.date}
                          </p>
                        </div>
                      </div>
                    </Link>
                  ),
                )}

                <Link
                  href={allNewsHref}
                  className="flex items-center justify-center rounded-xl border border-amber-500 px-4 py-3 font-semibold text-amber-400 transition hover:bg-amber-500 hover:text-black"
                >
                  {activeKomiteName
                    ? "Lihat Publikasi Komite →"
                    : "Lihat Semua Berita →"}
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>
    );
  }

  /*
   * ==========================================================
   * FULL PAGE
   * ==========================================================
   */
  return (
    <section className="bg-[#070707] py-20 md:py-24">
      <div className="mx-auto max-w-7xl px-6">
        {/* HEADER */}
        <div className="mb-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-amber-400">
              Majalah Digital DKKT
            </p>

            <h2 className="mt-3 text-4xl font-black text-white md:text-5xl">
              {activeKomiteName
                ? "Publikasi Komite"
                : "Berita & Artikel"}
            </h2>

            <div className="mt-4 h-1 w-20 rounded-full bg-gradient-to-r from-amber-500 to-yellow-300" />

            {activeKomiteName && (
              <div className="mt-5 inline-flex items-center gap-3 rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-2">
                <span className="h-2 w-2 rounded-full bg-amber-400" />

                <span className="text-sm font-semibold text-amber-300">
                  {activeKomiteName}
                </span>
              </div>
            )}
          </div>

          {/* SEARCH */}
          <div className="w-full md:w-80">
            <input
              type="text"
              placeholder="Cari berita..."
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              className="w-full rounded-xl border border-white/10 bg-[#111111] px-4 py-3 text-white outline-none placeholder:text-gray-500 transition focus:border-amber-400"
            />
          </div>
        </div>

        {/* FILTER INFO */}
        <div className="mb-8 flex flex-col gap-4 rounded-2xl border border-white/10 bg-[#111111] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-gray-500">
              Menampilkan publikasi
            </p>

            <p className="mt-1 font-semibold text-white">
              {activeKomiteName ??
                "Semua Publikasi DKKT"}
            </p>
          </div>

          <span className="inline-flex w-fit rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-2 text-sm text-amber-300">
            {filteredNews.length} Berita
          </span>
        </div>

        {filteredNews.length ===
        0 ? (
          <div className="rounded-3xl border border-dashed border-amber-500/30 bg-[#111111] p-12 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/10 text-3xl">
              📰
            </div>

            <h3 className="mt-5 text-2xl font-black text-white">
              Belum Ada Berita
            </h3>

            <p className="mx-auto mt-3 max-w-xl leading-7 text-gray-400">
              Tidak ditemukan berita
              yang sesuai dengan filter
              atau kata pencarian Anda.
            </p>

            <Link
              href="/berita"
              className="mt-6 inline-flex rounded-xl border border-amber-500 px-5 py-3 font-semibold text-amber-400 transition hover:bg-amber-500 hover:text-black"
            >
              Lihat Semua Berita
            </Link>
          </div>
        ) : (
          <>
            {/* FEATURED */}
            <div className="grid gap-8 lg:grid-cols-3">
              <div className="lg:col-span-2">
                {pageFeatured && (
                  <Link
                    href={`/berita/${pageFeatured.slug}`}
                    className="group block overflow-hidden rounded-3xl border border-white/10 bg-[#111111] transition hover:border-amber-400/60"
                  >
                    <div className="overflow-hidden">
                      <img
                        src={pageFeatured.image}
                        alt={pageFeatured.title}
                        className="h-[400px] w-full object-cover transition duration-700 group-hover:scale-105"
                      />
                    </div>

                    <div className="p-7">
                      <div className="flex flex-wrap gap-3">
                        <span className="rounded-full border border-amber-500/20 bg-amber-500/5 px-3 py-1 text-xs font-semibold text-amber-300">
                          {pageFeatured.category}
                        </span>

                        {pageFeatured.komiteName && (
                          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-gray-400">
                            {pageFeatured.komiteName}
                          </span>
                        )}
                      </div>

                      <h3 className="mt-5 text-3xl font-black leading-tight text-white group-hover:text-amber-300 md:text-4xl">
                        {pageFeatured.title}
                      </h3>

                      {pageFeatured.subtitle && (
                        <p className="mt-4 text-base leading-7 text-gray-400">
                          {pageFeatured.subtitle}
                        </p>
                      )}

                      <p className="mt-5 text-sm text-gray-500">
                        📅 {pageFeatured.date}
                      </p>

                      <span className="mt-6 inline-flex font-semibold text-amber-400">
                        Baca Berita →
                      </span>
                    </div>
                  </Link>
                )}
              </div>

              {/* SIDEBAR */}
              <div className="space-y-4">
                {sidebarNews.map(
                  (item) => (
                    <Link
                      key={item.id}
                      href={`/berita/${item.slug}`}
                      className="group block overflow-hidden rounded-2xl border border-white/10 bg-[#111111] transition hover:-translate-y-1 hover:border-amber-400/50"
                    >
                      <div className="overflow-hidden">
                        <img
                          src={item.image}
                          alt={item.title}
                          className="h-44 w-full object-cover transition duration-500 group-hover:scale-105"
                        />
                      </div>

                      <div className="p-5">
                        <p className="text-xs font-semibold uppercase tracking-widest text-amber-400">
                          {item.category}
                        </p>

                        <h3 className="mt-2 line-clamp-2 text-lg font-bold leading-7 text-white group-hover:text-amber-300">
                          {item.title}
                        </h3>

                        <p className="mt-3 text-xs text-gray-500">
                          📅 {item.date}
                        </p>
                      </div>
                    </Link>
                  ),
                )}

                <Link
                  href={allNewsHref}
                  className="flex items-center justify-center rounded-xl border border-amber-500 px-4 py-3 font-semibold text-amber-400 transition hover:bg-amber-500 hover:text-black"
                >
                  Kembali ke Semua Berita →
                </Link>
              </div>
            </div>

            {/* ARSIP */}
            <div className="mt-16">
              <div className="mb-6">
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-gray-600">
                  Arsip Publikasi
                </p>

                <h3 className="mt-2 text-2xl font-black text-white">
                  {activeKomiteName
                    ? `Publikasi ${activeKomiteName.replace(
                        "Komite ",
                        "",
                      )}`
                    : "Berita Terbaru"}
                </h3>
              </div>

              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {currentNews.map(
                  (item) => (
                    <Link
                      key={item.id}
                      href={`/berita/${item.slug}`}
                      className="group overflow-hidden rounded-2xl border border-white/10 bg-[#111111] transition-all duration-300 hover:-translate-y-1 hover:border-amber-400/60"
                    >
                      <div className="overflow-hidden">
                        <img
                          src={item.image}
                          alt={item.title}
                          className="h-52 w-full object-cover transition duration-500 group-hover:scale-105"
                        />
                      </div>

                      <div className="p-5">
                        <span className="text-xs font-semibold uppercase tracking-widest text-amber-400">
                          {item.category}
                        </span>

                        <h4 className="mt-3 line-clamp-2 text-xl font-bold leading-snug text-white group-hover:text-amber-300">
                          {item.title}
                        </h4>

                        {item.excerpt && (
                          <p className="mt-3 line-clamp-2 text-sm leading-6 text-gray-500">
                            {item.excerpt}
                          </p>
                        )}

                        <p className="mt-4 text-sm text-gray-500">
                          📅 {item.date}
                        </p>

                        {item.komiteName && (
                          <div className="mt-4">
                            <span className="inline-flex rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-gray-500">
                              {item.komiteName}
                            </span>
                          </div>
                        )}

                        <span className="mt-5 inline-flex font-semibold text-amber-400 transition group-hover:text-amber-300">
                          Baca Selengkapnya →
                        </span>
                      </div>
                    </Link>
                  ),
                )}
              </div>

              {/* PAGINATION */}
              {totalPage > 1 && (
                <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
                  {Array.from(
                    {
                      length: totalPage,
                    },
                    (_, index) =>
                      index + 1,
                  ).map(
                    (pageNumber) => (
                      <button
                        key={pageNumber}
                        type="button"
                        onClick={() =>
                          setPage(
                            pageNumber,
                          )
                        }
                        className={`flex h-11 w-11 items-center justify-center rounded-xl font-bold transition ${
                          safePage ===
                          pageNumber
                            ? "bg-amber-500 text-black"
                            : "border border-white/10 bg-[#111111] text-white hover:border-amber-400 hover:text-amber-400"
                        }`}
                      >
                        {pageNumber}
                      </button>
                    ),
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </section>
  );
}