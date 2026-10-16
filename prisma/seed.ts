import "temporal-polyfill/full/global";
import "dotenv/config";

import { Temporal } from "temporal-polyfill/full";
import bcrypt from "bcryptjs";
import postgres from "@prisma/orm-postgres/runtime";

import type { Contract } from "./contract.d";

import contractJson from "./contract.json" with {
  type: "json",
};

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error(
    "DATABASE_URL belum tersedia. Pastikan file .env berada di root project.",
  );
}

const db = postgres<Contract>({
  contractJson,
  url: databaseUrl,
});

async function main() {
  // ==========================================================
  // ENV SUPER ADMIN
  // ==========================================================

  const adminName =
    process.env.ADMIN_NAME?.trim() || "Super Admin DKKT";

  const adminEmail =
    process.env.ADMIN_EMAIL?.trim().toLowerCase() ||
    "admin@dkkt.local";

  const adminUsername =
    process.env.ADMIN_USERNAME?.trim().toLowerCase() ||
    "superadmin";

  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminPassword) {
    throw new Error(
      "ADMIN_PASSWORD belum tersedia di file .env.",
    );
  }

  console.log("");
  console.log("==============================================");
  console.log("        SEED DATABASE CMS DKKT");
  console.log("==============================================");
  console.log("");

  // ==========================================================
  // 1. ROLE
  // ==========================================================

  const roles = [
    {
      name: "SUPER_ADMIN",
      description: "Akses penuh terhadap seluruh sistem CMS DKKT.",
      isSystem: true,
    },
    {
      name: "ADMINISTRATOR",
      description: "Mengelola operasional utama CMS DKKT.",
      isSystem: true,
    },
    {
      name: "EDITOR",
      description: "Meninjau, menyetujui, dan menerbitkan berita.",
      isSystem: true,
    },
    {
      name: "KOMITE_MANAGER",
      description: "Mengelola konten dan anggota komite yang ditugaskan.",
      isSystem: true,
    },
    {
      name: "KOMITE_EDITOR",
      description: "Membuat berita dan mengelola anggota komite yang ditugaskan.",
      isSystem: true,
    },
    {
      name: "NEWS_EDITOR",
      description: "Membuat dan memperbaiki berita sendiri tanpa hak publikasi.",
      isSystem: true,
    },
    {
      name: "CONTRIBUTOR",
      description: "Membuat dan mengelola draft konten.",
      isSystem: true,
    },
    {
      name: "VIEWER",
      description: "Hanya dapat melihat data CMS.",
      isSystem: true,
    },
  ];

  const roleMap = new Map<string, string>();

  for (const roleData of roles) {
    let role = await db.orm.public.Role.first({
      name: roleData.name,
    });

    if (!role) {
      role = await db.orm.public.Role.create({
        name: roleData.name,
        description: roleData.description,
        isSystem: roleData.isSystem,
      });
    }

    roleMap.set(roleData.name, role.id);

    console.log(`✓ Role: ${roleData.name}`);
  }

  // ==========================================================
  // 2. PERMISSION
  // ==========================================================

  const permissions = [
    ["dashboard.view", "Melihat dashboard CMS"],

    ["news.view", "Melihat berita"],
    ["news.create", "Membuat berita"],
    ["news.update", "Mengubah berita"],
    ["news.delete", "Menghapus berita"],
    ["news.publish", "Menerbitkan berita"],

    ["agenda.view", "Melihat agenda"],
    ["agenda.create", "Membuat agenda"],
    ["agenda.update", "Mengubah agenda"],
    ["agenda.delete", "Menghapus agenda"],
    ["agenda.publish", "Menerbitkan agenda"],

    ["gallery.view", "Melihat galeri"],
    ["gallery.create", "Menambahkan galeri"],
    ["gallery.update", "Mengubah galeri"],
    ["gallery.delete", "Menghapus galeri"],

    ["media.view", "Melihat media library"],
    ["media.create", "Mengunggah media"],
    ["media.update", "Mengubah metadata media"],
    ["media.delete", "Menghapus media"],

    ["document.view", "Melihat dokumen"],
    ["document.create", "Menambahkan dokumen"],
    ["document.update", "Mengubah dokumen"],
    ["document.delete", "Menghapus dokumen"],

    ["committee.view", "Melihat komite"],
    ["committee.create", "Membuat komite"],
    ["committee.update", "Mengubah komite"],
    ["committee.delete", "Menghapus komite"],
    ["committee.member.manage", "Mengelola anggota komite"],

    ["organization.view", "Melihat struktur organisasi"],
    ["organization.create", "Menambah anggota organisasi"],
    ["organization.update", "Mengubah struktur organisasi"],
    ["organization.delete", "Menghapus struktur organisasi"],

    ["artist.view", "Melihat seniman dan budayawan"],
    ["artist.create", "Menambahkan seniman dan budayawan"],
    ["artist.update", "Mengubah seniman dan budayawan"],
    ["artist.delete", "Menghapus seniman dan budayawan"],
    ["artist.verify", "Memverifikasi pendaftaran dan menerbitkan kartu seniman"],

    ["group.view", "Melihat kelompok dan sanggar"],
    ["group.create", "Menambahkan kelompok dan sanggar"],
    ["group.update", "Mengubah kelompok dan sanggar"],
    ["group.delete", "Menghapus kelompok dan sanggar"],
    ["group.verify", "Memverifikasi pendaftaran dan menerbitkan kartu kelompok"],

    ["user.view", "Melihat pengguna"],
    ["user.create", "Membuat pengguna"],
    ["user.update", "Mengubah pengguna"],
    ["user.delete", "Menghapus pengguna"],

    ["audit.view", "Melihat riwayat audit CMS"],

    ["settings.view", "Melihat pengaturan"],
    ["settings.update", "Mengubah pengaturan"],

    ["contact.view", "Melihat pesan kontak"],
    ["contact.update", "Mengubah status pesan kontak"],
  ] as const;

  const permissionMap = new Map<string, string>();

  for (const [name, description] of permissions) {
    let permission = await db.orm.public.Permission.first({
      name,
    });

    if (!permission) {
      permission = await db.orm.public.Permission.create({
        name,
        description,
      });
    }

    permissionMap.set(name, permission.id);

    console.log(`✓ Permission: ${name}`);
  }

  // ==========================================================
  // 3. ROLE → PERMISSION
  // ==========================================================

  const rolePermissions: Record<string, string[]> = {
    SUPER_ADMIN: [...permissionMap.keys()],

    ADMINISTRATOR: [
      ...permissionMap.keys(),
    ].filter((name) => name !== "user.delete"),

    EDITOR: [
      "dashboard.view",
      "news.view",
      "news.update",
      "news.publish",
    ],

    KOMITE_MANAGER: [
      "dashboard.view",
      "news.view",
      "news.create",
      "news.update",
      "committee.view",
      "committee.member.manage",
    ],

    KOMITE_EDITOR: [
      "dashboard.view",
      "news.view",
      "news.create",
      "news.update",
      "committee.view",
      "committee.member.manage",
    ],

    NEWS_EDITOR: [
      "dashboard.view",
      "news.view",
      "news.create",
      "news.update",
    ],

    CONTRIBUTOR: [
      "dashboard.view",
      "news.view",
      "news.create",
      "news.update",
    ],

    VIEWER: [
      "dashboard.view",
      "news.view",
      "agenda.view",
      "gallery.view",
      "media.view",
      "document.view",
      "committee.view",
      "organization.view",
      "contact.view",
    ],
  };

  for (const [roleName, permissionNameList] of Object.entries(
    rolePermissions,
  )) {
    const roleId = roleMap.get(roleName);

    if (!roleId) {
      throw new Error(
        `Role ${roleName} tidak ditemukan.`,
      );
    }

    for (const permissionName of permissionNameList) {
      const permissionId = permissionMap.get(permissionName);

      if (!permissionId) {
        throw new Error(
          `Permission ${permissionName} tidak ditemukan.`,
        );
      }

      const existing =
        await db.orm.public.RolePermission.first({
          roleId,
          permissionId,
        });

      if (!existing) {
        await db.orm.public.RolePermission.create({
          roleId,
          permissionId,
        });
      }
    }

    const allowedPermissionIds = new Set(
      permissionNameList.map((permissionName) => permissionMap.get(permissionName)),
    );
    const assignedPermissions = await db.orm.public.RolePermission
      .where({ roleId })
      .all();

    for (const assignedPermission of assignedPermissions) {
      if (!allowedPermissionIds.has(assignedPermission.permissionId)) {
        await db.orm.public.RolePermission
          .where({ roleId, permissionId: assignedPermission.permissionId })
          .delete();
      }
    }

    console.log(
      `✓ Permission assigned: ${roleName}`,
    );
  }

  // ==========================================================
  // 4. KOMITE DKKT
  // ==========================================================

  const committees = [
    {
      name: "Komite Seni Teater",
      slug: "teater",
      shortName: "Teater",
      description:
        "Mengembangkan seni teater, pertunjukan, dan ekosistem aktor serta pekerja teater di Kota Tasikmalaya.",
      icon: "🎭",
      sortOrder: 1,
    },
    {
      name: "Komite Seni Rupa",
      slug: "seni-rupa",
      shortName: "Seni Rupa",
      description:
        "Mengembangkan kreativitas seni rupa melalui karya, pameran, edukasi, dan kolaborasi.",
      icon: "🎨",
      sortOrder: 2,
    },
    {
      name: "Komite Seni Sastra",
      slug: "sastra",
      shortName: "Sastra",
      description:
        "Mendorong pertumbuhan sastra, literasi, penulisan, dan apresiasi karya sastra.",
      icon: "📖",
      sortOrder: 3,
    },
    {
      name: "Komite Seni Musik",
      slug: "musik",
      shortName: "Musik",
      description:
        "Mengembangkan ekosistem musik dan apresiasi terhadap karya musik Kota Tasikmalaya.",
      icon: "🎵",
      sortOrder: 4,
    },
    {
      name: "Komite Seni Tari",
      slug: "tari",
      shortName: "Tari",
      description:
        "Mengembangkan seni tari tradisi dan kreasi serta regenerasi pelaku seni tari.",
      icon: "💃",
      sortOrder: 5,
    },
    {
      name: "Komite Seni Film dan Fotografi",
      slug: "film-fotografi",
      shortName: "Film & Fotografi",
      description:
        "Mengembangkan film, fotografi, dokumentasi visual, dan kreativitas media.",
      icon: "🎬",
      sortOrder: 6,
    },
    {
      name: "Komite Budaya",
      slug: "budaya",
      shortName: "Budaya",
      description:
        "Mendorong pelestarian, kajian, dokumentasi, dan pengembangan kebudayaan Kota Tasikmalaya.",
      icon: "🏛️",
      sortOrder: 7,
    },
  ];

  const committeeMap = new Map<string, string>();

  for (const committeeData of committees) {
    let committee =
      await db.orm.public.Committee.first({
        slug: committeeData.slug,
      });

    if (!committee) {
      committee =
        await db.orm.public.Committee.create({
          name: committeeData.name,
          slug: committeeData.slug,
          shortName: committeeData.shortName,
          description: committeeData.description,
          icon: committeeData.icon,
          sortOrder: committeeData.sortOrder,
          isActive: true,
        });
    }

    committeeMap.set(
      committeeData.slug,
      committee.id,
    );

    console.log(
      `✓ Komite: ${committeeData.name}`,
    );
  }

  // ==========================================================
  // 5. SUPER ADMIN
  // ==========================================================

  let admin = await db.orm.public.User.first({
    email: adminEmail,
  });

  if (!admin) {
    // adminPassword sudah dipastikan string
    const passwordHash = await bcrypt.hash(
      adminPassword,
      12,
    );

    admin = await db.orm.public.User.create({
      name: adminName,
      username: adminUsername,
      email: adminEmail,
      passwordHash,
      status: "ACTIVE",
    });

    console.log(
      `✓ Super Admin dibuat: ${admin.email}`,
    );
  } else {
    if (!admin.username) {
      await db.orm.public.User.where({ id: admin.id }).update({
        username: adminUsername,
        updatedAt: Temporal.Now.instant(),
      });
    }
    console.log(
      `✓ Super Admin sudah ada: ${admin.email}`,
    );
  }

  // ==========================================================
  // 6. SUPER ADMIN → ROLE
  // ==========================================================

  const superAdminRoleId =
    roleMap.get("SUPER_ADMIN");

  if (!superAdminRoleId) {
    throw new Error(
      "Role SUPER_ADMIN tidak ditemukan.",
    );
  }

  const existingUserRole =
    await db.orm.public.UserRole.first({
      userId: admin.id,
      roleId: superAdminRoleId,
    });

  if (!existingUserRole) {
    await db.orm.public.UserRole.create({
      userId: admin.id,
      roleId: superAdminRoleId,
    });

    console.log(
      "✓ Role SUPER_ADMIN diberikan.",
    );
  } else {
    console.log(
      "✓ Role SUPER_ADMIN sudah terpasang.",
    );
  }

  // ==========================================================
  // 7. SUPER ADMIN → SEMUA KOMITE
  // ==========================================================

  for (const [slug, committeeId] of committeeMap) {
    const existingAccess =
      await db.orm.public.CommitteeUser.first({
        userId: admin.id,
        committeeId,
      });

    if (!existingAccess) {
      await db.orm.public.CommitteeUser.create({
        userId: admin.id,
        committeeId,
        accessLevel: "MANAGER",
      });

      console.log(
        `✓ Akses komite diberikan: ${slug}`,
      );
    } else {
      console.log(
        `✓ Akses komite sudah ada: ${slug}`,
      );
    }
  }

  // ==========================================================
  // SELESAI
  // ==========================================================

  console.log("");
  console.log("==============================================");
  console.log("           SEED BERHASIL");
  console.log("==============================================");
  console.log(`Admin : ${admin.email}`);
  console.log("Role  : SUPER_ADMIN");
  console.log("Komite: 7");
  console.log("==============================================");
  console.log("");
}

main()
  .catch((error) => {
    console.error("");
    console.error("❌ SEED GAGAL");
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    if (
      "close" in db &&
      typeof db.close === "function"
    ) {
      await db.close();
    }
  });