"use client";

export default function BackupButton() {
  return (
    <a
      href="/api/admin/backup"
      onClick={(event) => {
        if (!window.confirm("Arsip mencakup data database dan file media, termasuk data akun. Simpan file backup ini di lokasi yang aman?")) {
          event.preventDefault();
        }
      }}
      className="inline-flex items-center justify-center rounded-xl border border-amber-400/30 bg-amber-400/5 px-5 py-3 text-sm font-bold text-amber-200 transition hover:border-amber-300/60 hover:bg-amber-400/10"
    >
      Backup Semua Data
    </a>
  );
}