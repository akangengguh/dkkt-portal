type Props = {
  title: string;
  subtitle: string;
};

export default function SectionTitle({ title, subtitle }: Props) {
  return (
    <div className="mb-8">
      <p className="text-sm uppercase tracking-[0.4em] text-amber-400">
        {subtitle}
      </p>

      <h2 className="mt-3 text-4xl font-black leading-tight text-white md:text-5xl">
        {title}
      </h2>

      <div className="mt-5 h-1 w-24 rounded-full bg-gradient-to-r from-amber-500 to-yellow-300" />
    </div>
  );
}