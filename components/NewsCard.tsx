type Props = {
  title: string;
  category: string;
  date: string;
  image: string;
};

export default function NewsCard({
  title,
  category,
  date,
  image,
}: Props) {
  return (
    <div className="group flex gap-4 rounded-2xl border border-amber-500/10 bg-[#111111] p-3 transition hover:border-amber-400 hover:bg-[#171717]">
      <img
        src={image}
        alt={title}
        className="h-24 w-24 rounded-xl object-cover"
      />

      <div className="flex-1">
        <span className="text-xs font-semibold uppercase tracking-widest text-amber-400">
          {category}
        </span>

        <h4 className="mt-2 line-clamp-2 font-bold text-white group-hover:text-amber-300">
          {title}
        </h4>

        <p className="mt-2 text-sm text-gray-500">{date}</p>
      </div>
    </div>
  );
}