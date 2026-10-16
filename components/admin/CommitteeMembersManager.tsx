"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

type CommitteeMember = {
  id: string;
  name: string;
  position: string;
  photo: string | null;
  biography: string | null;
  sortOrder: number;
  isActive: boolean;
};

type Props = {
  committeeId: string;
  initialMembers: CommitteeMember[];
  canManage: boolean;
};

export default function CommitteeMembersManager({ committeeId, initialMembers, canManage }: Props) {
  const router = useRouter();
  const [members, setMembers] = useState(initialMembers);
  const [newName, setNewName] = useState("");
  const [newPosition, setNewPosition] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const endpoint = `/api/admin/committees/${committeeId}/members`;

  async function saveMember(event: FormEvent<HTMLFormElement>, member?: CommitteeMember) {
    event.preventDefault();
    setBusy(true);
    setError("");

    try {
      const response = await fetch(member ? `${endpoint}/${member.id}` : endpoint, {
        method: member ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(member ? member : {
          name: newName,
          position: newPosition,
          sortOrder: members.length,
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Data anggota gagal disimpan.");

      if (member) {
        setMembers((current) => current.map((item) => item.id === member.id ? result.data : item));
      } else {
        setMembers((current) => [...current, result.data]);
        setNewName("");
        setNewPosition("");
      }
      router.refresh();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Data anggota gagal disimpan.");
    } finally {
      setBusy(false);
    }
  }

  async function deleteMember(memberId: string) {
    if (!window.confirm("Hapus anggota dari komite ini?")) return;
    setBusy(true);
    setError("");

    try {
      const response = await fetch(`${endpoint}/${memberId}`, { method: "DELETE" });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Anggota gagal dihapus.");
      setMembers((current) => current.filter((member) => member.id !== memberId));
      router.refresh();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Anggota gagal dihapus.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="mt-5 border-t border-white/10 pt-4">
      <h3 className="text-sm font-bold text-white">Anggota Komite</h3>
      {members.length === 0 ? (
        <p className="py-3 text-xs text-gray-500">Belum ada anggota komite.</p>
      ) : (
        <div className="mt-2 divide-y divide-white/5">
          {members.map((member) => (
            <form key={member.id} onSubmit={(event) => saveMember(event, member)} className="grid gap-2 py-3 sm:grid-cols-[1fr_1fr_auto] sm:items-center">
              {canManage ? (
                <>
                  <input
                    aria-label="Nama anggota"
                    required
                    value={member.name}
                    onChange={(event) => setMembers((current) => current.map((item) => item.id === member.id ? { ...item, name: event.target.value } : item))}
                    className="min-w-0 rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white"
                  />
                  <input
                    aria-label="Jabatan anggota"
                    required
                    value={member.position}
                    onChange={(event) => setMembers((current) => current.map((item) => item.id === member.id ? { ...item, position: event.target.value } : item))}
                    className="min-w-0 rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white"
                  />
                  <div className="flex gap-2">
                    <button type="submit" disabled={busy} className="rounded-lg border border-white/10 px-3 py-2 text-xs font-semibold text-gray-300 hover:border-amber-400/30 hover:text-amber-300 disabled:opacity-50">Simpan</button>
                    <button type="button" disabled={busy} onClick={() => deleteMember(member.id)} className="rounded-lg border border-red-500/20 px-3 py-2 text-xs font-semibold text-red-300 hover:bg-red-500/10 disabled:opacity-50">Hapus</button>
                  </div>
                </>
              ) : (
                <>
                  <p className="text-sm font-semibold text-gray-200">{member.name}</p>
                  <p className="text-sm text-amber-300">{member.position}</p>
                  <span className={`text-xs ${member.isActive ? "text-emerald-300" : "text-gray-500"}`}>{member.isActive ? "Aktif" : "Nonaktif"}</span>
                </>
              )}
            </form>
          ))}
        </div>
      )}

      {canManage && (
        <form onSubmit={(event) => saveMember(event)} className="mt-3 grid gap-2 border-t border-white/10 pt-4 sm:grid-cols-[1fr_1fr_auto]">
          <input required value={newName} onChange={(event) => setNewName(event.target.value)} placeholder="Nama anggota" className="min-w-0 rounded-lg border border-white/10 bg-black/30 px-3 py-2.5 text-sm text-white placeholder:text-gray-600" />
          <input required value={newPosition} onChange={(event) => setNewPosition(event.target.value)} placeholder="Jabatan" className="min-w-0 rounded-lg border border-white/10 bg-black/30 px-3 py-2.5 text-sm text-white placeholder:text-gray-600" />
          <button type="submit" disabled={busy} className="rounded-lg bg-amber-500 px-4 py-2.5 text-sm font-bold text-black hover:bg-amber-400 disabled:opacity-50">Tambah</button>
        </form>
      )}
      {error && <p role="alert" className="mt-3 text-xs text-red-300">{error}</p>}
    </section>
  );
}