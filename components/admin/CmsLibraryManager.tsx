"use client";

import { FormEvent, useEffect, useState } from "react";

type Props = {
  kind: "gallery" | "document";
  canCreate: boolean;
  canUpdate: boolean;
  canDelete: boolean;
};

type GalleryItem = {
  id: string;
  title: string;
  type: string;
  albumId: string;
  committeeId: string | null;
  description: string | null;
  fileUrl: string | null;
  externalUrl: string | null;
  mimeType: string | null;
  sortOrder: number;
  isActive: boolean;
};

type DocumentItem = {
  id: string;
  title: string;
  documentNumber: string | null;
  documentType: string | null;
  description: string | null;
  fileUrl: string;
  fileName: string | null;
  mimeType: string | null;
  fileSize: number | null;
  sortOrder: number;
  isPublished: boolean;
};

type Album = { id: string; title: string };
type Committee = { id: string; name: string };
type FormState = {
  title: string;
  type: string;
  albumId: string;
  albumTitle: string;
  committeeId: string;
  description: string;
  fileUrl: string;
  externalUrl: string;
  fileName: string;
  mimeType: string;
  fileSize: string;
  documentNumber: string;
  documentType: string;
  sortOrder: string;
  active: boolean;
};

const EMPTY_FORM: FormState = {
  title: "",
  type: "PHOTO",
  albumId: "",
  albumTitle: "",
  committeeId: "",
  description: "",
  fileUrl: "",
  externalUrl: "",
  fileName: "",
  mimeType: "",
  fileSize: "",
  documentNumber: "",
  documentType: "",
  sortOrder: "0",
  active: false,
};

function emptyForm(kind: Props["kind"]): FormState {
  return { ...EMPTY_FORM, active: kind === "gallery" };
}

function isYouTubeVideoUrl(value: string) {
  try {
    const url = new URL(value);
    const host = url.hostname.toLowerCase().replace(/^www\./, "");
    const pathParts = url.pathname.split("/").filter(Boolean);
    const videoId = host === "youtu.be"
      ? pathParts[0]
      : url.searchParams.get("v") || (pathParts[0] && ["embed", "live", "shorts"].includes(pathParts[0]) ? pathParts[1] : "");
    return ["youtube.com", "m.youtube.com", "youtu.be"].includes(host) && /^[\w-]{11}$/.test(videoId || "");
  } catch {
    return false;
  }
}

