import Link from "next/link";

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
    <Link
      href={link}
      className="group relative flex min-h-[265px] flex-col overflow-hidden rounded-3xl border border-white/10 bg-[#0D0D0D] p-6 transition-all duration-300 hover:-translate-y-1 hover:border-amber-400/60 hover:bg-[#111111] hover:shadow-[0_16px_40px_rgba(245,158,11,0.10)]"
    >
      {/* =====================================================
          BACKGROUND GLOW
      ===================================================== */}
      <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-amber-400/5 blur-3xl transition-all duration-500 group-hover:bg-amber-400/15" />

      <div className="pointer-events-none absolute bottom-[-50px] left-[-40px] h-28 w-28 rounded-full bg-orange-500/5 blur-3xl opacity-0 transition-all duration-500 group-hover:opacity-100" />

      {/* =====================================================
          CONTENT
      ===================================================== */}
      <div className="relative z-10 flex h-full flex-col">
        {/* ===================================================
            HEADER
        =================================================== */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-amber-500/20 bg-amber-500/10 text-3xl transition-all duration-300 group-hover:border-amber-400 group-hover:bg-amber-500 group-hover:text-black">
            {icon}
          </div>

          <span className="rounded-full border border-white/5 bg-white/3 px-3 py-1 text-[10px] font-bold tracking-[0.22em] text-gray-600 transition group-hover:border-amber-500/20 group-hover:text-amber-500">
            DKKT
          </span>
        </div>

        {/* ===================================================
            TITLE
        =================================================== */}
        <div className="mt-6">
          <h3 className="text-xl font-black leading-tight text-white transition-colors duration-300 group-hover:text-amber-300">
            {title}
          </h3>

          <div className="mt-3 h-1 w-10 rounded-full bg-amber-500/70 transition-all duration-300 group-hover:w-16 group-hover:bg-amber-400" />
        </div>

        {/* ===================================================
            DESCRIPTION
        =================================================== */}
        <p className="mt-4 line-clamp-3 text-sm leading-7 text-gray-400">
          {desc}
        </p>

        {/* ===================================================
            SPACER
        =================================================== */}
        <div className="flex-1" />

        {/* ===================================================
            CTA
        =================================================== */}
        <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-4">
          <span className="text-xs font-bold uppercase tracking-[0.12em] text-amber-400 transition-colors duration-300 group-hover:text-amber-300">
            Jelajahi Komite
          </span>

          <span className="flex h-9 w-9 items-center justify-center rounded-full border border-amber-500/20 bg-amber-500/10 text-amber-400 transition-all duration-300 group-hover:translate-x-1 group-hover:border-amber-400 group-hover:bg-amber-500 group-hover:text-black">
            →
          </span>
        </div>
      </div>
    </Link>
  );
}