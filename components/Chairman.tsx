"use client";

import { useState } from "react";
import Link from "next/link";
import SectionTitle from "./SectionTitle";

export default function Chairman() {
  const [expanded, setExpanded] = useState(false);

  return (
    <section className="relative overflow-hidden bg-[#080808] py-20 md:py-24">
      {/* =====================================================
          BACKGROUND DECORATION
      ===================================================== */}
      <div className="pointer-events-none absolute left-[-140px] top-1/2 h-[420px] w-[420px] -translate-y-1/2 rounded-full bg-amber-500/10 blur-[100px]" />

      <div className="pointer-events-none absolute right-[-120px] top-24 h-[320px] w-[320px] rounded-full bg-orange-500/[0.07] blur-[90px]" />

      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-500/20 to-transparent" />

      {/* =====================================================
          CONTAINER
      ===================================================== */}
      <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-6 lg:grid-cols-[0.88fr_1.12fr] lg:gap-14">
        {/* ===================================================
            FOTO KETUA
        =================================================== */}
        <div className="relative mx-auto w-full max-w-[520px]">
          {/* Outer Glow */}
          <div className="pointer-events-none absolute -inset-3 rounded-[30px] bg-gradient-to-br from-amber-400/20 via-transparent to-orange-500/20 blur-2xl" />

          {/* Image Frame */}
          <div className="group relative overflow-hidden rounded-[26px] border border-white/10 bg-[#111111] shadow-[0_0_55px_rgba(245,158,11,0.10)] transition duration-500 hover:border-amber-400/30 hover:shadow-[0_0_65px_rgba(245,158,11,0.16)]">
            <img
              src="/images/ketua-dkkt.jpg"
              alt="Tatang Suprihatna Sumpena, S.Sn."
              className="h-[430px] w-full object-cover object-center transition duration-700 group-hover:scale-[1.035] md:h-[500px]"
            />

            {/* Image Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/10 to-transparent opacity-90" />

            {/* Top Badge */}
            <div className="absolute left-5 top-5">
              <span className="rounded-full border border-amber-400/30 bg-black/50 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.22em] text-amber-300 backdrop-blur-md">
                Pimpinan DKKT
              </span>
            </div>

            {/* Bottom Identity */}
            <div className="absolute bottom-0 left-0 right-0 p-5 md:p-6">
              <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-amber-400">
                Ketua DKKT
              </p>

              <h3 className="mt-2 text-xl font-black leading-tight text-white md:text-2xl">
                Tatang Suprihatna Sumpena, S.Sn.
              </h3>

              <div className="mt-3 h-px w-24 bg-gradient-to-r from-amber-400 to-transparent" />
            </div>
          </div>

        </div>

        {/* ===================================================
            KONTEN
        =================================================== */}
        <div className="min-w-0">
          <SectionTitle
            title="Tabik Semesta! Salam Budaya!"
            subtitle="Sambutan Ketua DKKT"
          />

          <div className="mt-7 space-y-6 text-base leading-8 text-gray-300 md:text-[17px]">
            {/* Opening */}
            <p className="text-lg font-medium leading-8 text-white md:text-xl">
              Panggung telah dibuka, lampu sorot menyala. Selamat datang di
              Portal Resmi DKKT—rumah bersama bagi seluruh insan seni, budaya,
              akademisi, komunitas, dan masyarakat Kota Tasikmalaya.
            </p>

            {/* Main Paragraph */}
            <p>
              Seni bukan sekadar tontonan, melainkan ruang dialog, identitas,
              dan kekuatan yang membentuk peradaban. Melalui kolaborasi dan
              inovasi, DKKT hadir menjaga akar tradisi sekaligus melahirkan
              karya-karya kreatif untuk masa depan.
            </p>

            {/* Quote */}
            <blockquote className="relative overflow-hidden rounded-2xl border border-amber-400/10 bg-amber-500/[0.045] px-5 py-5 text-base italic leading-8 text-amber-100 md:px-6 md:text-lg">
              <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-amber-300 via-amber-500 to-transparent" />

              <span className="relative z-10">
                “Budaya yang besar lahir dari masyarakat yang mau berkarya,
                berkolaborasi, dan saling menghidupkan.”
              </span>
            </blockquote>

            {/* =================================================
                FULL SAMBUTAN
            ================================================= */}
            {expanded && (
              <div className="space-y-6 border-t border-white/10 pt-6 text-gray-300 animate-in fade-in duration-500">
                <p>
                  Sebagai seniman teater dan sutradara, saya meyakini bahwa
                  seni bukan hanya pertunjukan di atas panggung, tetapi juga
                  medium pendidikan, refleksi sosial, dan penguat karakter
                  masyarakat.
                </p>

                <p>
                  Dewan Kesenian dan Kebudayaan Kota Tasikmalaya hadir untuk
                  merentangkan panggung kolaborasi antara seniman, budayawan,
                  akademisi, pemerintah, komunitas, dan generasi muda dalam
                  membangun ekosistem kebudayaan yang hidup dan berkelanjutan.
                </p>

                <p>
                  Melalui transformasi digital, dokumentasi karya,
                  pemberdayaan komunitas, serta pelestarian nilai-nilai
                  tradisi, kita ingin memastikan bahwa kebudayaan Tasikmalaya
                  tidak hanya lestari, tetapi juga mampu menjadi inspirasi di
                  tingkat nasional maupun internasional.
                </p>

                <p>
                  Mari jadikan DKKT sebagai rumah bersama. Tempat setiap
                  gagasan dihargai, setiap karya diapresiasi, dan setiap insan
                  budaya memiliki ruang untuk tumbuh demi Tasikmalaya yang
                  lebih bermartabat.
                </p>
              </div>
            )}

            {/* =================================================
                TOGGLE BUTTON
            ================================================= */}
            <button
              type="button"
              onClick={() => setExpanded((value) => !value)}
              aria-expanded={expanded}
              className="group inline-flex items-center gap-2 text-sm font-bold uppercase tracking-[0.14em] text-amber-400 transition hover:text-amber-300"
            >
              <span>
                {expanded ? "Lihat lebih sedikit" : "Baca selengkapnya"}
              </span>

              <span
                className={`flex h-7 w-7 items-center justify-center rounded-full border border-amber-400/20 bg-amber-500/5 text-[10px] transition-all duration-300 group-hover:border-amber-400/50 group-hover:bg-amber-500/10 ${
                  expanded ? "rotate-180" : ""
                }`}
              >
                ↓
              </span>
            </button>
          </div>

          {/* ===================================================
              IDENTITAS KETUA
          =================================================== */}
          <div className="mt-9 border-l-[3px] border-amber-400 pl-5">
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-gray-500">
              Pimpinan
            </p>

            <h3 className="mt-2 text-2xl font-black leading-tight text-white md:text-3xl">
              Tatang Suprihatna Sumpena, S.Sn.
            </h3>

            <p className="mt-2 text-sm leading-7 text-amber-300 md:text-base">
              Ketua Dewan Kesenian dan Kebudayaan Kota Tasikmalaya
            </p>

            <div className="mt-4 h-px w-40 bg-gradient-to-r from-amber-400/80 to-transparent" />
          </div>

          {/* ===================================================
              ACTION BUTTONS
          =================================================== */}
          <div className="mt-8 flex flex-wrap gap-3 md:mt-9">
            <Link
              href="/profil"
              className="inline-flex items-center justify-center rounded-xl bg-amber-500 px-6 py-3 text-sm font-bold text-black transition duration-300 hover:-translate-y-0.5 hover:bg-amber-400 hover:shadow-[0_8px_30px_rgba(245,158,11,0.18)]"
            >
              Profil DKKT
              <span className="ml-2">→</span>
            </Link>

            <Link
              href="/berita"
              className="inline-flex items-center justify-center rounded-xl border border-white/15 bg-white/2 px-6 py-3 text-sm font-bold text-gray-200 transition duration-300 hover:-translate-y-0.5 hover:border-amber-400/50 hover:bg-amber-500/10 hover:text-amber-300"
            >
              Lihat Kegiatan
              <span className="ml-2">→</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}