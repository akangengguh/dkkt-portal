"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type NewsActionsProps = {
  id: string;
  slug: string;

  status?: string;

  isPublished: boolean;
  isFeatured?: boolean;

  canUpdate?: boolean;
  canPublish?: boolean;
  canDelete?: boolean;
};

export default function NewsActions({
  id,
  slug,
  status = "DRAFT",
  isPublished,
  isFeatured = false,

  canUpdate = true,
  canPublish = true,
  canDelete = true,
}: NewsActionsProps) {
  const router =
    useRouter();

  const [loading, setLoading] =
    useState(false);

  const [showReject, setShowReject] =
    useState(false);

  const [reason, setReason] =
    useState("");

  const [error, setError] =
    useState("");

  const isRejected =
    status === "REJECTED";

  async function updateNews(
    payload: Record<
      string,
      unknown
    >,
  ) {
    setLoading(true);
    setError("");

    try {
      const response =
        await fetch(
          `/api/admin/news/${id}`,
          {
            method: "PATCH",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify(
              payload,
            ),
          },
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Gagal memperbarui berita.",
        );
      }

      router.refresh();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Terjadi kesalahan.",
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    const confirmed =
      window.confirm(
        "Apakah Anda yakin ingin menghapus berita ini?",
      );

    if (!confirmed) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response =
        await fetch(
          `/api/admin/news/${id}`,
          {
            method: "DELETE",
          },
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Gagal menghapus berita.",
        );
      }

      router.refresh();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Gagal menghapus berita.",
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleReject() {
    const cleanReason =
      reason.trim();

    if (
      cleanReason.length < 10
    ) {
      setError(
        "Alasan penolakan minimal 10 karakter.",
      );
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response =
        await fetch(
          `/api/admin/news/${id}`,
          {
            method: "PATCH",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              reject: true,
              rejectionReason:
                cleanReason,
            }),
          },
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Gagal mengembalikan berita.",
        );
      }

      setShowReject(false);
      setReason("");

      router.refresh();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Gagal mengembalikan berita.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div className="flex flex-wrap items-center justify-end gap-2">
        {/* PREVIEW */}
        <Link
          href={`/admin/berita/${id}/preview`}
          className="rounded-lg border border-white/10 px-3 py-2 text-xs font-semibold text-gray-300 hover:border-amber-400/40 hover:text-amber-300"
        >
          Lihat
        </Link>

        {/* PUBLIC */}
        {isPublished && (
          <Link
            href={`/berita/${slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 px-3 py-2 text-xs font-semibold text-emerald-300 hover:bg-emerald-500/10"
          >
            Publik ↗
          </Link>
        )}

        {/* FEATURED */}
        {canPublish && (
          <button
            type="button"
            disabled={loading}
            onClick={() =>
              updateNews({
                featured:
                  !isFeatured,
              })
            }
            className={`rounded-lg border px-3 py-2 text-xs font-semibold ${
              isFeatured
                ? "border-amber-500/40 bg-amber-500/10 text-amber-300"
                : "border-white/10 text-gray-300 hover:border-amber-400/40 hover:text-amber-300"
            } disabled:opacity-50`}
          >
            {isFeatured
              ? "★ Unggulan"
              : "☆ Unggulkan"}
          </button>
        )}

        {/* PUBLISH */}
        {canPublish && (
          <button
            type="button"
            disabled={loading}
            onClick={() =>
              updateNews({
                publish:
                  !isPublished,
              })
            }
            className={`rounded-lg border px-3 py-2 text-xs font-semibold ${
              isPublished
                ? "border-red-500/20 bg-red-500/5 text-red-300 hover:bg-red-500/10"
                : "border-emerald-500/20 bg-emerald-500/5 text-emerald-300 hover:bg-emerald-500/10"
            } disabled:opacity-50`}
          >
            {isPublished
              ? "Unpublish"
              : "Publish"}
          </button>
        )}

        {/* REJECT */}
        {!isPublished &&
          !isRejected &&
          canPublish && (
            <button
              type="button"
              disabled={loading}
              onClick={() => {
                setError("");
                setShowReject(
                  true,
                );
              }}
              className="rounded-lg border border-red-500/20 bg-red-500/5 px-3 py-2 text-xs font-semibold text-red-300 hover:bg-red-500/10"
            >
              Tolak
            </button>
          )}

        {/* EDIT */}
        {canUpdate && (
          <Link
            href={`/admin/berita/${id}/edit`}
            className="rounded-lg border border-amber-500/20 bg-amber-500/5 px-3 py-2 text-xs font-semibold text-amber-300 hover:bg-amber-500/10"
          >
            Edit
          </Link>
        )}

        {/* DELETE */}
        {canDelete && (
          <button
            type="button"
            disabled={loading}
            onClick={
              handleDelete
            }
            className="rounded-lg border border-red-500/20 px-3 py-2 text-xs font-semibold text-red-300 hover:bg-red-500/10 disabled:opacity-50"
          >
            Hapus
          </button>
        )}
      </div>

      {/* ERROR */}
      {error && (
        <div className="fixed bottom-5 right-5 z-100 max-w-sm rounded-xl border border-red-500/20 bg-[#160909] px-5 py-4 text-sm text-red-300 shadow-2xl">
          {error}
        </div>
      )}

      {/* REJECT MODAL */}
      {showReject && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/80 p-5 backdrop-blur-sm">
          <div className="w-full max-w-lg overflow-hidden rounded-3xl border border-white/10 bg-[#0b0b0b] shadow-2xl">
            <div className="border-b border-white/10 p-6">
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-red-400">
                Kurator
              </p>

              <h2 className="mt-2 text-2xl font-black text-white">
                Kembalikan ke Editor
              </h2>

              <p className="mt-2 text-sm leading-7 text-gray-400">
                Tuliskan alasan penolakan agar Editor
                mengetahui bagian yang perlu diperbaiki.
              </p>
            </div>

            <div className="p-6">
              <label
                htmlFor="rejectionReason"
                className="mb-2 block text-sm font-semibold text-gray-200"
              >
                Alasan Penolakan
              </label>

              <textarea
                id="rejectionReason"
                value={reason}
                onChange={(event) =>
                  setReason(
                    event.target.value,
                  )
                }
                rows={6}
                autoFocus
                placeholder="Contoh: Mohon lengkapi waktu kegiatan, lokasi, nama narasumber, dan perbaiki judul agar lebih informatif."
                className="w-full rounded-2xl border border-white/10 bg-white/3 px-4 py-3.5 text-sm leading-7 text-white outline-none placeholder:text-gray-600 focus:border-red-400/50"
              />

              <p className="mt-2 text-xs text-gray-600">
                Minimal 10 karakter.
              </p>

              {error && (
                <div className="mt-4 rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-300">
                  {error}
                </div>
              )}
            </div>

            <div className="flex flex-col-reverse gap-3 border-t border-white/10 p-6 sm:flex-row sm:justify-end">
              <button
                type="button"
                disabled={
                  loading
                }
                onClick={() => {
                  setShowReject(
                    false,
                  );
                  setReason("");
                  setError("");
                }}
                className="rounded-xl border border-white/10 px-5 py-3 text-sm font-semibold text-gray-400 hover:text-white"
              >
                Batal
              </button>

              <button
                type="button"
                disabled={
                  loading
                }
                onClick={
                  handleReject
                }
                className="rounded-xl bg-red-500 px-5 py-3 text-sm font-bold text-white hover:bg-red-400 disabled:opacity-50"
              >
                {loading
                  ? "Mengembalikan..."
                  : "Kembalikan ke Editor"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}