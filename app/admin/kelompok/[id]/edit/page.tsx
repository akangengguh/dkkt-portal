import Link from "next/link";

import EcosystemForm from "@/components/admin/EcosystemForm";
import { requirePermissionPage } from "@/lib/admin";

export default async function EditKelompokPage({ params }: { params: Promise<{ id: string }> }) {
  await requirePermissionPage("group.update");
  const { id } = await params;
  return <div className="mx-auto max-w-3xl pb-20"><div className="mb-8"><Link href="/admin/kelompok" className="text-sm text-gray-500 hover:text-amber-300">← Kembali ke Kelompok</Link><h1 className="mt-4 text-3xl font-black text-white">Edit Kelompok</h1></div><EcosystemForm kind="group" id={id} /></div>;
}
