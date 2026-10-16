"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function logout() {
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/auth/logout", { method: "POST" });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Logout gagal.");
      router.replace("/");
      router.refresh();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Logout gagal. Silakan coba lagi.");
      setBusy(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setError("");
          setConfirming(true);
        }}
        className="rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-2 text-xs font-semibold text-red-300 transition hover:border-red-400/40 hover:bg-red-500/10"
      >
        Keluar
      </button>

      {confirming && (
        <div className="fixed inset-0 z-200 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <section role="dialog" aria-modal="true" aria-labelledby="logout-title" className="w-full max-w-sm rounded-2xl border border-white/10 bg-[#101010] p-6 shadow-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-red-300">Konfirmasi</p>
            <h2 id="logout-title" className="mt-2 text-xl font-bold text-white">Keluar dari CMS?</h2>
            <p className="mt-2 text-sm leading-6 text-gray-400">Sesi administrasi akan diakhiri dan Anda kembali ke halaman utama Portal DKKT.</p>
            {error && <p role="alert" className="mt-4 rounded-lg border border-red-500/20 bg-red-500/5 px-3 py-2 text-sm text-red-300">{error}</p>}
            <div className="mt-6 flex justify-end gap-3">
              <button type="button" disabled={busy} onClick={() => setConfirming(false)} className="rounded-lg border border-white/10 px-4 py-2.5 text-sm font-semibold text-gray-300 transition hover:border-white/20 hover:text-white disabled:opacity-50">Batal</button>
              <button type="button" disabled={busy} onClick={logout} className="rounded-lg bg-red-500 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-red-400 disabled:cursor-wait disabled:opacity-60">{busy ? "Keluar..." : "Ya, Keluar"}</button>
            </div>
          </section>
        </div>
      )}
    </>
  );
}