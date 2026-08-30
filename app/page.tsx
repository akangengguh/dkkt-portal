import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import Stats from "../components/Stats";
import Chairman from "../components/Chairman";

export default function Home() {
  return (
    <main className="bg-black">
      <Navbar />
      <Hero />
      <Stats />
      <Chairman />
    </main>
  );
}