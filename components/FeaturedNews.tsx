type Props = {
  title: string;
  category: string;
  date: string;
  image: string;
  excerpt: string;
};

export default function FeaturedNews({
  title,
  category,
  date,
  image,
  excerpt,
}: Props) {
  return (
    <div className="group overflow-hidden rounded-3xl border border-amber-500/20 bg-[#111111]">
      <div className="overflow-hidden">
        <img
          src={image}
          alt={title}
          className="h-80 w-full object-cover transition duration-700 group-hover:scale-105"
        />
      </div>

      <div className="p-7">
        <div className="flex items-center gap-3 text-sm">
          <span className="rounded-full bg-amber-500 px-3 py-1 font-semibold text-black">
            {category}
          </span>
          <span className="text-gray-400">{date}</span>
        </div>

        <h3 className="mt-5 text-3xl font-black leading-tight text-white group-hover:text-amber-300">
          {title}
        </h3>

        <p className="mt-4 leading-7 text-gray-400">{excerpt}</p>

        <button className="mt-6 font-semibold text-amber-400 hover:text-amber-300">
          Baca Selengkapnya →
        </button>
      </div>
    </div>
  );
}