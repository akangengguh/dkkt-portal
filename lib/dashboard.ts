import { db } from "@/lib/db";
import { getAccessibleCommitteeIds, getUserRoles, hasPermission } from "@/lib/permissions";

export type DashboardStats = Partial<{
  users: number;
  committees: number;
  news: number;
  agendas: number;
  media: number;
  gallery: number;
  documents: number;
  contactMessages: number;
}>;

export async function getDashboardStats(userId: string): Promise<DashboardStats> {
  const roles = await getUserRoles(userId);
  const scopedNewsRoles = roles.some((role) => ["NEWS_EDITOR", "CONTRIBUTOR"].includes(role));
  const committeeNewsRoles = roles.some((role) => ["KOMITE_EDITOR", "KOMITE_MANAGER"].includes(role));
  const accessibleCommitteeIds = committeeNewsRoles ? await getAccessibleCommitteeIds(userId) : null;
  const sections = [
    { key: "users", permission: "user.view", count: async () => (await db.orm.public.User.all()).length },
    {
      key: "committees",
      permission: "committee.view",
      count: async () => {
        if (!committeeNewsRoles || accessibleCommitteeIds === null) return (await db.orm.public.Committee.all()).length;
        if (accessibleCommitteeIds.length === 0) return 0;
        return (await db.orm.public.Committee.where((item) => item.id.in(accessibleCommitteeIds)).all()).length;
      },
    },
    {
      key: "news",
      permission: "news.view",
      count: async () => {
        if (scopedNewsRoles) return (await db.orm.public.News.where({ createdById: userId }).all()).length;
        if (committeeNewsRoles) {
          if (!accessibleCommitteeIds?.length) return 0;
          return (await db.orm.public.News.where((item) => item.committeeId.in(accessibleCommitteeIds)).all()).length;
        }
        return (await db.orm.public.News.all()).length;
      },
    },
    { key: "agendas", permission: "agenda.view", count: async () => (await db.orm.public.Agenda.all()).length },
    { key: "media", permission: "media.view", count: async () => (await db.orm.public.MediaFile.all()).length },
    { key: "gallery", permission: "gallery.view", count: async () => (await db.orm.public.GalleryItem.all()).length },
    { key: "documents", permission: "document.view", count: async () => (await db.orm.public.Document.all()).length },
    { key: "contactMessages", permission: "contact.view", count: async () => (await db.orm.public.ContactMessage.all()).length },
  ] as const;

  const visibleStats = await Promise.all(sections.map(async (section) => {
    if (!(await hasPermission({ userId, permission: section.permission }))) return null;
    return [section.key, await section.count()] as const;
  }));

  return Object.fromEntries(visibleStats.filter((entry) => entry !== null)) as DashboardStats;
}