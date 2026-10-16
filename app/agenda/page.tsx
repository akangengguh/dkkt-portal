import AgendaTimeline from "@/components/AgendaTimeline";
import PageHero from "@/components/PageHero";

export default function AgendaPage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <PageHero
        eyebrow="Kalender kegiatan"
        title="Agenda"
        highlight="Kegiatan DKKT"
        description="Jelajahi festival, pertunjukan, lokakarya, dan kegiatan kebudayaan yang telah diterbitkan oleh DKKT Kota Tasikmalaya."
      />
      <AgendaTimeline mode="page" />
    </main>
  );
}
