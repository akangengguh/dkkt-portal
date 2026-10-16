"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

type DropdownItem = {
  label: string;
  href: string;
  description?: string;
  icon?: string;
};

type MenuItem = {
  label: string;
  href?: string;
  dropdown?: DropdownItem[];
};

const menuItems: MenuItem[] = [
  {
    label: "Beranda",
    href: "/",
  },

  {
    label: "Profil",
    href: "/profil",
    dropdown: [
      {
        label: "Tentang DKKT",
        href: "/profil",
        description:
          "Mengenal DKKT dan perannya dalam ekosistem budaya.",
        icon: "🏛",
      },
      {
        label: "Struktur Organisasi",
        href: "/profil#struktur",
        description:
          "Pengurus, bidang, pembina, dan tujuh komite DKKT.",
        icon: "👥",
      },
      {
        label: "Visi & Misi",
        href: "/profil#visi-misi",
        description:
          "Arah strategis pengembangan seni dan kebudayaan.",
        icon: "◇",
      },
      {
        label: "Dasar Hukum / SK",
        href: "/profil#legalitas",
        description:
          "Dokumen legalitas dan Surat Keputusan DKKT.",
        icon: "📄",
      },
    ],
  },

  {
    label: "Komite",
    href: "/komite",
    dropdown: [
      {
        label: "Semua Komite",
        href: "/komite",
        description: "Lihat seluruh tujuh komite DKKT.",
        icon: "✦",
      },
      {
        label: "Seni Teater",
        href: "/komite/teater",
        icon: "🎭",
      },
      {
        label: "Seni Tari",
        href: "/komite/tari",
        icon: "💃",
      },
      {
        label: "Seni Musik",
        href: "/komite/musik",
        icon: "🎵",
      },
      {
        label: "Seni Rupa",
        href: "/komite/seni-rupa",
        icon: "🎨",
      },
      {
        label: "Seni Sastra",
        href: "/komite/sastra",
        icon: "📖",
      },
      {
        label: "Film & Fotografi",
        href: "/komite/film-fotografi",
        icon: "🎬",
      },
      {
        label: "Budaya",
        href: "/komite/budaya",
        icon: "🏛",
      },
    ],
  },

  {
    label: "Ekosistem",
    href: "/seniman",
    dropdown: [
      {
        label: "Seniman & Budayawan",
        href: "/seniman",
        description: "Profil pelaku seni dan budaya DKKT.",
        icon: "✦",
      },
      {
        label: "Kelompok & Sanggar",
        href: "/kelompok",
        description: "Komunitas dan sanggar dalam ekosistem DKKT.",
        icon: "👥",
      },
    ],
  },

  {
    label: "Berita",
    href: "/berita",
    dropdown: [
      {
        label: "Semua Berita",
        href: "/berita",
        description:
          "Seluruh publikasi dan berita terbaru DKKT.",
        icon: "📰",
      },
      {
        label: "Teater",
        href: "/berita?komite=teater",
        icon: "🎭",
      },
      {
        label: "Tari",
        href: "/berita?komite=tari",
        icon: "💃",
      },
      {
        label: "Musik",
        href: "/berita?komite=musik",
        icon: "🎵",
      },
      {
        label: "Seni Rupa",
        href: "/berita?komite=seni-rupa",
        icon: "🎨",
      },
      {
        label: "Sastra",
        href: "/berita?komite=sastra",
        icon: "📖",
      },
      {
        label: "Film & Fotografi",
        href: "/berita?komite=film-fotografi",
        icon: "🎬",
      },
      {
        label: "Budaya",
        href: "/berita?komite=budaya",
        icon: "🏛",
      },
    ],
  },

  {
    label: "Agenda",
    href: "/agenda",
    dropdown: [
      {
        label: "Semua Agenda",
        href: "/agenda",
        description:
          "Kalender kegiatan resmi DKKT tahun 2026.",
        icon: "📅",
      },
      {
        label: "Agenda Teater",
        href: "/agenda?komite=teater",
        icon: "🎭",
      },
      {
        label: "Agenda Tari",
        href: "/agenda?komite=tari",
        icon: "💃",
      },
      {
        label: "Agenda Musik",
        href: "/agenda?komite=musik",
        icon: "🎵",
      },
      {
        label: "Agenda Seni Rupa",
        href: "/agenda?komite=seni-rupa",
        icon: "🎨",
      },
      {
        label: "Agenda Sastra",
        href: "/agenda?komite=sastra",
        icon: "📖",
      },
      {
        label: "Agenda Film & Fotografi",
        href: "/agenda?komite=film-fotografi",
        icon: "🎬",
      },
      {
        label: "Agenda Budaya",
        href: "/agenda?komite=budaya",
        icon: "🏛",
      },
    ],
  },

  {
    label: "Galeri",
    href: "/galeri",
    dropdown: [
      {
        label: "Semua Galeri",
        href: "/galeri",
        description:
          "Dokumentasi visual perjalanan seni dan budaya DKKT.",
        icon: "🖼",
      },
      {
        label: "Foto",
        href: "/galeri#foto",
        icon: "📷",
      },
      {
        label: "Video",
        href: "/galeri#video",
        icon: "🎬",
      },
      {
        label: "Arsip Digital",
        href: "/galeri#arsip",
        icon: "🗂",
      },
    ],
  },

  {
    label: "Kontak",
    href: "/kontak",
  },
];

