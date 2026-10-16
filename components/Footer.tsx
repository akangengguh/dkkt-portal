import Link from "next/link";

const komiteLinks = [
  {
    label: "Seni Teater",
    href: "/komite/teater",
  },
  {
    label: "Seni Rupa",
    href: "/komite/seni-rupa",
  },
  {
    label: "Seni Sastra",
    href: "/komite/sastra",
  },
  {
    label: "Seni Musik",
    href: "/komite/musik",
  },
  {
    label: "Seni Tari",
    href: "/komite/tari",
  },
  {
    label: "Film & Fotografi",
    href: "/komite/film-fotografi",
  },
  {
    label: "Budaya",
    href: "/komite/budaya",
  },
];

const portalLinks = [
  {
    label: "Beranda",
    href: "/",
  },
  {
    label: "Profil",
    href: "/profil",
  },
  {
    label: "Komite",
    href: "/komite",
  },
  {
    label: "Berita",
    href: "/berita",
  },
  {
    label: "Agenda",
    href: "/agenda",
  },
  {
    label: "Galeri",
    href: "/galeri",
  },
  {
    label: "Kontak",
    href: "/kontak",
  },
];

const socialLinks = [
  {
    label: "Instagram",
    href: "#",
  },
  {
    label: "Facebook",
    href: "#",
  },
  {
    label: "YouTube",
    href: "#",
  },
  {
    label: "TikTok",
    href: "#",
  },
];

function FooterLink({
  href,
  label,
}: {
  href: string;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="group inline-flex items-center gap-2 text-sm text-gray-400 transition duration-300 hover:text-amber-400"
    >
      <span className="h-px w-0 bg-amber-400 transition-all duration-300 group-hover:w-3" />
      <span>{label}</span>
    </Link>
  );
}

