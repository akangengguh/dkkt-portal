import Link from "next/link";

import OrganizationForm from "@/components/admin/OrganizationForm";
import { requirePermissionPage } from "@/lib/admin";

export default async function TambahOrganisasiPage() {
  await requirePermissionPage("organization.create");

  return (
    <div className="mx-auto max-w-5xl pb-20">
      <div className="mb-8">
        <Link
          href="/admin/organisasi"
          className="text-sm text-gray-500 hover:text-amber-300"
        >
          ← Kembali ke Organisasi
        </Link>

        <h1 className="mt-4 text-3xl font-black text-white">
          Tambah Bagian Organisasi
        </h1>

        <p className="mt-2 text-sm text-gray-400">
          Tambahkan bagian baru dan atur anggota yang terlibat dalam struktur DKKT.
        </p>
      </div>

      <OrganizationForm />
    </div>
  );
}
