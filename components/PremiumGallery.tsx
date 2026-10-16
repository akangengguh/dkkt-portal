"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

type CmsGalleryItem = {
  id: string;
  title: string;
  description: string | null;
  type: string;
  fileUrl: string | null;
  externalUrl: string | null;
  committee: { name: string; slug: string } | null;
};

type CmsArchiveItem = {
  id: string;
  title: string;
  documentType: string | null;
  description: string | null;
  fileUrl: string;
  fileName: string | null;
  mimeType: string | null;
};

const categories = ["Semua", "Teater", "Tari", "Musik", "Seni Rupa", "Sastra", "Budaya", "Film", "Umum"];

const committeeCategories: Record<string, string> = {
  teater: "Teater",
  tari: "Tari",
  musik: "Musik",
  "seni-rupa": "Seni Rupa",
  sastra: "Sastra",
  "film-fotografi": "Film",
  budaya: "Budaya",
};

const committeeNames: Record<string, string> = {
  teater: "Komite Seni Teater",
  "seni-rupa": "Komite Seni Rupa",
  sastra: "Komite Seni Sastra",
  musik: "Komite Seni Musik",
  tari: "Komite Seni Tari",
  "film-fotografi": "Komite Seni Film dan Fotografi",
  budaya: "Komite Budaya",
};

function youtubeVideoId(value: string) {
  try {
    const url = new URL(value);
    const host = url.hostname.toLowerCase().replace(/^www\./, "");
    const pathParts = url.pathname.split("/").filter(Boolean);
    const videoId = host === "youtu.be"
      ? pathParts[0]
      : url.searchParams.get("v") || (pathParts[0] && ["embed", "live", "shorts"].includes(pathParts[0]) ? pathParts[1] : "");
    return videoId && /^[\w-]{11}$/.test(videoId) ? videoId : null;
  } catch {
    return null;
  }
}

