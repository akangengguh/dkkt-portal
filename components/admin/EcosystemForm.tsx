"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Kind = "artist" | "group";
type Props = { kind: Kind; id?: string };
type Committee = { id: string; name: string };
type FormState = Record<string, string | boolean>;

const GROUP_TYPES = [
  "Sanggar",
  "Komunitas",
  "Group",
  "Asosiasi / Himpunan Profesi",
  "Padepokan",
  "Lainnya",
] as const;

function normalizeGroupType(value: unknown) {
  if (typeof value !== "string") return "Sanggar";
  const legacyLabels: Record<string, string> = {
    SANGGAR: "Sanggar",
    KOMUNITAS: "Komunitas",
    GROUP: "Group",
    PADEPOKAN: "Padepokan",
    LAINNYA: "Lainnya",
    "ASOSIASI / HIMPUNAN PROFESI": "Asosiasi / Himpunan Profesi",
  };
  const normalized = legacyLabels[value.trim().toUpperCase()] || value.trim();
  return GROUP_TYPES.includes(normalized as (typeof GROUP_TYPES)[number]) ? normalized : "Lainnya";
}

const INITIAL_FORM: FormState = {
  name: "", slug: "", committeeId: "", registrationStatus: "PENDING",
  discipline: "", biography: "", photo: "", email: "", phone: "", website: "",
  birthPlace: "", birthDate: "", gender: "", address: "", groupType: "Sanggar",
  description: "", leader: "", establishedDate: "", memberCount: "", logo: "",
  isActive: true, isFeatured: false,
};

const statusText: Record<string, string> = {
  PENDING: "Menunggu verifikasi",
  VERIFIED: "Terverifikasi, menunggu penerbitan kartu",
  ACTIVE: "Aktif dan kartu telah diterbitkan",
  REJECTED: "Ditolak",
  EXPIRED: "Kedaluwarsa",
};

