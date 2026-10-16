import Link from "next/link";

import EcosystemForm from "@/components/admin/EcosystemForm";
import { requirePermissionPage } from "@/lib/admin";

export default async function TambahSenimanPage() {
  await requirePermissionPage("artist.create");

  return <div className="mx-auto max-w-3xl pb-20"><div className="mb-8"><Link href="/admin/seniman" className="text-sm text-gray-500 hover:text-amber-300">← Kembali ke Seniman</Link><h1 className="mt-4 text-3xl font-black text-white">Tambah Seniman</h1><p className="mt-2 text-sm text-gray-400">Tambahkan profil seniman atau budayawan ke database portal.</p></div><EcosystemForm kind="artist" /></div>;
}
