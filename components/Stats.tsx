export default function Stats() {
  const data = [
    { angka: "1.250", label: "Seniman" },
    { angka: "187", label: "Komunitas" },
    { angka: "7", label: "Komite" },
    { angka: "48", label: "Agenda" },
  ];

  return (
    <section className="bg-black px-6 py-16">
      <div className="mx-auto max-w-7xl grid gap-6 md:grid-cols-4">
        {data.map((item) => (
          <div
            key={item.label}
            className="rounded-2xl border border-amber-500/30 bg-[#111111]/95 p-6 backdrop-blur"
          >
            <h3 className="text-4xl font-black text-amber-400">
              {item.angka}
            </h3>
            <p className="mt-2 text-sm uppercase tracking-wider text-gray-400">
              {item.label}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}