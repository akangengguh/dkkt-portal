"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";

const contactInfo = [
  {
    icon: "📍",
    label: "Sekretariat",
    value: "Alamat Sekretariat DKKT",
    description: "Kota Tasikmalaya, Jawa Barat",
  },
  {
    icon: "📞",
    label: "Telepon",
    value: "Nomor Telepon DKKT",
    description: "Hubungi pada jam pelayanan",
  },
  {
    icon: "✉️",
    label: "Email",
    value: "email@dkkt.id",
    description: "Untuk komunikasi resmi dan administrasi",
  },
  {
    icon: "🕘",
    label: "Jam Pelayanan",
    value: "Senin – Jumat",
    description: "08.00 – 16.00 WIB",
  },
];

const socialLinks = [
  {
    label: "Instagram",
    href: "#",
    icon: "◎",
  },
  {
    label: "Facebook",
    href: "#",
    icon: "f",
  },
  {
    label: "YouTube",
    href: "#",
    icon: "▶",
  },
  {
    label: "TikTok",
    href: "#",
    icon: "♪",
  },
];

export default function KontakPage() {
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const form = event.currentTarget;
    const formData = new FormData(form);
    const response = await fetch("/api/public/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: formData.get("nama"),
        email: formData.get("email"),
        phone: formData.get("telepon"),
        subject: formData.get("subjek"),
        message: formData.get("pesan"),
      }),
    });

    if (!response.ok) {
      window.alert("Pesan gagal dikirim. Silakan coba lagi.");
      return;
    }

    setSubmitted(true);
    form.reset();
  }

  return (
    <main className="min-h-screen bg-[#050505] text-white">
      {/* =====================================================
          HERO
      ===================================================== */}
      <section className="relative overflow-hidden border-b border-white/10 bg-[#080808]">
        {/* Glow */}
        <div className="pointer-events-none absolute left-[-160px] top-20 h-[420px] w-[420px] rounded-full bg-amber-500/10 blur-[110px]" />
        <div className="pointer-events-none absolute right-[-140px] bottom-[-100px] h-[380px] w-[380px] rounded-full bg-orange-500/[0.07] blur-[100px]" />

        <div className="relative mx-auto max-w-7xl px-6 pb-20 pt-[150px] md:pb-24 md:pt-[170px]">
          <div className="max-w-4xl">
            <span className="inline-flex items-center rounded-full border border-amber-400/20 bg-amber-500/5 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.24em] text-amber-300">
              Hubungi DKKT
            </span>

            <h1 className="mt-6 text-4xl font-black leading-tight tracking-tight text-white md:text-6xl">
              Mari Terhubung
              <span className="block text-amber-400">dengan DKKT.</span>
            </h1>

            <p className="mt-6 max-w-2xl text-base leading-8 text-gray-400 md:text-lg">
              Dewan Kesenian dan Kebudayaan Kota Tasikmalaya terbuka untuk
              kolaborasi, komunikasi, informasi kegiatan, kemitraan, serta
              pengembangan ekosistem seni dan budaya di Kota Tasikmalaya.
            </p>
          </div>
        </div>
      </section>

      {/* =====================================================
          CONTACT CONTENT
      ===================================================== */}
      <section className="relative overflow-hidden py-20 md:py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr]">
            {/* =================================================
                LEFT : CONTACT INFO
            ================================================= */}
            <div>
              <div className="mb-8">
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-amber-400">
                  Informasi Kontak
                </p>

                <h2 className="mt-3 text-3xl font-black text-white md:text-4xl">
                  Hubungi Sekretariat DKKT
                </h2>

                <p className="mt-4 max-w-xl text-sm leading-7 text-gray-400 md:text-base">
                  Silakan gunakan informasi berikut untuk menghubungi DKKT
                  terkait kegiatan, administrasi, kemitraan, publikasi,
                  komunitas, maupun informasi kebudayaan.
                </p>
              </div>

              {/* Contact Cards */}
              <div className="space-y-4">
                {contactInfo.map((item) => (
                  <div
                    key={item.label}
                    className="group rounded-2xl border border-white/10 bg-[#0d0d0d] p-5 transition duration-300 hover:-translate-y-0.5 hover:border-amber-400/30 hover:bg-[#111111]"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-amber-400/10 bg-amber-500/10 text-xl transition group-hover:bg-amber-500/15">
                        {item.icon}
                      </div>

                      <div className="min-w-0">
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">
                          {item.label}
                        </p>

                        <p className="mt-1 break-words text-base font-bold text-white">
                          {item.value}
                        </p>

                        <p className="mt-1 text-sm leading-6 text-gray-500">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Social Media */}
              <div className="mt-8 rounded-2xl border border-white/10 bg-[#0d0d0d] p-6">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">
                  Media Sosial
                </p>

                <h3 className="mt-2 text-lg font-black text-white">
                  Ikuti Aktivitas DKKT
                </h3>

                <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {socialLinks.map((social) => (
                    <a
                      key={social.label}
                      href={social.href}
                      target={social.href === "#" ? undefined : "_blank"}
                      rel={
                        social.href === "#"
                          ? undefined
                          : "noopener noreferrer"
                      }
                      className="group flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/2 px-3 py-3 text-sm font-semibold text-gray-300 transition hover:border-amber-400/30 hover:bg-amber-500/10 hover:text-amber-300"
                    >
                      <span className="text-base">{social.icon}</span>
                      <span>{social.label}</span>
                    </a>
                  ))}
                </div>
              </div>
            </div>

            {/* =================================================
                RIGHT : FORM
            ================================================= */}
            <div className="rounded-3xl border border-white/10 bg-[#0c0c0c] p-6 shadow-[0_0_50px_rgba(0,0,0,0.25)] md:p-8">
              <div className="mb-7">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-400">
                  Formulir Pesan
                </p>

                <h2 className="mt-3 text-2xl font-black text-white md:text-3xl">
                  Sampaikan Pesan Anda
                </h2>

                <p className="mt-3 text-sm leading-7 text-gray-400">
                  Gunakan formulir berikut untuk menyampaikan pertanyaan,
                  informasi, undangan, kerja sama, atau kebutuhan komunikasi
                  lainnya kepada DKKT.
                </p>
              </div>

              {submitted && (
                <div className="mb-6 rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-4 text-sm leading-6 text-emerald-300">
                  Terima kasih. Pesan Anda sudah diterima oleh DKKT.
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Nama */}
                <div>
                  <label
                    htmlFor="nama"
                    className="mb-2 block text-sm font-semibold text-gray-300"
                  >
                    Nama Lengkap
                  </label>

                  <input
                    id="nama"
                    name="nama"
                    type="text"
                    required
                    placeholder="Masukkan nama lengkap"
                    className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3.5 text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-amber-400/50 focus:bg-black/40"
                  />
                </div>

                {/* Email */}
                <div>
                  <label
                    htmlFor="email"
                    className="mb-2 block text-sm font-semibold text-gray-300"
                  >
                    Email
                  </label>

                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    placeholder="nama@email.com"
                    className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3.5 text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-amber-400/50 focus:bg-black/40"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label
                    htmlFor="telepon"
                    className="mb-2 block text-sm font-semibold text-gray-300"
                  >
                    Nomor WhatsApp / Telepon
                  </label>

                  <input
                    id="telepon"
                    name="telepon"
                    type="tel"
                    placeholder="08xxxxxxxxxx"
                    className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3.5 text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-amber-400/50 focus:bg-black/40"
                  />
                </div>

                {/* Subject */}
                <div>
                  <label
                    htmlFor="subjek"
                    className="mb-2 block text-sm font-semibold text-gray-300"
                  >
                    Keperluan
                  </label>

                  <select
                    id="subjek"
                    name="subjek"
                    required
                    defaultValue=""
                    className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3.5 text-sm text-gray-300 outline-none transition focus:border-amber-400/50 focus:bg-black/40"
                  >
                    <option value="" disabled>
                      Pilih keperluan
                    </option>
                    <option value="informasi">Informasi</option>
                    <option value="kegiatan">Kegiatan</option>
                    <option value="kerja-sama">Kerja Sama</option>
                    <option value="undangan">Undangan</option>
                    <option value="komunitas">Komunitas</option>
                    <option value="publikasi">Publikasi</option>
                    <option value="lainnya">Lainnya</option>
                  </select>
                </div>

                {/* Message */}
                <div>
                  <label
                    htmlFor="pesan"
                    className="mb-2 block text-sm font-semibold text-gray-300"
                  >
                    Pesan
                  </label>

                  <textarea
                    id="pesan"
                    name="pesan"
                    required
                    rows={6}
                    placeholder="Tuliskan pesan atau kebutuhan Anda..."
                    className="w-full resize-none rounded-xl border border-white/10 bg-black/30 px-4 py-3.5 text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-amber-400/50 focus:bg-black/40"
                  />
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  className="group inline-flex w-full items-center justify-center rounded-xl bg-amber-500 px-6 py-3.5 text-sm font-bold text-black transition duration-300 hover:-translate-y-0.5 hover:bg-amber-400 hover:shadow-[0_10px_30px_rgba(245,158,11,0.15)]"
                >
                  Kirim Pesan
                  <span className="ml-2 transition-transform duration-300 group-hover:translate-x-1">
                    →
                  </span>
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          MAP / LOCATION
      ===================================================== */}
      <section className="border-t border-white/10 bg-[#080808] py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid gap-8 lg:grid-cols-[0.75fr_1.25fr] lg:items-center">
            {/* Text */}
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-400">
                Lokasi
              </p>

              <h2 className="mt-3 text-3xl font-black text-white md:text-4xl">
                Temui Kami
              </h2>

              <p className="mt-4 text-sm leading-7 text-gray-400 md:text-base">
                Sekretariat DKKT menjadi ruang bersama untuk komunikasi,
                koordinasi, pengembangan program, serta kolaborasi antara
                seniman, budayawan, komunitas, pemerintah, akademisi, dan
                masyarakat.
              </p>

              <Link
                href="/profil"
                className="mt-6 inline-flex items-center rounded-xl border border-amber-400/30 px-5 py-3 text-sm font-semibold text-amber-300 transition hover:bg-amber-500 hover:text-black"
              >
                Tentang DKKT
                <span className="ml-2">→</span>
              </Link>
            </div>

            {/* Map Placeholder */}
            <div className="relative min-h-[320px] overflow-hidden rounded-3xl border border-white/10 bg-[#111111]">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(245,158,11,0.08),transparent_50%)]" />

              <div className="relative flex h-full min-h-[320px] flex-col items-center justify-center px-6 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-amber-400/20 bg-amber-500/10 text-3xl">
                  📍
                </div>

                <h3 className="mt-5 text-xl font-black text-white">
                  Lokasi Sekretariat DKKT
                </h3>

                <p className="mt-2 max-w-md text-sm leading-6 text-gray-500">
                  Embed Google Maps dapat ditempatkan di area ini setelah
                  alamat resmi sekretariat dan koordinat lokasi ditetapkan.
                </p>

                <div className="mt-5 rounded-full border border-white/10 bg-black/30 px-4 py-2 text-xs font-semibold text-gray-500">
                  Kota Tasikmalaya · Jawa Barat
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          FINAL CTA
      ===================================================== */}
      <section className="relative overflow-hidden border-t border-white/10 bg-[#050505] py-16 md:py-20">
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-amber-500/[0.04] to-transparent" />

        <div className="relative mx-auto max-w-4xl px-6 text-center">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-amber-400">
            Bersama Membangun Ekosistem
          </p>

          <h2 className="mt-4 text-3xl font-black leading-tight text-white md:text-5xl">
            Mari hidupkan seni dan budaya Tasikmalaya.
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-gray-400 md:text-base">
            Setiap karya, gagasan, komunitas, dan kolaborasi memiliki ruang
            untuk tumbuh bersama DKKT.
          </p>

          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Link
              href="/komite"
              className="rounded-xl bg-amber-500 px-6 py-3 text-sm font-bold text-black transition hover:-translate-y-0.5 hover:bg-amber-400"
            >
              Jelajahi Komite
            </Link>

            <Link
              href="/agenda"
              className="rounded-xl border border-white/15 px-6 py-3 text-sm font-bold text-gray-200 transition hover:border-amber-400/40 hover:bg-amber-500/10 hover:text-amber-300"
            >
              Lihat Agenda
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}