export default function PremiumGallery() {
  const searchParams = useSearchParams();
  const committeeFilter = searchParams.get("komite");
  const [activeCategory, setActiveCategory] = useState("Semua");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [items, setItems] = useState<CmsGalleryItem[]>([]);
  const [archives, setArchives] = useState<CmsArchiveItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    const galleryRequest = fetch("/api/public/gallery", { cache: "no-store", signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error("Gagal mengambil galeri.");
        return response.json();
      });
    const archivesRequest = fetch("/api/public/documents", { cache: "no-store", signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error("Gagal mengambil arsip.");
        return response.json();
      });

    Promise.all([galleryRequest, archivesRequest])
      .then(([galleryResult, archivesResult]) => {
        if (controller.signal.aborted) return;
        setItems(Array.isArray(galleryResult.data) ? galleryResult.data : []);
        setArchives(Array.isArray(archivesResult.data) ? archivesResult.data : []);
      })
      .catch(() => {
        if (controller.signal.aborted) return;
        setItems([]);
        setArchives([]);
      })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, []);

  const photos = useMemo(() => items
    .filter((item) => item.type === "PHOTO" && item.fileUrl)
    .map((item) => ({
      id: item.id,
      title: item.title,
      description: item.description,
      image: item.fileUrl!,
      committeeSlug: item.committee?.slug || "",
      category: item.committee ? committeeCategories[item.committee.slug] || "Umum" : "Umum",
    })), [items]);

  const videos = useMemo(() => items
    .filter((item) => item.type === "VIDEO" && item.externalUrl)
    .map((item) => {
      const videoId = youtubeVideoId(item.externalUrl!);
      return {
        id: item.id,
        title: item.title,
        description: item.description,
        url: item.externalUrl!,
        thumbnail: videoId ? `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg` : null,
        committeeSlug: item.committee?.slug || "",
        category: item.committee ? committeeCategories[item.committee.slug] || "Umum" : "Umum",
      };
    }), [items]);

  const filteredPhotos = useMemo(() => photos.filter((item) =>
    (!committeeFilter || item.committeeSlug === committeeFilter) &&
    (activeCategory === "Semua" || item.category === activeCategory),
  ), [photos, committeeFilter, activeCategory]);

  const filteredVideos = useMemo(() => videos.filter((item) =>
    (!committeeFilter || item.committeeSlug === committeeFilter) &&
    (activeCategory === "Semua" || item.category === activeCategory),
  ), [videos, committeeFilter, activeCategory]);

  const filteredArchives = archives;
  const activeCommitteeName = committeeFilter ? committeeNames[committeeFilter] : null;

  return (
    <section className="bg-black py-24 text-white">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-14">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.35em] text-amber-400">Galeri DKKT</p>
          <h2 className="text-5xl font-black leading-tight md:text-6xl">Dokumentasi Kegiatan</h2>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-gray-400">
            Foto dan video kegiatan DKKT yang dikelola melalui CMS.
          </p>
          <div className="mt-8 h-1 w-20 rounded-full bg-amber-400" />
          {activeCommitteeName && <div className="mt-6 inline-flex items-center gap-3 rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-2"><span className="h-2 w-2 rounded-full bg-amber-400" /><span className="text-sm font-semibold text-amber-300">Menampilkan {activeCommitteeName}</span></div>}
        </div>

        <div id="foto" className="mb-24 scroll-mt-28">
          <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div><h3 className="text-3xl font-bold">Dokumentasi Foto</h3><p className="mt-2 text-gray-400">Foto kegiatan yang diunggah melalui CMS DKKT.</p></div>
            <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-2 text-sm text-amber-300">{filteredPhotos.length} Foto</span>
          </div>

          <div className="mb-8 flex flex-wrap gap-3">
            {categories.map((category) => <button key={category} type="button" onClick={() => setActiveCategory(category)} className={`rounded-full border px-5 py-2 text-sm transition ${activeCategory === category ? "border-amber-400 bg-amber-400 font-semibold text-black" : "border-white/10 bg-white/5 text-gray-300 hover:border-amber-400 hover:text-white"}`}>{category}</button>)}
          </div>

          {filteredPhotos.length > 0 ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {filteredPhotos.map((photo) => <button key={photo.id} type="button" onClick={() => setSelectedImage(photo.image)} className="group overflow-hidden rounded-2xl border border-amber-500/20 bg-zinc-950 text-left transition-all duration-300 hover:-translate-y-1 hover:border-amber-400">
                <div className="relative overflow-hidden"><img src={photo.image} alt={photo.title} className="h-60 w-full object-cover transition duration-500 group-hover:scale-105" /><div className="absolute inset-0 bg-linear-to-t from-black/70 via-transparent to-transparent" /><span className="absolute left-4 top-4 rounded-full bg-amber-500 px-3 py-1 text-xs font-bold text-black">{photo.category}</span><h4 className="absolute bottom-4 left-4 right-4 line-clamp-2 text-lg font-bold text-white">{photo.title}</h4></div>
                {photo.description && <p className="p-4 text-sm leading-6 text-gray-400">{photo.description}</p>}
              </button>)}
            </div>
          ) : <div className="rounded-3xl border border-dashed border-amber-500/30 bg-[#0D0D0D] p-12 text-center"><div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/10 text-3xl">{loading ? "…" : "Foto"}</div><h4 className="mt-5 text-2xl font-black">{loading ? "Memuat Galeri" : "Belum Ada Foto"}</h4><p className="mx-auto mt-3 max-w-xl text-gray-400">{loading ? "Mengambil foto dari galeri DKKT." : "Foto aktif yang diunggah melalui CMS akan tampil di sini."}</p></div>}
        </div>

        <div id="video" className="mb-24 scroll-mt-28">
          <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between"><div><h3 className="text-3xl font-bold">Video Dokumenter</h3><p className="mt-2 text-gray-400">Video diputar melalui kanal YouTube resmi DKKT.</p></div><span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-2 text-sm text-amber-300">{filteredVideos.length} Video</span></div>
          {filteredVideos.length > 0 ? <div className="grid gap-6 md:grid-cols-3">{filteredVideos.map((video) => <a key={video.id} href={video.url} target="_blank" rel="noopener noreferrer" className="group overflow-hidden rounded-3xl border border-amber-500/20 bg-zinc-950 transition hover:border-amber-400">
            <div className="relative">{video.thumbnail ? <img src={video.thumbnail} alt={video.title} className="h-56 w-full object-cover" /> : <div className="flex h-56 items-center justify-center bg-[#111] text-5xl text-amber-400">Video</div>}<div className="absolute inset-0 flex items-center justify-center bg-black/30"><div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/90 text-2xl text-black transition group-hover:scale-110">▶</div></div></div>
            <div className="p-6"><p className="text-xs uppercase tracking-widest text-amber-400">{video.category}</p><h4 className="mt-3 text-xl font-bold leading-snug">{video.title}</h4>{video.description && <p className="mt-2 line-clamp-2 text-sm text-gray-400">{video.description}</p>}<p className="mt-5 font-semibold text-amber-400">Tonton di YouTube ↗</p></div>
          </a>)}</div> : <div className="rounded-3xl border border-dashed border-amber-500/30 bg-[#0D0D0D] p-12 text-center"><div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/10 text-3xl">{loading ? "…" : "Video"}</div><h4 className="mt-5 text-2xl font-black">{loading ? "Memuat Galeri" : "Belum Ada Video"}</h4><p className="mx-auto mt-3 max-w-xl text-gray-400">{loading ? "Mengambil video dari galeri DKKT." : "Tautan video YouTube DKKT akan tampil di sini."}</p></div>}
        </div>

        <div id="arsip" className="scroll-mt-28">
          <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between"><div><h3 className="text-3xl font-bold">Arsip Digital</h3><p className="mt-2 text-gray-400">Poster, booklet, katalog, dan publikasi resmi DKKT.</p></div><span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-2 text-sm text-amber-300">{filteredArchives.length} Arsip</span></div>
          {filteredArchives.length > 0 ? <div className="grid gap-6 md:grid-cols-3">{filteredArchives.map((archive) => <a key={archive.id} href={archive.fileUrl} target="_blank" rel="noopener noreferrer" className="group overflow-hidden rounded-3xl border border-amber-500/20 bg-zinc-950 transition hover:border-amber-400/50">{archive.mimeType?.startsWith("image/") ? <img src={archive.fileUrl} alt={archive.title} className="h-72 w-full object-cover" /> : <div className="flex h-72 flex-col justify-between bg-gradient-to-br from-amber-500/15 via-zinc-950 to-black p-6"><span className="text-xs font-bold uppercase tracking-[0.2em] text-amber-300">Arsip DKKT</span><span className="text-4xl font-black text-amber-400">{archive.documentType || "PDF"}</span><span className="truncate text-xs text-gray-500">{archive.fileName || "Dokumen publik"}</span></div>}<div className="p-6"><span className="rounded-full bg-amber-500 px-3 py-1 text-xs font-bold text-black">{archive.documentType || "Publikasi"}</span><h4 className="mt-4 text-xl font-bold leading-snug">{archive.title}</h4>{archive.description && <p className="mt-2 line-clamp-3 text-sm leading-6 text-gray-400">{archive.description}</p>}<span className="mt-5 inline-flex text-sm font-semibold text-amber-400">Buka arsip ↗</span></div></a>)}</div> : <p className="py-10 text-gray-500">Belum ada arsip publik. Tambahkan dan terbitkan dokumen dari CMS DKKT.</p>}
        </div>
      </div>

      {selectedImage && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-6" onClick={() => setSelectedImage(null)}><button type="button" onClick={() => setSelectedImage(null)} aria-label="Tutup preview" className="absolute right-8 top-8 text-5xl font-light text-white transition hover:text-amber-400">×</button><img src={selectedImage} alt="Preview dokumentasi" className="max-h-[90vh] max-w-[92vw] rounded-2xl object-contain shadow-2xl" /></div>}
    </section>
  );
}