export default function CmsLibraryManager({ kind, canCreate, canUpdate, canDelete }: Props) {
  const apiPath = kind === "document" ? "documents" : kind;
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [committees, setCommittees] = useState<Committee[]>([]);
  const [form, setForm] = useState(() => emptyForm(kind));
  const [editingId, setEditingId] = useState("");
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [query, setQuery] = useState("");

  async function load() {
    const response = await fetch(`/api/admin/${apiPath}`, { cache: "no-store" });
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || "Data gagal dimuat.");
    if (kind === "gallery") {
      setGalleryItems(Array.isArray(result.data) ? result.data : []);
      setAlbums(Array.isArray(result.albums) ? result.albums : []);
      setCommittees(Array.isArray(result.committees) ? result.committees : []);
    } else {
      setDocuments(Array.isArray(result.data) ? result.data : []);
    }
  }

  useEffect(() => {
    let active = true;
    const timer = window.setTimeout(() => {
      fetch(`/api/admin/${apiPath}`, { cache: "no-store" })
        .then(async (response) => {
          const result = await response.json();
          if (!response.ok) throw new Error(result.message || "Data gagal dimuat.");
          if (!active) return;
          if (kind === "gallery") {
            setGalleryItems(Array.isArray(result.data) ? result.data : []);
            setAlbums(Array.isArray(result.albums) ? result.albums : []);
            setCommittees(Array.isArray(result.committees) ? result.committees : []);
          } else {
            setDocuments(Array.isArray(result.data) ? result.data : []);
          }
        })
        .catch((reason: unknown) => {
          if (active) setError(reason instanceof Error ? reason.message : "Data gagal dimuat.");
        });
    }, 0);
    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [apiPath, kind]);

  function update(key: keyof FormState, value: string | boolean) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function changeGalleryType(type: string) {
    setForm((current) => ({ ...current, type, fileUrl: "", externalUrl: "", fileName: "", mimeType: "" }));
    setUploadFile(null);
    setError("");
    setNotice("");
  }

  function editGallery(item: GalleryItem) {
    setEditingId(item.id);
    setForm({ ...EMPTY_FORM, title: item.title, type: item.type, albumId: item.albumId, committeeId: item.committeeId || "", description: item.description || "", fileUrl: item.fileUrl || "", externalUrl: item.externalUrl || "", mimeType: item.mimeType || "", sortOrder: String(item.sortOrder), active: item.isActive });
    setUploadFile(null);
    setError("");
    setNotice("");
  }

  function editDocument(item: DocumentItem) {
    setEditingId(item.id);
    setForm({ ...EMPTY_FORM, title: item.title, documentNumber: item.documentNumber || "", documentType: item.documentType || "", description: item.description || "", fileUrl: item.fileUrl, fileName: item.fileName || "", mimeType: item.mimeType || "", fileSize: item.fileSize === null ? "" : String(item.fileSize), sortOrder: String(item.sortOrder), active: item.isPublished });
    setUploadFile(null);
    setError("");
    setNotice("");
  }

  function resetForm() {
    setEditingId("");
    setForm(emptyForm(kind));
    setUploadFile(null);
  }

  async function uploadSelectedFile() {
    if (!uploadFile) return;
    if (kind === "gallery" && form.type !== "PHOTO") return;
    setBusy(true);
    setError("");
    try {
      const data = new FormData();
      data.set("file", uploadFile);
      data.set("scope", kind);
      data.set("intent", editingId ? "update" : "create");
      const response = await fetch("/api/admin/media/upload", { method: "POST", body: data });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "File gagal diunggah.");
      setForm((current) => ({ ...current, fileUrl: result.url, fileName: result.originalName || uploadFile.name, mimeType: result.mimeType || uploadFile.type, fileSize: String(result.size ?? uploadFile.size) }));
      setUploadFile(null);
      setNotice("File berhasil diunggah.");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "File gagal diunggah.");
    } finally {
      setBusy(false);
    }
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setNotice("");
    if (kind === "gallery" && form.type === "PHOTO" && !form.fileUrl) {
      setError("Pilih dan unggah file foto terlebih dahulu.");
      return;
    }
    if (kind === "gallery" && form.type === "VIDEO" && !isYouTubeVideoUrl(form.externalUrl)) {
      setError("Masukkan tautan video YouTube yang valid dari kanal DKKT @dkkt.official.");
      return;
    }
    setBusy(true);
    const body = kind === "gallery"
      ? { id: editingId || undefined, title: form.title, type: form.type, albumId: form.albumId, albumTitle: form.albumTitle, committeeId: form.committeeId, description: form.description, fileUrl: form.type === "PHOTO" ? form.fileUrl : "", externalUrl: form.type === "VIDEO" ? form.externalUrl : "", mimeType: form.type === "PHOTO" ? form.mimeType : "", sortOrder: Number(form.sortOrder), isActive: form.active }
      : { id: editingId || undefined, title: form.title, documentNumber: form.documentNumber, documentType: form.documentType, description: form.description, fileUrl: form.fileUrl, fileName: form.fileName, mimeType: form.mimeType, fileSize: form.fileSize ? Number(form.fileSize) : null, sortOrder: Number(form.sortOrder), isPublished: form.active };
    try {
      const response = await fetch(`/api/admin/${apiPath}`, { method: editingId ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Data gagal disimpan.");
      resetForm();
      await load();
      setNotice(editingId ? "Perubahan berhasil disimpan." : "Data berhasil ditambahkan.");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Data gagal disimpan.");
    } finally {
      setBusy(false);
    }
  }

  async function remove(id: string, title: string) {
    if (!window.confirm(`Hapus "${title}"? Tindakan ini tidak dapat dibatalkan.`)) return;
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const response = await fetch(`/api/admin/${apiPath}?id=${encodeURIComponent(id)}`, { method: "DELETE" });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Data gagal dihapus.");
      if (editingId === id) resetForm();
      await load();
      setNotice("Data berhasil dihapus.");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Data gagal dihapus.");
    } finally {
      setBusy(false);
    }
  }

  const records = kind === "gallery" ? galleryItems : documents;
  const normalizedQuery = query.trim().toLocaleLowerCase("id-ID");
  const visibleGalleryItems = galleryItems.filter((item) => {
    const album = albums.find((entry) => entry.id === item.albumId);
    const committee = committees.find((entry) => entry.id === item.committeeId);
    return [item.title, item.type, item.description, item.fileUrl, item.externalUrl, album?.title, committee?.name]
      .some((value) => String(value || "").toLocaleLowerCase("id-ID").includes(normalizedQuery));
  });
  const visibleDocuments = documents.filter((item) =>
    [item.title, item.documentNumber, item.documentType, item.description, item.fileName, item.fileUrl]
      .some((value) => String(value || "").toLocaleLowerCase("id-ID").includes(normalizedQuery)),
  );
  const visibleRecords = kind === "gallery" ? visibleGalleryItems : visibleDocuments;

  return (
    <section className="mt-8 grid gap-8 xl:grid-cols-[minmax(0,1fr)_minmax(320px,0.8fr)]">
      <div className="min-w-0">
        <div className="flex items-end justify-between gap-4 border-b border-white/10 pb-4">
          <div>
            <h2 className="text-lg font-bold text-white">Kelola {kind === "gallery" ? "media galeri" : "dokumen"}</h2>
            <p className="mt-1 text-sm text-gray-500">{visibleRecords.length} dari {records.length} item</p>
          </div>
          <label htmlFor={`${kind}-search`} className="sr-only">Cari {kind === "gallery" ? "galeri" : "dokumen"}</label>
          <input id={`${kind}-search`} type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder={kind === "gallery" ? "Cari judul, album, komite" : "Cari judul, nomor, jenis dokumen"} className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2.5 text-sm text-white placeholder:text-gray-600 outline-none transition focus:border-amber-400/50 md:max-w-sm" />
        </div>
        {visibleRecords.length === 0 ? <p className="py-10 text-sm text-gray-500">{query ? "Tidak ada data yang cocok dengan pencarian." : "Belum ada data."}</p> : (
          <div className="divide-y divide-white/10">
            {kind === "gallery" ? visibleGalleryItems.map((item) => (
              <div key={item.id} className="flex flex-wrap items-center justify-between gap-4 py-4">
                <div className="min-w-0"><p className="truncate font-semibold text-white">{item.title}</p><p className="mt-1 text-xs text-gray-500">{item.type} · {item.isActive ? "Aktif" : "Nonaktif"}</p></div>
                <div className="flex gap-2">{canUpdate && <button type="button" onClick={() => editGallery(item)} className="rounded-md border border-white/15 px-3 py-2 text-xs text-gray-200">Edit</button>}{canDelete && <button type="button" disabled={busy} onClick={() => remove(item.id, item.title)} className="rounded-md border border-red-400/30 px-3 py-2 text-xs text-red-300 disabled:opacity-50">Hapus</button>}</div>
              </div>
            )) : visibleDocuments.map((item) => (
              <div key={item.id} className="flex flex-wrap items-center justify-between gap-4 py-4">
                <div className="min-w-0"><p className="truncate font-semibold text-white">{item.title}</p><p className="mt-1 text-xs text-gray-500">{item.isPublished ? "Publik" : "Draft"} · {item.fileName || item.fileUrl}</p></div>
                <div className="flex gap-2">{canUpdate && <button type="button" onClick={() => editDocument(item)} className="rounded-md border border-white/15 px-3 py-2 text-xs text-gray-200">Edit</button>}{canDelete && <button type="button" disabled={busy} onClick={() => remove(item.id, item.title)} className="rounded-md border border-red-400/30 px-3 py-2 text-xs text-red-300 disabled:opacity-50">Hapus</button>}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {(canCreate || (editingId && canUpdate)) && (
        <form onSubmit={submit} className="space-y-4 border-t border-white/10 pt-5 xl:border-l xl:border-t-0 xl:pl-8 xl:pt-0">
          <div className="flex items-center justify-between"><h2 className="text-lg font-bold text-white">{editingId ? "Ubah data" : "Tambah data"}</h2>{editingId && <button type="button" onClick={resetForm} className="text-sm text-gray-400 hover:text-white">Batal</button>}</div>
          <label className="block text-sm text-gray-300">Judul<input required value={form.title} onChange={(event) => update("title", event.target.value)} className="mt-1 w-full rounded-md border border-white/15 bg-black/30 px-3 py-2 text-white" /></label>
          {kind === "gallery" ? <>
            <fieldset>
              <legend className="mb-2 text-sm font-semibold text-gray-300">Pilih jenis galeri</legend>
              <div role="group" aria-label="Jenis media galeri" className="grid grid-cols-2 gap-3">
                <button type="button" aria-pressed={form.type === "PHOTO"} onClick={() => changeGalleryType("PHOTO")} className={`rounded-lg border p-3 text-left transition ${form.type === "PHOTO" ? "border-emerald-400/60 bg-emerald-400/10" : "border-white/10 bg-white/2 hover:border-emerald-400/30"}`}>
                  <span className={`block text-sm font-bold ${form.type === "PHOTO" ? "text-emerald-300" : "text-gray-200"}`}>Foto</span>
                  <span className="mt-1 block text-xs text-gray-500">Pilih file dari perangkat</span>
                </button>
                <button type="button" aria-pressed={form.type === "VIDEO"} onClick={() => changeGalleryType("VIDEO")} className={`rounded-lg border p-3 text-left transition ${form.type === "VIDEO" ? "border-sky-400/60 bg-sky-400/10" : "border-white/10 bg-white/2 hover:border-sky-400/30"}`}>
                  <span className={`block text-sm font-bold ${form.type === "VIDEO" ? "text-sky-300" : "text-gray-200"}`}>Video YouTube</span>
                  <span className="mt-1 block text-xs text-gray-500">Tempel tautan, tanpa upload video</span>
                </button>
              </div>
            </fieldset>
            <label className="block text-sm text-gray-300">Album<select value={form.albumId} onChange={(event) => update("albumId", event.target.value)} className="mt-1 w-full rounded-md border border-white/15 bg-[#111] px-3 py-2 text-white"><option value="">Buat album baru</option>{albums.map((album) => <option key={album.id} value={album.id}>{album.title}</option>)}</select></label>
            {!form.albumId && <label className="block text-sm text-gray-300">Nama album<input value={form.albumTitle} onChange={(event) => update("albumTitle", event.target.value)} placeholder="Dokumentasi DKKT" className="mt-1 w-full rounded-md border border-white/15 bg-black/30 px-3 py-2 text-white" /></label>}
            <label className="block text-sm text-gray-300">Komite<select value={form.committeeId} onChange={(event) => update("committeeId", event.target.value)} className="mt-1 w-full rounded-md border border-white/15 bg-[#111] px-3 py-2 text-white"><option value="">Umum</option>{committees.map((committee) => <option key={committee.id} value={committee.id}>{committee.name}</option>)}</select></label>
            {form.type === "PHOTO" ? <>
              <div role="tabpanel" aria-label="Unggah foto" className="space-y-3 rounded-lg border border-emerald-400/20 bg-emerald-400/[0.035] p-4">
                <div><p className="text-sm font-bold text-emerald-300">Unggah Foto</p><p className="mt-1 text-xs text-gray-500">Pilih foto dari komputer atau galeri perangkat. JPG, PNG, WebP, atau GIF, maksimal 10 MB.</p></div>
                <label htmlFor="gallery-photo-file" className="sr-only">Pilih foto dari perangkat</label>
                <input id="gallery-photo-file" type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={(event) => setUploadFile(event.target.files?.[0] || null)} className="block w-full text-sm text-gray-300 file:mr-3 file:rounded-md file:border-0 file:bg-white/10 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-white" />
                {uploadFile && <p className="text-xs text-amber-300">Dipilih: {uploadFile.name}</p>}
                {form.fileUrl && <p className="text-xs text-emerald-300">Foto sudah diunggah dan siap disimpan.</p>}
                {uploadFile && <button type="button" disabled={busy} onClick={uploadSelectedFile} className="rounded-md border border-emerald-400/30 px-3 py-2 text-sm font-semibold text-emerald-300 disabled:opacity-50">{busy ? "Mengunggah..." : "Unggah foto"}</button>}
              </div>
            </> : <>
              <div role="tabpanel" aria-label="Tautkan video YouTube" className="space-y-3 rounded-lg border border-sky-400/20 bg-sky-400/[0.035] p-4">
                <div><p className="text-sm font-bold text-sky-300">Tautkan Video YouTube</p><p className="mt-1 text-xs text-gray-500">Gunakan tautan video yang sudah tayang di kanal DKKT @dkkt.official. Tidak ada file video yang diunggah atau disimpan di server.</p></div>
                <label htmlFor="gallery-youtube-url" className="block text-sm text-gray-300">Tautan video<input id="gallery-youtube-url" type="url" required value={form.externalUrl} onChange={(event) => update("externalUrl", event.target.value)} placeholder="https://youtu.be/..." className="mt-1 w-full rounded-md border border-white/15 bg-black/30 px-3 py-2 text-white" /></label>
              </div>
            </>}
            <label className="flex items-center gap-2 text-sm text-gray-300"><input type="checkbox" checked={form.active} onChange={(event) => update("active", event.target.checked)} />Aktif</label>
          </> : <>
            <label className="block text-sm text-gray-300">Nomor dokumen<input value={form.documentNumber} onChange={(event) => update("documentNumber", event.target.value)} className="mt-1 w-full rounded-md border border-white/15 bg-black/30 px-3 py-2 text-white" /></label>
            <label className="block text-sm text-gray-300">Jenis dokumen<input value={form.documentType} onChange={(event) => update("documentType", event.target.value)} className="mt-1 w-full rounded-md border border-white/15 bg-black/30 px-3 py-2 text-white" /></label>
            <label className="block text-sm text-gray-300">URL file<input required value={form.fileUrl} onChange={(event) => update("fileUrl", event.target.value)} placeholder="https://... atau /uploads/..." className="mt-1 w-full rounded-md border border-white/15 bg-black/30 px-3 py-2 text-white" /></label>
            <label className="block text-sm text-gray-300">File PDF<input type="file" accept="application/pdf" onChange={(event) => setUploadFile(event.target.files?.[0] || null)} className="mt-1 block w-full text-sm text-gray-300" /></label>
            {uploadFile && <button type="button" disabled={busy} onClick={uploadSelectedFile} className="rounded-md border border-white/15 px-3 py-2 text-sm text-white disabled:opacity-50">Unggah file</button>}
            <label className="flex items-center gap-2 text-sm text-gray-300"><input type="checkbox" checked={form.active} onChange={(event) => update("active", event.target.checked)} />Publikasikan</label>
          </>}
          <label className="block text-sm text-gray-300">Deskripsi<textarea value={form.description} onChange={(event) => update("description", event.target.value)} rows={3} className="mt-1 w-full rounded-md border border-white/15 bg-black/30 px-3 py-2 text-white" /></label>
          <label className="block text-sm text-gray-300">Urutan<input type="number" min="0" step="1" value={form.sortOrder} onChange={(event) => update("sortOrder", event.target.value)} className="mt-1 w-full rounded-md border border-white/15 bg-black/30 px-3 py-2 text-white" /></label>
          {error && <p role="alert" className="text-sm text-red-300">{error}</p>}{notice && <p role="status" className="text-sm text-emerald-300">{notice}</p>}
          <button type="submit" disabled={busy || (editingId ? !canUpdate : !canCreate)} className="rounded-md bg-amber-400 px-4 py-2.5 text-sm font-bold text-black disabled:opacity-50">{busy ? "Menyimpan..." : editingId ? "Simpan perubahan" : "Tambah"}</button>
        </form>
      )}
      {error && !(canCreate || (editingId && canUpdate)) && <p role="alert" className="text-sm text-red-300">{error}</p>}
    </section>
  );
}