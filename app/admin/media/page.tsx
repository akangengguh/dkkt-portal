import { readdir, stat } from "fs/promises";
import path from "path";

import Link from "next/link";

import { requireAdminPermission } from "@/lib/admin";
import AdminListSearch from "@/components/admin/AdminListSearch";
import { matchesSearch } from "@/lib/search";

async function getUploadedMedia() {
  const root = path.join(process.cwd(), "public", "uploads");

  try {
    const entries = await readdir(root, { withFileTypes: true });
    const files: { name: string; path: string; size: number; type: string }[] = [];

    for (const entry of entries) {
      if (!entry.isDirectory()) continue;

      const dirPath = path.join(root, entry.name);
      const nested = await readdir(dirPath, { withFileTypes: true });

      for (const item of nested) {
        if (item.isDirectory()) continue;

        const filePath = path.join(dirPath, item.name);
        const info = await stat(filePath);
        const ext = path.extname(item.name).toLowerCase();

        files.push({
          name: item.name,
          path: `/uploads/${entry.name}/${item.name}`,
          size: info.size,
          type: ext ? ext.slice(1) : "file",
        });
      }
    }

    return files.sort((a, b) => a.name.localeCompare(b.name));
  } catch {
    return [];
  }
}

export default async function AdminMediaPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string | string[] }>;
}) {
  await requireAdminPermission("media.view");

  const params = await searchParams;
  const query = typeof params.q === "string" ? params.q.trim() : "";
  const media = await getUploadedMedia();
  const filteredMedia = media.filter((item) => matchesSearch(query, [item.name, item.path, item.type]));

  return (
    <div className="mx-auto max-w-7xl pb-20">
      <section className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-amber-400">
            CMS DKKT
          </p>
          <h1 className="mt-2 text-3xl font-black text-white md:text-4xl">
            Media Library
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-gray-400">
            Daftar file upload yang tersimpan di server untuk digunakan pada berita, agenda, galeri, dan dokumen.
          </p>
        </div>

        <Link
          href="/admin"
          className="inline-flex items-center justify-center rounded-xl border border-white/10 px-5 py-3 text-sm font-semibold text-gray-300 transition hover:border-amber-400/40 hover:text-amber-300"
        >
          ← Kembali ke Dashboard
        </Link>
      </section>

      <section className="mt-8 rounded-3xl border border-white/10 bg-[#0b0b0b] p-6">
        <div className="mb-5 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-black text-white">File Upload</h2>
            <p className="mt-1 text-sm text-gray-500">Media yang telah diunggah melalui sistem CMS.</p>
          </div>
          <AdminListSearch query={query} clearHref="/admin/media" placeholder="Cari nama atau tipe file" resultCount={filteredMedia.length} />
        </div>

        {filteredMedia.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/10 p-10 text-center text-gray-500">
            {query ? "Tidak ada file yang cocok dengan pencarian." : "Belum ada file media yang diunggah."}
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filteredMedia.map((item) => (
              <div key={item.path} className="overflow-hidden rounded-2xl border border-white/10 bg-black/30">
                <div className="flex aspect-video items-center justify-center bg-linear-to-br from-[#161616] to-[#090909] text-3xl text-amber-300">
                  {item.type === "jpg" || item.type === "png" || item.type === "jpeg" || item.type === "webp" || item.type === "gif" ? "🖼️" : item.type === "mp4" || item.type === "webm" || item.type === "ogv" ? "🎬" : "📄"}
                </div>

                <div className="space-y-3 p-4">
                  <p className="truncate text-sm font-semibold text-white">{item.name}</p>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{item.type.toUpperCase()}</span>
                    <span>{(item.size / 1024).toFixed(1)} KB</span>
                  </div>
                  <a
                    href={item.path}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs font-semibold text-amber-300"
                  >
                    Lihat File
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
