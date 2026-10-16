import Link from "next/link";
import { notFound } from "next/navigation";

import { db } from "@/lib/db";

type NewsDetailPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

function formatDate(value: unknown) {
  return new Date(String(value)).toLocaleDateString(
    "id-ID",
    {
      day: "2-digit",
      month: "long",
      year: "numeric",
    },
  );
}

export default async function NewsDetailPage({
  params,
}: NewsDetailPageProps) {
  const { slug } = await params;

  const news = await db.orm.public.News.first({
    slug,
  });

  /*
   * Berita yang belum dipublish tidak boleh
   * diakses melalui halaman publik.
   */
  if (
    !news ||
    (!news.isPublished &&
      news.status !== "PUBLISHED")
  ) {
    notFound();
  }

  /*
   * Ambil metadata berita.
   */
  const [category, committee, creator] =
    await Promise.all([
      news.categoryId
        ? db.orm.public.NewsCategory.first({
            id: news.categoryId,
          })
        : Promise.resolve(null),

      news.committeeId
        ? db.orm.public.Committee.first({
            id: news.committeeId,
          })
        : Promise.resolve(null),

      db.orm.public.User.first({
        id: news.createdById,
      }),
    ]);

  /*
   * Berita terkait berdasarkan komite.
   */
  const allNews = await db.orm.public.News.all();

  const relatedNews = allNews
    .filter(
      (item) =>
        item.id !== news.id &&
        item.isPublished &&
        (!news.committeeId ||
          item.committeeId ===
            news.committeeId),
    )
    .sort(
      (a, b) =>
        new Date(
          b.createdAt.toString(),
        ).getTime() -
        new Date(
          a.createdAt.toString(),
        ).getTime(),
    )
    .slice(0, 3);

  return (
    <main className="min-h-screen bg-black text-white">
      {/* =====================================================
          HERO
      ===================================================== */}
      <section className="border-b border-white/10 bg-[#070707]">
        <div className="mx-auto max-w-5xl px-6 pb-16 pt-32 md:pt-36">
          {/* Breadcrumb */}
          <div className="mb-8 flex flex-wrap items-center gap-2 text-sm text-gray-500">
            <Link
              href="/"
              className="transition hover:text-amber-400"
            >
              Beranda
            </Link>

            <span>/</span>

            <Link
              href="/berita"
              className="transition hover:text-amber-400"
            >
              Berita
            </Link>

            <span>/</span>

            <span className="text-gray-600">
              Detail
            </span>
          </div>

          {/* Metadata */}
          <div className="flex flex-wrap gap-3">
            {category && (
              <span className="inline-flex rounded-full border border-amber-500/20 bg-amber-500/5 px-4 py-2 text-xs font-semibold text-amber-300">
                {category.name}
              </span>
            )}

            {committee && (
              <Link
                href={`/berita?komite=${encodeURIComponent(
                  committee.slug,
                )}`}
                className="inline-flex rounded-full border border-white/10 bg-white/3 px-4 py-2 text-xs font-semibold text-gray-400 transition hover:border-amber-400/30 hover:text-amber-300"
              >
                {committee.name}
              </Link>
            )}
          </div>

          {/* Title */}
          <h1 className="mt-7 max-w-5xl text-4xl font-black leading-[1.08] tracking-tight text-white md:text-5xl lg:text-6xl">
            {news.title}
          </h1>

          {/* Subtitle */}
          {news.subtitle && (
            <p className="mt-6 max-w-4xl text-lg leading-8 text-gray-400 md:text-xl">
              {news.subtitle}
            </p>
          )}

          {/* Author + Date */}
          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-white/10 pt-6 text-sm text-gray-500">
            <span>
              Dibuat oleh{" "}
              <strong className="font-semibold text-gray-300">
                {creator?.name ||
                  "Pengguna DKKT"}
              </strong>
            </span>

            <span>
              {formatDate(news.createdAt)}
            </span>
          </div>
        </div>
      </section>

      {/* =====================================================
          ARTICLE
      ===================================================== */}
      <article className="mx-auto max-w-5xl px-6 py-12 md:py-16">
        {/* Featured Image */}
        {news.featuredImage && (
          <div className="overflow-hidden rounded-3xl border border-white/10 bg-[#0b0b0b]">
            <img
              src={news.featuredImage}
              alt={news.title}
              className="aspect-[16/8] h-full w-full object-cover"
            />
          </div>
        )}

        {/* Excerpt */}
        {news.excerpt && (
          <div className="mt-10 rounded-3xl border-l-4 border-amber-400 bg-amber-500/5 px-6 py-6 md:px-8">
            <p className="text-base leading-8 text-amber-100 md:text-lg">
              {news.excerpt}
            </p>
          </div>
        )}

        {/* Content */}
        <div className="mt-10 whitespace-pre-line text-base leading-8 text-gray-300 md:text-lg md:leading-9">
          {news.content}
        </div>

        {/* Back */}
        <div className="mt-12 border-t border-white/10 pt-8">
          <Link
            href="/berita"
            className="inline-flex rounded-xl border border-white/10 px-5 py-3 text-sm font-semibold text-gray-400 transition hover:border-amber-400/40 hover:text-amber-300"
          >
            ← Kembali ke Berita
          </Link>
        </div>
      </article>

      {/* =====================================================
          RELATED NEWS
      ===================================================== */}
      {relatedNews.length > 0 && (
        <section className="border-t border-white/10 bg-[#070707] py-20">
          <div className="mx-auto max-w-5xl px-6">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-400">
              Berita Terkait
            </p>

            <h2 className="mt-3 text-3xl font-black text-white">
              Publikasi Lainnya
            </h2>

            <div className="mt-8 grid gap-5 md:grid-cols-3">
              {relatedNews.map((item) => (
                <Link
                  key={item.id}
                  href={`/berita/${item.slug}`}
                  className="group rounded-2xl border border-white/10 bg-[#0b0b0b] p-5 transition hover:-translate-y-1 hover:border-amber-400/40"
                >
                  {item.featuredImage && (
                    <div className="mb-5 overflow-hidden rounded-xl">
                      <img
                        src={item.featuredImage}
                        alt={item.title}
                        className="aspect-[16/9] w-full object-cover transition duration-500 group-hover:scale-105"
                      />
                    </div>
                  )}

                  <p className="text-xs text-gray-600">
                    {formatDate(
                      item.createdAt,
                    )}
                  </p>

                  <h3 className="mt-2 line-clamp-3 text-lg font-bold leading-7 text-white transition group-hover:text-amber-300">
                    {item.title}
                  </h3>

                  <span className="mt-4 inline-flex text-sm font-semibold text-amber-400">
                    Baca Berita →
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}