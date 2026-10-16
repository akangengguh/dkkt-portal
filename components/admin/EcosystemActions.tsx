"use client";

import Link from "next/link";
import { useState } from "react";

type Props = {
  kind: "artist" | "group";
  id: string;
  status: string;
  canUpdate: boolean;
  canDelete: boolean;
  canVerify: boolean;
};

export default function EcosystemActions({ kind, id, status, canUpdate, canDelete, canVerify }: Props) {
  const [busy, setBusy] = useState(false);
  const route = kind === "artist" ? "seniman" : "kelompok";
  const apiRoute = kind === "artist" ? "artists" : "groups";

  async function verify() {
    if (!window.confirm("Pastikan identitas dan dokumen SK sudah diperiksa. Verifikasi pendaftaran ini?")) return;
    setBusy(true);
    const response = await fetch(`/api/admin/${apiRoute}/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "verify" }),
    });
    const result = await response.json();
    setBusy(false);
    if (!response.ok) {
      window.alert(result.message || "Verifikasi gagal.");
      return;
    }
    window.location.reload();
  }

  async function remove() {
    if (!window.confirm("Hapus data ini? Tindakan ini tidak dapat dibatalkan.")) return;
    setBusy(true);
    const response = await fetch(`/api/admin/${apiRoute}/${id}`, { method: "DELETE" });
    const result = await response.json();
    setBusy(false);
    if (!response.ok) {
      window.alert(result.message || "Data gagal dihapus.");
      return;
    }
    window.location.reload();
  }

  return (
    <div className="flex flex-wrap gap-2">
      {canUpdate && <Link href={`/admin/${route}/${id}/edit`} className="rounded-md border border-white/15 px-3 py-2 text-xs font-semibold text-gray-200">Edit</Link>}
      {status === "PENDING" && canVerify && <button type="button" disabled={busy} onClick={verify} className="rounded-md bg-amber-400 px-3 py-2 text-xs font-bold text-black disabled:opacity-50">{busy ? "Menyimpan..." : "Verifikasi"}</button>}
      {status === "VERIFIED" && canVerify && <Link href={`/admin/${route}/${id}/kartu`} className="rounded-md bg-emerald-400 px-3 py-2 text-xs font-bold text-black">Terbitkan kartu</Link>}
      {status === "ACTIVE" && <Link href={`/admin/${route}/${id}/kartu`} className="rounded-md border border-emerald-400/30 px-3 py-2 text-xs font-semibold text-emerald-300">Buka / cetak kartu</Link>}
      {canDelete && <button type="button" disabled={busy} onClick={remove} className="rounded-md border border-red-400/30 px-3 py-2 text-xs font-semibold text-red-300 disabled:opacity-50">Hapus</button>}
    </div>
  );
}