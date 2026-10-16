type PageHeroProps = {
  eyebrow: string;
  title: string;
  highlight?: string;
  description: string;
  image?: string;
  children?: React.ReactNode;
};

export default function PageHero({
  eyebrow,
  title,
  highlight,
  description,
  image,
  children,
}: PageHeroProps) {
  return (
    <section className="relative overflow-hidden border-b border-amber-500/20 bg-black pt-[88px]">
      {/* ================= BACKGROUND ================= */}
      {image ? (
        <>
          <img
            src={image}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 h-full w-full object-cover"
          />

          {/* Dark Overlay */}
          <div className="absolute inset-0 bg-black/60" />

          {/* Gradient */}
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-black/30" />
        </>
      ) : (
        <>
          {/* Base Gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#1A1200] via-black to-[#120600]" />

          {/* Left Glow */}
          <div className="absolute left-0 top-0 h-96 w-96 rounded-full bg-amber-500/10 blur-[140px]" />

          {/* Right Glow */}
          <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-orange-500/10 blur-[160px]" />
        </>
      )}

      {/* ================= CONTENT ================= */}
      <div className="relative z-10 mx-auto max-w-7xl px-6">
        <div className="max-w-4xl py-20 md:py-24">
          {/* Eyebrow */}
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-2">
            <span className="h-2 w-2 rounded-full bg-amber-400" />

            <span className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-300">
              {eyebrow}
            </span>
          </div>

          {/* Title */}
          <h1 className="mt-7 text-5xl font-black leading-[1.05] tracking-tight text-white md:text-6xl lg:text-7xl">
            {title}

            {highlight && (
              <span className="block text-amber-400">
                {highlight}
              </span>
            )}
          </h1>

          {/* Description */}
          <p className="mt-7 max-w-3xl text-lg leading-8 text-gray-300 md:text-xl">
            {description}
          </p>

          {/* Optional Content / CTA */}
          {children && (
            <div className="mt-8">
              {children}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}