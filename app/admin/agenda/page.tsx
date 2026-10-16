import Link from "next/link";

import { requireAdmin } from "@/lib/admin";
import { db } from "@/lib/db";
import { hasPermission } from "@/lib/permissions";

import AgendaActions from "@/components/admin/AgendaActions";
import AdminListSearch from "@/components/admin/AdminListSearch";
import { matchesSearch } from "@/lib/search";

function formatDate(value: unknown) {
  if (!value) return "-";

  try {
    return new Date(
      String(value),
    ).toLocaleDateString(
      "id-ID",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      },
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
    item.isPublished ||
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
  const status =
    statusLabel(item);

  if (
    status ===
    "PUBLISHED"
  ) {
    return "border-emerald-500/20 bg-emerald-500/5 text-emerald-300";
  }

  if (
    status ===
    "REJECTED"
  ) {
    return "border-red-500/20 bg-red-500/5 text-red-300";
  }

  return "border-amber-500/20 bg-amber-500/5 text-amber-300";
}

export default async function AdminAgendaPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string | string[] }>;
}) {
  const params = await searchParams;
  const query = typeof params.q === "string" ? params.q.trim() : "";
  const session =
    await requireAdmin();

  const canView =
    await hasPermission({
      userId:
        session.userId,
      permission:
        "agenda.view",
    });

  const canUpdate =
    await hasPermission({
      userId:
        session.userId,
      permission:
        "agenda.update",
    });

  const canCreate =
    await hasPermission({
      userId:
        session.userId,
      permission:
        "agenda.create",
    });

  const canPublish =
    await hasPermission({
      userId:
        session.userId,
      permission:
        "agenda.publish",
    });

  const canDelete =
    await hasPermission({
      userId:
        session.userId,
      permission:
        "agenda.delete",
    });

  if (!canView) {
    return (
      <div className="rounded-3xl border border-red-500/20 bg-red-500/5 p-8">
        <h1 className="text-2xl font-black text-white">
          Akses Ditolak
        </h1>

        <Link
          href="/admin"
          className="mt-6 inline-flex rounded-xl bg-amber-500 px-5 py-3 font-bold text-black"
        >
          Kembali
        </Link>
      </div>
    );
  }

  const allAgenda =
    await db.orm.public.Agenda.all();

  const agenda = allAgenda.filter((item) => matchesSearch(query, [item.title, item.slug, item.location, item.organizer, item.status, item.description]));

  const sortedAgenda =
    [...agenda].sort(
      (a, b) =>
        new Date(
          String(a.startDate),
        ).getTime() -
        new Date(
          String(b.startDate),
        ).getTime(),
    );

  const publishedCount =
    allAgenda.filter(
      isPublished,
    ).length;

  const rejectedCount =
    allAgenda.filter(
      (item) =>
        item.status ===
        "REJECTED",
    ).length;

  const draftCount =
    allAgenda.filter(
      (item) =>
        !isPublished(item) &&
        item.status !==
          "REJECTED",
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
            Agenda
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-7 text-gray-400">
            Kelola agenda kegiatan DKKT melalui alur
            Editor → Kurator → Publikasi.
          </p>
        </div>

        {canCreate && (
          <Link
            href="/admin/agenda/tambah"
            className="rounded-xl bg-amber-500 px-5 py-3 text-sm font-bold text-black"
          >
            + Tambah Agenda
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
            {agenda.length}
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#0b0b0b] p-5">
          <p className="text-xs uppercase tracking-[0.2em] text-gray-600">
            Published
          </p>

          <p className="mt-2 text-3xl font-black text-emerald-300">
            {publishedCount}
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#0b0b0b] p-5">
          <p className="text-xs uppercase tracking-[0.2em] text-gray-600">
            Draft
          </p>

          <p className="mt-2 text-3xl font-black text-amber-300">
            {draftCount}
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#0b0b0b] p-5">
          <p className="text-xs uppercase tracking-[0.2em] text-gray-600">
            Ditolak
          </p>

          <p className="mt-2 text-3xl font-black text-red-300">
            {rejectedCount}
          </p>
        </div>
      </section>

      {/* TABLE */}
      <section className="mt-8 overflow-hidden rounded-3xl border border-white/10 bg-[#0b0b0b]">
        <div className="border-b border-white/10 px-6 py-5">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <h2 className="text-lg font-black text-white">Daftar Agenda</h2>
            <AdminListSearch query={query} clearHref="/admin/agenda" placeholder="Cari judul, lokasi, penyelenggara, status" resultCount={sortedAgenda.length} />
          </div>
        </div>

        {sortedAgenda.length ===
        0 ? (
          <div className="p-16 text-center">
            <p className="text-gray-500">
              {query ? "Tidak ada agenda yang cocok dengan pencarian." : "Belum ada agenda."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-white/10 text-left">
                  <th className="px-6 py-4 text-xs uppercase tracking-[0.15em] text-gray-600">
                    Agenda
                  </th>

                  <th className="px-6 py-4 text-xs uppercase tracking-[0.15em] text-gray-600">
                    Tanggal
                  </th>

                  <th className="px-6 py-4 text-xs uppercase tracking-[0.15em] text-gray-600">
                    Status
                  </th>

                  <th className="px-6 py-4 text-xs uppercase tracking-[0.15em] text-gray-600">
                    Featured
                  </th>

                  <th className="px-6 py-4 text-right text-xs uppercase tracking-[0.15em] text-gray-600">
                    Aksi
                  </th>
                </tr>
              </thead>

              <tbody>
                {sortedAgenda.map(
                  (item) => {
                    const published =
                      isPublished(
                        item,
                      );

                    return (
                      <tr
                        key={
                          item.id
                        }
                        className="border-b border-white/5 last:border-0 hover:bg-white/1.5"
                      >
                        <td className="max-w-md px-6 py-5">
                          <p className="font-semibold text-white">
                            {
                              item.title
                            }
                          </p>

                          <p className="mt-1 text-xs text-gray-600">
                            /{
                              item.slug
                            }
                          </p>

                          {item.location && (
                            <p className="mt-2 text-xs text-gray-500">
                              📍{" "}
                              {
                                item.location
                              }
                            </p>
                          )}
                        </td>

                        <td className="whitespace-nowrap px-6 py-5 text-sm text-gray-400">
                          {formatDate(
                            item.startDate,
                          )}

                          {item.startTime && (
                            <span className="ml-2 text-gray-600">
                              {
                                item.startTime
                              }
                            </span>
                          )}
                        </td>

                        <td className="px-6 py-5">
                          <span
                            className={`rounded-full border px-3 py-1 text-xs font-semibold ${statusClass(
                              item,
                            )}`}
                          >
                            {statusLabel(
                              item,
                            )}
                          </span>
                        </td>

                        <td className="px-6 py-5">
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

                        <td className="px-6 py-5">
                          <AgendaActions
                            id={
                              item.id
                            }
                            slug={
                              item.slug
                            }
                            status={
                              item.status
                            }
                            isPublished={
                              published
                            }
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
                  },
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
