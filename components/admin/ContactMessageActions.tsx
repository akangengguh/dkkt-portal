"use client";

import { useState } from "react";

type Props = {
  id: string;
  status: string;
};

export default function ContactMessageActions({ id, status }: Props) {
  const [saving, setSaving] = useState(false);

  async function updateStatus(nextStatus: string) {
    setSaving(true);

    try {
      const response = await fetch("/api/admin/contact", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: nextStatus }),
      });

      if (!response.ok) throw new Error("Gagal mengubah status");
      window.location.reload();
    } catch {
      window.alert("Status pesan gagal diubah.");
      setSaving(false);
    }
  }

  return (
    <div className="flex shrink-0 flex-wrap gap-2 lg:max-w-[220px] lg:justify-end">
      {status === "UNREAD" ? (
        <button type="button" disabled={saving} onClick={() => updateStatus("READ")} className="rounded-xl border border-white/10 px-3 py-2 text-xs font-semibold text-gray-300 hover:border-amber-400/30 hover:text-amber-300">
          Tandai Dibaca
        </button>
      ) : null}
      {status !== "REPLIED" ? (
        <button type="button" disabled={saving} onClick={() => updateStatus("REPLIED")} className="rounded-xl bg-emerald-500/10 px-3 py-2 text-xs font-semibold text-emerald-300 hover:bg-emerald-500/20">
          Tandai Dibalas
        </button>
      ) : null}
      {status !== "ARCHIVED" ? (
        <button type="button" disabled={saving} onClick={() => updateStatus("ARCHIVED")} className="rounded-xl border border-white/10 px-3 py-2 text-xs font-semibold text-gray-500 hover:text-white">
          Arsipkan
        </button>
      ) : null}
    </div>
  );
}