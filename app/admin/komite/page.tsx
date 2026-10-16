import Link from "next/link";

import CommitteeChairSelector from "@/components/admin/CommitteeChairSelector";
import CommitteeMembersManager from "@/components/admin/CommitteeMembersManager";
import AdminListSearch from "@/components/admin/AdminListSearch";
import PrintReportButton from "@/components/admin/PrintReportButton";
import { requireAdmin } from "@/lib/admin";
import { db } from "@/lib/db";
import { canManageCommittee, getAccessibleCommitteeIds, hasPermission } from "@/lib/permissions";
import { matchesSearch } from "@/lib/search";

export default async function AdminKomitePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string | string[] }>;
}) {
  const params = await searchParams;
  const query = typeof params.q === "string" ? params.q.trim() : "";
  const session = await requireAdmin();
  const [canView, canUpdate] = await Promise.all([
    hasPermission({ userId: session.userId, permission: "committee.view" }),
    hasPermission({ userId: session.userId, permission: "committee.update" }),
  ]);

  if (!canView) {
    return <section className="rounded-3xl border border-red-500/20 bg-red-500/5 p-8"><p className="text-xs font-bold uppercase tracking-[0.3em] text-red-400">Akses Ditolak</p><h1 className="mt-3 text-2xl font-black text-white">Anda tidak mempunyai akses ke modul Komite.</h1><Link href="/admin" className="mt-6 inline-flex rounded-xl bg-amber-500 px-5 py-3 text-sm font-bold text-black">Kembali ke Dashboard</Link></section>;
  }

  const [committees, members] = await Promise.all([
    db.orm.public.Committee.all(),
    db.orm.public.CommitteeMember.all(),
  ]);
  const accessibleCommitteeIds = await getAccessibleCommitteeIds(session.userId);
  const assignedCommittees = committees.filter(
    (committee) => accessibleCommitteeIds === null || accessibleCommitteeIds.includes(committee.id),
  );
  const visibleCommittees = assignedCommittees.filter((committee) => matchesSearch(query, [committee.name, committee.shortName, committee.slug, committee.description, committee.chairman]));
  const visibleCommitteeIds = new Set(visibleCommittees.map((committee) => committee.id));
  const visibleMembers = members.filter((member) => visibleCommitteeIds.has(member.committeeId));
  const memberCounts = new Map<string, number>();
  for (const member of visibleMembers) memberCounts.set(member.committeeId, (memberCounts.get(member.committeeId) || 0) + 1);
  const sortedCommittees = visibleCommittees.sort((a, b) => a.sortOrder - b.sortOrder);
  const canManageMembers = await hasPermission({ userId: session.userId, permission: "committee.member.manage" });
  const memberManagementByCommittee = new Map(await Promise.all(sortedCommittees.map(async (committee) => [
    committee.id,
    canManageMembers && await canManageCommittee(session.userId, committee.id),
  ] as const)));

  const artists = await db.orm.public.Artist.all();
  const artistById = new Map(artists.map((artist) => [artist.id, artist]));

  return (
    <div className="mx-auto max-w-7xl pb-20">
      <section className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between"><div><p className="text-xs font-bold uppercase tracking-[0.3em] text-amber-400">CMS DKKT</p><h1 className="mt-2 text-3xl font-black text-white md:text-4xl">Komite</h1><p className="mt-3 max-w-2xl text-sm leading-7 text-gray-400">Kelola bidang seni dan kebudayaan beserta anggota komite DKKT.</p></div><div className="flex flex-wrap items-center gap-3"><PrintReportButton href="/admin/laporan?category=committee" /><Link href="/admin" className="inline-flex items-center justify-center rounded-xl border border-white/10 px-5 py-3 text-sm font-semibold text-gray-300 hover:border-amber-400/40 hover:text-amber-300">Kembali ke Dashboard</Link></div></section>
      <section className="mt-8 grid gap-4 sm:grid-cols-3"><div className="rounded-2xl border border-white/10 bg-[#0b0b0b] p-5"><p className="text-xs uppercase tracking-[0.2em] text-gray-600">Total Komite</p><p className="mt-2 text-3xl font-black text-white">{visibleCommittees.length}</p></div><div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-5"><p className="text-xs uppercase tracking-[0.2em] text-emerald-400">Komite Aktif</p><p className="mt-2 text-3xl font-black text-emerald-300">{visibleCommittees.filter((item) => item.isActive).length}</p></div><div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-5"><p className="text-xs uppercase tracking-[0.2em] text-amber-400">Total Anggota</p><p className="mt-2 text-3xl font-black text-amber-300">{visibleMembers.length}</p></div></section>
      <div className="mt-8"><AdminListSearch query={query} clearHref="/admin/komite" placeholder="Cari nama, bidang, ketua, deskripsi" resultCount={visibleCommittees.length} /></div>
      {visibleCommittees.length === 0 && <p className="mt-8 border-t border-white/10 py-8 text-center text-sm text-gray-500">{query ? "Tidak ada komite yang cocok dengan pencarian." : "Belum ada komite yang ditugaskan."}</p>}
      <section className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">{sortedCommittees.map((committee) => {
        const chairman = committee.chairmanArtistId ? artistById.get(committee.chairmanArtistId) : undefined;
        return <article key={committee.id} className="rounded-3xl border border-white/10 bg-[#0b0b0b] p-6"><div className="flex items-start justify-between gap-4"><div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/10 text-2xl">{committee.icon || "✦"}</div><span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${committee.isActive ? "border-emerald-500/20 bg-emerald-500/5 text-emerald-300" : "border-white/10 text-gray-500"}`}>{committee.isActive ? "Aktif" : "Nonaktif"}</span></div><h2 className="mt-5 text-xl font-black text-white">{committee.name}</h2><p className="mt-2 text-sm leading-6 text-gray-400">{committee.description || "Belum ada deskripsi komite."}</p><div className="mt-5 border-t border-white/10 pt-4 text-sm text-gray-500"><div className="flex justify-between gap-3"><span>Ketua</span><span className="text-right text-gray-300">{chairman?.name || committee.chairman || "Belum diisi"}</span></div>{chairman && <p className="mt-1 text-right text-xs text-amber-300">NTA / No. registrasi: {chairman.registrationNumber}</p>}<div className="mt-2 flex justify-between gap-3"><span>Anggota</span><span className="font-semibold text-amber-300">{memberCounts.get(committee.id) || 0}</span></div></div>{canUpdate && <CommitteeChairSelector committeeId={committee.id} currentArtistId={committee.chairmanArtistId} currentName={committee.chairman} />}<CommitteeMembersManager committeeId={committee.id} initialMembers={visibleMembers.filter((member) => member.committeeId === committee.id)} canManage={memberManagementByCommittee.get(committee.id) || false} /></article>;
      })}</section>
    </div>
  );
}