import Link from "next/link";
import { connection } from "next/server";

import { db } from "@/lib/db";

function formatDate(value: unknown) {
  if (!value) return "-";

  try {
    return new Date(String(value)).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "-";
  }
}

export default async function DokumenPage() {
  await connection();
  const documents = await db.orm.public.Document.all();
  const published = documents
    .filter((item) => item.isPublished)
    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));

  return (
    <main className="min-h-screen bg-black text-white">
      <section className="mx-auto max-w-7xl px-6 pb-20 pt-[150px]">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-amber-400">
              Dokumen
            </p>
            <h1 className="mt-3 text-4xl font-black md:text-5xl">
              Arsip & Publikasi
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-8 text-gray-400">
              Koleksi dokumen resmi, kebijakan, arsip publik, dan publikasi penting DKKT Kota Tasikmalaya.
            </p>
          </div>

          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-xl border border-white/10 px-5 py-3 text-sm font-semibold text-gray-300 hover:border-amber-400/40 hover:text-amber-300"
          >
            Kembali ke Beranda
          </Link>
        </div>

        <div className="mt-8 rounded-3xl border border-white/10 bg-[#0b0b0b] p-6">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-black text-white">Dokumen Tersedia</h2>
              <p className="mt-1 text-sm text-gray-500">Data publik yang dapat diakses dari portal.</p>
            </div>
            <div className="rounded-full border border-white/10 bg-white/2 px-4 py-2 text-xs font-semibold text-gray-400">
              {published.length} dokumen
            </div>
          </div>

          {published.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/10 p-10 text-center text-gray-500">
              Belum ada dokumen publik yang tersedia saat ini.
            </div>
          ) : (
            <div className="space-y-4">
              {published.map((item) => (
                <a
                  key={item.id}
                  href={item.fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="block rounded-2xl border border-white/10 bg-black/20 p-5 transition hover:border-amber-400/30 hover:bg-[#111111]"
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-400">
                        {item.documentType || "Dokumen"}
                      </p>
                      <h3 className="mt-2 text-xl font-black text-white">{item.title}</h3>
                      {item.description ? (
                        <p className="mt-2 max-w-3xl text-sm leading-7 text-gray-400">{item.description}</p>
                      ) : null}
                    </div>

                    <div className="flex items-center gap-3 md:flex-col md:items-end">
                      <span className="rounded-full border border-emerald-500/20 bg-emerald-500/5 px-2.5 py-1 text-xs font-semibold text-emerald-300">
                        Publik
                      </span>
                      <span className="text-sm text-gray-500">{formatDate(item.createdAt)}</span>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
