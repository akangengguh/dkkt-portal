import "temporal-polyfill/full/global";
import "dotenv/config";

import postgres from "@prisma/orm-postgres/runtime";

import type { Contract } from "./contract.d";

import contractJson from "./contract.json" with {
  type: "json",
};

const databaseUrl =
  process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error(
    "DATABASE_URL belum tersedia.",
  );
}

const db = postgres<Contract>({
  contractJson,
  url: databaseUrl,
});

const categories = [
  {
    name: "Berita DKKT",
    slug: "berita-dkkt",
    description:
      "Berita resmi Dewan Kesenian dan Kebudayaan Kota Tasikmalaya.",
    sortOrder: 1,
  },
  {
    name: "Seni Teater",
    slug: "seni-teater",
    description:
      "Berita dan publikasi seni teater.",
    sortOrder: 2,
  },
  {
    name: "Seni Tari",
    slug: "seni-tari",
    description:
      "Berita dan publikasi seni tari.",
    sortOrder: 3,
  },
  {
    name: "Seni Musik",
    slug: "seni-musik",
    description:
      "Berita dan publikasi seni musik.",
    sortOrder: 4,
  },
  {
    name: "Seni Rupa",
    slug: "seni-rupa",
    description:
      "Berita dan publikasi seni rupa.",
    sortOrder: 5,
  },
  {
    name: "Seni Sastra",
    slug: "seni-sastra",
    description:
      "Berita dan publikasi seni sastra.",
    sortOrder: 6,
  },
  {
    name: "Film & Fotografi",
    slug: "film-fotografi",
    description:
      "Berita dan publikasi film dan fotografi.",
    sortOrder: 7,
  },
  {
    name: "Budaya",
    slug: "budaya",
    description:
      "Berita kebudayaan dan tradisi Kota Tasikmalaya.",
    sortOrder: 8,
  },
];

async function main() {
  console.log("");
  console.log(
    "SEED KATEGORI BERITA CMS DKKT",
  );
  console.log("");

  for (const categoryData of categories) {
    const existing =
      await db.orm.public.NewsCategory.first(
        {
          slug: categoryData.slug,
        },
      );

    if (!existing) {
      await db.orm.public.NewsCategory.create({
        name: categoryData.name,
        slug: categoryData.slug,
        description:
          categoryData.description,
        sortOrder:
          categoryData.sortOrder,
        isActive: true,
      });

      console.log(
        `✓ ${categoryData.name}`,
      );
    } else {
      console.log(
        `✓ Sudah ada: ${categoryData.name}`,
      );
    }
  }

  console.log("");
  console.log(
    "✓ KATEGORI BERITA SIAP",
  );
}

main()
  .catch((error) => {
    console.error(
      "❌ SEED KATEGORI GAGAL",
    );
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