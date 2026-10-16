"use client";

import {
  ChangeEvent,
  FormEvent,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  useParams,
  useRouter,
} from "next/navigation";

type Category = {
  id: string;
  name: string;
};

type Committee = {
  id: string;
  name: string;
  slug?: string;
};

type Agenda = {
  id: string;

  title: string;
  slug: string;

  description: string;
  excerpt: string | null;

  image: string | null;

  status: string;
  isPublished: boolean;

  committeeId: string | null;
  categoryId: string | null;

  startDate: string;
  endDate: string | null;

  startTime: string | null;
  endTime: string | null;

  location: string | null;
  address: string | null;

  registrationUrl: string | null;
  registrationText: string | null;

  contactName: string | null;
  contactPhone: string | null;
  contactEmail: string | null;

  organizer: string | null;
  target: string | null;
  notes: string | null;

  rejectionReason: string | null;
};

export default function EditAgendaPage() {
  const router =
    useRouter();

  const params =
    useParams();

  const fileInputRef =
    useRef<HTMLInputElement | null>(
      null,
    );

  const id =
    typeof params?.id === "string"
      ? params.id
      : "";

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [uploadingImage, setUploadingImage] =
    useState(false);

  const [error, setError] =
    useState("");

  const [message, setMessage] =
    useState("");

  const [slugEdited, setSlugEdited] =
    useState(false);

  const [data, setData] =
    useState<Agenda | null>(
      null,
    );

  const [categories, setCategories] =
    useState<Category[]>(
      [],
    );

  const [committees, setCommittees] =
    useState<Committee[]>(
      [],
    );

  /*
   * ============================================================
   * LOAD
   * ============================================================
   */
  useEffect(() => {
    if (!id) {
      return;
    }

    let active = true;

    async function load() {
      try {
        const [
          agendaResponse,
          optionsResponse,
        ] =
          await Promise.all([
            fetch(
              `/api/admin/agenda/${id}`,
              {
                cache:
                  "no-store",
              },
            ),

            fetch(
              "/api/admin/agenda/options",
              {
                cache:
                  "no-store",
              },
            ),
          ]);

        const agendaJson =
          await agendaResponse.json();

        const optionsJson =
          await optionsResponse.json();

        if (
          !agendaResponse.ok
        ) {
          throw new Error(
            agendaJson.message ||
              "Gagal mengambil agenda.",
          );
        }

        if (!active) {
          return;
        }

        setData(
          agendaJson.data,
        );

        setCategories(
          Array.isArray(
            optionsJson.categories,
          )
            ? optionsJson.categories
            : [],
        );

        setCommittees(
          Array.isArray(
            optionsJson.committees,
          )
            ? optionsJson.committees
            : [],
        );
      } catch (error) {
        if (active) {
          setError(
            error instanceof Error
              ? error.message
              : "Gagal mengambil agenda.",
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      active = false;
    };
  }, [id]);

  /*
   * ============================================================
   * UPDATE FIELD
   * ============================================================
   */
  function slugify(value: string) {
    return value
      .toLowerCase()
      .trim()
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");
  }

  function update(
    key: keyof Agenda,
    value: string | null,
  ) {
    setData(
      (current) =>
        current
          ? {
              ...current,
              [key]:
                value,
            }
          : current,
    );
  }

  function handleTitleChange(
    value: string,
  ) {
    update("title", value);

    if (!slugEdited) {
      update(
        "slug",
        slugify(value),
      );
    }
  }

  function handleSlugChange(
    value: string,
  ) {
    setSlugEdited(true);
    update(
      "slug",
      slugify(value),
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
        "File harus berupa gambar.",
      );

      event.target.value = "";

      return;
    }

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
      formData.append("intent", "update");

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

      const result =
        await response.json();

      if (!response.ok) {
        throw new Error(
          result.message ||
            "Gagal mengunggah gambar.",
        );
      }

      const url =
        result.url ||
        result.data?.url ||
        "";

      if (!url) {
        throw new Error(
          "URL gambar tidak diterima dari server.",
        );
      }

      update(
        "image",
        url,
      );

      setMessage(
        "Gambar berhasil diunggah.",
      );
    } catch (error) {
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
   * REMOVE IMAGE
   * ============================================================
   */
  function removeImage() {
    update(
      "image",
      null,
    );
  }

  /*
   * ============================================================
   * SAVE
   * ============================================================
   */
  async function submit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!data) {
      return;
    }

    setSaving(true);
    setError("");
    setMessage("");

    try {
      const response =
        await fetch(
          `/api/admin/agenda/${id}`,
          {
            method:
              "PATCH",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify({
                title:
                  data.title,

                slug:
                  data.slug,

                description:
                  data.description,

                excerpt:
                  data.excerpt,

                image:
                  data.image,

                committeeId:
                  data.committeeId,

                categoryId:
                  data.categoryId,

                startDate:
                  data.startDate.slice(
                    0,
                    10,
                  ),

                endDate:
                  data.endDate
                    ? data.endDate.slice(
                        0,
                        10,
                      )
                    : "",

                startTime:
                  data.startTime,

                endTime:
                  data.endTime,

                location:
                  data.location,

                address:
                  data.address,

                registrationUrl:
                  data.registrationUrl,

                registrationText:
                  data.registrationText,

                contactName:
                  data.contactName,

                contactPhone:
                  data.contactPhone,

                contactEmail:
                  data.contactEmail,

                organizer:
                  data.organizer,

                target:
                  data.target,

                notes:
                  data.notes,
              }),
          },
        );

      const result =
        await response.json();

      if (!response.ok) {
        throw new Error(
          result.message ||
            "Gagal menyimpan perubahan.",
        );
      }

      setMessage(
        result.message ||
          "Perubahan berhasil disimpan.",
      );

      setTimeout(() => {
        router.push(
          `/admin/agenda/${id}/preview`,
        );

        router.refresh();
      }, 700);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Gagal menyimpan perubahan.",
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
  if (loading) {
    return (
      <div className="mx-auto max-w-5xl pb-20">
        <div className="rounded-3xl border border-white/10 bg-[#0b0b0b] p-10 text-gray-400">
          Memuat Agenda...
        </div>
      </div>
    );
  }

  /*
   * ============================================================
   * NOT FOUND
   * ============================================================
   */
  if (!data) {
    return (
      <div className="mx-auto max-w-5xl pb-20">
        <div className="rounded-3xl border border-red-500/20 bg-red-500/5 p-8">
          <h1 className="text-2xl font-black text-white">
            Agenda tidak ditemukan.
          </h1>

          <button
            type="button"
            onClick={() =>
              router.push(
                "/admin/agenda",
              )
            }
            className="mt-6 rounded-xl bg-amber-500 px-5 py-3 text-sm font-bold text-black"
          >
            Kembali
          </button>
        </div>
      </div>
    );
  }

  const startDate =
    data.startDate.slice(
      0,
      10,
    );

  const endDate =
    data.endDate
      ? data.endDate.slice(
          0,
          10,
        )
      : "";

  /*
   * ============================================================
   * VIEW
   * ============================================================
   */
  return (
    <div className="mx-auto max-w-5xl pb-20">
      {/* HEADER */}
      <section className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-amber-400">
            CMS DKKT
          </p>

          <h1 className="mt-2 text-3xl font-black text-white md:text-4xl">
            Edit Agenda
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-7 text-gray-400">
            Perbarui informasi kegiatan. Setelah
            disimpan, Agenda akan tetap mengikuti
            workflow Kurator.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() =>
              router.push(
                `/admin/agenda/${id}/preview`,
              )
            }
            className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-5 py-3 text-sm font-semibold text-amber-300"
          >
            Lihat Preview
          </button>

          <button
            type="button"
            onClick={() =>
              router.push(
                "/admin/agenda",
              )
            }
            className="rounded-xl border border-white/10 px-5 py-3 text-sm font-semibold text-gray-400"
          >
            Kembali
          </button>
        </div>
      </section>

      {/* REJECTION */}
      {data.status ===
        "REJECTED" &&
        data.rejectionReason && (
          <section className="mt-6 rounded-3xl border border-red-500/20 bg-red-500/5 p-6">
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-red-400">
              DIKEMBALIKAN KURATOR
            </p>

            <h2 className="mt-2 text-xl font-black text-white">
              Agenda perlu diperbaiki
            </h2>

            <div className="mt-4 rounded-2xl border border-red-500/10 bg-black/20 p-4">
              <p className="text-sm leading-7 text-red-200">
                {data.rejectionReason}
              </p>
            </div>
          </section>
        )}

      {error && (
        <div className="mt-6 rounded-2xl border border-red-500/20 bg-red-500/5 p-5 text-sm text-red-300">
          {error}
        </div>
      )}

      {message && (
        <div className="mt-6 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-5 text-sm text-emerald-300">
          {message}
        </div>
      )}

      <form
        onSubmit={submit}
        className="mt-8 space-y-6"
      >
        {/* INFORMASI */}
        <section className="rounded-3xl border border-white/10 bg-[#0b0b0b] p-6 md:p-8">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-amber-400">
            Informasi
          </p>

          <h2 className="mt-2 text-xl font-black text-white">
            Informasi Agenda
          </h2>

          <div className="mt-6 space-y-5">
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-200">
                Judul Kegiatan
              </label>

              <input
                value={
                  data.title
                }
                onChange={(event) =>
                  handleTitleChange(
                    event.target.value,
                  )
                }
                required
                className="w-full rounded-2xl border border-white/10 bg-white/3 px-4 py-3.5 text-white outline-none focus:border-amber-400/60"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-200">
                Slug
              </label>

              <input
                value={
                  data.slug
                }
                onChange={(event) =>
                  handleSlugChange(
                    event.target.value,
                  )
                }
                required
                className="w-full rounded-2xl border border-white/10 bg-white/3 px-4 py-3.5 text-sm text-gray-300 outline-none focus:border-amber-400/60"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-200">
                Ringkasan
              </label>

              <textarea
                value={
                  data.excerpt ||
                  ""
                }
                onChange={(event) =>
                  update(
                    "excerpt",
                    event.target.value,
                  )
                }
                rows={4}
                className="w-full rounded-2xl border border-white/10 bg-white/3 px-4 py-3.5 text-white outline-none focus:border-amber-400/60"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-200">
                Deskripsi Kegiatan
              </label>

              <textarea
                value={
                  data.description
                }
                onChange={(event) =>
                  update(
                    "description",
                    event.target.value,
                  )
                }
                required
                rows={12}
                className="w-full rounded-2xl border border-white/10 bg-white/3 px-4 py-3.5 text-white outline-none focus:border-amber-400/60"
              />
            </div>
          </div>
        </section>

        {/* KLASIFIKASI */}
        <section className="rounded-3xl border border-white/10 bg-[#0b0b0b] p-6 md:p-8">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-amber-400">
            Klasifikasi
          </p>

          <h2 className="mt-2 text-xl font-black text-white">
            Kategori & Komite
          </h2>

          <div className="mt-6 grid gap-5 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-200">
                Kategori
              </label>

              <select
                value={
                  data.categoryId ||
                  ""
                }
                onChange={(event) =>
                  update(
                    "categoryId",
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
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-200">
                Komite
              </label>

              <select
                value={
                  data.committeeId ||
                  ""
                }
                onChange={(event) =>
                  update(
                    "committeeId",
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
            </div>
          </div>
        </section>

        {/* WAKTU */}
        <section className="rounded-3xl border border-white/10 bg-[#0b0b0b] p-6 md:p-8">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-amber-400">
            Waktu
          </p>

          <h2 className="mt-2 text-xl font-black text-white">
            Waktu Kegiatan
          </h2>

          <div className="mt-6 grid gap-5 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-200">
                Tanggal Mulai
              </label>

              <input
                type="date"
                value={
                  startDate
                }
                onChange={(event) =>
                  update(
                    "startDate",
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

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-200">
                Tanggal Selesai
              </label>

              <input
                type="date"
                value={
                  endDate
                }
                onChange={(event) =>
                  update(
                    "endDate",
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

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-200">
                Jam Mulai
              </label>

              <input
                type="time"
                value={
                  data.startTime ||
                  ""
                }
                onChange={(event) =>
                  update(
                    "startTime",
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

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-200">
                Jam Selesai
              </label>

              <input
                type="time"
                value={
                  data.endTime ||
                  ""
                }
                onChange={(event) =>
                  update(
                    "endTime",
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

        {/* LOKASI */}
        <section className="rounded-3xl border border-white/10 bg-[#0b0b0b] p-6 md:p-8">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-amber-400">
            Lokasi
          </p>

          <h2 className="mt-2 text-xl font-black text-white">
            Lokasi Kegiatan
          </h2>

          <div className="mt-6 space-y-5">
            <input
              value={
                data.location ||
                ""
              }
              onChange={(event) =>
                update(
                  "location",
                  event.target.value,
                )
              }
              placeholder="Nama tempat kegiatan"
              className="w-full rounded-2xl border border-white/10 bg-white/3 px-4 py-3.5 text-white outline-none focus:border-amber-400/60"
            />

            <textarea
              value={
                data.address ||
                ""
              }
              onChange={(event) =>
                update(
                  "address",
                  event.target.value,
                )
              }
              rows={4}
              placeholder="Alamat lengkap"
              className="w-full rounded-2xl border border-white/10 bg-white/3 px-4 py-3.5 text-white outline-none focus:border-amber-400/60"
            />
          </div>
        </section>

        {/* PENDAFTARAN */}
        <section className="rounded-3xl border border-white/10 bg-[#0b0b0b] p-6 md:p-8">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-amber-400">
            Pendaftaran
          </p>

          <h2 className="mt-2 text-xl font-black text-white">
            Informasi Pendaftaran
          </h2>

          <p className="mt-2 text-sm leading-7 text-gray-500">
            Kosongkan tautan bila kegiatan tidak memerlukan pendaftaran.
          </p>

          <div className="mt-6 space-y-5">
            <input
              type="url"
              value={data.registrationUrl || ""}
              onChange={(event) =>
                update("registrationUrl", event.target.value)
              }
              placeholder="Tautan pendaftaran, misalnya https://..."
              className="w-full rounded-2xl border border-white/10 bg-white/3 px-4 py-3.5 text-white outline-none"
            />

            <textarea
              value={data.registrationText || ""}
              onChange={(event) =>
                update("registrationText", event.target.value)
              }
              rows={3}
              placeholder="Keterangan pendaftaran"
              className="w-full rounded-2xl border border-white/10 bg-white/3 px-4 py-3.5 text-white outline-none"
            />
          </div>
        </section>

        {/* NARAHUBUNG */}
        <section className="rounded-3xl border border-white/10 bg-[#0b0b0b] p-6 md:p-8">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-amber-400">
            Informasi Kontak
          </p>

          <h2 className="mt-2 text-xl font-black text-white">
            Narahubung
          </h2>

          <div className="mt-6 grid gap-5 md:grid-cols-3">
            <input
              value={
                data.contactName ||
                ""
              }
              onChange={(event) =>
                update(
                  "contactName",
                  event.target.value,
                )
              }
              placeholder="Nama"
              className="rounded-2xl border border-white/10 bg-white/3 px-4 py-3.5 text-white outline-none"
            />

            <input
              value={
                data.contactPhone ||
                ""
              }
              onChange={(event) =>
                update(
                  "contactPhone",
                  event.target.value,
                )
              }
              placeholder="Nomor telepon"
              className="rounded-2xl border border-white/10 bg-white/3 px-4 py-3.5 text-white outline-none"
            />

            <input
              type="email"
              value={
                data.contactEmail ||
                ""
              }
              onChange={(event) =>
                update(
                  "contactEmail",
                  event.target.value,
                )
              }
              placeholder="Email"
              className="rounded-2xl border border-white/10 bg-white/3 px-4 py-3.5 text-white outline-none"
            />
          </div>
        </section>

        {/* TAMBAHAN */}
        <section className="rounded-3xl border border-white/10 bg-[#0b0b0b] p-6 md:p-8">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-amber-400">
            Tambahan
          </p>

          <h2 className="mt-2 text-xl font-black text-white">
            Informasi Tambahan
          </h2>

          <div className="mt-6 space-y-5">
            <input
              value={
                data.organizer ||
                ""
              }
              onChange={(event) =>
                update(
                  "organizer",
                  event.target.value,
                )
              }
              placeholder="Penyelenggara"
              className="w-full rounded-2xl border border-white/10 bg-white/3 px-4 py-3.5 text-white outline-none"
            />

            <input
              value={
                data.target ||
                ""
              }
              onChange={(event) =>
                update(
                  "target",
                  event.target.value,
                )
              }
              placeholder="Sasaran / peserta"
              className="w-full rounded-2xl border border-white/10 bg-white/3 px-4 py-3.5 text-white outline-none"
            />

            <textarea
              value={
                data.notes ||
                ""
              }
              onChange={(event) =>
                update(
                  "notes",
                  event.target.value,
                )
              }
              rows={5}
              placeholder="Catatan tambahan"
              className="w-full rounded-2xl border border-white/10 bg-white/3 px-4 py-3.5 text-white outline-none"
            />
          </div>
        </section>

        {/* IMAGE */}
        <section className="rounded-3xl border border-white/10 bg-[#0b0b0b] p-6 md:p-8">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-amber-400">
            Media
          </p>

          <h2 className="mt-2 text-xl font-black text-white">
            Gambar Kegiatan
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
            {data.image ? (
              <div className="overflow-hidden rounded-3xl border border-white/10 bg-black">
                <img
                  src={data.image}
                  alt={
                    data.title
                  }
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
                    className="rounded-xl border border-red-500/20 px-5 py-3 text-sm font-semibold text-red-300"
                  >
                    Hapus Gambar
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() =>
                  fileInputRef.current?.click()
                }
                disabled={
                  uploadingImage
                }
                className="flex w-full flex-col items-center justify-center rounded-3xl border border-dashed border-white/10 bg-white/2 px-6 py-12 hover:border-amber-400/40 disabled:opacity-50"
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
            )}
          </div>
        </section>

        {/* WORKFLOW */}
        <section className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-5">
          <p className="font-bold text-emerald-300">
            🔒 Alur Publikasi
          </p>

          <p className="mt-2 text-sm leading-7 text-gray-400">
            Editor hanya mengelola isi dan informasi kegiatan.
            Publikasi ke portal tetap menjadi kewenangan Kurator.
          </p>
        </section>

        {/* ACTION */}
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
            className="rounded-xl border border-white/10 px-6 py-3 text-sm font-semibold text-gray-400 hover:text-white disabled:opacity-50"
          >
            Batal
          </button>

          <button
            type="submit"
            disabled={
              saving ||
              uploadingImage
            }
            className="rounded-xl bg-amber-500 px-6 py-3 text-sm font-bold text-black hover:bg-amber-400 disabled:opacity-50"
          >
            {saving
              ? "Menyimpan..."
              : uploadingImage
                ? "Mengunggah Gambar..."
                : "Simpan Perubahan"}
          </button>
        </div>
      </form>
    </div>
  );
}
