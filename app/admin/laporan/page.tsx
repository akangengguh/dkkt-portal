import Link from "next/link";

import ReportCenter, {
  type ReportCategory,
  type ReportCategoryOption,
  type ReportRow,
} from "@/components/admin/ReportCenter";
import { requireAdmin } from "@/lib/admin";
import { db } from "@/lib/db";
import { getAccessibleCommitteeIds, hasPermission } from "@/lib/permissions";

const registrationStatusLabels: Record<string, string> = {
  PENDING: "Menunggu verifikasi",
  VERIFIED: "Terverifikasi · menunggu kartu",
  ACTIVE: "Aktif · kartu diterbitkan",
  REJECTED: "Ditolak",
  EXPIRED: "Kedaluwarsa",
};

function reportDate(value: unknown) {
  if (!value) return { date: "", dateLabel: "-" };
  const parsed = new Date(String(value));
  if (Number.isNaN(parsed.getTime())) return { date: "", dateLabel: "-" };
  return {
    date: parsed.toISOString().slice(0, 10),
    dateLabel: parsed.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      timeZone: "UTC",
    }),
  };
}

export default async function AdminReportPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string | string[] }>;
}) {
  const params = await searchParams;
  const requestedCategory = typeof params.category === "string" ? params.category : "all";
  const initialCategory: ReportCategory | "all" = ["artist", "group", "committee"].includes(requestedCategory)
    ? requestedCategory as ReportCategory
    : "all";
  const session = await requireAdmin();
  const [canViewArtists, canViewGroups, canViewCommittees] = await Promise.all([
    hasPermission({ userId: session.userId, permission: "artist.view" }),
    hasPermission({ userId: session.userId, permission: "group.view" }),
    hasPermission({ userId: session.userId, permission: "committee.view" }),
  ]);

  const categories: ReportCategoryOption[] = [
    ...(canViewArtists ? [{ value: "artist" as const, label: "Seniman" }] : []),
    ...(canViewGroups ? [{ value: "group" as const, label: "Kelompok / Sanggar" }] : []),
    ...(canViewCommittees ? [{ value: "committee" as const, label: "Komite" }] : []),
  ];

  if (categories.length === 0) {
    return (
      <section className="rounded-xl border border-red-500/20 bg-red-500/5 p-8">
        <h1 className="text-2xl font-bold text-white">Akses ditolak</h1>
        <p className="mt-2 text-gray-400">Anda tidak memiliki akses ke data laporan.</p>
        <Link href="/admin" className="mt-5 inline-flex rounded-lg bg-amber-400 px-4 py-2 font-semibold text-black">Kembali</Link>
      </section>
    );
  }

  const [artistRecords, groupRecords, committeeRecords, memberRecords] = await Promise.all([
    canViewArtists ? db.orm.public.Artist.all() : Promise.resolve([]),
    canViewGroups ? db.orm.public.CulturalGroup.all() : Promise.resolve([]),
    canViewCommittees ? db.orm.public.Committee.all() : Promise.resolve([]),
    canViewCommittees ? db.orm.public.CommitteeMember.all() : Promise.resolve([]),
  ]);
  const accessibleCommitteeIds = canViewCommittees
    ? await getAccessibleCommitteeIds(session.userId)
    : [];
  const committees = committeeRecords
    .filter((committee) => accessibleCommitteeIds === null || accessibleCommitteeIds.includes(committee.id))
    .sort((a, b) => a.sortOrder - b.sortOrder);
  const visibleCommitteeIds = new Set(committees.map((committee) => committee.id));
  const members = memberRecords.filter((member) => visibleCommitteeIds.has(member.committeeId));
  const committeeById = new Map(committees.map((committee) => [committee.id, committee]));
  const chairArtists = canViewArtists
    ? artistRecords
    : canViewCommittees
      ? await db.orm.public.Artist.all()
      : [];
  const artistById = new Map(chairArtists.map((artist) => [artist.id, artist]));
  const membersByCommittee = new Map<string, typeof members>();
  for (const member of members) {
    const committeeMembers = membersByCommittee.get(member.committeeId) || [];
    committeeMembers.push(member);
    membersByCommittee.set(member.committeeId, committeeMembers);
  }

  const rows: ReportRow[] = [];
  if (canViewArtists) {
    for (const artist of artistRecords) {
      const visibleCommittee = artist.committeeId ? committeeById.get(artist.committeeId) : undefined;
      rows.push({
        id: artist.id,
        category: "artist",
        name: artist.name,
        subcategory: artist.discipline || "Belum diisi",
        committeeId: visibleCommittee?.id || "",
        committeeName: visibleCommittee?.name || "",
        responsiblePerson: "",
        registrationNumber: artist.registrationNumber,
        ...reportDate(artist.registeredAt),
        status: registrationStatusLabels[artist.registrationStatus] || artist.registrationStatus,
      });
    }
  }

  if (canViewGroups) {
    for (const group of groupRecords) {
      const visibleCommittee = group.committeeId ? committeeById.get(group.committeeId) : undefined;
      rows.push({
        id: group.id,
        category: "group",
        name: group.name,
        subcategory: group.groupType || "Belum diisi",
        committeeId: visibleCommittee?.id || "",
        committeeName: visibleCommittee?.name || "",
        responsiblePerson: group.leader || "",
        registrationNumber: group.registrationNumber,
        ...reportDate(group.registeredAt),
        status: registrationStatusLabels[group.registrationStatus] || group.registrationStatus,
      });
    }
  }

  if (canViewCommittees) {
    for (const committee of committees) {
      const chairman = committee.chairmanArtistId
        ? artistById.get(committee.chairmanArtistId)?.name || committee.chairman || ""
        : committee.chairman || "";
      const committeeMembers = membersByCommittee.get(committee.id) || [];
      const chairmanKey = chairman.trim().toLocaleLowerCase("id-ID");
      let chairmanIncluded = false;

      for (const member of committeeMembers) {
        const isChairman = chairmanKey !== "" && member.name.trim().toLocaleLowerCase("id-ID") === chairmanKey;
        chairmanIncluded ||= isChairman;
        rows.push({
          id: member.id,
          category: "committee",
          name: member.name,
          subcategory: isChairman ? "Ketua Komite" : member.position || "Anggota",
          committeeId: committee.id,
          committeeName: committee.name,
          responsiblePerson: chairman,
          registrationNumber: "",
          ...reportDate(member.createdAt),
          status: committee.isActive && member.isActive ? "Aktif" : "Nonaktif",
        });
      }

      if (chairman && !chairmanIncluded) {
        rows.push({
          id: `chair-${committee.id}`,
          category: "committee",
          name: chairman,
          subcategory: "Ketua Komite",
          committeeId: committee.id,
          committeeName: committee.name,
          responsiblePerson: chairman,
          registrationNumber: "",
          ...reportDate(committee.createdAt),
          status: committee.isActive ? "Aktif" : "Nonaktif",
        });
      } else if (committeeMembers.length === 0) {
        rows.push({
          id: committee.id,
          category: "committee",
          name: committee.name,
          subcategory: "Belum ada anggota",
          committeeId: committee.id,
          committeeName: committee.name,
          responsiblePerson: chairman,
          registrationNumber: "",
          ...reportDate(committee.createdAt),
          status: committee.isActive ? "Aktif" : "Nonaktif",
        });
      }
    }
  }

  const permittedCategories = new Set<ReportCategory>(categories.map((item) => item.value));
  const permittedRows = rows.filter((row) => permittedCategories.has(row.category));

  return (
    <main className="mx-auto max-w-7xl pb-16">
      <ReportCenter
        rows={permittedRows}
        categories={categories}
        printedAt={new Date().toLocaleString("id-ID")}
        initialCategory={categories.some((item) => item.value === initialCategory) ? initialCategory : "all"}
      />
    </main>
  );
}
