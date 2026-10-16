"use client";

import {
  ChangeEvent,
  FormEvent,
  useEffect,
  useRef,
  useState,
} from "react";

import { useRouter } from "next/navigation";

type Category = {
  id: string;
  name: string;
};

type Committee = {
  id: string;
  name: string;
  slug: string;
};

export default function TambahBeritaPage() {
  const router = useRouter();

  const fileInputRef =
    useRef<HTMLInputElement | null>(
      null,
    );

  const [title, setTitle] =
    useState("");

  const [slug, setSlug] =
    useState("");

  const [subtitle, setSubtitle] =
    useState("");

  const [excerpt, setExcerpt] =
    useState("");

  const [content, setContent] =
    useState("");

  const [
    featuredImage,
    setFeaturedImage,
  ] = useState("");

  const [
    imagePreview,
    setImagePreview,
  ] = useState("");

  const [
    categoryId,
    setCategoryId,
  ] = useState("");

  const [
    committeeId,
    setCommitteeId,
  ] = useState("");

  const [
    categories,
    setCategories,
  ] = useState<Category[]>(
    [],
  );

  const [
    committees,
    setCommittees,
  ] = useState<Committee[]>(
    [],
  );

  const [
    loadingData,
    setLoadingData,
  ] = useState(true);

  const [
    uploadingImage,
    setUploadingImage,
  ] = useState(false);

  const [
    submitting,
    setSubmitting,
  ] = useState(false);

  const [message, setMessage] =
    useState("");

  const [slugEdited, setSlugEdited] =
    useState(false);

  const [error, setError] =
    useState("");

  /*
   * ============================================================
   * OPTIONS
   * ============================================================
   */
  useEffect(() => {
    async function loadData() {
      try {
        const response =
          await fetch(
            "/api/admin/news/options",
            {
              cache: "no-store",
            },
          );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
              "Gagal mengambil kategori dan komite.",
          );
        }

        setCategories(
          Array.isArray(
            data.categories,
          )
            ? data.categories
            : [],
        );

        setCommittees(
          Array.isArray(
            data.committees,
          )
            ? data.committees
            : [],
        );
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Gagal mengambil data.",
        );
      } finally {
        setLoadingData(false);
      }
    }

    loadData();
  }, []);

  /*
   * ============================================================
   * SLUG
   * ============================================================
   */
  function generateSlug(
    value: string,
  ) {
    return value
      .toLowerCase()
      .trim()
      .normalize("NFKD")
      .replace(
        /[\u0300-\u036f]/g,
        "",
      )
      .replace(
        /[^a-z0-9\s-]/g,
        "",
      )
      .replace(
        /\s+/g,
        "-",
      )
      .replace(
        /-+/g,
        "-",
      )
      .replace(
        /^-|-$/g,
        "");
  }

  function handleTitleChange(
    value: string,
  ) {
    setTitle(value);

    if (!slugEdited) {
      setSlug(
        generateSlug(value),
      );
    }
  }

  function handleSlugChange(
    value: string,
  ) {
    setSlugEdited(true);
    setSlug(
      generateSlug(value),
    );
  }

  /*
   * ============================================================
   * IMAGE UPLOAD
   * ============================================================
   */
  async function handleImageChange(
    event: ChangeEvent<HTMLInputElement>,
  ) {
    const file =
      event.target.files?.[0];

    if (!file) {
      return;
    }

    setError("");
    setMessage("");

    if (
      file.size >
      5 * 1024 * 1024
    ) {
      setError(
        "Ukuran gambar maksimal 5 MB.",
      );

      event.target.value = "";
      return;
    }

    if (
      !file.type.startsWith(
        "image/",
      )
    ) {
      setError(
        "File yang dipilih harus berupa gambar.",
      );

      event.target.value = "";
      return;
    }

    const localPreview =
      URL.createObjectURL(file);

    setImagePreview(
      localPreview,
    );

    setUploadingImage(true);

    try {
      const formData =
        new FormData();

      formData.append(
        "file",
        file,
      );
      formData.append("scope", "news");
      formData.append("intent", "create");

      const response =
        await fetch(
          "/api/admin/media/upload",
          {
            method: "POST",
            body: formData,
          },
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Gagal mengunggah gambar.",
        );
      }

      const url =
        data.url ||
        data.data?.url ||
        "";

      if (!url) {
        throw new Error(
          "URL gambar tidak diterima dari server.",
        );
      }

      setFeaturedImage(url);
      setImagePreview(url);

      setMessage(
        "Featured image berhasil diunggah.",
      );
    } catch (error) {
      setImagePreview(
        featuredImage,
      );

      setError(
        error instanceof Error
          ? error.message
          : "Gagal mengunggah gambar.",
      );
    } finally {
      setUploadingImage(false);
      event.target.value = "";
    }
  }

  function removeImage() {
    setFeaturedImage("");
    setImagePreview("");
  }

  /*
   * ============================================================
   * SUBMIT
   * ============================================================
   */
  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setSubmitting(true);
    setError("");
    setMessage("");

    try {
      const response =
        await fetch(
          "/api/admin/news",
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              title,
              slug,
              subtitle,
              excerpt,
              content,
              featuredImage,
              categoryId,
              committeeId,
            }),
          },
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Gagal menyimpan berita.",
        );
      }

      setMessage(
        "Berita berhasil disimpan sebagai Draft.",
      );

      setTimeout(() => {
        router.push(
          "/admin/berita",
        );

        router.refresh();
      }, 700);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Gagal menyimpan berita.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  /*
   * ============================================================
   * LOADING
   * ============================================================
   */
  if (loadingData) {
    return (
      <div className="mx-auto max-w-5xl">
        <div className="rounded-3xl border border-white/10 bg-[#0b0b0b] p-10">
          <p className="text-gray-400">
            Memuat formulir berita...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl pb-20">
      {/* HEADER */}
      <section className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-amber-400">
            CMS DKKT
          </p>

          <h1 className="mt-2 text-3xl font-black text-white md:text-4xl">
            Tambah Berita
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-7 text-gray-400">
            Buat berita baru untuk diperiksa oleh Kurator
            sebelum diterbitkan ke portal publik.
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            router.push(
              "/admin/berita",
            )
          }
          className="rounded-xl border border-white/10 px-5 py-3 text-sm font-semibold text-gray-400 transition hover:border-amber-400/40 hover:text-amber-300"
        >
          ← Kembali
        </button>
      </section>

      {/* WORKFLOW */}
      <section className="mt-6 rounded-2xl border border-amber-500/20 bg-amber-500/5 p-5">
        <div className="flex gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500 font-black text-black">
            D
          </div>

          <div>
            <p className="font-bold text-white">
              Berita akan disimpan sebagai DRAFT
            </p>

            <p className="mt-1 text-sm leading-7 text-gray-400">
              Setelah disimpan, Kurator akan memeriksa
              isi berita melalui Preview Internal sebelum
              menentukan Publish atau mengembalikannya
              kepada Editor.
            </p>
          </div>
        </div>
      </section>

      {/* ALERT */}
      {error && (
        <div className="mt-6 rounded-2xl border border-red-500/20 bg-red-500/5 px-5 py-4 text-sm text-red-300">
          {error}
        </div>
      )}

      {message && (
        <div className="mt-6 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 px-5 py-4 text-sm text-emerald-300">
          {message}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="mt-8 space-y-6"
      >
        {/* CONTENT */}
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
                value={title}
                onChange={(event) =>
                  handleTitleChange(
                    event.target.value,
                  )
                }
                required
                placeholder="Masukkan judul berita..."
                className="w-full rounded-2xl border border-white/10 bg-white/3 px-4 py-3.5 text-white outline-none placeholder:text-gray-600 focus:border-amber-400/60"
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
                value={slug}
                onChange={(event) =>
                  handleSlugChange(
                    event.target.value,
                  )
                }
                className="w-full rounded-2xl border border-white/10 bg-white/3 px-4 py-3.5 text-sm text-white outline-none focus:border-amber-400/60"
              />
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
                value={subtitle}
                onChange={(event) =>
                  setSubtitle(
                    event.target.value,
                  )
                }
                placeholder="Subjudul berita..."
                className="w-full rounded-2xl border border-white/10 bg-white/3 px-4 py-3.5 text-white outline-none placeholder:text-gray-600 focus:border-amber-400/60"
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
                rows={4}
                value={excerpt}
                onChange={(event) =>
                  setExcerpt(
                    event.target.value,
                  )
                }
                placeholder="Ringkasan singkat berita..."
                className="w-full rounded-2xl border border-white/10 bg-white/3 px-4 py-3.5 text-sm leading-7 text-white outline-none placeholder:text-gray-600 focus:border-amber-400/60"
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
                rows={16}
                value={content}
                onChange={(event) =>
                  setContent(
                    event.target.value,
                  )
                }
                required
                placeholder="Tuliskan isi berita..."
                className="w-full rounded-2xl border border-white/10 bg-white/3 px-4 py-3.5 text-sm leading-8 text-white outline-none placeholder:text-gray-600 focus:border-amber-400/60"
              />
            </div>
          </div>
        </section>

        {/* CLASSIFICATION */}
        <section className="rounded-3xl border border-white/10 bg-[#0b0b0b] p-6 md:p-8">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-amber-400">
            Klasifikasi
          </p>

          <h2 className="mt-2 text-xl font-black text-white">
            Kategori & Komite
          </h2>

          <div className="mt-6 grid gap-5 md:grid-cols-2">
            <div>
              <label
                htmlFor="category"
                className="mb-2 block text-sm font-semibold text-gray-200"
              >
                Kategori
              </label>

              <select
                id="category"
                value={categoryId}
                onChange={(event) =>
                  setCategoryId(
                    event.target.value,
                  )
                }
                className="w-full rounded-2xl border border-white/10 bg-[#111111] px-4 py-3.5 text-white outline-none focus:border-amber-400/60"
              >
                <option value="">
                  Pilih kategori
                </option>

                {categories.map(
                  (category) => (
                    <option
                      key={category.id}
                      value={category.id}
                    >
                      {category.name}
                    </option>
                  ),
                )}
              </select>
            </div>

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
                    event.target.value,
                  )
                }
                className="w-full rounded-2xl border border-white/10 bg-[#111111] px-4 py-3.5 text-white outline-none focus:border-amber-400/60"
              >
                <option value="">
                  Pilih komite
                </option>

                {committees.map(
                  (committee) => (
                    <option
                      key={committee.id}
                      value={committee.id}
                    >
                      {committee.name}
                    </option>
                  ),
                )}
              </select>
            </div>
          </div>
        </section>

        {/* IMAGE */}
        <section className="rounded-3xl border border-white/10 bg-[#0b0b0b] p-6 md:p-8">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-amber-400">
            Media
          </p>

          <h2 className="mt-2 text-xl font-black text-white">
            Featured Image
          </h2>

          <p className="mt-2 text-sm text-gray-500">
            JPG, PNG, WEBP, atau GIF. Maksimal 5 MB.
          </p>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={
              handleImageChange
            }
            className="hidden"
          />

          <div className="mt-6">
            {!imagePreview ? (
              <button
                type="button"
                onClick={() =>
                  fileInputRef.current?.click()
                }
                disabled={
                  uploadingImage
                }
                className="flex w-full flex-col items-center justify-center rounded-3xl border border-dashed border-white/10 bg-white/2 px-6 py-12 transition hover:border-amber-400/40"
              >
                <span className="text-4xl">
                  🖼️
                </span>

                <span className="mt-4 text-sm font-bold text-white">
                  Pilih Gambar
                </span>

                <span className="mt-2 text-xs text-gray-600">
                  Klik untuk memilih dari komputer
                </span>
              </button>
            ) : (
              <div className="overflow-hidden rounded-3xl border border-white/10 bg-black">
                <img
                  src={imagePreview}
                  alt="Featured image"
                  className="max-h-120 w-full object-contain"
                />

                <div className="flex flex-col gap-3 border-t border-white/10 p-4 sm:flex-row sm:justify-between">
                  <button
                    type="button"
                    onClick={() =>
                      fileInputRef.current?.click()
                    }
                    disabled={
                      uploadingImage
                    }
                    className="rounded-xl border border-white/10 px-5 py-3 text-sm font-semibold text-gray-300 hover:border-amber-400/40 hover:text-amber-300"
                  >
                    Ganti Gambar
                  </button>

                  <button
                    type="button"
                    onClick={
                      removeImage
                    }
                    disabled={
                      uploadingImage
                    }
                    className="rounded-xl border border-red-500/20 px-5 py-3 text-sm font-semibold text-red-300 hover:bg-red-500/5"
                  >
                    Hapus Gambar
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* NO PUBLISH */}
        <section className="rounded-3xl border border-emerald-500/20 bg-emerald-500/5 p-6">
          <p className="font-bold text-emerald-300">
            🔒 Pengaturan Publikasi
          </p>

          <p className="mt-2 text-sm leading-7 text-gray-400">
            Berita ini otomatis disimpan sebagai{" "}
            <strong className="text-amber-300">
              DRAFT
            </strong>
            . Hanya Kurator yang dapat menerbitkan
            berita dan menentukan berita unggulan.
          </p>
        </section>

        {/* ACTION */}
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={() =>
              router.push(
                "/admin/berita",
              )
            }
            disabled={
              submitting ||
              uploadingImage
            }
            className="rounded-xl border border-white/10 px-6 py-3 text-sm font-semibold text-gray-400 hover:text-white"
          >
            Batal
          </button>

          <button
            type="submit"
            disabled={
              submitting ||
              uploadingImage
            }
            className="rounded-xl bg-amber-500 px-6 py-3 text-sm font-bold text-black transition hover:bg-amber-400 disabled:opacity-50"
          >
            {submitting
              ? "Menyimpan..."
              : "Simpan sebagai Draft"}
          </button>
        </div>
      </form>
    </div>
  );
}