"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

type OrganizationActionsProps = {
  sectionId: string;
};

export default function OrganizationActions({ sectionId }: OrganizationActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    const confirmed = window.confirm(
      "Apakah Anda yakin ingin menghapus bagian organisasi ini?",
    );

    if (!confirmed) {
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`/api/admin/organization/${sectionId}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Gagal menghapus bagian organisasi.");
      }

      router.refresh();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Gagal menghapus bagian organisasi.";
      window.alert(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Link
        href={`/admin/organisasi/${sectionId}/edit`}
        className="rounded-lg border border-white/10 bg-white/3 px-3 py-2 text-xs font-semibold text-gray-200 transition hover:border-amber-400/30 hover:text-amber-300"
      >
        Edit
      </Link>

      <button
        type="button"
        onClick={handleDelete}
        disabled={loading}
        className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs font-semibold text-red-300 transition hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? "Menghapus..." : "Hapus"}
      </button>
    </div>
  );
}
