import Link from "next/link";

import OrganizationActions from "@/components/admin/OrganizationActions";
import AdminListSearch from "@/components/admin/AdminListSearch";
import { requireAdmin } from "@/lib/admin";
import { db } from "@/lib/db";
import { hasPermission } from "@/lib/permissions";
import { matchesSearch } from "@/lib/search";

export default async function AdminOrganisasiPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string | string[] }>;
}) {
  const params = await searchParams;
  const query = typeof params.q === "string" ? params.q.trim() : "";
  const session = await requireAdmin();
  const canView = await hasPermission({
    userId: session.userId,
    permission: "organization.view",
  });

  if (!canView) {
    return (
      <section className="rounded-3xl border border-red-500/20 bg-red-500/5 p-8">
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-red-400">
          Akses Ditolak
        </p>
        <h1 className="mt-3 text-2xl font-black text-white">
          Anda tidak mempunyai akses ke struktur organisasi.
        </h1>
        <Link
          href="/admin"
          className="mt-6 inline-flex rounded-xl bg-amber-500 px-5 py-3 text-sm font-bold text-black"
        >
          Kembali ke Dashboard
        </Link>
      </section>
    );
  }

  const [allSections, members, artists] = await Promise.all([
    db.orm.public.OrganizationSection.all(),
    db.orm.public.OrganizationMember.all(),
    db.orm.public.Artist.all(),
  ]);
  const sections = allSections.filter((section) => section.name.trim().toLowerCase() !== "pembina");
  const artistMap = new Map(artists.map((artist) => [artist.id, artist]));
  const visibleMembers = members.filter((member) => sections.some((section) => section.id === member.sectionId));

  const sortedSections = [...sections]
    .filter((section) => {
      const sectionMembers = members.filter((member) => member.sectionId === section.id);
      return matchesSearch(query, [
        section.name,
        section.slug,
        section.description,
        ...sectionMembers.flatMap((member) => [
          member.name,
          member.position,
          member.artistId ? artistMap.get(member.artistId)?.name : "",
          member.artistId ? artistMap.get(member.artistId)?.registrationNumber : "",
        ]),
      ]);
    })
    .sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <div className="mx-auto max-w-7xl pb-20">
      <section className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-amber-400">
            CMS DKKT
          </p>
          <h1 className="mt-2 text-3xl font-black text-white md:text-4xl">
            Organisasi
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-gray-400">
            Struktur organisasi dan anggota pengelola DKKT.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/admin/organisasi/tambah"
            className="inline-flex items-center justify-center rounded-xl bg-amber-500 px-5 py-3 text-sm font-bold text-black transition hover:bg-amber-400"
          >
            + Tambah Bagian
          </Link>

          <Link
            href="/admin"
            className="inline-flex items-center justify-center rounded-xl border border-white/10 px-5 py-3 text-sm font-semibold text-gray-300 hover:border-amber-400/40 hover:text-amber-300"
          >
            Kembali ke Dashboard
          </Link>
        </div>
      </section>

      <section className="mt-8 grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-[#0b0b0b] p-5">
          <p className="text-xs uppercase tracking-[0.2em] text-gray-600">
            Bagian Struktur
          </p>
          <p className="mt-2 text-3xl font-black text-white">{sections.length}</p>
        </div>

        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-5">
          <p className="text-xs uppercase tracking-[0.2em] text-emerald-400">
            Bagian Aktif
          </p>
          <p className="mt-2 text-3xl font-black text-emerald-300">
            {sections.filter((item) => item.isActive).length}
          </p>
        </div>

        <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-5">
          <p className="text-xs uppercase tracking-[0.2em] text-amber-400">
            Total Anggota
          </p>
          <p className="mt-2 text-3xl font-black text-amber-300">
            {visibleMembers.length}
          </p>
        </div>
      </section>

      <div className="mt-8"><AdminListSearch query={query} clearHref="/admin/organisasi" placeholder="Cari bagian, slug, anggota, jabatan" resultCount={sortedSections.length} /></div>

      <section className="mt-8 rounded-3xl border border-white/10 bg-[#0b0b0b]">
        <div className="border-b border-white/10 px-6 py-5">
          <h2 className="text-lg font-black text-white">Struktur Organisasi</h2>
          <p className="mt-1 text-sm text-gray-500">
            Daftar bagian dan jumlah anggota yang terdaftar.
          </p>
        </div>

        {sortedSections.length === 0 ? (
          <div className="px-6 py-16 text-center text-gray-500">
            {query ? "Tidak ada bagian organisasi yang cocok dengan pencarian." : "Belum ada struktur organisasi."}
          </div>
        ) : (
          <div className="space-y-4 p-6">
            {sortedSections.map((section) => {
                  const sectionMembers = members.filter((member) => member.sectionId === section.id);
                  const count = sectionMembers.length;

              return (
                <article
                  key={section.id}
                  className="rounded-2xl border border-white/10 bg-black/20 p-5"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-3">
                        <h3 className="text-xl font-black text-white">{section.name}</h3>
                        <span
                          className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] ${
                            section.isActive
                              ? "border-emerald-500/20 bg-emerald-500/5 text-emerald-300"
                              : "border-white/10 text-gray-500"
                          }`}
                        >
                          {section.isActive ? "Aktif" : "Nonaktif"}
                        </span>
                      </div>

                      <p className="mt-2 text-sm leading-7 text-gray-400">
                        {section.description || "Belum ada deskripsi bagian."}
                      </p>

                      <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-gray-500">
                        <span>Slug: {section.slug}</span>
                        <span>Urutan: {section.sortOrder}</span>
                        <span>{count} anggota</span>
                      </div>
                    </div>

                    <OrganizationActions sectionId={section.id} />
                  </div>

                  {count > 0 && (
                    <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                      {sectionMembers
                        .sort((a, b) => a.sortOrder - b.sortOrder)
                        .map((member) => (
                          <div
                            key={member.id}
                            className="rounded-2xl border border-white/10 bg-[#111111] p-4"
                          >
                            <div className="flex items-start gap-3">
                              {((member.artistId ? artistMap.get(member.artistId)?.photo : null) || member.photo) ? (
                                <img
                                  src={(member.artistId ? artistMap.get(member.artistId)?.photo : null) || member.photo || ""}
                                  alt={(member.artistId ? artistMap.get(member.artistId)?.name : null) || member.name}
                                  className="h-12 w-12 rounded-xl object-cover"
                                />
                              ) : (
                                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/10 text-sm font-bold text-amber-300">
                                  {((member.artistId ? artistMap.get(member.artistId)?.name : null) || member.name).slice(0, 2).toUpperCase() || "AN"}
                                </div>
                              )}

                              <div className="min-w-0 flex-1">
                                <p className="truncate font-bold text-white">{(member.artistId ? artistMap.get(member.artistId)?.name : null) || member.name}</p>
                                {member.artistId && artistMap.get(member.artistId)?.registrationNumber && <p className="mt-1 font-mono text-[10px] text-gray-500">{artistMap.get(member.artistId)?.registrationNumber}</p>}
                                <p className="mt-1 text-xs uppercase tracking-[0.2em] text-amber-300">
                                  {member.position || "Anggota"}
                                </p>
                              </div>
                            </div>

                            {member.biography && (
                              <p className="mt-3 text-sm leading-6 text-gray-400">
                                {member.biography}
                              </p>
                            )}
                          </div>
                        ))}
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
