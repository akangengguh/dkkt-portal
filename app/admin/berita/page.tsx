import Link from "next/link";

import { requireAdmin } from "@/lib/admin";
import { db } from "@/lib/db";
import { getAccessibleCommitteeIds, getUserRoles, hasPermission } from "@/lib/permissions";

import NewsActions from "@/components/admin/NewsActions";
import AdminListSearch from "@/components/admin/AdminListSearch";
import { matchesSearch } from "@/lib/search";

function formatDate(value: unknown) {
  if (!value) {
    return "-";
  }

  try {
    return new Date(String(value)).toLocaleDateString(
      "id-ID",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  } catch {
    return "-";
  }
}

function isPublished(item: {
  isPublished: boolean;
  status: string;
}) {
  return (
    item.isPublished === true ||
    item.status === "PUBLISHED"
  );
}

function statusLabel(item: {
  isPublished: boolean;
  status: string;
}) {
  if (isPublished(item)) {
    return "PUBLISHED";
  }

  if (item.status === "REJECTED") {
    return "REJECTED";
  }

  return item.status || "DRAFT";
}

function statusClass(item: {
  isPublished: boolean;
  status: string;
}) {
  const status = statusLabel(item);

  if (status === "PUBLISHED") {
    return "border-emerald-500/20 bg-emerald-500/5 text-emerald-300";
  }

  if (status === "REJECTED") {
    return "border-red-500/20 bg-red-500/5 text-red-300";
  }

  return "border-amber-500/20 bg-amber-500/5 text-amber-300";
}

export default async function AdminBeritaPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string | string[] }>;
}) {
  const params = await searchParams;
  const query = typeof params.q === "string" ? params.q.trim() : "";
  const session = await requireAdmin();

  const canView = await hasPermission({
    userId: session.userId,
    permission: "news.view",
  });

  const canCreate = await hasPermission({
    userId: session.userId,
    permission: "news.create",
  });

  const canUpdate = await hasPermission({
    userId: session.userId,
    permission: "news.update",
  });

  const canPublish = await hasPermission({
    userId: session.userId,
    permission: "news.publish",
  });

  const canDelete = await hasPermission({
    userId: session.userId,
    permission: "news.delete",
  });

  if (!canView) {
    return (
      <section className="mx-auto max-w-4xl">
        <div className="rounded-3xl border border-red-500/20 bg-red-500/5 p-8">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-red-400">
            Akses Ditolak
          </p>

          <h1 className="mt-3 text-2xl font-black text-white">
            Anda tidak mempunyai akses ke modul Berita.
          </h1>

          <p className="mt-3 text-sm leading-7 text-gray-400">
            Hubungi administrator sistem untuk memperoleh
            permission yang diperlukan.
          </p>

          <Link
            href="/admin"
            className="mt-6 inline-flex rounded-xl bg-amber-500 px-5 py-3 text-sm font-bold text-black transition hover:bg-amber-400"
          >
            Kembali ke Dashboard
          </Link>
        </div>
      </section>
    );
  }

  const allNews = await db.orm.public.News.all();
  const userRoles = await getUserRoles(session.userId);
  let news = allNews;
  if (!userRoles.some((role) => ["SUPER_ADMIN", "ADMINISTRATOR", "EDITOR"].includes(role))) {
    if (userRoles.includes("NEWS_EDITOR") || userRoles.includes("CONTRIBUTOR")) {
      news = allNews.filter((item) => item.createdById === session.userId);
    } else if (userRoles.some((role) => ["KOMITE_EDITOR", "KOMITE_MANAGER"].includes(role))) {
      const committeeIds = new Set(await getAccessibleCommitteeIds(session.userId) || []);
      news = allNews.filter((item) => item.committeeId && committeeIds.has(item.committeeId));
    } else {
      news = [];
    }
  }
  const accessibleNews = news;
  news = news.filter((item) => matchesSearch(query, [item.title, item.slug, item.subtitle, item.excerpt, item.status]));

  const sortedNews = [...news].sort((a, b) => {
    return (
      new Date(String(b.createdAt)).getTime() -
      new Date(String(a.createdAt)).getTime()
    );
  });

  const publishedCount = accessibleNews.filter((item) =>
    isPublished(item)
  ).length;

  const rejectedCount = accessibleNews.filter(
    (item) => item.status === "REJECTED"
  ).length;

  const draftCount = accessibleNews.filter(
    (item) =>
      !isPublished(item) &&
      item.status !== "REJECTED"
  ).length;

  return (
    <div className="mx-auto max-w-7xl pb-20">
      {/* HEADER */}
      <section className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-amber-400">
            CMS DKKT
          </p>

          <h1 className="mt-2 text-3xl font-black text-white md:text-4xl">
            Berita
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-7 text-gray-400">
            Kelola berita melalui alur editorial Editor →
            Kurator → Publikasi.
          </p>
        </div>

        {canCreate && (
          <Link
            href="/admin/berita/tambah"
            className="inline-flex items-center justify-center rounded-xl bg-amber-500 px-5 py-3 text-sm font-bold text-black transition hover:bg-amber-400"
          >
            + Tambah Berita
          </Link>
        )}
      </section>

      {/* SUMMARY */}
      <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-white/10 bg-[#0b0b0b] p-5">
          <p className="text-xs uppercase tracking-[0.2em] text-gray-600">
            Total
          </p>

          <p className="mt-2 text-3xl font-black text-white">
            {news.length}
          </p>

          <p className="mt-1 text-sm text-gray-500">
            Semua berita
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#0b0b0b] p-5">
          <p className="text-xs uppercase tracking-[0.2em] text-gray-600">
            Published
          </p>

          <p className="mt-2 text-3xl font-black text-emerald-300">
            {publishedCount}
          </p>

          <p className="mt-1 text-sm text-gray-500">
            Berita tayang
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#0b0b0b] p-5">
          <p className="text-xs uppercase tracking-[0.2em] text-gray-600">
            Draft
          </p>

          <p className="mt-2 text-3xl font-black text-amber-300">
            {draftCount}
          </p>

          <p className="mt-1 text-sm text-gray-500">
            Menunggu pemeriksaan
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#0b0b0b] p-5">
          <p className="text-xs uppercase tracking-[0.2em] text-gray-600">
            Ditolak
          </p>

          <p className="mt-2 text-3xl font-black text-red-300">
            {rejectedCount}
          </p>

          <p className="mt-1 text-sm text-gray-500">
            Perlu diperbaiki
          </p>
        </div>
      </section>

      {/* WORKFLOW */}
      <section className="mt-8 rounded-2xl border border-amber-500/15 bg-amber-500/5 p-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500 font-black text-black">
            ✓
          </div>

          <div>
            <p className="font-bold text-white">
              Workflow Editorial DKKT
            </p>

            <p className="mt-1 text-sm leading-7 text-gray-400">
              Editor membuat Draft → Kurator membaca Preview →
              Publish atau Tolak dengan alasan → Editor
              memperbaiki → kembali diperiksa Kurator.
            </p>
          </div>
        </div>
      </section>

      {/* TABLE */}
      <section className="mt-8 overflow-hidden rounded-3xl border border-white/10 bg-[#0b0b0b]">
        <div className="flex flex-col gap-4 border-b border-white/10 px-6 py-5 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-lg font-black text-white">
              Daftar Berita
            </h2>

            <p className="mt-1 text-sm text-gray-500">Data diambil langsung dari database CMS DKKT.</p>
          </div>
          <AdminListSearch query={query} clearHref="/admin/berita" placeholder="Cari judul, slug, ringkasan, status" resultCount={sortedNews.length} />
        </div>

        {sortedNews.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white/[0.04] text-2xl">
              📰
            </div>

            <h3 className="mt-5 text-lg font-bold text-white">
              Belum ada berita
            </h3>

            <p className="mt-2 text-sm text-gray-500">
              {query ? "Tidak ada berita yang cocok dengan pencarian." : "Silakan tambahkan berita pertama melalui CMS."}
            </p>

            {canUpdate && (
              <Link
                href="/admin/berita/tambah"
                className="mt-6 inline-flex rounded-xl bg-amber-500 px-5 py-3 text-sm font-bold text-black transition hover:bg-amber-400"
              >
                + Tambah Berita
              </Link>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-white/10 text-left">
                  <th className="whitespace-nowrap px-6 py-4 text-xs font-bold uppercase tracking-[0.15em] text-gray-600">
                    Judul
                  </th>

                  <th className="whitespace-nowrap px-6 py-4 text-xs font-bold uppercase tracking-[0.15em] text-gray-600">
                    Status
                  </th>

                  <th className="whitespace-nowrap px-6 py-4 text-xs font-bold uppercase tracking-[0.15em] text-gray-600">
                    Featured
                  </th>

                  <th className="whitespace-nowrap px-6 py-4 text-xs font-bold uppercase tracking-[0.15em] text-gray-600">
                    Dibuat
                  </th>

                  <th className="whitespace-nowrap px-6 py-4 text-right text-xs font-bold uppercase tracking-[0.15em] text-gray-600">
                    Aksi
                  </th>
                </tr>
              </thead>

              <tbody>
                {sortedNews.map((item) => {
                  const published =
                    isPublished(item);

                  return (
                    <tr
                      key={item.id}
                      className="border-b border-white/5 transition last:border-0 hover:bg-white/1.5"
                    >
                      <td className="max-w-md px-6 py-5">
                        <p className="font-semibold leading-6 text-white">
                          {item.title}
                        </p>

                        <p className="mt-1 break-all text-xs leading-5 text-gray-600">
                          /{item.slug}
                        </p>
                      </td>

                      <td className="whitespace-nowrap px-6 py-5">
                        <span
                          className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${statusClass(
                            item
                          )}`}
                        >
                          {statusLabel(item)}
                        </span>
                      </td>

                      <td className="whitespace-nowrap px-6 py-5">
                        {item.isFeatured ? (
                          <span className="font-semibold text-amber-400">
                            ★ Ya
                          </span>
                        ) : (
                          <span className="text-gray-600">
                            Tidak
                          </span>
                        )}
                      </td>

                      <td className="whitespace-nowrap px-6 py-5 text-sm text-gray-500">
                        {formatDate(item.createdAt)}
                      </td>

                      <td className="px-6 py-5">
                        <NewsActions
                          id={item.id}
                          slug={item.slug}
                          isPublished={published}
                          isFeatured={
                            item.isFeatured
                          }
                          canUpdate={
                            canUpdate
                          }
                          canPublish={
                            canPublish
                          }
                          canDelete={
                            canDelete
                          }
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}