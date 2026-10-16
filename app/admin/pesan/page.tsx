import Link from "next/link";

import { requireAdmin } from "@/lib/admin";
import { db } from "@/lib/db";
import { hasPermission } from "@/lib/permissions";

import ContactMessageActions from "@/components/admin/ContactMessageActions";
import AdminListSearch from "@/components/admin/AdminListSearch";
import { matchesSearch } from "@/lib/search";

type SearchParams = {
  status?: string;
  q?: string;
};

function formatDate(value: unknown) {
  return new Date(String(value)).toLocaleString("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default async function AdminPesanPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const session = await requireAdmin();
  const canView = await hasPermission({ userId: session.userId, permission: "contact.view" });

  if (!canView) {
    return (
      <section className="mx-auto max-w-4xl rounded-3xl border border-red-500/20 bg-red-500/5 p-8">
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-red-400">Akses Ditolak</p>
        <h1 className="mt-3 text-2xl font-black text-white">Anda tidak mempunyai akses ke pesan kontak.</h1>
        <Link href="/admin" className="mt-6 inline-flex rounded-xl bg-amber-500 px-5 py-3 text-sm font-bold text-black">Kembali ke Dashboard</Link>
      </section>
    );
  }

  const params = await searchParams;
  const status = ["UNREAD", "READ", "REPLIED", "ARCHIVED"].includes(params.status || "") ? params.status : "ALL";
  const query = typeof params.q === "string" ? params.q.trim() : "";
  const [messages, canUpdate] = await Promise.all([
    db.orm.public.ContactMessage.all(),
    hasPermission({ userId: session.userId, permission: "contact.update" }),
  ]);

  const filteredMessages = messages
    .filter((item) => status === "ALL" || item.status === status)
    .filter((item) => matchesSearch(query, [item.subject, item.name, item.email, item.phone, item.message, item.status]))
    .sort((a, b) => new Date(String(b.createdAt)).getTime() - new Date(String(a.createdAt)).getTime());

  const unreadCount = messages.filter((item) => item.status === "UNREAD").length;
  const repliedCount = messages.filter((item) => item.status === "REPLIED").length;

  return (
    <div className="mx-auto max-w-7xl pb-20">
      <section className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-amber-400">CMS DKKT</p>
          <h1 className="mt-2 text-3xl font-black text-white md:text-4xl">Pesan Kontak</h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-gray-400">Kelola pertanyaan, undangan, dan komunikasi yang dikirim melalui portal publik.</p>
        </div>
        <Link href="/admin" className="inline-flex items-center justify-center rounded-xl border border-white/10 px-5 py-3 text-sm font-semibold text-gray-300 hover:border-amber-400/40 hover:text-amber-300">Kembali ke Dashboard</Link>
      </section>

      <section className="mt-8 grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-[#0b0b0b] p-5"><p className="text-xs uppercase tracking-[0.2em] text-gray-600">Total</p><p className="mt-2 text-3xl font-black text-white">{messages.length}</p><p className="mt-1 text-sm text-gray-500">Semua pesan</p></div>
        <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-5"><p className="text-xs uppercase tracking-[0.2em] text-amber-400">Belum Dibaca</p><p className="mt-2 text-3xl font-black text-amber-300">{unreadCount}</p><p className="mt-1 text-sm text-gray-500">Perlu ditinjau</p></div>
        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-5"><p className="text-xs uppercase tracking-[0.2em] text-emerald-400">Sudah Dibalas</p><p className="mt-2 text-3xl font-black text-emerald-300">{repliedCount}</p><p className="mt-1 text-sm text-gray-500">Komunikasi selesai</p></div>
      </section>

      <section className="mt-8 overflow-hidden rounded-3xl border border-white/10 bg-[#0b0b0b]">
        <div className="flex flex-col gap-4 border-b border-white/10 px-6 py-5 md:flex-row md:items-center md:justify-between">
          <div><h2 className="text-lg font-black text-white">Inbox Komunikasi</h2><p className="mt-1 text-sm text-gray-500">Pesan terbaru tampil lebih dahulu.</p></div>
          <div className="flex flex-wrap items-center gap-3">
          <AdminListSearch query={query} clearHref={status === "ALL" ? "/admin/pesan" : `/admin/pesan?status=${status}`} placeholder="Cari nama, email, subjek, isi pesan" resultCount={filteredMessages.length} />
          <form method="GET" className="flex items-center gap-2">
            {query && <input type="hidden" name="q" value={query} />}
            <label htmlFor="status" className="sr-only">Status</label>
            <select id="status" name="status" defaultValue={status} className="rounded-xl border border-white/10 bg-[#111] px-3 py-2 text-sm text-white">
              <option value="ALL">Semua status</option><option value="UNREAD">Belum dibaca</option><option value="READ">Sudah dibaca</option><option value="REPLIED">Sudah dibalas</option><option value="ARCHIVED">Arsip</option>
            </select>
            <button type="submit" className="rounded-xl bg-amber-500 px-4 py-2 text-sm font-bold text-black">Filter</button>
          </form>
          </div>
        </div>

        {filteredMessages.length === 0 ? (
          <div className="px-6 py-16 text-center text-gray-500">Belum ada pesan pada filter ini.</div>
        ) : (
          <div className="divide-y divide-white/10">
            {filteredMessages.map((item) => (
              <article key={item.id} className="px-6 py-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-3"><h3 className="text-lg font-bold text-white">{item.subject}</h3><span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${item.status === "UNREAD" ? "border-amber-500/20 bg-amber-500/5 text-amber-300" : item.status === "REPLIED" ? "border-emerald-500/20 bg-emerald-500/5 text-emerald-300" : "border-white/10 bg-white/3 text-gray-400"}`}>{item.status}</span></div>
                    <p className="mt-2 text-sm text-gray-300">{item.name} <span className="text-gray-600">·</span> {item.email}{item.phone ? ` · ${item.phone}` : ""}</p>
                    <p className="mt-1 text-xs text-gray-600">{formatDate(item.createdAt)}</p>
                    <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-gray-400">{item.message}</p>
                  </div>
                  {canUpdate ? <ContactMessageActions id={item.id} status={item.status} /> : null}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}