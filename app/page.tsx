import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Stats from "@/components/Stats";
import Chairman from "@/components/Chairman";
import Committees from "@/components/Committees";
import NewsSection from "@/components/NewsSection";
import AgendaTimeline from "@/components/AgendaTimeline";

export default function Home() {
  return (
    <main className="bg-black text-white">
      <Navbar />
      <Hero />
      <Stats />
      <Chairman />
      <Committees />
      <NewsSection />
      <AgendaTimeline />
    </main>
  );
}