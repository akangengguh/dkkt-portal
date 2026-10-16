import Link from "next/link";

import OrganizationForm from "@/components/admin/OrganizationForm";
import { requirePermissionPage } from "@/lib/admin";

type EditOrganisasiPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditOrganisasiPage({
  params,
}: EditOrganisasiPageProps) {
  await requirePermissionPage("organization.update");

  const { id } = await params;

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
          Edit Bagian Organisasi
        </h1>

        <p className="mt-2 text-sm text-gray-400">
          Ubah data bagian dan susunan anggota sesuai kebutuhan.
        </p>
      </div>

      <OrganizationForm id={id} />
    </div>
  );
}
