import { ReactNode } from "react";
import Link from "next/link";

import { requireAdmin } from "@/lib/admin";
import { hasPermission } from "@/lib/permissions";
import LogoutButton from "@/components/admin/LogoutButton";

type AdminLayoutProps = {
  children: ReactNode;
};

const contentMenu = [
  {
    label: "Dashboard",
    href: "/admin",
    icon: "▦",
    permission: "dashboard.view",
  },
  {
    label: "Berita",
    href: "/admin/berita",
    icon: "📰",
    permission: "news.view",
  },
  {
    label: "Agenda",
    href: "/admin/agenda",
    icon: "📅",
    permission: "agenda.view",
  },
  {
    label: "Galeri",
    href: "/admin/galeri",
    icon: "🖼",
    permission: "gallery.view",
  },
  {
    label: "Media Library",
    href: "/admin/media",
    icon: "📁",
    permission: "media.view",
  },
  {
    label: "Dokumen",
    href: "/admin/dokumen",
    icon: "📄",
    permission: "document.view",
  },
];

const ecosystemMenu = [
  {
    label: "Komite",
    href: "/admin/komite",
    icon: "🎭",
    permission: "committee.view",
  },
  {
    label: "Organisasi",
    href: "/admin/organisasi",
    icon: "🏛",
    permission: "organization.view",
  },
  {
    label: "Seniman & Budayawan",
    href: "/admin/seniman",
    icon: "🎨",
    permission: "artist.view",
  },
  {
    label: "Kelompok / Sanggar",
    href: "/admin/kelompok",
    icon: "👥",
    permission: "group.view",
  },
];

const systemMenu = [
  {
    label: "Pengguna",
    href: "/admin/pengguna",
    icon: "👤",
    permission: "user.view",
  },
  {
    label: "Pesan Kontak",
    href: "/admin/pesan",
    icon: "✉",
    permission: "contact.view",
  },
  {
    label: "Pengaturan",
    href: "/admin/pengaturan",
    icon: "⚙",
    permission: "settings.view",
  },
  {
    label: "Audit Log",
    href: "/admin/audit-log",
    icon: "🛡",
    permission: "audit.view",
  },
];

function MenuSection({
  title,
  items,
}: {
  title: string;
  items: {
    label: string;
    href: string;
    icon: string;
      permission?: string;
  }[];
}) {
  return (
    <div className="mb-7">
      <p className="px-3 text-[10px] font-bold uppercase tracking-[0.3em] text-gray-600">
        {title}
      </p>

      <nav className="mt-3 space-y-1">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-400 transition hover:bg-amber-500/10 hover:text-amber-300"
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/3 text-sm transition group-hover:bg-amber-500/10">
              {item.icon}
            </span>

            <span>{item.label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}

export default async function AdminLayout({
  children,
}: AdminLayoutProps) {
  const session = await requireAdmin();
  const filterMenu = async (items: typeof contentMenu) => {
    const allowed = await Promise.all(items.map(async (item) => ({
      item,
      allowed: item.permission ? await hasPermission({ userId: session.userId, permission: item.permission }) : true,
    })));
    return allowed.filter((entry) => entry.allowed).map((entry) => entry.item);
  };
  const [visibleContentMenu, visibleEcosystemMenu, visibleSystemMenu] = await Promise.all([
    filterMenu(contentMenu),
    filterMenu(ecosystemMenu),
    filterMenu(systemMenu),
  ]);
  const visibleSystemItems = visibleSystemMenu.filter(
    (item) => item.href !== "/admin/audit-log" || session.roles.includes("SUPER_ADMIN") || session.roles.includes("ADMINISTRATOR"),
  );

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <div className="flex min-h-screen">
        {/* =====================================================
            SIDEBAR
        ===================================================== */}
        <aside className="hidden w-72 shrink-0 border-r border-white/10 bg-[#090909] lg:flex lg:flex-col print:hidden">
          {/* BRAND */}
          <div className="border-b border-white/10 px-6 py-5">
            <Link
              href="/admin"
              className="flex items-center gap-3"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-amber-500/20 bg-amber-500/10 p-2">
                <img
                  src="/logo/logo-dkkt.png"
                  alt="Logo DKKT"
                  className="h-full w-full object-contain"
                />
              </div>

              <div>
                <p className="text-sm font-black text-white">
                  CMS DKKT
                </p>

                <p className="mt-1 text-xs text-amber-400">
                  Kota Tasikmalaya
                </p>
              </div>
            </Link>
          </div>

          {/* NAV */}
          <div className="flex-1 overflow-y-auto px-4 py-6">
            <MenuSection
              title="Konten"
              items={visibleContentMenu}
            />

            <MenuSection
              title="Ekosistem"
              items={visibleEcosystemMenu}
            />

            <MenuSection
              title="Sistem"
              items={visibleSystemItems}
            />
          </div>

          {/* USER */}
          <div className="border-t border-white/10 p-4">
            <div className="rounded-2xl border border-white/10 bg-white/3 p-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gray-600">
                Login sebagai
              </p>

              <p className="mt-2 truncate text-sm font-bold text-white">
                {session.name}
              </p>

              <p className="mt-1 truncate text-xs text-gray-500">
                {session.email}
              </p>
            </div>
          </div>
        </aside>

        {/* =====================================================
            MAIN
        ===================================================== */}
        <div className="flex min-w-0 flex-1 flex-col">
          {/* HEADER CMS */}
          <header className="sticky top-0 z-30 border-b border-white/10 bg-[#070707]/95 backdrop-blur-xl print:hidden">
            <div className="flex h-16 items-center justify-between px-5 md:px-8">
              <div className="flex items-center gap-4">
                <div className="lg:hidden">
                  <Link
                    href="/admin"
                    className="flex h-10 w-10 items-center justify-center rounded-xl border border-amber-500/20 bg-amber-500/10"
                  >
                    <img
                      src="/logo/logo-dkkt.png"
                      alt="DKKT"
                      className="h-7 w-7 object-contain"
                    />
                  </Link>
                </div>

                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-amber-400">
                    CMS DKKT
                  </p>

                  <p className="mt-1 text-sm font-bold text-white">
                    Panel Administrasi
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="hidden text-right sm:block">
                  <p className="text-xs font-semibold text-white">
                    {session.name}
                  </p>

                  <p className="text-[11px] text-gray-500">
                    Administrator
                  </p>
                </div>

                <Link
                  href="/"
                  className="rounded-xl border border-white/10 px-4 py-2 text-xs font-semibold text-gray-400 transition hover:border-amber-400/40 hover:text-amber-300"
                >
                  Portal
                </Link>

                <LogoutButton />
              </div>
            </div>
          </header>

          {/* CONTENT */}
          <main className="flex-1 px-5 py-6 md:px-8 md:py-8 print:m-0 print:p-0">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}