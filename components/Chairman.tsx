"use client";

import { useState } from "react";
import SectionTitle from "./SectionTitle";

export default function Chairman() {
  const [expanded, setExpanded] = useState(false);

  return (
    <section className="relative overflow-hidden bg-[#080808] py-28">
      {/* Background Glow */}
      <div className="absolute left-0 top-1/2 h-[420px] w-[420px] -translate-y-1/2 rounded-full bg-amber-500/10 blur-3xl" />
      <div className="absolute right-0 top-16 h-80 w-80 rounded-full bg-orange-500/10 blur-3xl" />

      <div className="relative mx-auto grid max-w-7xl items-center gap-16 px-6 lg:grid-cols-2">

        {/* FOTO KETUA */}
        <div className="relative">
          <div className="absolute -inset-3 rounded-[32px] bg-gradient-to-br from-amber-400/20 via-transparent to-orange-500/20 blur-xl" />

          <div className="relative overflow-hidden rounded-[28px] border border-amber-500/30 bg-neutral-900 shadow-[0_0_70px_rgba(245,158,11,0.18)]">
            <img
              src="/images/ketua-dkkt.jpg"
              alt="Tatang Suprihatna Sumpena"
              className="h-[620px] w-full object-cover transition duration-700 hover:scale-105"
            />
          </div>
        </div>

        {/* KONTEN */}
        <div>
          <SectionTitle
            title="Tabik Semesta! Salam Budaya!"
            subtitle="Sambutan Ketua DKKT"
          />

          {/* Highlight Sambutan */}
          <div className="mt-8 space-y-6 text-lg leading-8 text-gray-200">

            <p className="text-xl font-medium text-white">
              Panggung telah dibuka, lampu sorot menyala. Selamat datang di
              Portal Resmi DKKT—rumah bersama bagi seluruh insan seni, budaya,
              akademisi, komunitas, dan masyarakat Kota Tasikmalaya.
            </p>

            <p>
              Seni bukan sekadar tontonan, melainkan ruang dialog, identitas,
              dan kekuatan yang membentuk peradaban. Melalui kolaborasi dan
              inovasi, DKKT hadir menjaga akar tradisi sekaligus melahirkan
              karya-karya kreatif untuk masa depan.
            </p>

            {/* Quote */}
            <blockquote className="rounded-r-2xl border-l-4 border-amber-400 bg-amber-500/5 px-6 py-5 italic text-amber-200">
              “Budaya yang besar lahir dari masyarakat yang mau berkarya,
              berkolaborasi, dan saling menghidupkan.”
            </blockquote>

            {/* Full Sambutan */}
            {expanded && (
              <div className="space-y-6 pt-2 text-gray-300 animate-in fade-in duration-500">
                <p>
                  Sebagai seniman teater dan sutradara, saya meyakini bahwa seni
                  bukan hanya pertunjukan di atas panggung, tetapi juga medium
                  pendidikan, refleksi sosial, dan penguat karakter masyarakat.
                </p>

                <p>
                  Dewan Kesenian dan Kebudayaan Kota Tasikmalaya hadir untuk
                  merentangkan panggung kolaborasi antara seniman, budayawan,
                  akademisi, pemerintah, komunitas, dan generasi muda dalam
                  membangun ekosistem kebudayaan yang hidup dan berkelanjutan.
                </p>

                <p>
                  Melalui transformasi digital, dokumentasi karya, pemberdayaan
                  komunitas, serta pelestarian nilai-nilai tradisi, kita ingin
                  memastikan bahwa kebudayaan Tasikmalaya tidak hanya lestari,
                  tetapi juga mampu menjadi inspirasi di tingkat nasional maupun
                  internasional.
                </p>

                <p>
                  Mari jadikan DKKT sebagai rumah bersama. Tempat setiap gagasan
                  dihargai, setiap karya diapresiasi, dan setiap insan budaya
                  memiliki ruang untuk tumbuh demi Tasikmalaya yang lebih
                  bermartabat.
                </p>
              </div>
            )}

            {/* Read More */}
            <button
              onClick={() => setExpanded(!expanded)}
              className="inline-flex items-center gap-2 font-semibold text-amber-400 transition hover:text-amber-300"
            >
              {expanded ? "Lihat lebih sedikit" : "Selengkapnya"}
              <span className={`transition ${expanded ? "rotate-180" : ""}`}>
                ▼
              </span>
            </button>
          </div>

          {/* Identitas Ketua */}
          <div className="mt-12 border-l-4 border-amber-400 pl-5">
            <h3 className="text-3xl font-bold text-white">
              Tatang Suprihatna Sumpena, S.Sn.
            </h3>

            <p className="mt-2 text-lg text-amber-300">
              Ketua Dewan Kesenian dan Kebudayaan Kota Tasikmalaya
            </p>

            <div className="mt-5 h-px w-48 bg-gradient-to-r from-amber-400 to-transparent" />
          </div>

          {/* Button */}
          <div className="mt-10 flex flex-wrap gap-4">
            <a
              href="/profil"
              className="rounded-xl bg-amber-500 px-7 py-3 font-semibold text-black transition hover:scale-105 hover:bg-amber-400"
            >
              Profil DKKT
            </a>

            <a
              href="/berita"
              className="rounded-xl border border-amber-400 px-7 py-3 font-semibold text-amber-300 transition hover:bg-amber-400 hover:text-black"
            >
              Lihat Kegiatan
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}