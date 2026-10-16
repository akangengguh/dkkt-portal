import Link from "next/link";

import { requireAdmin } from "@/lib/admin";
import { db } from "@/lib/db";
import { hasPermission } from "@/lib/permissions";
import CmsLibraryManager from "@/components/admin/CmsLibraryManager";

export default async function AdminDokumenPage() {
  const session = await requireAdmin();

  const canView = await hasPermission({
    userId: session.userId,
    permission: "document.view",
  });

  const [canCreate, canUpdate, canDelete] = await Promise.all([
    hasPermission({ userId: session.userId, permission: "document.create" }),
    hasPermission({ userId: session.userId, permission: "document.update" }),
    hasPermission({ userId: session.userId, permission: "document.delete" }),
  ]);

  if (!canView) {
    return (
      <section className="mx-auto max-w-4xl">
        <div className="rounded-3xl border border-red-500/20 bg-red-500/5 p-8">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-red-400">
            Akses Ditolak
          </p>
          <h1 className="mt-3 text-2xl font-black text-white">
            Anda tidak mempunyai akses ke modul Dokumen.
          </h1>
          <Link
            href="/admin"
            className="mt-6 inline-flex rounded-xl bg-amber-500 px-5 py-3 text-sm font-bold text-black"
          >
            Kembali ke Dashboard
          </Link>
        </div>
      </section>
    );
  }

  const documents = await db.orm.public.Document.all();

  return (
    <div className="mx-auto max-w-7xl pb-20">
      <section className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-amber-400">
            CMS DKKT
          </p>
          <h1 className="mt-2 text-3xl font-black text-white md:text-4xl">
            Dokumen
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-gray-400">
            Kelola dokumen resmi, arsip publik, dan publikasi institusi DKKT.
          </p>
        </div>

        <Link
          href="/admin"
          className="inline-flex items-center justify-center rounded-xl border border-white/10 px-5 py-3 text-sm font-semibold text-gray-300 transition hover:border-amber-400/40 hover:text-amber-300"
        >
          ← Kembali ke Dashboard
        </Link>
      </section>

      <section className="mt-8 grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-[#0b0b0b] p-5">
          <p className="text-xs uppercase tracking-[0.2em] text-gray-600">Total Dokumen</p>
          <p className="mt-2 text-3xl font-black text-white">{documents.length}</p>
          <p className="mt-1 text-sm text-gray-500">Semua file</p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#0b0b0b] p-5">
          <p className="text-xs uppercase tracking-[0.2em] text-gray-600">Publik</p>
          <p className="mt-2 text-3xl font-black text-emerald-300">
            {documents.filter((item) => item.isPublished).length}
          </p>
          <p className="mt-1 text-sm text-gray-500">Tayang di portal</p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#0b0b0b] p-5">
          <p className="text-xs uppercase tracking-[0.2em] text-gray-600">Draft</p>
          <p className="mt-2 text-3xl font-black text-amber-300">
            {documents.filter((item) => !item.isPublished).length}
          </p>
          <p className="mt-1 text-sm text-gray-500">Belum dipublikasi</p>
        </div>
      </section>

      <CmsLibraryManager kind="document" canCreate={canCreate} canUpdate={canUpdate} canDelete={canDelete} />
    </div>
  );
}
