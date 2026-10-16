"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type AgendaActionsProps = {
  id: string;
  slug: string;
  status?: string;

  isPublished: boolean;
  isFeatured?: boolean;

  canUpdate?: boolean;
  canPublish?: boolean;
  canDelete?: boolean;
};

export default function AgendaActions({
  id,
  slug,
  status = "DRAFT",
  isPublished,
  isFeatured = false,
  canUpdate = true,
  canPublish = true,
  canDelete = true,
}: AgendaActionsProps) {
  const router = useRouter();

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

  async function updateAgenda(
    payload: Record<
      string,
      unknown
    >,
  ) {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `/api/admin/agenda/${id}`,
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
            "Gagal memperbarui agenda.",
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

  async function deleteAgenda() {
    const confirmed =
      window.confirm(
        "Apakah Anda yakin ingin menghapus agenda ini?",
      );

    if (!confirmed) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `/api/admin/agenda/${id}`,
        {
          method: "DELETE",
        },
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Gagal menghapus agenda.",
        );
      }

      router.refresh();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Gagal menghapus agenda.",
      );
    } finally {
      setLoading(false);
    }
  }

  async function rejectAgenda() {
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
      const response = await fetch(
        `/api/admin/agenda/${id}`,
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
            "Gagal mengembalikan agenda.",
        );
      }

      setShowReject(false);
      setReason("");

      router.refresh();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Gagal mengembalikan agenda.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div className="flex flex-wrap items-center justify-end gap-2">
        {/* LIHAT */}
        <Link
          href={`/admin/agenda/${id}/preview`}
          className="rounded-lg border border-white/10 px-3 py-2 text-xs font-semibold text-gray-300 transition hover:border-amber-400/40 hover:text-amber-300"
        >
          Lihat
        </Link>

        {/* PUBLIK */}
        {isPublished && (
          <Link
            href={`/agenda/${slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 px-3 py-2 text-xs font-semibold text-emerald-300"
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
              updateAgenda({
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

        {/* PUBLISH / UNPUBLISH */}
        {canPublish && (
          <button
            type="button"
            disabled={loading}
            onClick={() =>
              updateAgenda({
                publish:
                  !isPublished,
              })
            }
            className={`rounded-lg border px-3 py-2 text-xs font-semibold ${
              isPublished
                ? "border-red-500/20 bg-red-500/5 text-red-300"
                : "border-emerald-500/20 bg-emerald-500/5 text-emerald-300"
            } disabled:opacity-50`}
          >
            {isPublished
              ? "Unpublish"
              : "Publish"}
          </button>
        )}

        {/* TOLAK */}
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
              className="rounded-lg border border-red-500/20 bg-red-500/5 px-3 py-2 text-xs font-semibold text-red-300"
            >
              Tolak
            </button>
          )}

        {/* EDIT */}
        {canUpdate && (
          <Link
            href={`/admin/agenda/${id}/edit`}
            className="rounded-lg border border-amber-500/20 bg-amber-500/5 px-3 py-2 text-xs font-semibold text-amber-300"
          >
            Edit
          </Link>
        )}

        {/* HAPUS */}
        {canDelete && (
          <button
            type="button"
            disabled={loading}
            onClick={
              deleteAgenda
            }
            className="rounded-lg border border-red-500/20 px-3 py-2 text-xs font-semibold text-red-300"
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
                KURATOR
              </p>

              <h2 className="mt-2 text-2xl font-black text-white">
                Kembalikan Agenda ke Editor
              </h2>

              <p className="mt-2 text-sm leading-7 text-gray-400">
                Tuliskan alasan yang jelas
                agar Editor mengetahui
                apa yang perlu diperbaiki.
              </p>
            </div>

            <div className="p-6">
              <label
                htmlFor="agenda-rejection-reason"
                className="mb-2 block text-sm font-semibold text-gray-200"
              >
                Alasan Penolakan
              </label>

              <textarea
                id="agenda-rejection-reason"
                value={reason}
                onChange={(event) =>
                  setReason(
                    event.target.value,
                  )
                }
                rows={6}
                autoFocus
                placeholder="Contoh: Mohon lengkapi lokasi kegiatan, jam pelaksanaan, dan narahubung."
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
                disabled={loading}
                onClick={() => {
                  setShowReject(
                    false,
                  );
                  setReason("");
                  setError("");
                }}
                className="rounded-xl border border-white/10 px-5 py-3 text-sm font-semibold text-gray-400 hover:text-white disabled:opacity-50"
              >
                Batal
              </button>

              <button
                type="button"
                disabled={loading}
                onClick={
                  rejectAgenda
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