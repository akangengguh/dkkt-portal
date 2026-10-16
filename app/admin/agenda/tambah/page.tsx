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
  slug?: string;
};

export default function TambahAgendaPage() {
  const router = useRouter();

  const fileInputRef =
    useRef<HTMLInputElement | null>(
      null,
    );

  const [title, setTitle] =
    useState("");

  const [slug, setSlug] =
    useState("");

  const [description, setDescription] =
    useState("");

  const [excerpt, setExcerpt] =
    useState("");

  const [image, setImage] =
    useState("");

  const [imagePreview, setImagePreview] =
    useState("");

  const [uploadingImage, setUploadingImage] =
    useState(false);

  const [committeeId, setCommitteeId] =
    useState("");

  const [categoryId, setCategoryId] =
    useState("");

  const [startDate, setStartDate] =
    useState("");

  const [endDate, setEndDate] =
    useState("");

  const [startTime, setStartTime] =
    useState("");

  const [endTime, setEndTime] =
    useState("");

  const [location, setLocation] =
    useState("");

  const [address, setAddress] =
    useState("");

  const [registrationUrl, setRegistrationUrl] =
    useState("");

  const [registrationText, setRegistrationText] =
    useState("");

  const [contactName, setContactName] =
    useState("");

  const [contactPhone, setContactPhone] =
    useState("");

  const [contactEmail, setContactEmail] =
    useState("");

  const [organizer, setOrganizer] =
    useState("");

  const [target, setTarget] =
    useState("");

  const [notes, setNotes] =
    useState("");

  const [categories, setCategories] =
    useState<Category[]>([]);

  const [committees, setCommittees] =
    useState<Committee[]>([]);

  const [loadingData, setLoadingData] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const [message, setMessage] =
    useState("");

  const [slugEdited, setSlugEdited] =
    useState(false);

  /*
   * ============================================================
   * LOAD KATEGORI + KOMITE
   * ============================================================
   */
  useEffect(() => {
    let active = true;

    async function loadOptions() {
      try {
        const response =
          await fetch(
            "/api/admin/agenda/options",
            {
              cache:
                "no-store",
            },
          );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
              "Gagal mengambil data Agenda.",
          );
        }

        if (!active) {
          return;
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
        if (active) {
          setError(
            error instanceof Error
              ? error.message
              : "Gagal mengambil kategori dan komite.",
          );
        }
      } finally {
        if (active) {
          setLoadingData(
            false,
          );
        }
      }
    }

    loadOptions();

    return () => {
      active = false;
    };
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

  function handleTitle(
    value: string,
  ) {
    setTitle(value);

    if (!slugEdited) {
      setSlug(
        generateSlug(
          value,
        ),
      );
    }
  }

  function handleSlugChange(
    value: string,
  ) {
    const nextSlug =
      generateSlug(value);

    setSlug(nextSlug);
    setSlugEdited(true);
  }

  /*
   * ============================================================
   * UPLOAD GAMBAR
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

    /*
     * Maksimal 5 MB
     */
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

    /*
     * Harus gambar
     */
    if (
      !file.type.startsWith(
        "image/",
      )
    ) {
      setError(
        "File harus berupa gambar.",
      );

      event.target.value = "";

      return;
    }

    /*
     * Preview lokal
     */
    const localPreview =
      URL.createObjectURL(
        file,
      );

    setImagePreview(
      localPreview,
    );

    setUploadingImage(
      true,
    );

    try {
      const formData =
        new FormData();

      formData.append(
        "file",
        file,
      );
      formData.append("scope", "agenda");
      formData.append("intent", "create");

      const response =
        await fetch(
          "/api/admin/media/upload",
          {
            method:
              "POST",
            body:
              formData,
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

      setImage(url);

      setImagePreview(
        url,
      );

      setMessage(
        "Gambar Agenda berhasil diunggah.",
      );
    } catch (error) {
      setImagePreview("");

      setError(
        error instanceof Error
          ? error.message
          : "Gagal mengunggah gambar.",
      );
    } finally {
      setUploadingImage(
        false,
      );

      event.target.value = "";
    }
  }

  /*
   * ============================================================
   * HAPUS GAMBAR
   * ============================================================
   */
  function removeImage() {
    setImage("");
    setImagePreview("");
  }

  /*
   * ============================================================
   * SUBMIT
   * ============================================================
   */
  async function submit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setSaving(true);
    setError("");
    setMessage("");

    try {
      const response =
        await fetch(
          "/api/admin/agenda",
          {
            method:
              "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify({
                title,

                slug,

                description,

                excerpt,

                image,

                committeeId,

                categoryId,

                startDate,

                endDate,

                startTime,

                endTime,

                location,

                address,

                registrationUrl,

                registrationText,

                contactName,

                contactPhone,

                contactEmail,

                organizer,

                target,

                notes,
              }),
          },
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Gagal menyimpan agenda.",
        );
      }

      setMessage(
        "Agenda berhasil disimpan sebagai Draft.",
      );

      setTimeout(() => {
        router.push(
          "/admin/agenda",
        );

        router.refresh();
      }, 700);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Gagal menyimpan agenda.",
      );
    } finally {
      setSaving(false);
    }
  }

  /*
   * ============================================================
   * LOADING
   * ============================================================
   */
  if (loadingData) {
    return (
      <div className="mx-auto max-w-5xl pb-20">
        <div className="rounded-3xl border border-white/10 bg-[#0b0b0b] p-10 text-gray-400">
          Memuat formulir Agenda...
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl pb-20">
      {/* ======================================================
          HEADER
      ====================================================== */}
      <section className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-amber-400">
            CMS DKKT
          </p>

          <h1 className="mt-2 text-3xl font-black text-white md:text-4xl">
            Tambah Agenda
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-7 text-gray-400">
            Tambahkan informasi kegiatan resmi DKKT
            untuk ditampilkan sebagai timeline kegiatan
            dan informasi publik.
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            router.push(
              "/admin/agenda",
            )
          }
          className="rounded-xl border border-white/10 px-5 py-3 text-sm font-semibold text-gray-400 transition hover:border-amber-400/40 hover:text-amber-300"
        >
          ← Kembali
        </button>
      </section>

      {/* ======================================================
          WORKFLOW
      ====================================================== */}
      <section className="mt-6 rounded-2xl border border-amber-500/20 bg-amber-500/5 p-5">
        <div className="flex gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500 font-black text-black">
            D
          </div>

          <div>
            <p className="font-bold text-white">
              Agenda akan disimpan sebagai DRAFT
            </p>

            <p className="mt-1 text-sm leading-7 text-gray-400">
              Editor mengisi informasi kegiatan.
              Kurator yang menentukan apakah agenda
              diterbitkan ke portal publik.
            </p>
          </div>
        </div>
      </section>

      {/* ======================================================
          ALERT
      ====================================================== */}
      {error && (
        <div className="mt-6 rounded-2xl border border-red-500/20 bg-red-500/5 px-5 py-4 text-sm leading-6 text-red-300">
          {error}
        </div>
      )}

      {message && (
        <div className="mt-6 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 px-5 py-4 text-sm leading-6 text-emerald-300">
          {message}
        </div>
      )}

      <form
        onSubmit={submit}
        className="mt-8 space-y-6"
      >
        {/* ====================================================
            INFORMASI DASAR
        ==================================================== */}
        <section className="rounded-3xl border border-white/10 bg-[#0b0b0b] p-6 md:p-8">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-amber-400">
            Informasi
          </p>

          <h2 className="mt-2 text-xl font-black text-white">
            Informasi Agenda
          </h2>

          <div className="mt-6 space-y-5">
            {/* JUDUL */}
            <div>
              <label
                htmlFor="agenda-title"
                className="mb-2 block text-sm font-semibold text-gray-200"
              >
                Judul Kegiatan
              </label>

              <input
                id="agenda-title"
                type="text"
                value={title}
                onChange={(event) =>
                  handleTitle(
                    event.target.value,
                  )
                }
                required
                placeholder="Contoh: Festival Seni Tasikmalaya 2026"
                className="w-full rounded-2xl border border-white/10 bg-white/3 px-4 py-3.5 text-white outline-none placeholder:text-gray-600 focus:border-amber-400/60"
              />
            </div>

            {/* SLUG */}
            <div>
              <label
                htmlFor="agenda-slug"
                className="mb-2 block text-sm font-semibold text-gray-200"
              >
                Slug
              </label>

              <input
                id="agenda-slug"
                type="text"
                value={slug}
                onChange={(event) =>
                  handleSlugChange(
                    event.target.value,
                  )
                }
                placeholder="festival-seni-tasikmalaya-2026"
                className="w-full rounded-2xl border border-white/10 bg-white/3 px-4 py-3.5 text-sm text-gray-300 outline-none focus:border-amber-400/60"
              />

              <p className="mt-2 text-xs text-gray-600">
                Digunakan sebagai alamat detail agenda.
              </p>
            </div>

            {/* RINGKASAN */}
            <div>
              <label
                htmlFor="agenda-excerpt"
                className="mb-2 block text-sm font-semibold text-gray-200"
              >
                Ringkasan
              </label>

              <textarea
                id="agenda-excerpt"
                value={excerpt}
                onChange={(event) =>
                  setExcerpt(
                    event.target.value,
                  )
                }
                rows={4}
                placeholder="Ringkasan singkat kegiatan..."
                className="w-full rounded-2xl border border-white/10 bg-white/3 px-4 py-3.5 text-sm leading-7 text-white outline-none placeholder:text-gray-600 focus:border-amber-400/60"
              />
            </div>

            {/* DESKRIPSI */}
            <div>
              <label
                htmlFor="agenda-description"
                className="mb-2 block text-sm font-semibold text-gray-200"
              >
                Deskripsi Kegiatan
              </label>

              <textarea
                id="agenda-description"
                value={description}
                onChange={(event) =>
                  setDescription(
                    event.target.value,
                  )
                }
                required
                rows={12}
                placeholder="Tuliskan informasi lengkap kegiatan..."
                className="w-full rounded-2xl border border-white/10 bg-white/3 px-4 py-3.5 text-sm leading-8 text-white outline-none placeholder:text-gray-600 focus:border-amber-400/60"
              />

              <p className="mt-2 text-xs text-gray-600">
                Tuliskan informasi kegiatan dengan lengkap
                dan mudah dipahami masyarakat.
              </p>
            </div>
          </div>
        </section>

        {/* ====================================================
            KLASIFIKASI
        ==================================================== */}
        <section className="rounded-3xl border border-white/10 bg-[#0b0b0b] p-6 md:p-8">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-amber-400">
            Klasifikasi
          </p>

          <h2 className="mt-2 text-xl font-black text-white">
            Kategori & Komite
          </h2>

          <p className="mt-2 text-sm leading-7 text-gray-500">
            Digunakan untuk mengelompokkan kegiatan
            pada portal publik DKKT.
          </p>

          <div className="mt-6 grid gap-5 md:grid-cols-2">
            {/* KATEGORI */}
            <div>
              <label
                htmlFor="agenda-category"
                className="mb-2 block text-sm font-semibold text-gray-200"
              >
                Kategori Kegiatan
              </label>

              <select
                id="agenda-category"
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
                  (item) => (
                    <option
                      key={
                        item.id
                      }
                      value={
                        item.id
                      }
                    >
                      {item.name}
                    </option>
                  ),
                )}
              </select>

              {categories.length ===
                0 && (
                <p className="mt-2 text-xs text-red-400">
                  Kategori belum tersedia.
                </p>
              )}
            </div>

            {/* KOMITE */}
            <div>
              <label
                htmlFor="agenda-committee"
                className="mb-2 block text-sm font-semibold text-gray-200"
              >
                Komite
              </label>

              <select
                id="agenda-committee"
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
                  (item) => (
                    <option
                      key={
                        item.id
                      }
                      value={
                        item.id
                      }
                    >
                      {item.name}
                    </option>
                  ),
                )}
              </select>

              {committees.length ===
                0 && (
                <p className="mt-2 text-xs text-red-400">
                  Data komite belum tersedia.
                </p>
              )}
            </div>
          </div>
        </section>

        {/* ====================================================
            WAKTU
        ==================================================== */}
        <section className="rounded-3xl border border-white/10 bg-[#0b0b0b] p-6 md:p-8">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-amber-400">
            Waktu
          </p>

          <h2 className="mt-2 text-xl font-black text-white">
            Waktu Kegiatan
          </h2>

          <div className="mt-6 grid gap-5 md:grid-cols-2">
            {/* TANGGAL MULAI */}
            <div>
              <label
                htmlFor="agenda-start-date"
                className="mb-2 block text-sm font-semibold text-gray-200"
              >
                Tanggal Mulai
              </label>

              <input
                id="agenda-start-date"
                type="date"
                value={
                  startDate
                }
                onChange={(event) =>
                  setStartDate(
                    event.target.value,
                  )
                }
                required
                style={{
                  colorScheme:
                    "dark",
                }}
                className="w-full rounded-2xl border border-white/10 bg-[#111111] px-4 py-3.5 text-white outline-none focus:border-amber-400/60"
              />
            </div>

            {/* TANGGAL SELESAI */}
            <div>
              <label
                htmlFor="agenda-end-date"
                className="mb-2 block text-sm font-semibold text-gray-200"
              >
                Tanggal Selesai
              </label>

              <input
                id="agenda-end-date"
                type="date"
                value={
                  endDate
                }
                onChange={(event) =>
                  setEndDate(
                    event.target.value,
                  )
                }
                style={{
                  colorScheme:
                    "dark",
                }}
                className="w-full rounded-2xl border border-white/10 bg-[#111111] px-4 py-3.5 text-white outline-none focus:border-amber-400/60"
              />
            </div>

            {/* JAM MULAI */}
            <div>
              <label
                htmlFor="agenda-start-time"
                className="mb-2 block text-sm font-semibold text-gray-200"
              >
                Jam Mulai
              </label>

              <input
                id="agenda-start-time"
                type="time"
                value={
                  startTime
                }
                onChange={(event) =>
                  setStartTime(
                    event.target.value,
                  )
                }
                style={{
                  colorScheme:
                    "dark",
                }}
                className="w-full rounded-2xl border border-white/10 bg-[#111111] px-4 py-3.5 text-white outline-none focus:border-amber-400/60"
              />
            </div>

            {/* JAM SELESAI */}
            <div>
              <label
                htmlFor="agenda-end-time"
                className="mb-2 block text-sm font-semibold text-gray-200"
              >
                Jam Selesai
              </label>

              <input
                id="agenda-end-time"
                type="time"
                value={
                  endTime
                }
                onChange={(event) =>
                  setEndTime(
                    event.target.value,
                  )
                }
                style={{
                  colorScheme:
                    "dark",
                }}
                className="w-full rounded-2xl border border-white/10 bg-[#111111] px-4 py-3.5 text-white outline-none focus:border-amber-400/60"
              />
            </div>
          </div>
        </section>

        {/* ====================================================
            LOKASI
        ==================================================== */}
        <section className="rounded-3xl border border-white/10 bg-[#0b0b0b] p-6 md:p-8">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-amber-400">
            Lokasi
          </p>

          <h2 className="mt-2 text-xl font-black text-white">
            Lokasi Kegiatan
          </h2>

          <div className="mt-6 space-y-5">
            <div>
              <label
                htmlFor="agenda-location"
                className="mb-2 block text-sm font-semibold text-gray-200"
              >
                Nama Tempat
              </label>

              <input
                id="agenda-location"
                type="text"
                value={
                  location
                }
                onChange={(event) =>
                  setLocation(
                    event.target.value,
                  )
                }
                placeholder="Contoh: Gedung Kesenian Dadaha"
                className="w-full rounded-2xl border border-white/10 bg-white/3 px-4 py-3.5 text-white outline-none placeholder:text-gray-600 focus:border-amber-400/60"
              />
            </div>

            <div>
              <label
                htmlFor="agenda-address"
                className="mb-2 block text-sm font-semibold text-gray-200"
              >
                Alamat
              </label>

              <textarea
                id="agenda-address"
                value={
                  address
                }
                onChange={(event) =>
                  setAddress(
                    event.target.value,
                  )
                }
                rows={4}
                placeholder="Alamat lengkap lokasi kegiatan..."
                className="w-full rounded-2xl border border-white/10 bg-white/3 px-4 py-3.5 text-white outline-none placeholder:text-gray-600 focus:border-amber-400/60"
              />
            </div>
          </div>
        </section>

        {/* ====================================================
            PENDAFTARAN
        ==================================================== */}
        <section className="rounded-3xl border border-white/10 bg-[#0b0b0b] p-6 md:p-8">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-amber-400">
            Pendaftaran
          </p>

          <h2 className="mt-2 text-xl font-black text-white">
            Informasi Pendaftaran
          </h2>

          <p className="mt-2 text-sm leading-7 text-gray-500">
            Opsional. Isi tautan jika peserta perlu mendaftar.
          </p>

          <div className="mt-6 space-y-5">
            <div>
              <label
                htmlFor="agenda-registration-url"
                className="mb-2 block text-sm font-semibold text-gray-200"
              >
                Tautan Pendaftaran
              </label>

              <input
                id="agenda-registration-url"
                type="url"
                value={registrationUrl}
                onChange={(event) =>
                  setRegistrationUrl(event.target.value)
                }
                placeholder="https://..."
                className="w-full rounded-2xl border border-white/10 bg-white/3 px-4 py-3.5 text-white outline-none placeholder:text-gray-600 focus:border-amber-400/60"
              />
            </div>

            <div>
              <label
                htmlFor="agenda-registration-text"
                className="mb-2 block text-sm font-semibold text-gray-200"
              >
                Keterangan Pendaftaran
              </label>

              <textarea
                id="agenda-registration-text"
                value={registrationText}
                onChange={(event) =>
                  setRegistrationText(event.target.value)
                }
                rows={3}
                placeholder="Contoh: Pendaftaran dibuka hingga 20 September 2026."
                className="w-full rounded-2xl border border-white/10 bg-white/3 px-4 py-3.5 text-white outline-none placeholder:text-gray-600 focus:border-amber-400/60"
              />
            </div>
          </div>
        </section>

        {/* ====================================================
            NARAHUBUNG
        ==================================================== */}
        <section className="rounded-3xl border border-white/10 bg-[#0b0b0b] p-6 md:p-8">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-amber-400">
            Informasi Kontak
          </p>

          <h2 className="mt-2 text-xl font-black text-white">
            Narahubung
          </h2>

          <p className="mt-2 text-sm leading-7 text-gray-500">
            Opsional. Digunakan hanya sebagai informasi
            kontak publik.
          </p>

          <div className="mt-6 grid gap-5 md:grid-cols-3">
            <div>
              <label
                htmlFor="agenda-contact-name"
                className="mb-2 block text-sm font-semibold text-gray-200"
              >
                Nama
              </label>

              <input
                id="agenda-contact-name"
                type="text"
                value={
                  contactName
                }
                onChange={(event) =>
                  setContactName(
                    event.target.value,
                  )
                }
                placeholder="Nama narahubung"
                className="w-full rounded-2xl border border-white/10 bg-white/3 px-4 py-3.5 text-white outline-none placeholder:text-gray-600 focus:border-amber-400/60"
              />
            </div>

            <div>
              <label
                htmlFor="agenda-contact-phone"
                className="mb-2 block text-sm font-semibold text-gray-200"
              >
                Nomor Telepon
              </label>

              <input
                id="agenda-contact-phone"
                type="text"
                value={
                  contactPhone
                }
                onChange={(event) =>
                  setContactPhone(
                    event.target.value,
                  )
                }
                placeholder="08xxxxxxxxxx"
                className="w-full rounded-2xl border border-white/10 bg-white/3 px-4 py-3.5 text-white outline-none placeholder:text-gray-600 focus:border-amber-400/60"
              />
            </div>

            <div>
              <label
                htmlFor="agenda-contact-email"
                className="mb-2 block text-sm font-semibold text-gray-200"
              >
                Email
              </label>

              <input
                id="agenda-contact-email"
                type="email"
                value={
                  contactEmail
                }
                onChange={(event) =>
                  setContactEmail(
                    event.target.value,
                  )
                }
                placeholder="email@contoh.com"
                className="w-full rounded-2xl border border-white/10 bg-white/3 px-4 py-3.5 text-white outline-none placeholder:text-gray-600 focus:border-amber-400/60"
              />
            </div>
          </div>
        </section>

        {/* ====================================================
            INFORMASI TAMBAHAN
        ==================================================== */}
        <section className="rounded-3xl border border-white/10 bg-[#0b0b0b] p-6 md:p-8">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-amber-400">
            Tambahan
          </p>

          <h2 className="mt-2 text-xl font-black text-white">
            Informasi Tambahan
          </h2>

          <div className="mt-6 space-y-5">
            {/* PENYELENGGARA */}
            <div>
              <label
                htmlFor="agenda-organizer"
                className="mb-2 block text-sm font-semibold text-gray-200"
              >
                Penyelenggara
              </label>

              <input
                id="agenda-organizer"
                type="text"
                value={
                  organizer
                }
                onChange={(event) =>
                  setOrganizer(
                    event.target.value,
                  )
                }
                placeholder="Nama penyelenggara"
                className="w-full rounded-2xl border border-white/10 bg-white/3 px-4 py-3.5 text-white outline-none placeholder:text-gray-600 focus:border-amber-400/60"
              />
            </div>

            {/* SASARAN */}
            <div>
              <label
                htmlFor="agenda-target"
                className="mb-2 block text-sm font-semibold text-gray-200"
              >
                Sasaran / Peserta
              </label>

              <input
                id="agenda-target"
                type="text"
                value={
                  target
                }
                onChange={(event) =>
                  setTarget(
                    event.target.value,
                  )
                }
                placeholder="Contoh: Seniman, budayawan, pelajar, masyarakat umum"
                className="w-full rounded-2xl border border-white/10 bg-white/3 px-4 py-3.5 text-white outline-none placeholder:text-gray-600 focus:border-amber-400/60"
              />
            </div>

            {/* CATATAN */}
            <div>
              <label
                htmlFor="agenda-notes"
                className="mb-2 block text-sm font-semibold text-gray-200"
              >
                Catatan
              </label>

              <textarea
                id="agenda-notes"
                value={
                  notes
                }
                onChange={(event) =>
                  setNotes(
                    event.target.value,
                  )
                }
                rows={5}
                placeholder="Catatan tambahan kegiatan..."
                className="w-full rounded-2xl border border-white/10 bg-white/3 px-4 py-3.5 text-white outline-none placeholder:text-gray-600 focus:border-amber-400/60"
              />
            </div>
          </div>
        </section>

        {/* ====================================================
            GAMBAR
        ==================================================== */}
        <section className="rounded-3xl border border-white/10 bg-[#0b0b0b] p-6 md:p-8">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-amber-400">
            Media
          </p>

          <h2 className="mt-2 text-xl font-black text-white">
            Gambar Kegiatan
          </h2>

          <p className="mt-2 text-sm leading-7 text-gray-500">
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
                className="flex w-full flex-col items-center justify-center rounded-3xl border border-dashed border-white/10 bg-white/2 px-6 py-12 transition hover:border-amber-400/40 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <span className="text-4xl">
                  🖼️
                </span>

                <span className="mt-4 text-sm font-bold text-white">
                  Pilih Gambar
                </span>

                <span className="mt-2 text-xs text-gray-600">
                  Ambil gambar dari komputer
                </span>
              </button>
            ) : (
              <div className="overflow-hidden rounded-3xl border border-white/10 bg-black">
                <img
                  src={
                    imagePreview
                  }
                  alt="Preview gambar kegiatan"
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
                    className="rounded-xl border border-white/10 px-5 py-3 text-sm font-semibold text-gray-300 hover:border-amber-400/40 hover:text-amber-300 disabled:opacity-50"
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
                    className="rounded-xl border border-red-500/20 px-5 py-3 text-sm font-semibold text-red-300 hover:bg-red-500/5 disabled:opacity-50"
                  >
                    Hapus Gambar
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* ====================================================
            PUBLIKASI
        ==================================================== */}
        <section className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-5">
          <p className="font-bold text-emerald-300">
            🔒 Publikasi dikendalikan Kurator
          </p>

          <p className="mt-2 text-sm leading-7 text-gray-400">
            Agenda yang dibuat oleh Editor otomatis
            menjadi{" "}
            <strong className="text-amber-300">
              DRAFT
            </strong>
            . Agenda baru tampil di portal publik
            setelah diterbitkan oleh Kurator.
          </p>
        </section>

        {/* ====================================================
            BUTTON
        ==================================================== */}
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            disabled={
              saving ||
              uploadingImage
            }
            onClick={() =>
              router.push(
                "/admin/agenda",
              )
            }
            className="rounded-xl border border-white/10 px-6 py-3 text-sm font-semibold text-gray-400 transition hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            Batal
          </button>

          <button
            type="submit"
            disabled={
              saving ||
              uploadingImage
            }
            className="rounded-xl bg-amber-500 px-6 py-3 text-sm font-bold text-black transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving
              ? "Menyimpan..."
              : uploadingImage
                ? "Mengunggah Gambar..."
                : "Simpan sebagai Draft"}
          </button>
        </div>
      </form>
    </div>
  );
}
