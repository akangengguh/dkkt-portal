import Link from "next/link";
import { notFound } from "next/navigation";

import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ slug: string }>;
};

function formatDate(value: unknown) {
  const date = new Date(String(value));

  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function safeRegistrationUrl(value: string | null) {
  if (!value) return null;

  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:"
      ? url.href
      : null;
  } catch {
    return null;
  }
}

export default async function AgendaDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const agenda = await db.orm.public.Agenda.first({ slug });

  if (!agenda || (!agenda.isPublished && agenda.status !== "PUBLISHED")) {
    notFound();
  }

  const [category, committee, allAgenda] = await Promise.all([
    agenda.categoryId
      ? db.orm.public.AgendaCategory.first({ id: agenda.categoryId })
      : null,
    agenda.committeeId
      ? db.orm.public.Committee.first({ id: agenda.committeeId })
      : null,
    db.orm.public.Agenda.all(),
  ]);

  const relatedAgenda = allAgenda
    .filter(
      (item) =>
        item.id !== agenda.id &&
        (item.isPublished || item.status === "PUBLISHED") &&
        item.committeeId === agenda.committeeId,
    )
    .sort(
      (a, b) =>
        new Date(String(a.startDate)).getTime() -
        new Date(String(b.startDate)).getTime(),
    )
    .slice(0, 3);

  const registrationUrl = safeRegistrationUrl(agenda.registrationUrl);

  return (
    <main className="min-h-screen bg-black pt-[88px] text-white">
      <section className="relative overflow-hidden border-b border-amber-500/20 bg-gradient-to-br from-amber-500/10 via-black to-black">
        <div className="pointer-events-none absolute left-[-100px] top-0 h-96 w-96 rounded-full bg-amber-500/10 blur-[150px]" />

        <div className="relative mx-auto max-w-7xl px-6 py-16 md:py-20">
          <div className="flex flex-wrap items-center gap-2 text-sm text-gray-400">
            <Link href="/" className="hover:text-amber-400">Beranda</Link>
            <span>/</span>
            <Link href="/agenda" className="hover:text-amber-400">Agenda</Link>
            <span>/</span>
            <span className="max-w-[280px] truncate text-amber-300">{agenda.title}</span>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <span className="rounded-full bg-emerald-500/15 px-4 py-2 text-xs font-bold uppercase tracking-wider text-emerald-300">Agenda Publik</span>
            {category && (
              <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-gray-300">{category.name}</span>
            )}
            {committee && (
              <Link
                href={`/komite/${committee.slug}`}
                className="rounded-full border border-amber-500/20 bg-amber-500/5 px-4 py-2 text-xs font-semibold text-amber-300 hover:bg-amber-500/10"
              >
                {committee.name}
              </Link>
            )}
          </div>

          <h1 className="mt-7 max-w-5xl text-4xl font-black leading-tight md:text-6xl">{agenda.title}</h1>

          {agenda.excerpt && (
            <p className="mt-6 max-w-3xl text-lg leading-8 text-gray-300 md:text-xl">{agenda.excerpt}</p>
          )}

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <InfoCard label="Tanggal">
              {formatDate(agenda.startDate)}{agenda.endDate && ` — ${formatDate(agenda.endDate)}`}
            </InfoCard>
            <InfoCard label="Waktu">
              {agenda.startTime || "Belum ditentukan"}{agenda.endTime && ` — ${agenda.endTime}`}
            </InfoCard>
            <InfoCard label="Lokasi">
              {agenda.location || "Belum ditentukan"}
              {agenda.address && <span className="mt-1 block text-sm font-normal leading-6 text-gray-500">{agenda.address}</span>}
            </InfoCard>
          </div>
        </div>
      </section>

      <section className="bg-[#070707] py-16 md:py-20">
        <div className="mx-auto grid max-w-7xl gap-8 px-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          <article className="rounded-3xl border border-white/10 bg-[#111111] p-7 md:p-10">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-400">Informasi Kegiatan</p>
            <h2 className="mt-3 text-3xl font-black">Tentang Kegiatan</h2>
            <div className="mt-4 h-1 w-20 rounded-full bg-amber-400" />
            <p className="mt-7 whitespace-pre-line text-lg leading-9 text-gray-300">{agenda.description}</p>

            {agenda.target && <DetailBlock title="Sasaran / Peserta">{agenda.target}</DetailBlock>}

            {(agenda.registrationText || registrationUrl) && (
              <DetailBlock title="Pendaftaran">
                {agenda.registrationText || "Pendaftaran kegiatan tersedia melalui tautan berikut."}
                {registrationUrl && (
                  <a href={registrationUrl} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex rounded-xl bg-amber-500 px-5 py-3 text-sm font-bold text-black transition hover:bg-amber-400">
                    Daftar Kegiatan ↗
                  </a>
                )}
              </DetailBlock>
            )}

            {agenda.notes && <DetailBlock title="Catatan">{agenda.notes}</DetailBlock>}
          </article>

          <aside className="space-y-5">
            {agenda.image && (
              <div className="overflow-hidden rounded-3xl border border-white/10 bg-[#111111]">
                <img src={agenda.image} alt={agenda.title} className="aspect-[4/3] h-full w-full object-cover" />
              </div>
            )}

            <div className="rounded-3xl border border-white/10 bg-[#111111] p-7">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-400">Detail Kegiatan</p>
              <dl className="mt-6 space-y-5 text-sm">
                {agenda.organizer && <DetailRow label="Penyelenggara" value={agenda.organizer} />}
                {committee && <DetailRow label="Komite" value={committee.name} />}
                {agenda.contactName && <DetailRow label="Narahubung" value={agenda.contactName} />}
                {agenda.contactPhone && <DetailRow label="Telepon" value={agenda.contactPhone} />}
                {agenda.contactEmail && <DetailRow label="Email" value={agenda.contactEmail} />}
              </dl>
            </div>
          </aside>
        </div>
      </section>

      {relatedAgenda.length > 0 && (
        <section className="bg-black py-16 md:py-20">
          <div className="mx-auto max-w-7xl px-6">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-400">Agenda Lainnya</p>
            <h2 className="mt-3 text-3xl font-black">Agenda Terkait</h2>
            <div className="mt-8 grid gap-5 md:grid-cols-3">
              {relatedAgenda.map((item) => (
                <Link key={item.id} href={`/agenda/${item.slug}`} className="rounded-3xl border border-white/10 bg-[#111111] p-6 transition hover:-translate-y-1 hover:border-amber-500/40">
                  <p className="text-sm font-bold text-amber-400">{formatDate(item.startDate)}</p>
                  <h3 className="mt-3 text-xl font-black leading-7 text-white">{item.title}</h3>
                  {item.location && <p className="mt-3 text-sm text-gray-500">{item.location}</p>}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}

function InfoCard({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-400">{label}</p>
      <p className="mt-2 text-lg font-bold text-white">{children}</p>
    </div>
  );
}

function DetailBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-8 rounded-2xl border border-white/10 bg-black/30 p-6">
      <p className="text-xs font-semibold uppercase tracking-[0.25em] text-amber-400">{title}</p>
      <div className="mt-3 whitespace-pre-line leading-8 text-gray-300">{children}</div>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-gray-500">{label}</dt>
      <dd className="mt-1 font-semibold leading-6 text-white">{value}</dd>
    </div>
  );
}
