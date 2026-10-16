"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(
          typeof data.message === "string"
            ? data.message
            : "Login gagal.",
        );

        return;
      }

      router.push("/admin");
      router.refresh();
    } catch (error) {
      console.error("LOGIN_REQUEST_ERROR:", error);

      setError(
        "Tidak dapat terhubung ke server. Silakan coba lagi.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#050505] px-6 py-12 text-white">
      {/* =====================================================
          BACKGROUND
      ===================================================== */}
      <div className="pointer-events-none absolute left-[-160px] top-[-120px] h-[420px] w-[420px] rounded-full bg-amber-500/10 blur-[120px]" />

      <div className="pointer-events-none absolute bottom-[-150px] right-[-140px] h-[420px] w-[420px] rounded-full bg-orange-500/10 blur-[120px]" />

      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(245,158,11,0.04),transparent_45%)]" />

      {/* =====================================================
          CARD
      ===================================================== */}
      <div className="relative z-10 w-full max-w-md">
        <div className="rounded-[30px] border border-amber-500/20 bg-[#0b0b0b]/95 p-7 shadow-[0_0_80px_rgba(245,158,11,0.08)] backdrop-blur-xl md:p-9">
          {/* =================================================
              BRAND
          ================================================= */}
          <div className="text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl border border-amber-500/20 bg-amber-500/10 p-3">
              <img
                src="/logo/logo-dkkt.png"
                alt="Logo DKKT"
                className="h-full w-full object-contain"
              />
            </div>

            <p className="mt-6 text-xs font-semibold uppercase tracking-[0.35em] text-amber-400">
              CMS DKKT
            </p>

            <h1 className="mt-3 text-3xl font-black tracking-tight text-white md:text-4xl">
              Selamat Datang
            </h1>

            <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-gray-400">
              Masuk ke panel administrasi Dewan Kesenian dan
              Kebudayaan Kota Tasikmalaya.
            </p>
          </div>

          {/* =================================================
              FORM
          ================================================= */}
          <form
            onSubmit={handleSubmit}
            className="mt-8 space-y-5"
          >
            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-semibold text-gray-200"
              >
                Username atau Email
              </label>

              <input
                id="email"
                type="text"
                autoComplete="username"
                value={email}
                onChange={(event) =>
                  setEmail(event.target.value)
                }
                placeholder="Username atau email"
                required
                disabled={loading}
                className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3.5 text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-amber-400/70 focus:bg-white/[0.06] focus:ring-2 focus:ring-amber-400/10 disabled:cursor-not-allowed disabled:opacity-60"
              />
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-semibold text-gray-200"
              >
                Password
              </label>

              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) =>
                    setPassword(event.target.value)
                  }
                  placeholder="Masukkan password"
                  required
                  disabled={loading}
                  className="w-full rounded-2xl border border-white/10 bg-white/[0.04] py-3.5 pl-4 pr-12 text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-amber-400/70 focus:bg-white/[0.06] focus:ring-2 focus:ring-amber-400/10 disabled:cursor-not-allowed disabled:opacity-60"
                />
                <button
                  type="button"
                  aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                  aria-pressed={showPassword}
                  onClick={() => setShowPassword((visible) => !visible)}
                  disabled={loading}
                  className="absolute inset-y-0 right-0 flex w-12 items-center justify-center text-gray-500 transition hover:text-amber-300 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
                    {showPassword ? <><path d="m3 3 18 18" /><path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" /><path d="M9.9 5.2A10.8 10.8 0 0 1 12 5c5 0 8.5 4.5 9.5 7-.4 1.1-1.2 2.2-2.2 3.2M6.2 6.2C4.3 7.4 3 9.3 2.5 12c.6 1.5 2 3.4 4.1 4.8A9.8 9.8 0 0 0 12 19c1 0 2-.2 2.9-.5" /></> : <><path d="M2.5 12s3.4-7 9.5-7 9.5 7 9.5 7-3.4 7-9.5 7-9.5-7-9.5-7Z" /><circle cx="12" cy="12" r="2.5" /></>}
                  </svg>
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div
                role="alert"
                className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm leading-6 text-red-300"
              >
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-3 rounded-2xl bg-amber-500 px-5 py-3.5 text-sm font-bold text-black transition hover:-translate-y-0.5 hover:bg-amber-400 disabled:cursor-not-allowed disabled:translate-y-0 disabled:opacity-60"
            >
              {loading ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-black/30 border-t-black" />
                  Memproses...
                </>
              ) : (
                <>
                  Masuk ke CMS
                  <span>→</span>
                </>
              )}
            </button>
          </form>

          {/* =================================================
              INFO
          ================================================= */}
          <div className="mt-7 border-t border-white/10 pt-6 text-center">
            <p className="text-xs leading-6 text-gray-500">
              Akses terbatas untuk pengelola resmi Portal DKKT.
            </p>

            <p className="mt-2 text-xs text-gray-600">
              Dewan Kesenian dan Kebudayaan Kota Tasikmalaya
            </p>
          </div>
        </div>

        {/* ===================================================
            BACK TO WEBSITE
        =================================================== */}
        <div className="mt-6 text-center">
          <Link
            href="/"
            className="text-sm text-gray-500 transition hover:text-amber-400"
          >
            ← Kembali ke Portal DKKT
          </Link>
        </div>
      </div>
    </main>
  );
}