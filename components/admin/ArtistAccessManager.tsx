"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

type ArtistAccess = {
  id: string;
  name: string;
  email: string | null;
  registrationNumber: string;
  account?: {
    userId: string;
    username: string | null;
    status: string;
    roleName: string;
    committeeIds: string[];
  };
};

type Props = {
  artists: ArtistAccess[];
  committees: { id: string; name: string }[];
  roles: { name: string; label: string }[];
};

export default function ArtistAccessManager({ artists, committees, roles }: Props) {
  const router = useRouter();
  const [roleByArtist, setRoleByArtist] = useState<Record<string, string>>(() =>
    Object.fromEntries(artists.map((artist) => [artist.id, artist.account?.roleName || ""])),
  );
  const [committeeIdsByArtist, setCommitteeIdsByArtist] = useState<Record<string, string[]>>(() =>
    Object.fromEntries(artists.map((artist) => [artist.id, artist.account?.committeeIds || []])),
  );
  const [passwordByArtist, setPasswordByArtist] = useState<Record<string, string>>({});
  const [busyArtist, setBusyArtist] = useState<string | null>(null);
  const [messageByArtist, setMessageByArtist] = useState<Record<string, string>>({});
  const [query, setQuery] = useState("");
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [selectedArtistId, setSelectedArtistId] = useState<string | null>(null);
  const normalizedQuery = query.trim().toLocaleLowerCase("id-ID");
  const filteredArtists = artists.filter((artist) =>
    [artist.name, artist.email, artist.registrationNumber, artist.account?.username, artist.account?.roleName]
      .some((value) => String(value || "").toLocaleLowerCase("id-ID").includes(normalizedQuery)),
  );
  const selectedArtist = artists.find((artist) => artist.id === selectedArtistId);

  function toggleCommittee(artistId: string, committeeId: string) {
    setCommitteeIdsByArtist((current) => {
      const selected = new Set(current[artistId] || []);
      if (selected.has(committeeId)) selected.delete(committeeId);
      else selected.add(committeeId);
      return { ...current, [artistId]: [...selected] };
    });
  }

  async function saveAccess(event: FormEvent<HTMLFormElement>, artist: ArtistAccess) {
    event.preventDefault();
    setBusyArtist(artist.id);
    setMessageByArtist((current) => ({ ...current, [artist.id]: "" }));

    try {
      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          artistId: artist.id,
          roleName: roleByArtist[artist.id],
          committeeIds: committeeIdsByArtist[artist.id] || [],
          password: passwordByArtist[artist.id] || undefined,
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Hak akses gagal disimpan.");
      setPasswordByArtist((current) => ({ ...current, [artist.id]: "" }));
      setMessageByArtist((current) => ({ ...current, [artist.id]: result.message }));
      router.refresh();
    } catch (error) {
      setMessageByArtist((current) => ({
        ...current,
        [artist.id]: error instanceof Error ? error.message : "Hak akses gagal disimpan.",
      }));
    } finally {
      setBusyArtist(null);
    }
  }

  async function revokeAccess(artist: ArtistAccess) {
    if (!window.confirm(`Cabut akses CMS untuk ${artist.name}? Akun dan riwayat audit tetap disimpan.`)) return;
    setBusyArtist(artist.id);
    setMessageByArtist((current) => ({ ...current, [artist.id]: "" }));

    try {
      const response = await fetch(`/api/admin/users/${artist.id}`, { method: "DELETE" });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Akses gagal dicabut.");
      setRoleByArtist((current) => ({ ...current, [artist.id]: "" }));
      setCommitteeIdsByArtist((current) => ({ ...current, [artist.id]: [] }));
      setMessageByArtist((current) => ({ ...current, [artist.id]: result.message }));
      router.refresh();
    } catch (error) {
      setMessageByArtist((current) => ({
        ...current,
        [artist.id]: error instanceof Error ? error.message : "Akses gagal dicabut.",
      }));
    } finally {
      setBusyArtist(null);
    }
  }

  return (
    <section className="mt-8 border-y border-white/10">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 py-5">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-amber-400">Akses dari data terverifikasi</p>
          <h2 className="mt-2 text-xl font-black text-white">Seniman & Budayawan</h2>
          <p className="mt-2 text-sm text-gray-400">Akun CMS hanya dapat ditautkan ke profil aktif-terverifikasi.</p>
        </div>
        {!selectedArtist && <button type="button" onClick={() => { setIsPickerOpen((open) => !open); setQuery(""); }} aria-expanded={isPickerOpen} className="rounded-lg bg-amber-500 px-4 py-2.5 text-sm font-bold text-black transition hover:bg-amber-400">
          {isPickerOpen ? "Tutup daftar nama" : "Tambahkan Pengguna"}
        </button>}
      </div>

      {isPickerOpen && !selectedArtist && <div className="py-5">
        {artists.length === 0 ? <p className="text-sm text-gray-500">Belum ada seniman aktif-terverifikasi dengan email terdaftar.</p> : <>
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <label htmlFor="artist-access-search" className="sr-only">Cari seniman terverifikasi</label>
            <input id="artist-access-search" type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Cari nama, nomor registrasi, email" className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2.5 text-sm text-white placeholder:text-gray-600 outline-none transition focus:border-amber-400/50 sm:max-w-sm" />
            <span className="text-xs text-gray-500">{filteredArtists.length} nama</span>
          </div>
          {filteredArtists.length === 0 ? <p className="py-5 text-sm text-gray-500">Tidak ada seniman yang cocok dengan pencarian.</p> : <ul className="divide-y divide-white/10 border-y border-white/10">
            {filteredArtists.map((artist) => <li key={artist.id}>
              <button type="button" onClick={() => setSelectedArtistId(artist.id)} className="grid w-full gap-1 py-4 text-left transition hover:bg-white/3 sm:grid-cols-[1fr_auto] sm:items-center">
                <span className="font-semibold text-white">{artist.name}</span>
                <span className={`text-xs ${artist.account ? "text-emerald-300" : "text-gray-500"}`}>{artist.account ? "Akun CMS tersedia" : "Belum memiliki akun"}</span>
                <span className="text-xs text-gray-500 sm:col-span-2">{artist.email || "Email belum tercatat"} · {artist.registrationNumber}</span>
              </button>
            </li>)}
          </ul>}
        </>}
      </div>}

      {selectedArtist && (() => {
        const artist = selectedArtist;
        const hasAccount = Boolean(artist.account);
        const selectedRole = roleByArtist[artist.id] || "";
        const isCommitteeRole = selectedRole === "KOMITE_EDITOR";

        return <div className="py-5">
          <button type="button" onClick={() => setSelectedArtistId(null)} className="mb-5 text-sm font-semibold text-amber-300 hover:text-amber-200">← Pilih nama lain</button>
          <form onSubmit={(event) => saveAccess(event, artist)} className="grid gap-5 lg:grid-cols-[0.8fr_1.2fr]">
            <div className="min-w-0">
              <p className="font-bold text-white">{artist.name}</p>
              <p className="mt-1 font-mono text-xs text-amber-300">{artist.registrationNumber}</p>
              <p className="mt-2 break-all text-sm text-gray-400">{artist.email || "Email belum tercatat"}</p>
              {hasAccount ? (
                <p className={`mt-2 text-xs ${artist.account?.status === "ACTIVE" ? "text-emerald-300" : "text-amber-300"}`}>
                  Akun {artist.account?.status === "ACTIVE" ? "aktif" : "nonaktif"} · username {artist.account?.username || "belum ditetapkan"}
                </p>
              ) : (
                <p className="mt-2 text-xs text-gray-500">Belum memiliki akun CMS</p>
              )}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label htmlFor={`role-${artist.id}`} className="mb-1 block text-xs font-semibold text-gray-400">Role akses</label>
                <select
                  id={`role-${artist.id}`}
                  required
                  value={selectedRole}
                  onChange={(event) => setRoleByArtist((current) => ({ ...current, [artist.id]: event.target.value }))}
                  className="w-full rounded-lg border border-white/10 bg-[#111] px-3 py-2.5 text-sm text-white"
                >
                  <option value="">Pilih role</option>
                  {roles.map((role) => <option key={role.name} value={role.name}>{role.label}</option>)}
                </select>
              </div>

              {!hasAccount && <div>
                <label htmlFor={`password-${artist.id}`} className="mb-1 block text-xs font-semibold text-gray-400">Sandi awal · minimal 12 karakter</label>
                <input
                  id={`password-${artist.id}`}
                  type="password"
                  required
                  minLength={12}
                  autoComplete="new-password"
                  value={passwordByArtist[artist.id] || ""}
                  onChange={(event) => setPasswordByArtist((current) => ({ ...current, [artist.id]: event.target.value }))}
                  className="w-full rounded-lg border border-white/10 bg-[#111] px-3 py-2.5 text-sm text-white"
                />
              </div>}

              {isCommitteeRole && <fieldset className="md:col-span-2">
                <legend className="mb-2 text-xs font-semibold text-gray-400">Komite yang dapat dikelola</legend>
                <div className="grid gap-2 sm:grid-cols-2">
                  {committees.map((committee) => <label key={committee.id} className="flex items-center gap-2 text-sm text-gray-300">
                    <input
                      type="checkbox"
                      checked={(committeeIdsByArtist[artist.id] || []).includes(committee.id)}
                      onChange={() => toggleCommittee(artist.id, committee.id)}
                      className="h-4 w-4 accent-amber-500"
                    />
                    {committee.name}
                  </label>)}
                </div>
              </fieldset>}

              <div className="flex flex-wrap items-center gap-3 md:col-span-2">
                <button
                  type="submit"
                  disabled={busyArtist === artist.id || !artist.email}
                  className="rounded-lg bg-amber-500 px-4 py-2.5 text-sm font-bold text-black transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {busyArtist === artist.id ? "Menyimpan..." : hasAccount ? "Simpan hak akses" : "Aktifkan akses CMS"}
                </button>
                {hasAccount && artist.account?.status === "ACTIVE" && <button type="button" disabled={busyArtist === artist.id} onClick={() => revokeAccess(artist)} className="rounded-lg border border-red-500/20 px-4 py-2.5 text-sm font-semibold text-red-300 transition hover:bg-red-500/10 disabled:opacity-50">
                  Cabut akses
                </button>}
                {messageByArtist[artist.id] && <p role="status" className="text-xs text-gray-400">{messageByArtist[artist.id]}</p>}
              </div>
            </div>
          </form>
        </div>;
      })()}
    </section>
  );
}