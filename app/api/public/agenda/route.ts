import { NextResponse } from "next/server";

import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

function serializeDate(
  value: unknown,
) {
  if (!value) {
    return null;
  }

  return String(value);
}

export async function GET(
  request: Request,
) {
  try {
    const { searchParams } =
      new URL(request.url);

    const committeeSlug =
      searchParams.get(
        "komite",
      );

    const allAgenda =
      await db.orm.public.Agenda.all();

    const [
      categories,
      committees,
    ] = await Promise.all([
      db.orm.public.AgendaCategory.all(),
      db.orm.public.Committee.all(),
    ]);

    const categoryMap =
      new Map(
        categories.map(
          (item) => [
            String(item.id),
            item,
          ],
        ),
      );

    const committeeMap =
      new Map(
        committees.map(
          (item) => [
            String(item.id),
            item,
          ],
        ),
      );

    /*
     * Hanya agenda yang sudah diterbitkan
     * boleh masuk portal publik.
     */
    let agenda =
      allAgenda.filter(
        (item) =>
          item.isPublished === true ||
          item.status === "PUBLISHED",
      );

    /*
     * Filter komite berdasarkan slug.
     */
    if (committeeSlug) {
      agenda =
        agenda.filter(
          (item) => {
            const committee =
              item.committeeId
                ? committeeMap.get(
                    String(
                      item.committeeId,
                    ),
                  )
                : null;

            return (
              committee?.slug ===
              committeeSlug
            );
          },
        );
    }

    /*
     * Urutkan berdasarkan tanggal kegiatan.
     */
    agenda.sort(
      (a, b) =>
        new Date(
          String(a.startDate),
        ).getTime() -
        new Date(
          String(b.startDate),
        ).getTime(),
    );

    const data =
      agenda.map((item) => {
        const category =
          item.categoryId
            ? categoryMap.get(
                String(
                  item.categoryId,
                ),
              )
            : null;

        const committee =
          item.committeeId
            ? committeeMap.get(
                String(
                  item.committeeId,
                ),
              )
            : null;

        return {
          id: item.id,
          title: item.title,
          slug: item.slug,
          description:
            item.description,
          excerpt:
            item.excerpt,
          image:
            item.image,

          status:
            "PUBLISHED",

          isFeatured:
            item.isFeatured,

          category: category
            ? {
                id: category.id,
                name: category.name,
                slug: category.slug,
              }
            : null,

          committee: committee
            ? {
                id: committee.id,
                name: committee.name,
                slug: committee.slug,
              }
            : null,

          startDate:
            serializeDate(
              item.startDate,
            ),

          endDate:
            serializeDate(
              item.endDate,
            ),

          startTime:
            item.startTime,

          endTime:
            item.endTime,

          location:
            item.location,

          address:
            item.address,

          registrationUrl:
            item.registrationUrl,

          registrationText:
            item.registrationText,

          contactName:
            item.contactName,

          contactPhone:
            item.contactPhone,

          contactEmail:
            item.contactEmail,

          organizer:
            item.organizer,

          target:
            item.target,

          notes:
            item.notes,
        };
      });

    return NextResponse.json(
      {
        success: true,
        data,
      },
      {
        headers: {
          "Cache-Control":
            "public, s-maxage=60, stale-while-revalidate=300",
        },
      },
    );
  } catch (error) {
    console.error(
      "PUBLIC_AGENDA_ERROR:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Gagal mengambil data agenda publik.",
        data: [],
      },
      { status: 500 },
    );
  }
}