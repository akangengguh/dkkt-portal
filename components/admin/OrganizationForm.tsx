"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type MemberDraft = {
  id?: string;
  artistId: string;
  name: string;
  position: string;
  photo: string;
  biography: string;
  sortOrder: number;
  isActive: boolean;
};

type OrganizationFormProps = {
  id?: string;
};

type ArtistOption = {
  id: string;
  registrationNumber: string;
  name: string;
  photo: string | null;
  discipline: string | null;
};

type OrganizationSectionData = {
  name?: string;
  slug?: string;
  description?: string | null;
  sortOrder?: number;
  isActive?: boolean;
  members?: MemberDraft[];
};

export default function OrganizationForm({ id }: OrganizationFormProps) {
  const router = useRouter();

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [sortOrder, setSortOrder] = useState(0);
  const [isActive, setIsActive] = useState(true);
  const [members, setMembers] = useState<MemberDraft[]>([
    {
      artistId: "",
      name: "",
      position: "",
      photo: "",
      biography: "",
      sortOrder: 0,
      isActive: true,
    },
  ]);
  const [artists, setArtists] = useState<ArtistOption[]>([]);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/admin/organization/options", { cache: "no-store" })
      .then((response) => response.json())
      .then((result) => setArtists(Array.isArray(result.artists) ? result.artists : []))
      .catch(() => setError("Daftar seniman gagal dimuat."));

    if (!id) {
      return;
    }

    fetch(`/api/admin/organization/${id}`)
      .then((response) => response.json())
      .then((result: { data?: OrganizationSectionData }) => {
        if (!result.data) {
          return;
        }

        setName(result.data.name || "");
        setSlug(result.data.slug || "");
        setDescription(result.data.description || "");
        setSortOrder(Number(result.data.sortOrder || 0));
        setIsActive(result.data.isActive !== false);

        const loadedMembers = Array.isArray(result.data.members)
          ? result.data.members.map((member) => ({
              id: member.id,
              artistId: member.artistId || "",
              name: member.name || "",
              position: member.position || "",
              photo: member.photo || "",
              biography: member.biography || "",
              sortOrder: Number(member.sortOrder || 0),
              isActive: member.isActive !== false,
            }))
          : [];

        setMembers(
          loadedMembers.length > 0
            ? loadedMembers
            : [
                {
                  artistId: "",
                  name: "",
                  position: "",
                  photo: "",
                  biography: "",
                  sortOrder: 0,
                  isActive: true,
                },
              ],
        );
      })
      .catch(() => {
        setError("Data struktur organisasi gagal dimuat.");
      });
  }, [id]);

  function updateMember(
    index: number,
    field: keyof MemberDraft,
    value: string | number | boolean,
  ) {
    setMembers((current) =>
      current.map((member, memberIndex) =>
        memberIndex === index
          ? {
              ...member,
              [field]: value,
            }
          : member,
      ),
    );
  }

  function addMember() {
    setMembers((current) => [
      ...current,
      {
        artistId: "",
        name: "",
        position: "",
        photo: "",
        biography: "",
        sortOrder: current.length,
        isActive: true,
      },
    ]);
  }

  function removeMember(index: number) {
    setMembers((current) => {
      if (current.length === 1) {
        return [
          {
            artistId: "",
            name: "",
            position: "",
            photo: "",
            biography: "",
            sortOrder: 0,
            isActive: true,
          },
        ];
      }

      return current.filter((_, memberIndex) => memberIndex !== index);
    });
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");

    try {
      const payload = {
        name,
        slug,
        description,
        sortOrder,
        isActive,
        members: members
          .filter((member) => member.artistId || (member.id && member.name.trim()))
          .map((member) => ({
            id: member.id,
            artistId: member.artistId || null,
            name: member.name.trim(),
            position: member.position.trim(),
            photo: member.photo.trim(),
            biography: member.biography.trim(),
            sortOrder: Number(member.sortOrder || 0),
            isActive: member.isActive !== false,
          })),
      };

      const response = await fetch(
        id ? `/api/admin/organization/${id}` : "/api/admin/organization",
        {
          method: id ? "PATCH" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        },
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Gagal menyimpan struktur organisasi.");
      }

      router.push("/admin/organisasi");
      router.refresh();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Gagal menyimpan struktur organisasi.";
      setError(message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form
      onSubmit={submit}
      className="space-y-6 rounded-3xl border border-white/10 bg-[#0b0b0b] p-6"
    >
      <div className="grid gap-5 lg:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-semibold text-gray-300">
            Nama bagian
          </label>
          <input
            required
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none transition focus:border-amber-400/50"
            placeholder="Misal: Pembina"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-gray-300">
            Slug
          </label>
          <input
            value={slug}
            onChange={(event) => setSlug(event.target.value)}
            className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none transition focus:border-amber-400/50"
            placeholder="diisi otomatis jika kosong"
          />
        </div>
      </div>

      <div>
        <label className="mb-2 block text-sm font-semibold text-gray-300">
          Deskripsi
        </label>
        <textarea
          rows={4}
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none transition focus:border-amber-400/50"
          placeholder="Jelaskan tugas dan fungsi bagian ini..."
        />
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-semibold text-gray-300">
            Urutan
          </label>
          <input
            type="number"
            value={sortOrder}
            onChange={(event) => setSortOrder(Number(event.target.value || 0))}
            className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none transition focus:border-amber-400/50"
          />
        </div>

        <div className="flex items-end">
          <label className="flex w-full items-center justify-between rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-gray-200">
            <span>Status aktif</span>
            <input
              type="checkbox"
              checked={isActive}
              onChange={(event) => setIsActive(event.target.checked)}
              className="h-4 w-4 accent-amber-500"
            />
          </label>
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-bold text-white">Anggota</h3>
            <p className="text-sm text-gray-400">
              Tambahkan anggota yang termasuk dalam bagian ini.
            </p>
          </div>

          <button
            type="button"
            onClick={addMember}
            className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm font-semibold text-amber-300"
          >
            + Tambah anggota
          </button>
        </div>

        <div className="space-y-4">
          {members.map((member, index) => (
            <div
              key={`${member.name || "member"}-${index}`}
              className="rounded-2xl border border-white/10 bg-[#111111] p-4"
            >
              <div className="mb-3 flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-gray-200">
                  Anggota {index + 1}
                </p>

                {members.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeMember(index)}
                    className="text-xs font-semibold text-red-300 hover:text-red-200"
                  >
                    Hapus
                  </button>
                )}
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs uppercase tracking-[0.2em] text-gray-500">Seniman terdaftar · NTA / nomor registrasi</label>
                  <select
                    value={member.artistId}
                    onChange={(event) => {
                      const artist = artists.find((item) => item.id === event.target.value);
                      updateMember(index, "artistId", event.target.value);
                      updateMember(index, "name", artist?.name || "");
                      updateMember(index, "photo", artist?.photo || "");
                      updateMember(index, "biography", artist?.discipline || "");
                    }}
                    required={!member.id || Boolean(member.artistId)}
                    className="w-full rounded-xl border border-white/10 bg-[#111] px-3 py-2.5 text-white outline-none transition focus:border-amber-400/50"
                  >
                    <option value="">{member.id && member.name ? `Data lama: ${member.name} (belum terhubung)` : "Pilih seniman terverifikasi"}</option>
                    {artists.map((artist) => <option key={artist.id} value={artist.id}>{artist.registrationNumber} · {artist.name}</option>)}
                  </select>
                  {member.artistId && <div className="mt-3 flex items-center gap-3 rounded-xl border border-white/10 p-3">{member.photo ? <img src={member.photo} alt={member.name} className="h-12 w-12 rounded-lg object-cover" /> : <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-amber-500/10 font-bold text-amber-300">{member.name.slice(0, 1)}</div>}<div><p className="text-sm font-semibold text-emerald-300">{member.name}</p><p className="mt-1 text-xs text-gray-500">{artists.find((artist) => artist.id === member.artistId)?.registrationNumber}</p></div></div>}
                  {!member.artistId && member.id && member.name && <p className="mt-2 text-xs text-amber-300">Anggota lama masih menyimpan nama manual. Pilih seniman untuk menghubungkan ke database.</p>}
                </div>

                <div>
                  <label className="mb-1 block text-xs uppercase tracking-[0.2em] text-gray-500">
                    Jabatan
                  </label>
                  <input
                    value={member.position}
                    onChange={(event) =>
                      updateMember(index, "position", event.target.value)
                    }
                    className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 text-white outline-none transition focus:border-amber-400/50"
                    placeholder="Jabatan / peran"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs uppercase tracking-[0.2em] text-gray-500">
                    Urutan
                  </label>
                  <input
                    type="number"
                    value={member.sortOrder}
                    onChange={(event) =>
                      updateMember(index, "sortOrder", Number(event.target.value || 0))
                    }
                    className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 text-white outline-none transition focus:border-amber-400/50"
                  />
                </div>
              </div>

              <div className="mt-4">
                <label className="mb-1 block text-xs uppercase tracking-[0.2em] text-gray-500">
                  Biografi
                </label>
                <textarea
                  rows={3}
                  value={member.biography}
                  onChange={(event) =>
                    updateMember(index, "biography", event.target.value)
                  }
                  className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 text-white outline-none transition focus:border-amber-400/50"
                  placeholder="Deskripsi singkat tentang anggota..."
                />
              </div>

              <div className="mt-3 flex items-center justify-between rounded-xl border border-white/10 bg-black/20 px-3 py-2">
                <span className="text-sm text-gray-300">Aktif</span>
                <input
                  type="checkbox"
                  checked={member.isActive}
                  onChange={(event) =>
                    updateMember(index, "isActive", event.target.checked)
                  }
                  className="h-4 w-4 accent-amber-500"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {error && (
        <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      <div className="flex flex-wrap items-center justify-end gap-3">
        <button
          type="button"
          onClick={() => router.push("/admin/organisasi")}
          className="rounded-xl border border-white/10 px-4 py-2.5 text-sm font-semibold text-gray-300"
        >
          Batal
        </button>

        <button
          type="submit"
          disabled={saving}
          className="rounded-xl bg-amber-500 px-5 py-2.5 text-sm font-bold text-black disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? "Menyimpan..." : id ? "Simpan perubahan" : "Simpan struktur"}
        </button>
      </div>
    </form>
  );
}
