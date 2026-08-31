type Props = {
  title: string;
  desc: string;
  icon: string;
  link: string;
};

export default function CommitteeCard({
  title,
  desc,
  icon,
  link,
}: Props) {
  return (
    <a
      href={link}
      className="group relative overflow-hidden rounded-3xl border border-amber-500/20 bg-[#111111] p-7 transition duration-500 hover:-translate-y-2 hover:border-amber-400 hover:shadow-[0_0_40px_rgba(245,158,11,0.18)]"
    >
      {/* Glow */}
      <div className="absolute right-0 top-0 h-24 w-24 rounded-full bg-amber-400/10 blur-2xl transition group-hover:bg-amber-400/20" />

      <div className="relative z-10">
        <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/10 text-4xl">
          {icon}
        </div>

        <h3 className="text-2xl font-bold text-white">{title}</h3>

        <p className="mt-3 leading-7 text-gray-400">
          {desc}
        </p>

        <div className="mt-6 flex items-center gap-2 font-semibold text-amber-400">
          Jelajahi
          <span className="transition group-hover:translate-x-1">→</span>
        </div>
      </div>
    </a>
  );
}