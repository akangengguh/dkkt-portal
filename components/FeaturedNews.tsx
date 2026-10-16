import Link from "next/link";

type Props = {
  title: string;
  category: string;
  date: string;
  image: string;
  excerpt: string;
  href: string;
  readTime?: string;
};

export default function FeaturedNews({
  title,
  category,
  date,
  image,
  excerpt,
  href,
  readTime = "5 Menit Baca",
}: Props) {
  return (
    <article className="group overflow-hidden rounded-3xl border border-amber-500/20 bg-[#111111] transition-all duration-300 hover:border-amber-400/50 hover:shadow-[0_0_35px_rgba(245,158,11,0.08)]">
      {/* ==================================================
          IMAGE
      ================================================== */}
      <div className="relative overflow-hidden">
        <img
          src={image}
          alt={title}
          className="h-80 w-full object-cover transition duration-700 ease-out group-hover:scale-105"
        />

        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

        {/* Label */}
        <div className="absolute left-5 top-5">
          <span className="rounded-full bg-amber-500 px-3 py-1 text-xs font-semibold text-black">
            {category}
          </span>
        </div>
      </div>

      {/* ==================================================
          CONTENT
      ================================================== */}
      <div className="p-7">
        {/* Meta */}
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-gray-300">
            {category}
          </span>

          <span className="text-gray-500">
            📅 {date}
          </span>

          <span className="text-gray-700">
            •
          </span>

          <span className="text-gray-500">
            ⏱ {readTime}
          </span>
        </div>

        {/* Title */}
        <h3 className="mt-5 text-3xl font-black leading-tight text-white transition group-hover:text-amber-300 md:text-4xl">
          {title}
        </h3>

        {/* Excerpt */}
        <p className="mt-5 text-base leading-8 text-gray-400 md:text-lg">
          {excerpt}
        </p>

        {/* ==================================================
            FOOTER
        ================================================== */}
        <div className="mt-8 flex flex-col gap-5 border-t border-white/10 pt-5 sm:flex-row sm:items-center sm:justify-between">
          {/* Author */}
          <div>
            <p className="font-semibold text-white">
              Redaksi DKKT
            </p>

            <p className="text-sm text-gray-500">
              Dewan Kesenian dan Kebudayaan Kota Tasikmalaya
            </p>
          </div>

          {/* CTA */}
          <Link
            href={href}
            className="inline-flex w-fit items-center rounded-xl bg-amber-500 px-5 py-3 text-sm font-semibold text-black transition hover:-translate-y-0.5 hover:bg-amber-400"
          >
            Baca Artikel
            <span className="ml-2 transition-transform group-hover:translate-x-1">
              →
            </span>
          </Link>
        </div>
      </div>
    </article>
  );
}