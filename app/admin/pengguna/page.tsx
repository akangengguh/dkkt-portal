import Link from "next/link";

import { requireAdmin } from "@/lib/admin";
import { db } from "@/lib/db";
import { hasPermission } from "@/lib/permissions";
import ArtistAccessManager from "@/components/admin/ArtistAccessManager";
import AdminListSearch from "@/components/admin/AdminListSearch";
import { matchesSearch } from "@/lib/search";

function formatDate(value: unknown) {
  if (!value) return "Belum pernah";
  return new Date(String(value)).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default async function AdminPenggunaPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string | string[] }>;
}) {
  const params = await searchParams;
  const query = typeof params.q === "string" ? params.q.trim() : "";
  const session = await requireAdmin();
  const canView = await hasPermission({ userId: session.userId, permission: "user.view" });

  if (!canView) {
    return <section className="rounded-3xl border border-red-500/20 bg-red-500/5 p-8"><p className="text-xs font-bold uppercase tracking-[0.3em] text-red-400">Akses Ditolak</p><h1 className="mt-3 text-2xl font-black text-white">Anda tidak mempunyai akses ke modul Pengguna.</h1><Link href="/admin" className="mt-6 inline-flex rounded-xl bg-amber-500 px-5 py-3 text-sm font-bold text-black">Kembali ke Dashboard</Link></section>;
  }

  const [users, roles, userRoles, artists, committees, committeeAccess] = await Promise.all([
    db.orm.public.User.all(),
    db.orm.public.Role.all(),
    db.orm.public.UserRole.all(),
    db.orm.public.Artist.all(),
    db.orm.public.Committee.all(),
    db.orm.public.CommitteeUser.all(),
  ]);
  const roleMap = new Map(roles.map((role) => [role.id, role.name]));
  const userRoleMap = new Map<string, string[]>();
  const committeeIdsByUser = new Map<string, string[]>();
  for (const userRole of userRoles) {
    const current = userRoleMap.get(userRole.userId) || [];
    current.push(roleMap.get(userRole.roleId) || "Role tidak dikenal");
    userRoleMap.set(userRole.userId, current);
  }
  for (const assignment of committeeAccess) {
    const current = committeeIdsByUser.get(assignment.userId) || [];
    current.push(assignment.committeeId);
    committeeIdsByUser.set(assignment.userId, current);
  }

  const managedRoleLabels: Record<string, string> = {
    SUPER_ADMIN: "Super Admin",
    ADMINISTRATOR: "Admin",
    EDITOR: "Kurator Berita",
    NEWS_EDITOR: "Berita",
    KOMITE_EDITOR: "Komite",
  };
  const availableRoles = roles
    .filter((role) => managedRoleLabels[role.name])
    .map((role) => ({ name: role.name, label: managedRoleLabels[role.name] }));
  const eligibleArtists = artists
    .filter((artist) => artist.isActive && artist.registrationStatus === "ACTIVE")
    .sort((a, b) => a.registrationNumber.localeCompare(b.registrationNumber))
    .map((artist) => {
      const account = users.find((user) => user.artistId === artist.id)
        || users.find((user) => artist.email && user.email.toLowerCase() === artist.email.toLowerCase());
      const accountRoles = account ? userRoleMap.get(account.id) || [] : [];
      const roleName = accountRoles.find((name) => managedRoleLabels[name]) || "";

      return {
        id: artist.id,
        name: artist.name,
        email: artist.email,
        registrationNumber: artist.registrationNumber,
        account: account ? {
          userId: account.id,
          username: account.username,
          status: account.status,
          roleName,
          committeeIds: committeeIdsByUser.get(account.id) || [],
        } : undefined,
      };
    });
  const activeCommittees = committees
    .filter((committee) => committee.isActive)
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((committee) => ({ id: committee.id, name: committee.name }));
  const filteredUsers = users.filter((user) => matchesSearch(query, [
    user.name,
    user.email,
    user.username,
    user.status,
    ...(userRoleMap.get(user.id) || []),
  ]));

  return (
    <div className="mx-auto max-w-7xl pb-20">
      <section className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between"><div><p className="text-xs font-bold uppercase tracking-[0.3em] text-amber-400">CMS DKKT</p><h1 className="mt-2 text-3xl font-black text-white md:text-4xl">Pengguna</h1><p className="mt-3 max-w-2xl text-sm leading-7 text-gray-400">Kelola akun yang memiliki akses ke CMS DKKT dan peran yang diberikan.</p></div><Link href="/admin" className="inline-flex items-center justify-center rounded-xl border border-white/10 px-5 py-3 text-sm font-semibold text-gray-300 hover:border-amber-400/40 hover:text-amber-300">Kembali ke Dashboard</Link></section>
      <section className="mt-8 grid gap-4 sm:grid-cols-3"><div className="rounded-2xl border border-white/10 bg-[#0b0b0b] p-5"><p className="text-xs uppercase tracking-[0.2em] text-gray-600">Total Pengguna</p><p className="mt-2 text-3xl font-black text-white">{users.length}</p></div><div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-5"><p className="text-xs uppercase tracking-[0.2em] text-emerald-400">Aktif</p><p className="mt-2 text-3xl font-black text-emerald-300">{users.filter((user) => user.status === "ACTIVE").length}</p></div><div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-5"><p className="text-xs uppercase tracking-[0.2em] text-amber-400">Role</p><p className="mt-2 text-3xl font-black text-amber-300">{roles.length}</p></div></section>
      {session.roles.includes("SUPER_ADMIN") && <ArtistAccessManager artists={eligibleArtists} committees={activeCommittees} roles={availableRoles} />}
      <section className="mt-8 overflow-hidden rounded-3xl border border-white/10 bg-[#0b0b0b]"><div className="flex flex-col gap-4 border-b border-white/10 px-6 py-5 md:flex-row md:items-center md:justify-between"><div><h2 className="text-lg font-black text-white">Daftar Pengguna</h2><p className="mt-1 text-sm text-gray-500">Informasi akun dan role dari database CMS.</p></div><AdminListSearch query={query} clearHref="/admin/pengguna" placeholder="Cari nama, email, username, role" resultCount={filteredUsers.length} /></div>{filteredUsers.length === 0 ? <p className="px-6 py-10 text-center text-sm text-gray-500">{query ? "Tidak ada pengguna yang cocok dengan pencarian." : "Belum ada pengguna."}</p> : <div className="overflow-x-auto"><table className="min-w-full text-left text-sm"><thead className="border-b border-white/10 bg-white/2 text-gray-300"><tr><th className="px-6 py-4 font-semibold">Pengguna</th><th className="px-6 py-4 font-semibold">Role</th><th className="px-6 py-4 font-semibold">Status</th><th className="px-6 py-4 font-semibold">Login Terakhir</th></tr></thead><tbody>{filteredUsers.map((user) => <tr key={user.id} className="border-b border-white/10 text-gray-300 last:border-b-0"><td className="px-6 py-4"><div className="font-semibold text-white">{user.name}</div><div className="mt-1 text-xs text-gray-500">{user.email}</div></td><td className="px-6 py-4"><div className="flex flex-wrap gap-2">{(userRoleMap.get(user.id) || []).map((role) => <span key={role} className="rounded-full border border-amber-500/20 bg-amber-500/5 px-2.5 py-1 text-xs font-semibold text-amber-300">{role}</span>)}</div></td><td className="px-6 py-4"><span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${user.status === "ACTIVE" ? "border-emerald-500/20 bg-emerald-500/5 text-emerald-300" : "border-white/10 text-gray-500"}`}>{user.status}</span></td><td className="px-6 py-4 text-gray-400">{formatDate(user.lastLoginAt)}</td></tr>)}</tbody></table></div>}</section>
    </div>
  );
}