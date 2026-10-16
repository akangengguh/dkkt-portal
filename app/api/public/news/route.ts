import "temporal-polyfill/full/global";

import { NextResponse } from "next/server";

import { db } from "@/lib/db";

export async function GET() {
  try {
    const [allNews, categories, committees] =
      await Promise.all([
        db.orm.public.News.all(),
        db.orm.public.NewsCategory.all(),
        db.orm.public.Committee.all(),
      ]);

    /*
     * Hanya berita yang sudah diterbitkan
     * yang boleh masuk ke portal publik.
     */
    const publishedNews = allNews
      .filter(
        (item) =>
          item.isPublished === true ||
          item.status === "PUBLISHED",
      )
      .sort(
        (a, b) =>
          new Date(
            String(
              b.publishedAt ??
                b.updatedAt ??
                b.createdAt,
            ),
          ).getTime() -
          new Date(
            String(
              a.publishedAt ??
                a.updatedAt ??
                a.createdAt,
            ),
          ).getTime(),
      );

    const categoryMap = new Map(
      categories.map((item) => [
        item.id,
        item.name,
      ]),
    );

    const committeeMap = new Map(
      committees.map((item) => [
        item.id,
        {
          name: item.name,
          slug: item.slug,
        },
      ]),
    );

    const data = publishedNews.map(
      (item) => {
        const committee =
          item.committeeId
            ? committeeMap.get(
                item.committeeId,
              )
            : undefined;

        return {
          id: item.id,
          title: item.title,
          slug: item.slug,
          subtitle:
            item.subtitle ?? "",
          excerpt:
            item.excerpt ?? "",
          content: item.content,
          image:
            item.featuredImage ||
            "/gallery/featured.jpg",
          category:
            item.categoryId
              ? categoryMap.get(
                  item.categoryId,
                ) ?? "DKKT"
              : "DKKT",
          komite:
            committee?.slug ?? "",
          komiteName:
            committee?.name ?? "",
          date: new Date(
            String(
              item.publishedAt ??
                item.createdAt,
            ),
          ).toLocaleDateString(
            "id-ID",
            {
              day: "2-digit",
              month: "long",
              year: "numeric",
            },
          ),
          publishedAt: item.publishedAt
            ? item.publishedAt.toString()
            : null,
          isFeatured:
            item.isFeatured,
        };
      },
    );

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error(
      "PUBLIC_NEWS_ERROR:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Gagal mengambil publikasi berita.",
        data: [],
      },
      { status: 500 },
    );
  }
}