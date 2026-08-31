
type Agenda = {
  day: string;
  month: string;
  title: string;
  location: string;
  status: "Berlangsung" | "Pendaftaran" | "Terjadwal";
};

export default function AgendaTimeline() {
  const agenda: Agenda[] = [
    {
      day: "01",
      month: "SEP",
      title: "Festival Teater Tasikmalaya 2026",
      location: "Gedung Kesenian Kota Tasikmalaya",
      status: "Berlangsung",
    },
    {
      day: "07",
      month: "SEP",
      title: "Anugerah Budaya Kota Tasikmalaya",
      location: "Sekretariat DKKT",
      status: "Pendaftaran",
    },
    {
      day: "21",
      month: "SEP",
      title: "Workshop Fotografi Heritage",
      location: "Museum Kota Tasikmalaya",
      status: "Terjadwal",
    },
    {
      day: "28",
      month: "SEP",
      title: "Gempungan Seniman III",
      location: "Taman Budaya Tasikmalaya",
      status: "Terjadwal",
    },
  ];

  const statusColor = (status: Agenda["status"]) => {
    switch (status) {
      case "Berlangsung":
        return "bg-green-500 text-white";
      case "Pendaftaran":
        return "bg-blue-500 text-white";
      default:
        return "bg-zinc-700 text-white";
    }
  };

  return (
    <section className="bg-[#050505] py-28">
      <div className="mx-auto max-w-7xl px-6">
        {/* Header */}
        <div className="mb-14 flex items-end justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.4em] text-amber-400">
              Agenda DKKT
            </p>

            <h2 className="mt-3 text-4xl font-black text-white md:text-5xl">
              Timeline Kegiatan
            </h2>

            <div className="mt-4 h-1 w-24 rounded-full bg-gradient-to-r from-amber-500 to-yellow-300" />
          </div>

          <a
            href="/agenda"
            className="hidden text-amber-400 font-semibold hover:text-amber-300 md:block"
          >
            Lihat Semua →
          </a>
        </div>

        {/* Timeline */}
        <div className="relative">
          <div className="absolute left-7 top-0 h-full w-[2px] bg-gradient-to-b from-amber-500 via-amber-400/60 to-transparent" />

          <div className="space-y-10">
            {agenda.map((item) => (
              <div key={item.title} className="relative flex gap-6">
                {/* Tanggal */}
                <div className="relative z-10 flex h-14 w-14 flex-col items-center justify-center rounded-2xl border border-amber-500 bg-[#111111] shadow-lg">
                  <span className="text-lg font-black text-white">
                    {item.day}
                  </span>
                  <span className="text-[10px] tracking-wider text-amber-400">
                    {item.month}
                  </span>
                </div>

                {/* Card */}
                <div className="flex-1 rounded-2xl border border-amber-500/10 bg-[#111111] p-6 transition hover:border-amber-400 hover:shadow-[0_0_30px_rgba(245,158,11,0.12)]">
                  <div className="mb-3 flex items-center gap-3">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${statusColor(
                        item.status
                      )}`}
                    >
                      {item.status}
                    </span>
                  </div>

                  <h3 className="text-2xl font-bold text-white">
                    {item.title}
                  </h3>

                  <div className="mt-3 flex items-center gap-2 text-gray-400">
                    <span>📍</span>
                    <span>{item.location}</span>
                  </div>

                  <button className="mt-5 font-semibold text-amber-400 hover:text-amber-300">
                    Detail Agenda →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Mobile Button */}
        <div className="mt-12 md:hidden">
          <a
            href="/agenda"
            className="block rounded-xl border border-amber-400 py-4 text-center font-semibold text-amber-400 hover:bg-amber-400 hover:text-black"
          >
            Lihat Semua Agenda
          </a>
        </div>
      </div>
    </section>
  );
}