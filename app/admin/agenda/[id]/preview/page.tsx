import Link from "next/link";

import {
  requireAdminPermission,
} from "@/lib/admin";

import { db } from "@/lib/db";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

function formatDate(
  value: unknown,
) {
  if (!value) {
    return "-";
  }

  const date =
    new Date(
      String(value),
    );

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

export default async function PreviewAgendaPage({
  params,
}: Props) {
  await requireAdminPermission(
    "agenda.view",
  );

  const { id } =
    await params;

  const agendaList =
    await db.orm.public.Agenda.all();

  const agenda =
    agendaList.find(
      (item) =>
        String(item.id) ===
        String(id),
    );

  if (!agenda) {
    return (
      <div className="mx-auto max-w-5xl pb-20">
        <div className="rounded-3xl border border-red-500/20 bg-red-500/5 p-8">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-red-400">
            DATA TIDAK DITEMUKAN
          </p>

          <h1 className="mt-3 text-2xl font-black text-white">
            Agenda tidak ditemukan.
          </h1>

          <p className="mt-3 break-all font-mono text-sm text-gray-500">
            {id}
          </p>

          <Link
            href="/admin/agenda"
            className="mt-6 inline-flex rounded-xl bg-amber-500 px-5 py-3 font-bold text-black"
          >
            ← Kembali
          </Link>
        </div>
      </div>
    );
  }

  const published =
    agenda.isPublished ||
    agenda.status ===
      "PUBLISHED";

  let category =
    null;

  if (agenda.categoryId) {
    category =
      await db.orm.public.AgendaCategory.first(
        {
          id:
            agenda.categoryId,
        },
      );
  }

  let committee =
    null;

  if (agenda.committeeId) {
    committee =
      await db.orm.public.Committee.first(
        {
          id:
            agenda.committeeId,
        },
      );
  }

  return (
    <div className="mx-auto max-w-6xl pb-20">
      {/* HEADER */}
      <section className="rounded-3xl border border-amber-500/20 bg-amber-500/5 p-6 md:p-8">
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-amber-400">
              CMS DKKT
            </p>

            <h1 className="mt-2 text-3xl font-black text-white">
              Preview Internal Kurator
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-7 text-gray-400">
              Preview internal untuk memastikan informasi
              kegiatan sudah benar sebelum dipublikasikan.
            </p>
          </div>

          <span
            className={`rounded-full border px-4 py-2 text-xs font-bold ${
              published
                ? "border-emerald-500/20 bg-emerald-500/5 text-emerald-300"
                : agenda.status ===
                    "REJECTED"
                  ? "border-red-500/20 bg-red-500/5 text-red-300"
                  : "border-amber-500/20 bg-amber-500/5 text-amber-300"
            }`}
          >
            {published
              ? "PUBLISHED"
              : agenda.status ||
                "DRAFT"}
          </span>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/admin/agenda"
            className="rounded-xl border border-white/10 px-5 py-3 text-sm font-semibold text-gray-300"
          >
            ← Kembali
          </Link>

          <Link
            href={`/admin/agenda/${agenda.id}/edit`}
            className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-5 py-3 text-sm font-semibold text-amber-300"
          >
            Edit Agenda
          </Link>

          {published && (
            <Link
              href={`/agenda/${agenda.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-xl bg-amber-500 px-5 py-3 text-sm font-bold text-black"
            >
              Buka Publik ↗
            </Link>
          )}
        </div>
      </section>

      {/* REJECTION */}
      {agenda.rejectionReason && (
        <section className="mt-6 rounded-3xl border border-red-500/20 bg-red-500/5 p-6">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-red-400">
            CATATAN KURATOR
          </p>

          <h2 className="mt-2 text-xl font-black text-white">
            Alasan Pengembalian
          </h2>

          <p className="mt-4 leading-8 text-red-200">
            {
              agenda.rejectionReason
            }
          </p>
        </section>
      )}

      {/* CONTENT */}
      <article className="mt-8 overflow-hidden rounded-3xl border border-white/10 bg-[#0b0b0b]">
        {agenda.image && (
          <img
            src={agenda.image}
            alt={
              agenda.title
            }
            className="max-h-[560px] w-full object-cover"
          />
        )}

        <div className="p-6 md:p-10">
          <div className="flex flex-wrap gap-2">
            {category && (
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-gray-400">
                {category.name}
              </span>
            )}

            {committee && (
              <span className="rounded-full border border-amber-500/20 bg-amber-500/5 px-3 py-1 text-xs text-amber-300">
                {committee.name}
              </span>
            )}
          </div>

          <h2 className="mt-5 text-3xl font-black leading-tight text-white md:text-5xl">
            {agenda.title}
          </h2>

          {agenda.excerpt && (
            <p className="mt-4 max-w-3xl text-lg leading-8 text-gray-400">
              {agenda.excerpt}
            </p>
          )}

          {/* DETAIL */}
          <div className="mt-8 grid gap-4 border-y border-white/10 py-7 md:grid-cols-2">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-gray-600">
                Tanggal
              </p>

              <p className="mt-2 font-semibold text-white">
                {formatDate(
                  agenda.startDate,
                )}

                {agenda.endDate && (
                  <>
                    {" "}
                    —{" "}
                    {formatDate(
                      agenda.endDate,
                    )}
                  </>
                )}
              </p>
            </div>

            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-gray-600">
                Waktu
              </p>

              <p className="mt-2 font-semibold text-white">
                {agenda.startTime ||
                  "-"}

                {agenda.endTime && (
                  <>
                    {" "}
                    —{" "}
                    {agenda.endTime}
                  </>
                )}
              </p>
            </div>

            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-gray-600">
                Lokasi
              </p>

              <p className="mt-2 font-semibold text-white">
                {agenda.location ||
                  "-"}
              </p>
            </div>

            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-gray-600">
                Penyelenggara
              </p>

              <p className="mt-2 font-semibold text-white">
                {agenda.organizer ||
                  "-"}
              </p>
            </div>
          </div>

          {/* DESCRIPTION */}
          <div className="mt-8">
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-amber-400">
              Deskripsi Kegiatan
            </p>

            <div className="mt-4 whitespace-pre-wrap text-base leading-8 text-gray-300">
              {agenda.description}
            </div>
          </div>

          {/* ADDRESS */}
          {agenda.address && (
            <div className="mt-8 rounded-2xl border border-white/10 bg-white/2 p-5">
              <p className="text-xs uppercase tracking-[0.2em] text-gray-600">
                Alamat
              </p>

              <p className="mt-2 whitespace-pre-wrap leading-7 text-gray-300">
                {agenda.address}
              </p>
            </div>
          )}

          {/* CONTACT */}
          {(agenda.contactName ||
            agenda.contactPhone ||
            agenda.contactEmail) && (
            <div className="mt-8 rounded-2xl border border-white/10 bg-white/2 p-6">
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-amber-400">
                Narahubung
              </p>

              <div className="mt-4 space-y-2 text-sm text-gray-400">
                {agenda.contactName && (
                  <p>
                    Nama:{" "}
                    <span className="text-white">
                      {
                        agenda.contactName
                      }
                    </span>
                  </p>
                )}

                {agenda.contactPhone && (
                  <p>
                    Telepon:{" "}
                    <span className="text-white">
                      {
                        agenda.contactPhone
                      }
                    </span>
                  </p>
                )}

                {agenda.contactEmail && (
                  <p>
                    Email:{" "}
                    <span className="text-white">
                      {
                        agenda.contactEmail
                      }
                    </span>
                  </p>
                )}
              </div>
            </div>
          )}

          {/* TARGET */}
          {agenda.target && (
            <div className="mt-8">
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-amber-400">
                Sasaran / Peserta
              </p>

              <p className="mt-3 leading-7 text-gray-400">
                {agenda.target}
              </p>
            </div>
          )}

          {/* NOTES */}
          {agenda.notes && (
            <div className="mt-8">
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-amber-400">
                Catatan
              </p>

              <p className="mt-3 whitespace-pre-wrap leading-7 text-gray-400">
                {agenda.notes}
              </p>
            </div>
          )}
        </div>
      </article>
    </div>
  );
}