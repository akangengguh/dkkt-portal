import { redirect } from "next/navigation";

import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  getUserRoles,
  hasPermission,
  requirePermission,
} from "@/lib/permissions";

/**
 * Mengambil session user.
 *
 * Jika belum login → redirect ke /login.
 */
export async function requireAuth() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  const user = await db.orm.public.User.first({ id: session.userId });
  if (!user || user.status !== "ACTIVE") {
    redirect("/login");
  }

  return { ...session, email: user.email, name: user.name };
}

/**
 * Mengambil session + role user.
 */
export async function requireAdmin() {
  const session = await requireAuth();

  const roles = await getUserRoles(session.userId);

  if (roles.length === 0) {
    redirect("/login");
  }

  return {
    ...session,
    roles,
  };
}

export async function requireSuperAdmin() {
  const session = await requireAuth();
  const roles = await getUserRoles(session.userId);

  if (!roles.includes("SUPER_ADMIN")) {
    throw new Error("Permission denied: user.role.manage");
  }

  return { ...session, roles };
}

/**
 * Memastikan user mempunyai permission tertentu.
 *
 * Contoh:
 *
 * const admin = await requirePermissionPage(
 *   "news.create"
 * );
 */
export async function requirePermissionPage(
  permission: string,
) {
  const session = await requireAuth();

  const allowed = await hasPermission({
    userId: session.userId,
    permission,
  });

  if (!allowed) {
    redirect("/admin");
  }

  return session;
}

/**
 * Utility untuk server action/API yang
 * membutuhkan permission.
 */
export async function requireAdminPermission(
  permission: string,
) {
  const session = await requireAuth();

  await requirePermission(
    session.userId,
    permission,
  );

  return session;
}