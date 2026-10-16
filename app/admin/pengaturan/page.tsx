import Link from "next/link";

import SettingsForm from "@/components/admin/SettingsForm";
import { requireAdmin } from "@/lib/admin";
import { db } from "@/lib/db";
import { hasPermission } from "@/lib/permissions";

export default async function AdminPengaturanPage() {
  const session = await requireAdmin();
  const canView = await hasPermission({ userId: session.userId, permission: "settings.view" });

  if (!canView) {
    return <section className="rounded-3xl border border-red-500/20 bg-red-500/5 p-8"><p className="text-xs font-bold uppercase tracking-[0.3em] text-red-400">Akses Ditolak</p><h1 className="mt-3 text-2xl font-black text-white">Anda tidak mempunyai akses ke pengaturan.</h1><Link href="/admin" className="mt-6 inline-flex rounded-xl bg-amber-500 px-5 py-3 text-sm font-bold text-black">Kembali ke Dashboard</Link></section>;
  }

  const settings = await db.orm.public.SiteSetting.all();
  const canUpdate = await hasPermission({ userId: session.userId, permission: "settings.update" });

  return (
    <div className="mx-auto max-w-5xl pb-20">
      <section className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between"><div><p className="text-xs font-bold uppercase tracking-[0.3em] text-amber-400">CMS DKKT</p><h1 className="mt-2 text-3xl font-black text-white md:text-4xl">Pengaturan</h1><p className="mt-3 max-w-2xl text-sm leading-7 text-gray-400">Konfigurasi dasar portal yang tersimpan sebagai Site Setting. Ubah nilai yang dibutuhkan untuk operasional website.</p></div><Link href="/admin" className="inline-flex items-center justify-center rounded-xl border border-white/10 px-5 py-3 text-sm font-semibold text-gray-300 hover:border-amber-400/40 hover:text-amber-300">Kembali ke Dashboard</Link></section>
      <section className="mt-8 overflow-hidden rounded-3xl border border-white/10 bg-[#0b0b0b]">
        <div className="border-b border-white/10 px-6 py-5">
          <h2 className="text-lg font-black text-white">Site Settings</h2>
          <p className="mt-1 text-sm text-gray-500">{settings.length} konfigurasi terdaftar.</p>
        </div>
        <SettingsForm initialSettings={settings} canUpdate={canUpdate} />
      </section>
    </div>
  );
}