export default function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-amber-500/20 bg-[#050505] text-white">
      {/* =====================================================
          BACKGROUND DECORATION
      ===================================================== */}
      <div className="pointer-events-none absolute left-[-180px] top-[-160px] h-[420px] w-[420px] rounded-full bg-amber-500/[0.045] blur-[110px]" />

      <div className="pointer-events-none absolute right-[-160px] bottom-[-180px] h-[420px] w-[420px] rounded-full bg-orange-500/[0.035] blur-[120px]" />

      {/* =====================================================
          MAIN FOOTER
      ===================================================== */}
      <div className="relative mx-auto max-w-7xl px-6 py-16 md:py-20">
        <div className="grid gap-12 lg:grid-cols-[1.25fr_0.75fr_0.95fr] lg:gap-16">
          {/* =================================================
              BRAND
          ================================================= */}
          <div>
            <Link
              href="/"
              className="group inline-flex items-center gap-4"
            >
              <div className="relative">
                <div className="pointer-events-none absolute -inset-2 rounded-2xl bg-amber-500/10 blur-xl transition group-hover:bg-amber-500/20" />

                <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl border border-amber-400/20 bg-[#101010]">
                  <img
                    src="/logo/logo-dkkt.png"
                    alt="Logo Dewan Kesenian dan Kebudayaan Kota Tasikmalaya"
                    className="h-12 w-12 object-contain"
                  />
                </div>
              </div>

              <div className="leading-tight">
                <h2 className="text-lg font-black text-white">
                  Dewan Kesenian dan Kebudayaan
                </h2>

                <p className="mt-1 text-sm font-semibold text-amber-300">
                  Kota Tasikmalaya
                </p>
              </div>
            </Link>

            <p className="mt-7 max-w-xl text-sm leading-8 text-gray-400 md:text-base">
              Portal resmi Dewan Kesenian dan Kebudayaan Kota Tasikmalaya
              sebagai ruang informasi, dokumentasi, promosi, dan penguatan
              ekosistem seni serta kebudayaan.
            </p>

            {/* Tags */}
            <div className="mt-7 flex flex-wrap gap-2">
              {["Seni", "Budaya", "Kolaborasi", "Tasikmalaya"].map(
                (item) => (
                  <span
                    key={item}
                    className="rounded-full border border-white/10 bg-white/[0.025] px-3.5 py-1.5 text-[11px] font-semibold text-gray-400 transition hover:border-amber-400/20 hover:bg-amber-500/5 hover:text-amber-300"
                  >
                    {item}
                  </span>
                ),
              )}
            </div>

            {/* Social */}
            <div className="mt-8">
              <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-gray-600">
                Ikuti DKKT
              </p>

              <div className="mt-4 flex flex-wrap gap-2">
                {socialLinks.map((item) => (
                  <a
                    key={item.label}
                    href={item.href}
                    className="rounded-xl border border-white/10 bg-white/2 px-3.5 py-2 text-xs font-semibold text-gray-400 transition hover:border-amber-400/30 hover:bg-amber-500/10 hover:text-amber-300"
                  >
                    {item.label}
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* =================================================
              PORTAL
          ================================================= */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-amber-400">
              Portal
            </p>

            <h3 className="mt-3 text-xl font-black text-white">
              Navigasi
            </h3>

            <div className="mt-6 grid gap-3">
              {portalLinks.map((item) => (
                <FooterLink
                  key={item.href}
                  href={item.href}
                  label={item.label}
                />
              ))}
            </div>
          </div>

          {/* =================================================
              KOMITE
          ================================================= */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-amber-400">
              Komite
            </p>

            <h3 className="mt-3 text-xl font-black text-white">
              7 Bidang Seni & Budaya
            </h3>

            <div className="mt-6 grid gap-3">
              {komiteLinks.map((item) => (
                <FooterLink
                  key={item.href}
                  href={item.href}
                  label={item.label}
                />
              ))}
            </div>
          </div>
        </div>

        {/* =====================================================
            CONTACT STRIP
        ===================================================== */}
        <div className="relative mt-14 overflow-hidden rounded-3xl border border-amber-400/15 bg-[#0c0c0c]">
          <div className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-amber-300 via-amber-500 to-transparent" />

          <div className="pointer-events-none absolute right-0 top-0 h-full w-1/2 bg-gradient-to-l from-amber-500/[0.06] to-transparent" />

          <div className="relative flex flex-col gap-6 p-6 md:flex-row md:items-center md:justify-between md:p-8">
            <div className="max-w-3xl">
              <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-amber-400">
                Hubungi DKKT
              </p>

              <h3 className="mt-2 text-xl font-black leading-tight text-white md:text-2xl">
                Terhubung dengan ekosistem seni dan budaya Kota Tasikmalaya.
              </h3>

              <p className="mt-2 text-sm leading-7 text-gray-500">
                Informasi kegiatan, kolaborasi, publikasi, komunitas,
                kemitraan, dan kebutuhan komunikasi lainnya.
              </p>
            </div>

            <Link
              href="/kontak"
              className="inline-flex shrink-0 items-center justify-center rounded-xl bg-amber-500 px-6 py-3 text-sm font-bold text-black transition duration-300 hover:-translate-y-0.5 hover:bg-amber-400 hover:shadow-[0_8px_25px_rgba(245,158,11,0.15)]"
            >
              Hubungi Kami
              <span className="ml-2 transition-transform duration-300 hover:translate-x-1">
                →
              </span>
            </Link>
          </div>
        </div>
      </div>

      {/* =====================================================
          BOTTOM BAR
      ===================================================== */}
      <div className="relative border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-6 text-xs text-gray-600 md:flex-row md:items-center md:justify-between">
          <p className="leading-6">
            © 2026 Dewan Kesenian dan Kebudayaan Kota Tasikmalaya.
            <span className="ml-1">Semua hak dilindungi.</span>
          </p>

          <div className="flex flex-wrap items-center gap-5">
            <Link
              href="/profil#legalitas"
              className="transition hover:text-amber-400"
            >
              Legalitas
            </Link>

            <Link
              href="/kontak"
              className="transition hover:text-amber-400"
            >
              Kontak
            </Link>

            <span className="font-semibold text-amber-400">
              DKKT
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}