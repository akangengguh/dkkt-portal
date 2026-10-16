"use client";

import { useEffect, useState } from "react";

type ArtistOption = { id: string; registrationNumber: string; name: string };

export default function CommitteeChairSelector({ committeeId, currentArtistId, currentName }: { committeeId: string; currentArtistId: string | null; currentName: string | null }) {
  const [artists, setArtists] = useState<ArtistOption[]>([]);
  const [selected, setSelected] = useState(currentArtistId || "");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let active = true;
    fetch("/api/admin/committees/options", { cache: "no-store" })
      .then((response) => response.json())
      .then((result) => { if (active) setArtists(Array.isArray(result.artists) ? result.artists : []); })
      .catch(() => { if (active) setMessage("Daftar seniman gagal dimuat."); });
    return () => { active = false; };
  }, []);

  async function save() {
    setBusy(true);
    setMessage("");
    try {
      const response = await fetch(`/api/admin/committees/${committeeId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ artistId: selected || null }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Ketua komite gagal disimpan.");
      setMessage(selected ? "Ketua komite berhasil disimpan." : "Ketua komite dihapus.");
      window.location.reload();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Ketua komite gagal disimpan.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mt-5 border-t border-white/10 pt-4">
      <label className="block text-xs font-semibold text-gray-400">Ketua · pilih nomor registrasi</label>
      <div className="mt-2 flex flex-wrap gap-2">
        <select value={selected} onChange={(event) => setSelected(event.target.value)} className="min-w-56 flex-1 rounded-lg border border-white/10 bg-[#111] px-3 py-2 text-sm text-white">
          <option value="">{currentArtistId ? "Belum dipilih" : currentName ? `Data lama: ${currentName}` : "Pilih ketua"}</option>
          {artists.map((artist) => <option key={artist.id} value={artist.id}>{artist.registrationNumber} · {artist.name}</option>)}
        </select>
        <button type="button" disabled={busy || selected === (currentArtistId || "")} onClick={save} className="rounded-lg bg-amber-400 px-3 py-2 text-xs font-bold text-black disabled:opacity-40">{busy ? "Menyimpan..." : "Simpan ketua"}</button>
      </div>
      {message && <p role="status" className="mt-2 text-xs text-emerald-300">{message}</p>}
    </div>
  );
}