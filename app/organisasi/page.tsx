import Link from "next/link";
import { connection } from "next/server";

import PageHero from "@/components/PageHero";

type OrganizationMember = {
  id: string;
  name: string;
  position: string;
  photo: string | null;
  biography: string | null;
};

type OrganizationSection = {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
  members: OrganizationMember[];
};

async function getOrganizationData(): Promise<OrganizationSection[]> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/api/public/organization`,
      {
        cache: "no-store",
      },
    );

    if (!response.ok) {
      return [];
    }

    const result = await response.json() as { data?: OrganizationSection[] };

    return Array.isArray(result.data) ? result.data : [];
  } catch {
    return [];
  }
}

export default async function OrganisasiPage() {
  await connection();
  const sections = await getOrganizationData();

  return (
    <main className="min-h-screen bg-black text-white">
      <PageHero
        eyebrow="Struktur DKKT"
        title="Organisasi"
        highlight="Kepengurusan & Bidang Kerja"
        description="Struktur organisasi DKKT berfungsi sebagai wadah koordinasi, pembinaan, dan pengembangan seni dan kebudayaan Kota Tasikmalaya."
      >
        <div className="flex flex-wrap gap-4">
          <Link
            href="/profil#struktur"
            className="rounded-xl bg-amber-500 px-6 py-3 font-semibold text-black transition hover:bg-amber-400"
          >
            Lihat Profil
          </Link>

          <Link
            href="/komite"
            className="rounded-xl border border-amber-500 px-6 py-3 font-semibold text-amber-400 transition hover:bg-amber-500 hover:text-black"
          >
            Portal Komite
          </Link>
        </div>
      </PageHero>

      <section className="py-20 md:py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-10">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-amber-400">
              Susunan Kepengurusan
            </p>
            <h2 className="mt-3 text-4xl font-black md:text-5xl">
              Struktur DKKT
            </h2>
          </div>

          {sections.length === 0 ? (
            <div className="rounded-3xl border border-white/10 bg-[#0b0b0b] p-10 text-center text-gray-400">
              Data struktur organisasi belum tersedia.
            </div>
          ) : (
            <div className="space-y-6">
              {sections.map((section, index) => (
                <div
                  key={section.id}
                  className="overflow-hidden rounded-3xl border border-white/10 bg-[#0b0b0b]"
                >
                  <div className="border-b border-white/10 bg-white/2 px-6 py-5 md:px-8">
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-amber-400">
                          {String(index + 1).padStart(2, "0")}
                        </p>
                        <h3 className="mt-2 text-2xl font-black text-white md:text-3xl">
                          {section.name}
                        </h3>
                      </div>

                      <span className="inline-flex items-center rounded-full border border-emerald-500/20 bg-emerald-500/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300">
                        {section.isActive ? "Aktif" : "Tidak Aktif"}
                      </span>
                    </div>

                    {section.description && (
                      <p className="mt-4 max-w-3xl text-sm leading-7 text-gray-400">
                        {section.description}
                      </p>
                    )}
                  </div>

                  <div className="p-6 md:p-8">
                    {Array.isArray(section.members) && section.members.length > 0 ? (
                      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                        {section.members.map((member) => (
                          <div
                            key={member.id}
                            className="rounded-2xl border border-white/10 bg-[#111111] p-5"
                          >
                            <div className="flex items-start gap-4">
                              {member.photo ? (
                                <img
                                  src={member.photo}
                                  alt={member.name}
                                  className="h-16 w-16 rounded-2xl object-cover"
                                />
                              ) : (
                                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/10 text-lg font-black text-amber-300">
                                  {member.name?.slice(0, 2)?.toUpperCase() || "AN"}
                                </div>
                              )}

                              <div className="min-w-0 flex-1">
                                <p className="truncate text-lg font-black text-white">
                                  {member.name}
                                </p>
                                <p className="mt-1 text-xs font-semibold uppercase tracking-[0.25em] text-amber-300">
                                  {member.position || "Anggota"}
                                </p>
                              </div>
                            </div>

                            {member.biography && (
                              <p className="mt-4 text-sm leading-7 text-gray-400">
                                {member.biography}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="rounded-2xl border border-dashed border-white/10 bg-black/20 p-6 text-center text-sm text-gray-400">
                        Belum ada anggota yang ditambahkan pada bagian ini.
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