function dateInputValue(value: unknown) {
  if (typeof value !== "string" || !value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const part = (type: string) => parts.find((item) => item.type === type)?.value || "";
  return `${part("year")}-${part("month")}-${part("day")}`;
}

function DateInput({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="block text-sm font-semibold text-gray-300">
      {label}
      <input
        type="date"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 block w-full rounded-xl border border-white/10 bg-[#111] px-4 py-3 text-white accent-amber-400 scheme-dark focus:border-amber-400/50 focus:outline-none"
      />
    </label>
  );
}

export default function EcosystemForm({ kind, id }: Props) {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [committees, setCommittees] = useState<Committee[]>([]);
  const [loading, setLoading] = useState(Boolean(id));
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageError, setImageError] = useState("");
  const isArtist = kind === "artist";
  const apiRoute = isArtist ? "artists" : "groups";

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const optionsResponse = await fetch("/api/admin/ecosystem/options", { cache: "no-store" });
        const options = await optionsResponse.json();
        if (!optionsResponse.ok) throw new Error(options.message || "Komite gagal dimuat.");
        if (active) setCommittees(Array.isArray(options.committees) ? options.committees : []);

        if (!id) return;
        const response = await fetch(`/api/admin/${apiRoute}/${id}`, { cache: "no-store" });
        const result = await response.json();
        if (!response.ok) throw new Error(result.message || "Data gagal dimuat.");
        if (!active || !result.data) return;
        const data = result.data;
        const formData = { ...data };
        delete formData.skNumber;
        delete formData.skDate;
        delete formData.skFileUrl;
        setForm({
          ...INITIAL_FORM,
          ...formData,
          groupType: normalizeGroupType(data.groupType),
          birthDate: dateInputValue(data.birthDate),
          establishedDate: dateInputValue(data.establishedDate),
          memberCount: data.memberCount === null || data.memberCount === undefined ? "" : String(data.memberCount),
        });
      } catch (reason) {
        if (active) setError(reason instanceof Error ? reason.message : "Data gagal dimuat.");
      } finally {
        if (active) setLoading(false);
      }
    };
    void load();
    return () => { active = false; };
  }, [apiRoute, id]);

  function update(key: string, value: string | boolean) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function uploadImage(file: File) {
    setImageError("");
    setUploadingImage(true);
    const data = new FormData();
    data.set("file", file);
    data.set("scope", kind);
    data.set("intent", id ? "update" : "create");
    try {
      const response = await fetch("/api/admin/media/upload", { method: "POST", body: data });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Gambar gagal diunggah.");
      update(isArtist ? "photo" : "logo", result.url);
    } catch (reason) {
      setImageError(reason instanceof Error ? reason.message : "Gambar gagal diunggah.");
    } finally {
      setUploadingImage(false);
    }
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    const endpoint = `/api/admin/${apiRoute}${id ? `/${id}` : ""}`;
    try {
      const response = await fetch(endpoint, {
        method: id ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Data gagal disimpan.");
      router.push(`/admin/${isArtist ? "seniman" : "kelompok"}`);
      router.refresh();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Data gagal disimpan.");
      setSaving(false);
    }
  }

  const fields = isArtist
    ? [["discipline", "Bidang seni"], ["biography", "Biografi"], ["address", "Alamat"], ["email", "Email"], ["phone", "Telepon"], ["website", "Website"]]
    : [["groupType", "Jenis kelompok"], ["description", "Deskripsi"], ["leader", "Nama pimpinan"], ["memberCount", "Jumlah anggota"], ["address", "Alamat"], ["email", "Email"], ["phone", "Telepon"], ["website", "Website"]];

  if (loading) return <p className="py-8 text-sm text-gray-400">Memuat data pendaftaran...</p>;

  return (
    <form onSubmit={submit} className="space-y-7 rounded-2xl border border-white/10 bg-[#0b0b0b] p-5 sm:p-7">
      <section className="space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-wide text-amber-300">Data utama</h2>
        <label className="block text-sm font-semibold text-gray-300">Nama<input required value={String(form.name)} onChange={(event) => update("name", event.target.value)} className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white focus:border-amber-400/50 focus:outline-none" /></label>
        <label className="block text-sm font-semibold text-gray-300">Slug<input value={String(form.slug)} onChange={(event) => update("slug", event.target.value)} placeholder="Dibuat otomatis jika kosong" className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white focus:border-amber-400/50 focus:outline-none" /></label>
        <label className="block text-sm font-semibold text-gray-300">Komite<select value={String(form.committeeId)} onChange={(event) => update("committeeId", event.target.value)} className="mt-2 w-full rounded-xl border border-white/10 bg-[#111] px-4 py-3 text-white"><option value="">Umum / belum ditentukan</option>{committees.map((committee) => <option key={committee.id} value={committee.id}>{committee.name}</option>)}</select></label>
        <div>
          <label className="block text-sm font-semibold text-gray-300">{isArtist ? "Foto seniman" : "Logo kelompok / sanggar"}</label>
          <label className="mt-2 flex cursor-pointer items-center justify-center rounded-xl border border-dashed border-white/20 bg-black/20 px-4 py-5 text-sm font-semibold text-gray-200 transition hover:border-amber-400/50 hover:text-amber-200">
            <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={(event) => { const file = event.target.files?.[0]; if (file) void uploadImage(file); event.currentTarget.value = ""; }} className="sr-only" />
            {uploadingImage ? "Mengunggah gambar..." : "Pilih gambar untuk diunggah"}
          </label>
          <p className="mt-2 text-xs text-gray-500">JPG, PNG, WebP, atau GIF. Maksimal 5 MB.</p>
          {imageError && <p role="alert" className="mt-2 text-sm text-red-300">{imageError}</p>}
          {String(form[isArtist ? "photo" : "logo"]) && <div className="mt-3 flex items-center gap-4 rounded-xl border border-white/10 p-3">
            <img src={String(form[isArtist ? "photo" : "logo"])} alt={isArtist ? "Pratinjau foto seniman" : "Pratinjau logo kelompok"} className="h-20 w-20 rounded-lg bg-white/5 object-cover" />
            <div className="min-w-0"><p className="text-sm font-semibold text-emerald-300">Gambar siap disimpan</p><button type="button" onClick={() => update(isArtist ? "photo" : "logo", "")} className="mt-2 text-xs text-red-300 hover:text-red-200">Hapus gambar</button></div>
          </div>}
        </div>
        {isArtist && <>
          <label className="block text-sm font-semibold text-gray-300">Tempat lahir<input value={String(form.birthPlace)} onChange={(event) => update("birthPlace", event.target.value)} className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white focus:border-amber-400/50 focus:outline-none" /></label>
          <DateInput label="Tanggal lahir" value={String(form.birthDate)} onChange={(value) => update("birthDate", value)} />
          <label className="block text-sm font-semibold text-gray-300">Jenis kelamin<select value={String(form.gender)} onChange={(event) => update("gender", event.target.value)} className="mt-2 w-full rounded-xl border border-white/10 bg-[#111] px-4 py-3 text-white"><option value="">Pilih jenis kelamin</option><option value="Laki-laki">Laki-laki</option><option value="Perempuan">Perempuan</option></select></label>
        </>}
        {fields.map(([key, label]) => {
          const isLongText = ["biography", "description", "address"].includes(key);
          const isEmail = key === "email";
          const isUrl = ["website"].includes(key);
          if (key === "groupType") {
            return <label key={key} className="block text-sm font-semibold text-gray-300">{label}<select value={String(form.groupType)} onChange={(event) => update("groupType", event.target.value)} className="mt-2 w-full rounded-xl border border-white/10 bg-[#111] px-4 py-3 text-white">{GROUP_TYPES.map((type) => <option key={type} value={type}>{type}</option>)}</select></label>;
          }
          return <label key={key} className="block text-sm font-semibold text-gray-300">{label}{isLongText
            ? <textarea value={String(form[key])} onChange={(event) => update(key, event.target.value)} rows={4} className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white focus:border-amber-400/50 focus:outline-none" />
            : <input type={isEmail ? "email" : key === "memberCount" ? "number" : "text"} min={key === "memberCount" ? "0" : undefined} placeholder={isUrl ? "Isi - jika tidak memiliki website" : undefined} value={String(form[key])} onChange={(event) => update(key, event.target.value)} className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white focus:border-amber-400/50 focus:outline-none" />}</label>;
        })}
        {!isArtist && <DateInput label="Tanggal berdiri" value={String(form.establishedDate)} onChange={(value) => update("establishedDate", value)} />}
      </section>

      <section className="space-y-3 border-t border-white/10 pt-6">
        <h2 className="text-sm font-bold uppercase tracking-wide text-amber-300">Alur pendaftaran</h2>
        {id ? <div className="rounded-xl border border-amber-400/20 bg-amber-400/5 p-4"><p className="font-semibold text-amber-200">Status: {statusText[String(form.registrationStatus)] || String(form.registrationStatus)}</p><p className="mt-2 text-sm leading-6 text-gray-400">Status tidak diubah dari formulir. Verifikasi dan penerbitan kartu dilakukan melalui tindakan pada daftar pendaftaran.</p></div>
          : <div className="rounded-xl border border-amber-400/20 bg-amber-400/5 p-4"><p className="font-semibold text-amber-200">Pendaftaran baru akan berstatus PENDING</p><p className="mt-2 text-sm leading-6 text-gray-400">Setelah disimpan, admin meninjau identitas dan dokumen SK. Status berubah menjadi VERIFIED setelah pemeriksaan, lalu menjadi ACTIVE saat kartu registrasi diterbitkan.</p></div>}
        <label className="flex items-center gap-3 text-sm text-gray-300"><input type="checkbox" checked={Boolean(form.isActive)} onChange={(event) => update("isActive", event.target.checked)} />Tampilkan profil setelah terverifikasi</label>
        <label className="flex items-center gap-3 text-sm text-gray-300"><input type="checkbox" checked={Boolean(form.isFeatured)} onChange={(event) => update("isFeatured", event.target.checked)} />Tandai sebagai unggulan</label>
      </section>

      {error && <p role="alert" className="text-sm text-red-300">{error}</p>}
      <button type="submit" disabled={saving} className="w-full rounded-xl bg-amber-400 px-5 py-3 font-bold text-black disabled:opacity-50">{saving ? "Menyimpan..." : id ? "Simpan perubahan" : "Simpan pendaftaran"}</button>
    </form>
  );
}