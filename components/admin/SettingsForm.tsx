"use client";

import { useState } from "react";

type Setting = {
  id: string;
  key: string;
  value: string;
  description?: string | null;
};

export default function SettingsForm({
  initialSettings,
  canUpdate,
}: {
  initialSettings: Setting[];
  canUpdate: boolean;
}) {
  const [settings, setSettings] = useState(initialSettings);
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [savingKey, setSavingKey] = useState<string | null>(null);

  const updateValue = (id: string, value: string) => {
    setSettings((current) =>
      current.map((item) =>
        item.id === id ? { ...item, value } : item,
      ),
    );
  };

  const handleSave = async (setting: Setting) => {
    if (!canUpdate) {
      setStatus({ type: "error", message: "Anda tidak memiliki izin untuk mengubah pengaturan." });
      return;
    }

    setSavingKey(setting.id);
    setStatus(null);

    try {
      const response = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: setting.id,
          key: setting.key,
          value: setting.value,
          description: setting.description ?? "",
        }),
      });

      const payload = await response.json();

      if (!response.ok || !payload.success) {
        throw new Error(payload.message || "Gagal menyimpan pengaturan.");
      }

      setStatus({
        type: "success",
        message: `Pengaturan "${setting.key}" berhasil disimpan.`,
      });
    } catch (error) {
      setStatus({
        type: "error",
        message: error instanceof Error ? error.message : "Gagal menyimpan pengaturan.",
      });
    } finally {
      setSavingKey(null);
    }
  };

  if (!settings.length) {
    return (
      <div className="px-6 py-16 text-center text-gray-500">
        Belum ada pengaturan yang dibuat.
      </div>
    );
  }

  return (
    <div className="space-y-4 p-6">
      {status && (
        <div
          className={`rounded-xl border px-4 py-3 text-sm ${
            status.type === "success"
              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-200"
              : "border-red-500/30 bg-red-500/10 text-red-200"
          }`}
        >
          {status.message}
        </div>
      )}

      {settings.map((setting) => (
        <div
          key={setting.id}
          className="rounded-2xl border border-white/10 bg-[#0d0d0d] p-5"
        >
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-white">{setting.key}</p>
              <p className="mt-1 text-sm text-gray-500">
                {setting.description || "Tanpa deskripsi"}
              </p>
            </div>

            {canUpdate && (
              <button
                type="button"
                onClick={() => handleSave(setting)}
                disabled={savingKey === setting.id}
                className="inline-flex items-center justify-center rounded-xl bg-amber-500 px-4 py-2 text-sm font-bold text-black transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {savingKey === setting.id ? "Menyimpan..." : "Simpan"}
              </button>
            )}
          </div>

          <label className="mt-4 block text-xs font-semibold uppercase tracking-[0.22em] text-gray-500">
            Nilai
          </label>
          <textarea
            value={setting.value}
            onChange={(event) => updateValue(setting.id, event.target.value)}
            disabled={!canUpdate}
            rows={4}
            className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none transition focus:border-amber-400/50 disabled:cursor-not-allowed disabled:text-gray-500"
          />
        </div>
      ))}
    </div>
  );
}
