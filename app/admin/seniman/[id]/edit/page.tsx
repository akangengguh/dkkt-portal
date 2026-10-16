import Link from "next/link";

import EcosystemForm from "@/components/admin/EcosystemForm";
import { requirePermissionPage } from "@/lib/admin";

export default async function EditSenimanPage({ params }: { params: Promise<{ id: string }> }) {
  await requirePermissionPage("artist.update");
  const { id } = await params;
  return <div className="mx-auto max-w-3xl pb-20"><div className="mb-8"><Link href="/admin/seniman" className="text-sm text-gray-500 hover:text-amber-300">← Kembali ke Seniman</Link><h1 className="mt-4 text-3xl font-black text-white">Edit Seniman</h1></div><EcosystemForm kind="artist" id={id} /></div>;
}
