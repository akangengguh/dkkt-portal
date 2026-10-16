import Link from "next/link";

type Props = {
  title: string;
  category: string;
  date: string;
  image: string;
  slug: string;
};

export default function NewsCard({
  title,
  category,
  date,
  image,
  slug,
}: Props) {
  return (
    <Link
      href={`/berita/${slug}`}
      className="group block"
    >
      <article className="flex gap-4 rounded-2xl border border-white/10 bg-[#111111] p-3 transition-all duration-300 hover:-translate-y-0.5 hover:border-amber-400/60 hover:bg-[#151515]">
        {/* ==================================================
            IMAGE
        ================================================== */}
        <div className="h-20 w-24 shrink-0 overflow-hidden rounded-xl">
          <img
            src={image}
            alt={title}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        </div>

        {/* ==================================================
            CONTENT
        ================================================== */}
        <div className="min-w-0 flex-1 py-1">
          <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-amber-400">
            {category}
          </p>

          <h3 className="mt-1 line-clamp-2 text-sm font-bold leading-5 text-white transition group-hover:text-amber-300">
            {title}
          </h3>

          <p className="mt-2 text-[11px] text-gray-500">
            📅 {date}
          </p>
        </div>

        {/* Arrow */}
        <div className="flex items-center pr-2 text-sm text-gray-600 transition group-hover:translate-x-1 group-hover:text-amber-400">
          →
        </div>
      </article>
    </Link>
  );
}