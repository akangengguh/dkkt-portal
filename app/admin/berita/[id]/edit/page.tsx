"use client";

import {
  FormEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import { useParams, useRouter } from "next/navigation";

type Category = {
  id: string;
  name: string;
};

type Committee = {
  id: string;
  name: string;
  slug: string;
};

type NewsData = {
  id: string;
  title: string;
  slug: string;
  subtitle: string | null;
  excerpt: string | null;
  content: string;
  featuredImage: string | null;
  categoryId: string | null;
  committeeId: string | null;
  status: string;
  isPublished: boolean;
  isFeatured: boolean;
};

export default function EditBeritaPage() {
  const router = useRouter();
  const params = useParams();

  const id =
    typeof params?.id === "string"
      ? params.id
      : "";

  const fileInputRef = useRef<HTMLInputElement | null>(
    null
  );

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] =
    useState(false);
  const [uploadingImage, setUploadingImage] =
    useState(false);

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [featuredImage, setFeaturedImage] =
    useState("");
  const [imagePreview, setImagePreview] =
    useState("");

  const [categoryId, setCategoryId] =
    useState("");
  const [committeeId, setCommitteeId] =
    useState("");

  const [status, setStatus] =
    useState("DRAFT");
  const [isPublished, setIsPublished] =
    useState(false);

  const [categories, setCategories] =
    useState<Category[]>([]);
  const [committees, setCommittees] =
    useState<Committee[]>([]);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [slugEdited, setSlugEdited] =
    useState(false);

  /*
   * ==========================================================
   * LOAD DATA
   * ==========================================================
   */
  useEffect(() => {
    if (!id) return;

    async function loadData() {
      setLoading(true);
      setError("");

      try {
        /*
         * Ambil berita
         */
        const newsResponse = await fetch(
          `/api/admin/news/${id}`,
          {
            cache: "no-store",
          }
        );

        const newsData =
          await newsResponse.json();

        if (!newsResponse.ok) {
          throw new Error(
            newsData.message ||
              "Gagal mengambil data berita."
          );
        }

        const news: NewsData =
          newsData.news ?? newsData.data ?? newsData;

        setTitle(news.title ?? "");
        setSlug(news.slug ?? "");
        setSlugEdited(
          Boolean(
            news.slug &&
              String(news.slug).trim().length > 0
          )
        );
        setSubtitle(news.subtitle ?? "");
        setExcerpt(news.excerpt ?? "");
        setContent(news.content ?? "");
        setFeaturedImage(
          news.featuredImage ?? ""
        );
        setImagePreview(
          news.featuredImage ?? ""
        );
        setCategoryId(
          news.categoryId ?? ""
        );
        setCommitteeId(
          news.committeeId ?? ""
        );
        setStatus(news.status ?? "DRAFT");
        setIsPublished(
          news.isPublished === true
        );

        /*
         * Ambil kategori + komite
         */
        const optionsResponse = await fetch(
          "/api/admin/news/options",
          {
            cache: "no-store",
          }
        );

        const optionsData =
          await optionsResponse.json();

        if (!optionsResponse.ok) {
          throw new Error(
            optionsData.message ||
              "Gagal mengambil kategori dan komite."
          );
        }

        setCategories(
          Array.isArray(optionsData.categories)
            ? optionsData.categories
            : []
        );

        setCommittees(
          Array.isArray(optionsData.committees)
            ? optionsData.committees
            : []
        );
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Gagal memuat data berita."
        );
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [id]);

  /*
   * ==========================================================
   * SLUG
   * ==========================================================
   */
  function generateSlug(value: string) {
    return value
      .toLowerCase()
      .normalize("NFKD")
      .replace(
        /[\u0300-\u036f]/g,
        ""
      )
      .replace(
        /[^a-z0-9\s-]/g,
        ""
      )
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");
  }

  /*
   * ==========================================================
   * TITLE
   * ==========================================================
   */
  function handleTitleChange(value: string) {
    setTitle(value);

    if (!slugEdited && !slug.trim()) {
      setSlug(
        generateSlug(value),
      );
    }
  }

  function handleSlugChange(value: string) {
    setSlugEdited(true);
    setSlug(
      generateSlug(value),
    );
  }

  /*
   * ==========================================================
   * IMAGE PICKER
   * ==========================================================
   */
  async function handleSelectImage(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];

    if (!file) return;

    setError("");
    setMessage("");

    /*
     * Maksimal 5 MB
     */
    if (file.size > 5 * 1024 * 1024) {
      setError(
        "Ukuran gambar maksimal 5 MB."
      );

      event.target.value = "";
      return;
    }

    /*
     * Hanya gambar
     */
    if (!file.type.startsWith("image/")) {
      setError(
        "File yang dipilih harus berupa gambar."
      );

      event.target.value = "";
      return;
    }

    /*
     * Preview lokal
     */
    const localPreview =
      URL.createObjectURL(file);

    setImagePreview(localPreview);

    setUploadingImage(true);

    try {
      const formData = new FormData();

      formData.append("file", file);
      formData.append("scope", "news");
      formData.append("intent", "update");

      const response = await fetch(
        "/api/admin/media/upload",
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Gagal mengunggah gambar."
        );
      }

      const uploadedUrl =
        data.url ??
        data.data?.url ??
        "";

      if (!uploadedUrl) {
        throw new Error(
          "Server tidak mengembalikan URL gambar."
        );
      }

      setFeaturedImage(uploadedUrl);
      setImagePreview(uploadedUrl);
      setMessage(
        "Gambar berhasil diunggah."
      );
    } catch (err) {
      setImagePreview(featuredImage);

      setError(
        err instanceof Error
          ? err.message
          : "Gagal mengunggah gambar."
      );
    } finally {
      setUploadingImage(false);

      event.target.value = "";
    }
  }

  /*
   * ==========================================================
   * REMOVE IMAGE
   * ==========================================================
   */
  function handleRemoveImage() {
    setFeaturedImage("");
    setImagePreview("");
  }

  /*
   * ==========================================================
   * SUBMIT
   * ==========================================================
   */
  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!id) {
      setError(
        "ID berita tidak ditemukan."
      );
      return;
    }

    if (!title.trim()) {
      setError(
        "Judul berita wajib diisi."
      );
      return;
    }

    if (!content.trim()) {
      setError(
        "Isi berita wajib diisi."
      );
      return;
    }

    setSubmitting(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch(
        `/api/admin/news/${id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            title: title.trim(),
            slug: slug.trim() ||
              generateSlug(title),
            subtitle:
              subtitle.trim() || null,
            excerpt:
              excerpt.trim() || null,
            content: content.trim(),
            featuredImage:
              featuredImage.trim() || null,
            categoryId:
              categoryId || null,
            committeeId:
              committeeId || null,

            /*
             * PENTING
             *
             * Editor tidak mengubah:
             * - publish
             * - isFeatured
             *
             * Nilai publikasi yang sudah ada
             * tetap dipertahankan.
             */
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Gagal menyimpan perubahan."
        );
      }

      setMessage(
        data.message ||
          "Perubahan berita berhasil disimpan."
      );

      /*
       * Kembali ke daftar berita
       */
      setTimeout(() => {
        router.push("/admin/berita");
        router.refresh();
      }, 700);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Gagal menyimpan perubahan."
      );
    } finally {
      setSubmitting(false);
    }
  }

  /*
   * ==========================================================
   * LOADING
   * ==========================================================
   */
  if (loading) {
    return (
      <div className="mx-auto max-w-5xl">
        <div className="rounded-3xl border border-white/10 bg-[#0b0b0b] p-10">
          <div className="animate-pulse">
            <div className="h-4 w-32 rounded bg-white/10" />

            <div className="mt-4 h-8 w-72 rounded bg-white/10" />

            <div className="mt-8 h-12 w-full rounded bg-white/5" />

            <div className="mt-4 h-12 w-full rounded bg-white/5" />

            <div className="mt-4 h-32 w-full rounded bg-white/5" />
          </div>
        </div>
      </div>
    );
  }

  /*
   * ==========================================================
   * PAGE
   * ==========================================================
   */
  return (
    <div className="mx-auto max-w-5xl pb-20">
      {/* =====================================================
          HEADER
      ===================================================== */}
      <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-amber-400">
            CMS DKKT
          </p>

          <h1 className="mt-2 text-3xl font-black text-white md:text-4xl">
            Edit Berita
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-7 text-gray-400">
            Perbaiki isi berita yang sudah dibuat.
            Pengaturan publikasi tetap menjadi
            kewenangan Kurator.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() =>
              router.push(
                `/admin/berita/${id}/preview`
              )
            }
            className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-5 py-3 text-sm font-semibold text-amber-300 transition hover:bg-amber-500/15"
          >
            Lihat Preview
          </button>

          <button
            type="button"
            onClick={() =>
              router.push("/admin/berita")
            }
            className="rounded-xl border border-white/10 px-5 py-3 text-sm font-semibold text-gray-400 transition hover:border-white/20 hover:text-white"
          >
            ← Kembali
          </button>
        </div>
      </div>

      {/* =====================================================
          STATUS
      ===================================================== */}
      <div className="mt-6 flex flex-wrap items-center gap-3 rounded-2xl border border-white/10 bg-[#0b0b0b] p-5">
        <span className="text-xs font-bold uppercase tracking-[0.2em] text-gray-600">
          Status
        </span>

        <span
          className={`rounded-full border px-3 py-1.5 text-xs font-bold ${
            isPublished
              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
              : "border-amber-500/30 bg-amber-500/10 text-amber-300"
          }`}
        >
          {isPublished
            ? "PUBLISHED"
            : status || "DRAFT"}
        </span>

        <span className="text-sm text-gray-500">
          {isPublished
            ? "Berita sedang tampil di portal publik."
            : "Berita belum diterbitkan."}
        </span>
      </div>

      {/* =====================================================
          ALERT
      ===================================================== */}
      {error && (
        <div className="mt-6 rounded-2xl border border-red-500/20 bg-red-500/5 px-5 py-4 text-sm leading-7 text-red-300">
          {error}
        </div>
      )}

      {message && (
        <div className="mt-6 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 px-5 py-4 text-sm leading-7 text-emerald-300">
          {message}
        </div>
      )}

      {/* =====================================================
          FORM
      ===================================================== */}
      <form
        onSubmit={handleSubmit}
        className="mt-8 space-y-6"
      >
        {/* ===================================================
            BASIC INFORMATION
        =================================================== */}
        <section className="rounded-3xl border border-white/10 bg-[#0b0b0b] p-6 md:p-8">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-amber-400">
            Konten
          </p>

          <h2 className="mt-2 text-xl font-black text-white">
            Informasi Berita
          </h2>

          <div className="mt-6 space-y-5">
            {/* TITLE */}
            <div>
              <label
                htmlFor="title"
                className="mb-2 block text-sm font-semibold text-gray-200"
              >
                Judul Berita
              </label>

              <input
                id="title"
                type="text"
                value={title}
                onChange={(event) =>
                  handleTitleChange(
                    event.target.value
                  )
                }
                required
                className="w-full rounded-2xl border border-white/10 bg-white/3 px-4 py-3.5 text-white outline-none transition placeholder:text-gray-600 focus:border-amber-400/60"
              />
            </div>

            {/* SLUG */}
            <div>
              <label
                htmlFor="slug"
                className="mb-2 block text-sm font-semibold text-gray-200"
              >
                Slug
              </label>

              <input
                id="slug"
                type="text"
                value={slug}
                onChange={(event) =>
                  setSlug(event.target.value)
                }
                className="w-full rounded-2xl border border-white/10 bg-white/3 px-4 py-3.5 text-sm text-white outline-none transition focus:border-amber-400/60"
              />

              <p className="mt-2 text-xs text-gray-600">
                URL publik:
                <span className="ml-1 text-gray-500">
                  /berita/{slug}
                </span>
              </p>
            </div>

            {/* SUBTITLE */}
            <div>
              <label
                htmlFor="subtitle"
                className="mb-2 block text-sm font-semibold text-gray-200"
              >
                Subjudul
              </label>

              <input
                id="subtitle"
                type="text"
                value={subtitle}
                onChange={(event) =>
                  setSubtitle(
                    event.target.value
                  )
                }
                className="w-full rounded-2xl border border-white/10 bg-white/3 px-4 py-3.5 text-white outline-none transition placeholder:text-gray-600 focus:border-amber-400/60"
              />
            </div>

            {/* EXCERPT */}
            <div>
              <label
                htmlFor="excerpt"
                className="mb-2 block text-sm font-semibold text-gray-200"
              >
                Ringkasan
              </label>

              <textarea
                id="excerpt"
                value={excerpt}
                onChange={(event) =>
                  setExcerpt(
                    event.target.value
                  )
                }
                rows={4}
                className="w-full rounded-2xl border border-white/10 bg-white/3 px-4 py-3.5 text-sm leading-7 text-white outline-none transition placeholder:text-gray-600 focus:border-amber-400/60"
              />
            </div>

            {/* CONTENT */}
            <div>
              <label
                htmlFor="content"
                className="mb-2 block text-sm font-semibold text-gray-200"
              >
                Isi Berita
              </label>

              <textarea
                id="content"
                value={content}
                onChange={(event) =>
                  setContent(
                    event.target.value
                  )
                }
                rows={16}
                required
                className="w-full rounded-2xl border border-white/10 bg-white/3 px-4 py-3.5 text-sm leading-7 text-white outline-none transition placeholder:text-gray-600 focus:border-amber-400/60"
              />

              <p className="mt-2 text-xs text-gray-600">
                Gunakan paragraf yang jelas agar
                mudah dibaca saat preview maupun
                saat diterbitkan.
              </p>
            </div>
          </div>
        </section>

        {/* ===================================================
            CLASSIFICATION
        =================================================== */}
        <section className="rounded-3xl border border-white/10 bg-[#0b0b0b] p-6 md:p-8">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-amber-400">
            Klasifikasi
          </p>

          <h2 className="mt-2 text-xl font-black text-white">
            Kategori & Komite
          </h2>

          <div className="mt-6 grid gap-5 md:grid-cols-2">
            {/* CATEGORY */}
            <div>
              <label
                htmlFor="category"
                className="mb-2 block text-sm font-semibold text-gray-200"
              >
                Kategori Berita
              </label>

              <select
                id="category"
                value={categoryId}
                onChange={(event) =>
                  setCategoryId(
                    event.target.value
                  )
                }
                className="w-full rounded-2xl border border-white/10 bg-[#111111] px-4 py-3.5 text-sm text-white outline-none focus:border-amber-400/60"
              >
                <option value="">
                  Tanpa kategori
                </option>

                {categories.map((category) => (
                  <option
                    key={category.id}
                    value={category.id}
                  >
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            {/* COMMITTEE */}
            <div>
              <label
                htmlFor="committee"
                className="mb-2 block text-sm font-semibold text-gray-200"
              >
                Komite
              </label>

              <select
                id="committee"
                value={committeeId}
                onChange={(event) =>
                  setCommitteeId(
                    event.target.value
                  )
                }
                className="w-full rounded-2xl border border-white/10 bg-[#111111] px-4 py-3.5 text-sm text-white outline-none focus:border-amber-400/60"
              >
                <option value="">
                  Tanpa komite
                </option>

                {committees.map((committee) => (
                  <option
                    key={committee.id}
                    value={committee.id}
                  >
                    {committee.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </section>

        {/* ===================================================
            FEATURED IMAGE
        =================================================== */}
        <section className="rounded-3xl border border-white/10 bg-[#0b0b0b] p-6 md:p-8">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-amber-400">
            Media
          </p>

          <h2 className="mt-2 text-xl font-black text-white">
            Featured Image
          </h2>

          <p className="mt-2 text-sm leading-7 text-gray-500">
            Pilih gambar dari komputer untuk
            mengganti gambar utama berita.
          </p>

          <div className="mt-6">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={handleSelectImage}
              className="hidden"
            />

            {!imagePreview ? (
              <button
                type="button"
                onClick={() =>
                  fileInputRef.current?.click()
                }
                disabled={uploadingImage}
                className="flex w-full flex-col items-center justify-center rounded-3xl border border-dashed border-white/10 bg-white/2 px-6 py-12 text-center transition hover:border-amber-400/40 hover:bg-white/3 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <span className="text-4xl">
                  🖼️
                </span>

                <span className="mt-4 text-sm font-bold text-white">
                  Pilih Gambar
                </span>

                <span className="mt-2 text-xs text-gray-600">
                  JPG, PNG, WEBP, GIF · Maks. 5 MB
                </span>
              </button>
            ) : (
              <div className="overflow-hidden rounded-3xl border border-white/10 bg-black">
                <div className="relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={imagePreview}
                    alt="Featured image"
                    className="max-h-115 w-full object-contain"
                  />
                </div>

                <div className="flex flex-col gap-3 border-t border-white/10 p-4 sm:flex-row sm:justify-between">
                  <button
                    type="button"
                    onClick={() =>
                      fileInputRef.current?.click()
                    }
                    disabled={uploadingImage}
                    className="rounded-xl border border-white/10 px-5 py-3 text-sm font-semibold text-gray-300 transition hover:border-amber-400/40 hover:text-amber-300 disabled:opacity-50"
                  >
                    {uploadingImage
                      ? "Mengunggah..."
                      : "Ganti Gambar"}
                  </button>

                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    disabled={uploadingImage}
                    className="rounded-xl border border-red-500/20 px-5 py-3 text-sm font-semibold text-red-300 transition hover:bg-red-500/5 disabled:opacity-50"
                  >
                    Hapus Gambar
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* ===================================================
            NOTICE
        =================================================== */}
        <section className="rounded-3xl border border-amber-500/20 bg-amber-500/5 p-6 md:p-8">
          <div className="flex gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500 text-lg text-black">
              i
            </div>

            <div>
              <h3 className="font-bold text-white">
                Pengaturan Kurator
              </h3>

              <p className="mt-2 text-sm leading-7 text-gray-400">
                Pada halaman Editor ini tidak tersedia
                pilihan untuk menerbitkan berita atau
                menjadikannya berita unggulan.
                Pengaturan tersebut tetap dilakukan
                oleh Kurator dari halaman daftar berita.
              </p>
            </div>
          </div>
        </section>

        {/* ===================================================
            ACTION
        =================================================== */}
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={() =>
              router.push("/admin/berita")
            }
            disabled={submitting || uploadingImage}
            className="rounded-xl border border-white/10 px-6 py-3 text-sm font-semibold text-gray-400 transition hover:border-white/20 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            Batal
          </button>

          <button
            type="submit"
            disabled={
              submitting ||
              uploadingImage ||
              loading
            }
            className="rounded-xl bg-amber-500 px-6 py-3 text-sm font-bold text-black transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting
              ? "Menyimpan..."
              : "Simpan Perubahan"}
          </button>
        </div>
      </form>
    </div>
  );
}