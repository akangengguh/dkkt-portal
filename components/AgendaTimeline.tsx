"use client";

import Link from "next/link";
import {
  useEffect,
  useMemo,
  useState,
} from "react";

type AgendaTimelineProps = {
  mode?: "home" | "page";
  komiteFilter?: string | null;
};

type AgendaItem = {
  id: string;
  title: string;
  slug: string;
  description: string;
  excerpt: string | null;
  image: string | null;

  status: string;
  isFeatured: boolean;

  category: {
    id: string;
    name: string;
    slug: string;
  } | null;

  committee: {
    id: string;
    name: string;
    slug: string;
  } | null;

  startDate: string | null;
  endDate: string | null;

  startTime: string | null;
  endTime: string | null;

  location: string | null;
  address: string | null;

  registrationUrl:
    | string
    | null;

  registrationText:
    | string
    | null;

  contactName:
    | string
    | null;

  contactPhone:
    | string
    | null;

  contactEmail:
    | string
    | null;

  organizer:
    | string
    | null;

  target:
    | string
    | null;

  notes:
    | string
    | null;
};

const bulanList = [
  "Semua",
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

const bulanIndex: Record<
  string,
  number
> = {
  Januari: 0,
  Februari: 1,
  Maret: 2,
  April: 3,
  Mei: 4,
  Juni: 5,
  Juli: 6,
  Agustus: 7,
  September: 8,
  Oktober: 9,
  November: 10,
  Desember: 11,
};

function formatDate(
  value: string | null,
) {
  if (!value) {
    return "-";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return "-";
  }

  return date.toLocaleDateString(
    "id-ID",
    {
      day: "2-digit",
      month: "long",
      year: "numeric",
    },
  );
}

function getMonthName(
  value: string | null,
) {
  if (!value) {
    return "";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return "";
  }

  return date.toLocaleDateString(
    "id-ID",
    {
      month: "long",
    },
  );
}

function getDay(
  value: string | null,
) {
  if (!value) {
    return "-";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return "-";
  }

  return date
    .getDate()
    .toString()
    .padStart(2, "0");
}

function getYear(
  value: string | null,
) {
  if (!value) {
    return "";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return "";
  }

  return date.getFullYear();
}

export default function AgendaTimeline({
  mode = "page",
  komiteFilter = null,
}: AgendaTimelineProps) {
  const isHome =
    mode === "home";

  const [agenda, setAgenda] =
    useState<AgendaItem[]>(
      [],
    );

  const [bulan, setBulan] =
    useState("Semua");

  const [search, setSearch] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  /*
   * ============================================================
   * LOAD DATA
   * ============================================================
   */
  useEffect(() => {
    let active = true;

    async function loadAgenda() {
      setLoading(true);
      setError("");

      try {
        const query =
          komiteFilter
            ? `?komite=${encodeURIComponent(
                komiteFilter,
              )}`
            : "";

        const response =
          await fetch(
            `/api/public/agenda${query}`,
            {
              cache:
                "no-store",
            },
          );

        const result =
          await response.json();

        if (!response.ok) {
          throw new Error(
            result.message ||
              "Gagal mengambil agenda.",
          );
        }

        if (active) {
          setAgenda(
            Array.isArray(
              result.data,
            )
              ? result.data
              : [],
          );
        }
      } catch (error) {
        if (active) {
          setError(
            error instanceof Error
              ? error.message
              : "Gagal mengambil agenda.",
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadAgenda();

    return () => {
      active = false;
    };
  }, [komiteFilter]);

  /*
   * ============================================================
   * FILTER
   * ============================================================
   */
  const filteredAgenda =
    useMemo(() => {
      let result = [
        ...agenda,
      ];

      /*
       * BULAN
       */
      if (
        bulan !==
        "Semua"
      ) {
        result =
          result.filter(
            (item) => {
              if (
                !item.startDate
              ) {
                return false;
              }

              const date =
                new Date(
                  item.startDate,
                );

              return (
                date.getMonth() ===
                bulanIndex[
                  bulan
                ]
              );
            },
          );
      }

      /*
       * SEARCH
       */
      const keyword =
        search
          .trim()
          .toLowerCase();

      if (keyword) {
        result =
          result.filter(
            (item) =>
              [
                item.title,
                item.description,
                item.excerpt,
                item.location,
                item.organizer,
                item.category
                  ?.name,
                item.committee
                  ?.name,
              ]
                .filter(
                  Boolean,
                )
                .join(" ")
                .toLowerCase()
                .includes(
                  keyword,
                ),
          );
      }

      return result;
    }, [
      agenda,
      bulan,
      search,
    ]);

  /*
   * ============================================================
   * HOME
   * ============================================================
   */
  if (isHome) {
    const homeAgenda =
      filteredAgenda.slice(
        0,
        4,
      );

    return (
      <section className="relative overflow-hidden bg-[#070707] py-20 md:py-24">
        <div className="pointer-events-none absolute left-[-100px] top-20 h-72 w-72 rounded-full bg-amber-500/5 blur-[120px]" />

        <div className="pointer-events-none absolute bottom-0 right-[-100px] h-80 w-80 rounded-full bg-orange-500/5 blur-[140px]" />

        <div className="relative mx-auto max-w-7xl px-6">
          <div className="mb-10 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-amber-400">
                Agenda DKKT
              </p>

              <h2 className="mt-3 text-4xl font-black text-white md:text-5xl">
                Agenda Kegiatan
              </h2>

              <div className="mt-4 h-1 w-20 rounded-full bg-amber-500" />
            </div>

            <Link
              href="/agenda"
              className="inline-flex self-start rounded-xl border border-amber-500 px-5 py-3 text-sm font-semibold text-amber-400 transition hover:bg-amber-500 hover:text-black md:self-auto"
            >
              Lihat Semua Agenda →
            </Link>
          </div>

          {loading ? (
            <div className="rounded-3xl border border-white/10 bg-[#111111] p-10 text-center text-gray-500">
              Memuat agenda...
            </div>
          ) : error ? (
            <div className="rounded-3xl border border-red-500/20 bg-red-500/5 p-10 text-center text-red-300">
              {error}
            </div>
          ) : homeAgenda.length ===
            0 ? (
            <div className="rounded-3xl border border-white/10 bg-[#111111] p-10 text-center">
              <p className="text-lg font-semibold text-white">
                Belum ada agenda publik.
              </p>

              <p className="mt-2 text-sm text-gray-500">
                Agenda yang sudah diterbitkan akan tampil di sini.
              </p>
            </div>
          ) : (
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
              {homeAgenda.map(
                (item) => (
                  <Link
                    key={
                      item.id
                    }
                    href={`/agenda/${item.slug}`}
                    className="group overflow-hidden rounded-3xl border border-white/10 bg-[#111111] transition hover:-translate-y-1 hover:border-amber-500/40"
                  >
                    {item.image && (
                      <div className="aspect-[16/10] overflow-hidden">
                        <img
                          src={
                            item.image
                          }
                          alt={
                            item.title
                          }
                          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                        />
                      </div>
                    )}

                    <div className="p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-3xl font-black text-amber-400">
                            {getDay(
                              item.startDate,
                            )}
                          </p>

                          <p className="text-xs font-bold uppercase tracking-wider text-gray-500">
                            {getMonthName(
                              item.startDate,
                            )}
                          </p>
                        </div>

                        <span className="rounded-full border border-emerald-500/20 bg-emerald-500/5 px-2.5 py-1 text-[10px] font-bold text-emerald-300">
                          PUBLISHED
                        </span>
                      </div>

                      <h3 className="mt-5 text-lg font-black leading-7 text-white group-hover:text-amber-300">
                        {
                          item.title
                        }
                      </h3>

                      <p className="mt-3 text-sm text-gray-500">
                        {item.startTime ||
                          "-"}{" "}
                        •{" "}
                        {item.location ||
                          "Lokasi belum ditentukan"}
                      </p>
                    </div>
                  </Link>
                ),
              )}
            </div>
          )}
        </div>
      </section>
    );
  }

  /*
   * ============================================================
   * PAGE
   * ============================================================
   */
  return (
    <section className="min-h-screen bg-black py-24">
      <div className="mx-auto max-w-7xl px-6">
        {/* HEADER */}
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-amber-400">
              Agenda DKKT
            </p>

            <h1 className="mt-3 text-4xl font-black text-white md:text-5xl">
              Timeline Kegiatan
            </h1>

            <div className="mt-4 h-1 w-20 rounded-full bg-amber-500" />

            {komiteFilter &&
              agenda.some(
                (item) =>
                  item.committee
                    ?.slug ===
                  komiteFilter,
              ) && (
                <p className="mt-5 inline-flex rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-2 text-sm text-amber-300">
                  {
                    agenda.find(
                      (item) =>
                        item
                          .committee
                          ?.slug ===
                        komiteFilter,
                    )?.committee
                      ?.name
                  }
                </p>
              )}
          </div>

          <p className="max-w-xl text-sm leading-7 text-gray-500">
            Kalender kegiatan resmi DKKT yang telah
            diterbitkan melalui proses editorial.
          </p>
        </div>

        {/* FILTER */}
        <div className="mt-10 grid gap-4 rounded-3xl border border-white/10 bg-[#0b0b0b] p-5 md:grid-cols-[1fr_auto]">
          <input
            value={search}
            onChange={(event) =>
              setSearch(
                event.target.value,
              )
            }
            placeholder="Cari agenda, kegiatan, lokasi, komite..."
            className="rounded-2xl border border-white/10 bg-white/3 px-4 py-3.5 text-sm text-white outline-none placeholder:text-gray-600 focus:border-amber-400/50"
          />

          <select
            value={bulan}
            onChange={(event) =>
              setBulan(
                event.target.value,
              )
            }
            className="rounded-2xl border border-white/10 bg-[#111111] px-4 py-3.5 text-sm text-white outline-none"
          >
            {bulanList.map(
              (item) => (
                <option
                  key={
                    item
                  }
                  value={
                    item
                  }
                >
                  {item}
                </option>
              ),
            )}
          </select>
        </div>

        {/* RESULT */}
        <div className="mt-10">
          {loading ? (
            <div className="rounded-3xl border border-white/10 bg-[#111111] p-16 text-center text-gray-500">
              Memuat agenda publik...
            </div>
          ) : error ? (
            <div className="rounded-3xl border border-red-500/20 bg-red-500/5 p-8 text-red-300">
              {error}
            </div>
          ) : filteredAgenda.length ===
            0 ? (
            <div className="rounded-3xl border border-white/10 bg-[#111111] p-16 text-center">
              <p className="text-xl font-black text-white">
                Agenda tidak ditemukan
              </p>

              <p className="mt-3 text-sm text-gray-500">
                Belum ada agenda publik yang sesuai dengan filter Anda.
              </p>
            </div>
          ) : (
            <div className="relative">
              <div className="absolute bottom-0 left-[28px] top-0 hidden w-px bg-gradient-to-b from-amber-500/60 via-amber-500/20 to-transparent md:block" />

              <div className="space-y-8">
                {filteredAgenda.map(
                  (item) => (
                    <div
                      key={
                        item.id
                      }
                      className="relative md:pl-20"
                    >
                      <div className="absolute left-[21px] top-8 hidden h-4 w-4 rounded-full border-4 border-black bg-amber-500 md:block" />

                      <div className="grid overflow-hidden rounded-3xl border border-white/10 bg-[#111111] md:grid-cols-[220px_1fr]">
                        {/* DATE */}
                        <div className="hidden bg-amber-500/[0.03] p-7 md:block">
                          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-amber-400">
                            {getMonthName(
                              item.startDate,
                            )}
                          </p>

                          <p className="mt-2 text-6xl font-black text-white">
                            {getDay(
                              item.startDate,
                            )}
                          </p>

                          <p className="mt-1 text-sm font-semibold text-gray-500">
                            {getYear(
                              item.startDate,
                            )}
                          </p>
                        </div>

                        {/* CONTENT */}
                        <div className="p-6 md:p-8">
                          <div className="flex flex-wrap gap-2">
                            <span className="rounded-full border border-emerald-500/20 bg-emerald-500/5 px-3 py-1 text-xs font-bold text-emerald-300">
                              PUBLISHED
                            </span>

                            {item.category && (
                              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-gray-400">
                                {item.category.name}
                              </span>
                            )}
                          </div>

                          <div className="mt-4 md:hidden">
                            <span className="rounded-lg border border-amber-500 px-3 py-2 text-sm font-black text-amber-400">
                              {
                                getDay(
                                  item.startDate,
                                )
                              }{" "}
                              {
                                getMonthName(
                                  item.startDate,
                                )
                              }{" "}
                              {
                                getYear(
                                  item.startDate,
                                )
                              }
                            </span>
                          </div>

                          <h2 className="mt-5 text-2xl font-black leading-tight text-white md:text-3xl">
                            {
                              item.title
                            }
                          </h2>

                          {item.excerpt && (
                            <p className="mt-4 max-w-3xl leading-7 text-gray-400">
                              {
                                item.excerpt
                              }
                            </p>
                          )}

                          <div className="mt-5 flex flex-wrap gap-x-6 gap-y-3 text-sm text-gray-400">
                            <span>
                              🕒{" "}
                              {item.startTime ||
                                "-"}
                              {item.endTime
                                ? ` — ${item.endTime}`
                                : ""}
                            </span>

                            <span>
                              📍{" "}
                              {item.location ||
                                "Lokasi belum ditentukan"}
                            </span>
                          </div>

                          {item.committee && (
                            <div className="mt-4">
                              <span className="inline-flex rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-gray-500">
                                Komite:{" "}
                                {
                                  item.committee
                                    .name
                                }
                              </span>
                            </div>
                          )}

                          <Link
                            href={`/agenda/${item.slug}`}
                            className="mt-6 inline-flex font-semibold text-amber-400 transition hover:text-amber-300"
                          >
                            Detail Agenda →
                          </Link>
                        </div>
                      </div>
                    </div>
                  ),
                )}
              </div>
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="mt-16 rounded-3xl border border-dashed border-amber-500/20 bg-amber-500/[0.03] p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-400">
            Agenda DKKT
          </p>

          <h3 className="mt-3 text-2xl font-black text-white">
            Kalender Kegiatan Kota Tasikmalaya
          </h3>

          <p className="mt-3 max-w-2xl leading-7 text-gray-500">
            Agenda publik akan terus diperbarui berdasarkan
            kegiatan resmi DKKT yang telah melewati proses
            editorial dan dipublikasikan oleh Kurator.
          </p>
        </div>
      </div>
    </section>
  );
}