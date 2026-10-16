import { db } from "@/lib/db";

export type PermissionCheck = {
  userId: string;
  permission: string;
};

/**
 * Mengambil seluruh role yang dimiliki user.
 */
export async function getUserRoles(
  userId: string,
): Promise<string[]> {
  const userRoles =
    await db.orm.public.UserRole
      .where({
        userId,
      })
      .all();

  if (userRoles.length === 0) {
    return [];
  }

  const roleIds = userRoles.map(
    (item) => item.roleId,
  );

  const roles = await db.orm.public.Role
    .where((role) => role.id.in(roleIds))
    .all();

  return roles.map(
    (role) => role.name,
  );
}

/**
 * Mengecek apakah user mempunyai permission tertentu.
 */
export async function hasPermission({
  userId,
  permission,
}: PermissionCheck): Promise<boolean> {
  // ----------------------------------------------------------
  // Ambil role user
  // ----------------------------------------------------------

  const userRoles =
    await db.orm.public.UserRole
      .where({
        userId,
      })
      .all();

  if (userRoles.length === 0) {
    return false;
  }

  const roleIds = userRoles.map(
    (item) => item.roleId,
  );

  // ----------------------------------------------------------
  // SUPER_ADMIN memiliki seluruh permission
  // ----------------------------------------------------------

  const roles = await db.orm.public.Role
    .where((role) => role.id.in(roleIds))
    .all();

  const isSuperAdmin = roles.some(
    (role) => role.name === "SUPER_ADMIN",
  );

  if (isSuperAdmin) {
    return true;
  }

  // ----------------------------------------------------------
  // Ambil permission berdasarkan role
  // ----------------------------------------------------------

  const rolePermissions =
    await db.orm.public.RolePermission
      .where((item) =>
        item.roleId.in(roleIds),
      )
      .all();

  if (rolePermissions.length === 0) {
    return false;
  }

  const permissionIds =
    rolePermissions.map(
      (item) => item.permissionId,
    );

  // ----------------------------------------------------------
  // Cari permission yang diminta
  // ----------------------------------------------------------

  const permissions =
    await db.orm.public.Permission
      .where((item) =>
        item.id.in(permissionIds),
      )
      .all();

  return permissions.some(
    (item) => item.name === permission,
  );
}

/**
 * Memastikan user mempunyai permission tertentu.
 *
 * Jika tidak mempunyai permission,
 * function akan melempar error.
 */
export async function requirePermission(
  userId: string,
  permission: string,
): Promise<void> {
  const allowed = await hasPermission({
    userId,
    permission,
  });

  if (!allowed) {
    throw new Error(
      `Permission denied: ${permission}`,
    );
  }
}

/**
 * Memastikan user mempunyai salah satu dari
 * beberapa permission.
 */
export async function hasAnyPermission(
  userId: string,
  permissions: string[],
): Promise<boolean> {
  if (permissions.length === 0) {
    return false;
  }

  for (const permission of permissions) {
    const allowed = await hasPermission({
      userId,
      permission,
    });

    if (allowed) {
      return true;
    }
  }

  return false;
}

/**
 * Memastikan user mempunyai salah satu dari
 * beberapa permission.
 */
export async function requireAnyPermission(
  userId: string,
  permissions: string[],
): Promise<void> {
  const allowed = await hasAnyPermission(
    userId,
    permissions,
  );

  if (!allowed) {
    throw new Error(
      `Permission denied. Required one of: ${permissions.join(
        ", ",
      )}`,
    );
  }
}

export async function getAccessibleCommitteeIds(
  userId: string,
): Promise<string[] | null> {
  const roles = await getUserRoles(userId);
  if (roles.includes("SUPER_ADMIN") || roles.includes("ADMINISTRATOR")) {
    return null;
  }

  const assignments = await db.orm.public.CommitteeUser
    .where({ userId })
    .all();
  return assignments.map((assignment) => assignment.committeeId);
}

export async function canManageCommittee(
  userId: string,
  committeeId: string,
): Promise<boolean> {
  const roles = await getUserRoles(userId);
  if (roles.includes("SUPER_ADMIN") || roles.includes("ADMINISTRATOR")) {
    return true;
  }
  if (!roles.some((role) => ["KOMITE_EDITOR", "KOMITE_MANAGER"].includes(role))) {
    return false;
  }

  const committee = await db.orm.public.Committee.first({ id: committeeId });
  if (!committee?.isActive) return false;

  const assignment = await db.orm.public.CommitteeUser.first({
    userId,
    committeeId,
  });
  return assignment?.accessLevel === "EDITOR" || assignment?.accessLevel === "MANAGER";
}

export async function canAccessNews(
  userId: string,
  news: {
    createdById: string;
    committeeId: string | null;
    isPublished: boolean;
    status: string;
  },
  action: "view" | "edit",
): Promise<boolean> {
  const roles = await getUserRoles(userId);
  if (roles.some((role) => ["SUPER_ADMIN", "ADMINISTRATOR", "EDITOR"].includes(role))) {
    return true;
  }

  const isPublished = news.isPublished || news.status === "PUBLISHED";
  if (roles.includes("NEWS_EDITOR") || roles.includes("CONTRIBUTOR")) {
    return news.createdById === userId && (action === "view" || !isPublished);
  }

  if (
    !news.committeeId ||
    !roles.some((role) => ["KOMITE_EDITOR", "KOMITE_MANAGER"].includes(role))
  ) {
    return false;
  }

  const assignment = await db.orm.public.CommitteeUser.first({
    userId,
    committeeId: news.committeeId,
  });
  if (!assignment) return false;
  const committee = await db.orm.public.Committee.first({ id: news.committeeId });
  if (!committee?.isActive) return false;
  if (action === "view") return true;
  return !isPublished && ["EDITOR", "MANAGER"].includes(assignment.accessLevel);
}

export async function canCreateCommitteeNews(
  userId: string,
  committeeId: string,
): Promise<boolean> {
  const roles = await getUserRoles(userId);
  if (roles.some((role) => ["SUPER_ADMIN", "ADMINISTRATOR", "EDITOR", "NEWS_EDITOR"].includes(role))) {
    return true;
  }
  if (!roles.some((role) => ["KOMITE_EDITOR", "KOMITE_MANAGER"].includes(role))) {
    return false;
  }
  const committee = await db.orm.public.Committee.first({ id: committeeId });
  if (!committee?.isActive) return false;
  return canManageCommittee(userId, committeeId);
}