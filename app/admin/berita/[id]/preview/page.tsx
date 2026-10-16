import Link from "next/link";
import { notFound } from "next/navigation";

import { requireAdmin } from "@/lib/admin";
import { db } from "@/lib/db";
import { canAccessNews, hasPermission } from "@/lib/permissions";

type PreviewPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export const dynamic = "force-dynamic";

function formatDate(value: unknown) {
  if (!value) return "-";

  try {
    return new Date(
      String(value)
    ).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  } catch {
    return "-";
  }
}

export default async function AdminNewsPreviewPage({
  params,
}: PreviewPageProps) {
  const session = await requireAdmin();

  const canView = await hasPermission({
    userId: session.userId,
    permission: "news.view",
  });

  const canUpdate = await hasPermission({
    userId: session.userId,
    permission: "news.update",
  });

  const canPublish = await hasPermission({
    userId: session.userId,
    permission: "news.publish",
  });

  if (!canView) {
    return (
      <div className="mx-auto max-w-4xl p-8">
        <div className="rounded-3xl border border-red-500/20 bg-red-500/5 p-8">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-red-400">
            AKSES DITOLAK
          </p>

          <h1 className="mt-3 text-2xl font-black text-white">
            Anda tidak mempunyai akses preview.
          </h1>

          <Link
            href="/admin/berita"
            className="mt-6 inline-flex rounded-xl bg-amber-500 px-5 py-3 font-bold text-black"
          >
            Kembali
          </Link>
        </div>
      </div>
    );
  }

  const { id } = await params;

  const allNews =
    await db.orm.public.News.all();

  const news = allNews.find(
    (item) =>
      String(item.id) === String(id)
  );

  if (!news) {
    return (
      <div className="mx-auto max-w-4xl pb-20">
        <div className="rounded-3xl border border-red-500/20 bg-red-500/5 p-8">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-red-400">
            DATA TIDAK DITEMUKAN
          </p>

          <h1 className="mt-3 text-2xl font-black text-white">
            Berita tidak ditemukan.
          </h1>

          <p className="mt-4 break-all font-mono text-sm text-gray-500">
            {id}
          </p>

          <Link
            href="/admin/berita"
            className="mt-6 inline-flex rounded-xl bg-amber-500 px-5 py-3 font-bold text-black"
          >
            ← Kembali ke Berita
          </Link>
        </div>
      </div>
    );
  }

  if (!(await canAccessNews(session.userId, news, "view"))) {
    notFound();
  }

  const published =
    news.isPublished === true ||
    news.status === "PUBLISHED";

  const status =
    news.status || "DRAFT";

  return (
    <div className="mx-auto max-w-6xl pb-20">
      {/* =====================================================
          INTERNAL BAR
      ===================================================== */}
      <section className="rounded-3xl border border-amber-500/20 bg-amber-500/5 p-6 md:p-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-amber-400">
              CMS DKKT
            </p>

            <h1 className="mt-2 text-2xl font-black text-white md:text-3xl">
              Preview Internal Kurator
            </h1>

            <p className="mt-2 text-sm leading-7 text-gray-400">
              Periksa berita sebelum diterbitkan ke portal
              publik.
            </p>
          </div>

          <span
            className={`rounded-full border px-4 py-2 text-xs font-bold ${
              published
                ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                : status === "REJECTED"
                  ? "border-red-500/30 bg-red-500/10 text-red-300"
                  : "border-amber-500/30 bg-amber-500/10 text-amber-300"
            }`}
          >
            {published
              ? "PUBLISHED"
              : status}
          </span>
        </div>

        {/* ACTION */}
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/admin/berita"
            className="rounded-xl border border-white/10 px-5 py-3 text-sm font-semibold text-gray-300 hover:border-amber-400/40 hover:text-amber-300"
          >
            ← Kembali
          </Link>

          {canUpdate && (
            <Link
              href={`/admin/berita/${news.id}/edit`}
              className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-5 py-3 text-sm font-semibold text-amber-300"
            >
              Edit Berita
            </Link>
          )}

          {canPublish && !published && (
            <Link
              href="/admin/berita"
              className="rounded-xl bg-emerald-500 px-5 py-3 text-sm font-bold text-black"
            >
              Kembali untuk Publish
            </Link>
          )}

          {published && (
            <Link
              href={`/berita/${news.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-xl bg-amber-500 px-5 py-3 text-sm font-bold text-black"
            >
              Buka Publik ↗
            </Link>
          )}
        </div>
      </section>

      {/* =====================================================
          ARTICLE
      ===================================================== */}
      <article className="mt-8 overflow-hidden rounded-3xl border border-white/10 bg-[#0b0b0b]">
        {/* IMAGE */}
        {news.featuredImage ? (
          <div className="overflow-hidden bg-black">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={news.featuredImage}
              alt={news.title}
              className="max-h-145 w-full object-cover"
            />
          </div>
        ) : (
          <div className="flex h-72 items-center justify-center bg-[#111111]">
            <div className="text-center">
              <div className="text-5xl">
                📰
              </div>

              <p className="mt-3 text-sm text-gray-600">
                Belum ada featured image
              </p>
            </div>
          </div>
        )}

        <div className="p-6 md:p-12">
          {/* STATUS */}
          <div className="flex flex-wrap gap-3">
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-bold text-gray-300">
              {status}
            </span>

            {news.isFeatured && (
              <span className="rounded-full border border-purple-500/20 bg-purple-500/5 px-3 py-1.5 text-xs font-bold text-purple-300">
                ★ BERITA UNGGULAN
              </span>
            )}
          </div>

          {/* TITLE */}
          <h2 className="mt-6 text-3xl font-black leading-tight text-white md:text-5xl">
            {news.title}
          </h2>

          {/* SUBTITLE */}
          {news.subtitle && (
            <p className="mt-4 text-lg leading-8 text-gray-400 md:text-xl">
              {news.subtitle}
            </p>
          )}

          {/* META */}
          <div className="mt-7 flex flex-wrap gap-x-8 gap-y-3 border-y border-white/10 py-5 text-sm text-gray-500">
            <span>
              Dibuat:{" "}
              <strong className="text-gray-300">
                {formatDate(news.createdAt)}
              </strong>
            </span>

            {news.publishedAt && (
              <span>
                Publikasi:{" "}
                <strong className="text-gray-300">
                  {formatDate(news.publishedAt)}
                </strong>
              </span>
            )}
          </div>

          {/* EXCERPT */}
          {news.excerpt && (
            <div className="mt-8 rounded-2xl border border-amber-500/10 bg-amber-500/5 p-6">
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-amber-400">
                Ringkasan
              </p>

              <p className="mt-3 text-base leading-8 text-gray-300">
                {news.excerpt}
              </p>
            </div>
          )}

          {/* CONTENT */}
          <div className="mt-10">
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-gray-600">
              Isi Berita
            </p>

            <div className="mt-5 whitespace-pre-wrap text-base leading-8 text-gray-300 md:text-lg md:leading-9">
              {news.content}
            </div>
          </div>
        </div>
      </article>

      {/* =====================================================
          KURATOR INFO
      ===================================================== */}
      <div className="mt-8 rounded-2xl border border-white/10 bg-white/2 p-6">
        <p className="text-xs font-bold uppercase tracking-[0.25em] text-gray-500">
          Pemeriksaan Kurator
        </p>

        <p className="mt-3 text-sm leading-7 text-gray-400">
          Halaman ini adalah preview internal. Berita DRAFT
          dan REJECTED tetap dapat dibaca di dalam CMS dan
          tidak tampil pada portal publik.
        </p>
      </div>
    </div>
  );
}