export default function Navbar() {
  const pathname = usePathname();
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileSubmenu, setMobileSubmenu] = useState<string | null>(null);

  const navRef = useRef<HTMLElement | null>(null);

  const shouldHideNavbar =
    pathname.startsWith("/admin") ||
    pathname === "/login";

  if (shouldHideNavbar) {
    return null;
  }

  /*
   * ==========================================================
   * ACTIVE MENU
   * ==========================================================
   */
  const isMenuActive = (item: MenuItem) => {
    if (!item.href) return false;

    if (item.href === "/") {
      return pathname === "/";
    }

    return pathname.startsWith(item.href);
  };

  /*
   * ==========================================================
   * DESKTOP DROPDOWN
   * ==========================================================
   */
  const toggleDropdown = (label: string) => {
    setOpenMenu((current) =>
      current === label ? null : label
    );
  };

  /*
   * ==========================================================
   * RENDER
   * ==========================================================
   */

  return (
    <header className="fixed inset-x-0 top-0 z-100 border-b border-amber-500/20 bg-black/90 backdrop-blur-xl">
      <nav ref={navRef}>
        {/* ====================================================
            NAVBAR UTAMA
        ==================================================== */}
        <div className="mx-auto flex h-22 max-w-7xl items-center justify-between px-6">
          {/* ==================================================
              BRAND
          ================================================== */}
          <Link
            href="/"
            className="flex min-w-0 items-center gap-3"
            onClick={() => {
              setOpenMenu(null);
              setMobileOpen(false);
              setMobileSubmenu(null);
            }}
          >
            <img
              src="/logo/logo-dkkt.png"
              alt="Logo Dewan Kesenian dan Kebudayaan Kota Tasikmalaya"
              className="h-14 w-14 shrink-0 object-contain md:h-16 md:w-16"
            />

            <div className="min-w-0 leading-tight">
              <h1 className="truncate text-sm font-bold tracking-tight text-white md:text-lg">
                Dewan Kesenian dan Kebudayaan
              </h1>

              <p className="mt-1 text-xs font-medium text-amber-300 md:text-sm">
                Kota Tasikmalaya
              </p>
            </div>
          </Link>

          {/* ==================================================
              DESKTOP NAVIGATION
          ================================================== */}
          <div className="hidden items-center gap-1 md:flex">
            {menuItems.map((item) => {
              const active = isMenuActive(item);

              /*
               * MENU BIASA
               */
              if (!item.dropdown) {
                return (
                  <Link
                    key={item.label}
                    href={item.href ?? "#"}
                    className={`relative rounded-xl px-3 py-2 text-sm font-medium transition-all duration-200 ${
                      active
                        ? "text-amber-400"
                        : "text-gray-300 hover:bg-white/5 hover:text-amber-400"
                    }`}
                  >
                    {item.label}

                    {active && (
                      <span className="absolute bottom-0 left-3 right-3 h-0.5 rounded-full bg-amber-400" />
                    )}
                  </Link>
                );
              }

              const dropdownOpen =
                openMenu === item.label;

              return (
                <div
                  key={item.label}
                  className="relative"
                >
                  {/* TRIGGER */}
                  <button
                    type="button"
                    aria-haspopup="menu"
                    aria-expanded={dropdownOpen}
                    onClick={() =>
                      toggleDropdown(item.label)
                    }
                    className={`flex items-center gap-1 rounded-xl px-3 py-2 text-sm font-medium transition-all duration-200 ${
                      active || dropdownOpen
                        ? "bg-white/5 text-amber-400"
                        : "text-gray-300 hover:bg-white/5 hover:text-amber-400"
                    }`}
                  >
                    <span>{item.label}</span>

                    <span
                      className={`ml-1 text-[9px] transition-transform duration-200 ${
                        dropdownOpen
                          ? "rotate-180"
                          : ""
                      }`}
                    >
                      ▼
                    </span>
                  </button>

                  {/* DROPDOWN */}
                  <div
                    className={`absolute left-1/2 top-full w-82.5 -translate-x-1/2 pt-3 transition-all duration-200 ${
                      dropdownOpen
                        ? "visible translate-y-0 opacity-100"
                        : "pointer-events-none invisible -translate-y-2 opacity-0"
                    }`}
                  >
                    <div className="overflow-hidden rounded-2xl border border-amber-500/20 bg-[#0B0B0B] p-2 shadow-[0_20px_60px_rgba(0,0,0,0.65)]">
                      {/* HEADER */}
                      <div className="border-b border-white/10 px-4 py-3">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-amber-400">
                          DKKT
                        </p>

                        <p className="mt-1 text-sm font-bold text-white">
                          {item.label}
                        </p>
                      </div>

                      {/* ITEMS */}
                      <div className="max-h-105 overflow-y-auto py-2">
                        {item.dropdown.map(
                          (subItem) => (
                            <Link
                              key={`${item.label}-${subItem.label}`}
                              href={subItem.href}
                              onClick={() =>
                                setOpenMenu(null)
                              }
                              className="group flex items-start gap-3 rounded-xl px-3 py-3 transition hover:bg-amber-500/10"
                            >
                              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 text-base transition group-hover:bg-amber-500 group-hover:text-black">
                                {subItem.icon ?? "•"}
                              </span>

                              <span className="min-w-0">
                                <span className="block text-sm font-semibold text-gray-200 transition group-hover:text-amber-300">
                                  {subItem.label}
                                </span>

                                {subItem.description && (
                                  <span className="mt-1 block text-xs leading-5 text-gray-500">
                                    {subItem.description}
                                  </span>
                                )}
                              </span>

                              <span className="ml-auto pt-1 text-xs text-gray-600 transition group-hover:translate-x-1 group-hover:text-amber-400">
                                →
                              </span>
                            </Link>
                          )
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ==================================================
              LOGIN DESKTOP
          ================================================== */}
          <Link
            href="/login"
            className="hidden rounded-lg border border-white/10 bg-white/4 px-3 py-2 text-xs font-semibold text-gray-300 transition hover:border-amber-400/30 hover:text-amber-300 md:inline-flex"
          >
            Login
          </Link>

          {/* ==================================================
              MOBILE BUTTON
          ================================================== */}
          <button
            type="button"
            aria-label={
              mobileOpen
                ? "Tutup menu navigasi"
                : "Buka menu navigasi"
            }
            aria-expanded={mobileOpen}
            onClick={() => {
              setMobileOpen((value) => !value);
              setMobileSubmenu(null);
              setOpenMenu(null);
            }}
            className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white transition hover:border-amber-400 hover:text-amber-400 md:hidden"
          >
            <div className="space-y-1.5">
              <span
                className={`block h-0.5 w-5 bg-current transition-transform duration-300 ${
                  mobileOpen
                    ? "translate-y-2 rotate-45"
                    : ""
                }`}
              />

              <span
                className={`block h-0.5 w-5 bg-current transition-opacity duration-300 ${
                  mobileOpen
                    ? "opacity-0"
                    : "opacity-100"
                }`}
              />

              <span
                className={`block h-0.5 w-5 bg-current transition-transform duration-300 ${
                  mobileOpen
                    ? "-translate-y-2 -rotate-45"
                    : ""
                }`}
              />
            </div>
          </button>
        </div>

        {/* ====================================================
            MOBILE MENU
        ==================================================== */}
        <div
          className={`overflow-hidden border-t border-white/10 bg-black/95 transition-all duration-300 md:hidden ${
            mobileOpen
              ? "max-h-[calc(100vh-88px)] opacity-100"
              : "max-h-0 opacity-0"
          }`}
        >
          <div className="max-h-[calc(100vh-88px)] overflow-y-auto px-6 py-5">
            <div className="flex flex-col">
              {menuItems.map((item) => {
                const active = isMenuActive(item);
                const submenuOpen =
                  mobileSubmenu === item.label;

                /*
                 * MENU TANPA SUBMENU
                 */
                if (!item.dropdown) {
                  return (
                    <Link
                      key={item.label}
                      href={item.href ?? "#"}
                      onClick={() => {
                        setMobileOpen(false);
                        setMobileSubmenu(null);
                      }}
                      className={`border-b border-white/5 py-4 text-sm font-medium transition ${
                        active
                          ? "text-amber-400"
                          : "text-gray-300 hover:text-amber-400"
                      }`}
                    >
                      {item.label}
                    </Link>
                  );
                }

                /*
                 * MENU DENGAN SUBMENU
                 */
                return (
                  <div
                    key={item.label}
                    className="border-b border-white/5"
                  >
                    <div className="flex items-center">
                      <Link
                        href={item.href ?? "#"}
                        onClick={() => {
                          setMobileOpen(false);
                          setMobileSubmenu(null);
                        }}
                        className={`flex-1 py-4 text-sm font-medium ${
                          active
                            ? "text-amber-400"
                            : "text-gray-300"
                        }`}
                      >
                        {item.label}
                      </Link>

                      <button
                        type="button"
                        aria-label={`Buka submenu ${item.label}`}
                        aria-expanded={submenuOpen}
                        onClick={() =>
                          setMobileSubmenu(
                            submenuOpen
                              ? null
                              : item.label
                          )
                        }
                        className="flex h-10 w-10 items-center justify-center rounded-lg text-gray-400 transition hover:bg-white/5 hover:text-amber-400"
                      >
                        <span
                          className={`text-[10px] transition-transform duration-200 ${
                            submenuOpen
                              ? "rotate-180"
                              : ""
                          }`}
                        >
                          ▼
                        </span>
                      </button>
                    </div>

                    {/* SUBMENU MOBILE */}
                    <div
                      className={`overflow-hidden transition-all duration-300 ${
                        submenuOpen
                          ? "max-h-200 pb-3 opacity-100"
                          : "max-h-0 opacity-0"
                      }`}
                    >
                      <div className="ml-2 rounded-xl border border-white/5 bg-white/2 p-2">
                        {item.dropdown.map(
                          (subItem) => (
                            <Link
                              key={`${item.label}-${subItem.label}`}
                              href={subItem.href}
                              onClick={() => {
                                setMobileOpen(false);
                                setMobileSubmenu(null);
                              }}
                              className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm text-gray-400 transition hover:bg-amber-500/10 hover:text-amber-300"
                            >
                              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 text-sm">
                                {subItem.icon ?? "•"}
                              </span>

                              <span>
                                {subItem.label}
                              </span>
                            </Link>
                          )
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* LOGIN MOBILE */}
              <Link
                href="/login"
                onClick={() => {
                  setMobileOpen(false);
                  setMobileSubmenu(null);
                }}
                className="mt-4 inline-flex items-center justify-center rounded-lg border border-white/10 bg-white/4 px-4 py-2.5 text-sm font-semibold text-gray-300 transition hover:border-amber-400/30 hover:text-amber-300"
              >
                Login
              </Link>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}