"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

import { news } from "@/lib/news";
import { agenda } from "@/lib/agenda";

type Highlight = {
  type: "Berita" | "Agenda" | "Galeri" | "Program";
  label: string;
  title: string;
  description: string;
  date: string;
  image: string;
  href: string;
  button: string;
};

const galleryHighlight: Highlight = {
  type: "Galeri",
  label: "GALERI • DOKUMENTASI BUDAYA",
  title: "Ritual dan Tradisi Budaya Tasikmalaya",
  description:
    "Merekam perjalanan, tradisi, dan aktivitas kebudayaan sebagai bagian dari arsip visual Kota Tasikmalaya.",
  date: "Dokumentasi 2026",
  image: "/gallery/galeri5.jpeg",
  href: "/galeri?komite=budaya",
  button: "Lihat Galeri",
};

const programHighlight: Highlight = {
  type: "Program",
  label: "PROGRAM DKKT • EKOSISTEM KEBUDAYAAN",
  title: "Menguatkan Ekosistem Seni Kota Tasikmalaya",
  description:
    "Kolaborasi seniman, komunitas, akademisi, pemerintah, dan masyarakat menjadi fondasi pengembangan kebudayaan yang berkelanjutan.",
  date: "Program DKKT 2026",
  image: "/gallery/news1.jpg",
  href: "/profil",
  button: "Tentang DKKT",
};

const AUTO_DELAY = 6000;
const TRANSITION_DURATION = 1000;
const DRAG_THRESHOLD = 60;

export default function HighlightSlider() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [dragX, setDragX] = useState(0);

  /*
   * ==========================================================
   * DATA
   * ==========================================================
   */
  const highlights = useMemo<Highlight[]>(() => {
    const latestNews = news.slice(0, 2).map((item) => ({
      type: "Berita" as const,
      label: `BERITA • ${item.date.toUpperCase()}`,
      title: item.title,
      description: item.excerpt,
      date: item.date,
      image: item.image,
      href: `/berita/${item.slug}`,
      button: "Baca Berita",
    }));

    const latestAgenda = agenda.slice(0, 2).map((item) => ({
      type: "Agenda" as const,
      label: `AGENDA • ${item.date} ${item.month} 2026`,
      title: item.title,
      description: item.description,
      date: `${item.date} ${item.bulan} ${item.year}`,
      image: getAgendaImage(item.komite),
      href: `/agenda/${item.slug}`,
      button: "Lihat Agenda",
    }));

    return [
      ...latestNews,
      ...latestAgenda,
      galleryHighlight,
      programHighlight,
    ];
  }, []);

  const totalSlides = highlights.length;

  /*
   * ==========================================================
   * AUTO PLAY
   * ==========================================================
   */
  useEffect(() => {
    if (
      paused ||
      dragging ||
      totalSlides <= 1
    ) {
      return;
    }

    const timer = window.setTimeout(() => {
      setActive((current) =>
        current >= totalSlides - 1
          ? 0
          : current + 1
      );
    }, AUTO_DELAY);

    return () => {
      window.clearTimeout(timer);
    };
  }, [
    active,
    paused,
    dragging,
    totalSlides,
  ]);

  /*
   * ==========================================================
   * NEXT
   * ==========================================================
   */
  const nextSlide = () => {
    if (totalSlides <= 1) return;

    setActive((current) =>
      current >= totalSlides - 1
        ? 0
        : current + 1
    );
  };

  /*
   * ==========================================================
   * PREVIOUS
   * ==========================================================
   */
  const previousSlide = () => {
    if (totalSlides <= 1) return;

    setActive((current) =>
      current <= 0
        ? totalSlides - 1
        : current - 1
    );
  };

  /*
   * ==========================================================
   * POINTER START
   * ==========================================================
   */
  const pointerStart = (
    event: React.PointerEvent<HTMLDivElement>
  ) => {
    if (event.pointerType === "mouse" && event.button !== 0) {
      return;
    }

    setDragging(true);
    setPaused(true);
    setDragX(0);

    event.currentTarget.setPointerCapture(
      event.pointerId
    );

    event.currentTarget.dataset.startX =
      String(event.clientX);
  };

  /*
   * ==========================================================
   * POINTER MOVE
   * ==========================================================
   */
  const pointerMove = (
    event: React.PointerEvent<HTMLDivElement>
  ) => {
    if (!dragging) return;

    const startX = Number(
      event.currentTarget.dataset.startX ?? 0
    );

    const distance =
      event.clientX - startX;

    /*
     * Batasi pergerakan supaya tidak terlalu liar
     */
    const limitedDistance = Math.max(
      -180,
      Math.min(180, distance)
    );

    setDragX(limitedDistance);
  };

  /*
   * ==========================================================
   * POINTER END
   * ==========================================================
   */
  const pointerEnd = (
    event: React.PointerEvent<HTMLDivElement>
  ) => {
    if (!dragging) return;

    const startX = Number(
      event.currentTarget.dataset.startX ?? 0
    );

    const distance =
      event.clientX - startX;

    setDragging(false);
    setDragX(0);

    /*
     * Sedikit delay agar klik link tidak salah terbaca
     * setelah gesture selesai.
     */
    window.setTimeout(() => {
      setPaused(false);
    }, 120);

    if (distance < -DRAG_THRESHOLD) {
      nextSlide();
    } else if (
      distance > DRAG_THRESHOLD
    ) {
      previousSlide();
    }
  };

  if (!highlights.length) {
    return null;
  }

  const current = highlights[active];

  /*
   * ==========================================================
   * TRACK POSITION
   * ==========================================================
   */
  const transform = dragging
    ? `translateX(calc(-${active * 100}% + ${dragX}px))`
    : `translateX(-${active * 100}%)`;

  return (
    <section className="bg-black px-3 pt-[104px] pb-4 sm:px-4 sm:pt-[104px] md:px-6 md:pt-[108px] md:pb-7">
      <div className="mx-auto max-w-7xl">

        {/* ====================================================
            SLIDER CONTAINER
        ==================================================== */}
        <div
          className="group relative overflow-hidden rounded-[22px] border border-amber-500/20 bg-[#0D0D0D] sm:rounded-[26px] md:rounded-[28px]"
          onMouseEnter={() => {
            if (!dragging) {
              setPaused(true);
            }
          }}
          onMouseLeave={() => {
            if (!dragging) {
              setPaused(false);
            }
          }}
        >

          {/* ==================================================
              VIEWPORT
          ================================================== */}
          <div
            className="relative h-[390px] overflow-hidden sm:h-[430px] md:h-[470px] lg:h-[480px]"
            onPointerDown={pointerStart}
            onPointerMove={pointerMove}
            onPointerUp={pointerEnd}
            onPointerCancel={pointerEnd}
            style={{
              touchAction: "pan-y",
              cursor: dragging
                ? "grabbing"
                : "grab",
            }}
          >

            {/* =================================================
                TRACK
            ================================================= */}
            <div
              className="flex h-full"
              style={{
                transform,
                transition: dragging
                  ? "none"
                  : `transform ${TRANSITION_DURATION}ms cubic-bezier(0.22, 1, 0.36, 1)`,
                willChange: "transform",
              }}
            >
              {highlights.map((item, index) => (
                <article
                  key={`slide-${item.type}-${index}`}
                  className="relative h-full w-full min-w-full shrink-0 overflow-hidden"
                >

                  {/* IMAGE */}
                  <img
                    src={item.image}
                    alt={item.title}
                    draggable={false}
                    className="absolute inset-0 h-full w-full object-cover"
                  />

                  {/* OVERLAY */}
                  <div className="absolute inset-0 bg-black/30" />

                  <div className="absolute inset-0 bg-gradient-to-r from-black via-black/65 to-black/20" />

                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

                  {/* =================================================
                      CONTENT
                  ================================================= */}
                  <div className="relative z-10 flex h-full items-end">
                    <div className="w-full p-5 sm:p-7 md:p-10 lg:p-12">
                      <div className="max-w-3xl">

                        {/* TYPE */}
                        <div className="flex flex-wrap items-center gap-2 sm:gap-3">

                          <span className="rounded-full bg-amber-500 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-black sm:px-4 sm:py-2 sm:text-xs">
                            {item.type}
                          </span>

                          <span className="max-w-[220px] truncate text-[10px] font-medium uppercase tracking-[0.15em] text-amber-300 sm:max-w-none sm:text-xs sm:tracking-[0.18em]">
                            {item.label}
                          </span>

                        </div>

                        {/* TITLE */}
                        <h2 className="mt-4 max-w-3xl text-2xl font-black leading-[1.1] text-white sm:mt-5 sm:text-3xl md:text-5xl lg:text-6xl">
                          {item.title}
                        </h2>

                        {/* DESCRIPTION */}
                        <p className="mt-3 max-w-2xl text-xs leading-6 text-gray-300 sm:mt-4 sm:text-sm sm:leading-7 md:text-base">
                          {item.description}
                        </p>

                        {/* DATE */}
                        <p className="mt-3 text-xs text-gray-400 sm:mt-4 sm:text-sm">
                          {item.date}
                        </p>

                        {/* CTA */}
                        <div className="mt-5 sm:mt-6">
                          <Link
                            href={item.href}
                            onPointerDown={(event) => {
                              event.stopPropagation();
                            }}
                            onClick={(event) => {
                              event.stopPropagation();
                            }}
                            className="inline-flex min-h-10 items-center rounded-xl bg-amber-500 px-4 py-2.5 text-xs font-semibold text-black transition hover:-translate-y-0.5 hover:bg-amber-400 sm:min-h-11 sm:px-5 sm:py-3 sm:text-sm"
                          >
                            {item.button}

                            <span className="ml-2">
                              →
                            </span>
                          </Link>
                        </div>

                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            {/* =================================================
                PREVIOUS
            ================================================= */}
            <button
              type="button"
              aria-label="Highlight sebelumnya"
              onPointerDown={(event) => {
                event.stopPropagation();
              }}
              onClick={(event) => {
                event.stopPropagation();
                previousSlide();
              }}
              className="absolute left-3 top-1/2 z-30 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-black/45 text-sm text-white backdrop-blur transition hover:border-amber-400 hover:bg-amber-500 hover:text-black sm:left-4 sm:h-10 sm:w-10 md:h-11 md:w-11 md:opacity-0 md:group-hover:opacity-100"
            >
              ←
            </button>

            {/* =================================================
                NEXT
            ================================================= */}
            <button
              type="button"
              aria-label="Highlight berikutnya"
              onPointerDown={(event) => {
                event.stopPropagation();
              }}
              onClick={(event) => {
                event.stopPropagation();
                nextSlide();
              }}
              className="absolute right-3 top-1/2 z-30 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-black/45 text-sm text-white backdrop-blur transition hover:border-amber-400 hover:bg-amber-500 hover:text-black sm:right-4 sm:h-10 sm:w-10 md:h-11 md:w-11 md:opacity-0 md:group-hover:opacity-100"
            >
              →
            </button>

            {/* =================================================
                STATUS
            ================================================= */}
            <div className="absolute right-4 top-4 z-30 sm:right-5 sm:top-5">
              <span className="rounded-full border border-white/10 bg-black/45 px-2.5 py-1 text-[9px] font-semibold uppercase tracking-widest text-gray-300 backdrop-blur sm:px-3 sm:text-[10px]">
                {paused ? "Paused" : "Auto"}
              </span>
            </div>
          </div>

          {/* ==================================================
              INDICATOR BAR
          ================================================== */}
          <div className="flex items-center justify-between border-t border-white/10 bg-black/70 px-4 py-3 sm:px-5">

            <div className="flex items-center gap-1.5">
              {highlights.map((item, index) => (
                <button
                  key={`indicator-${index}`}
                  type="button"
                  aria-label={`Buka highlight ${index + 1}`}
                  onClick={() => {
                    setActive(index);
                    setPaused(false);
                  }}
                  className={`h-1.5 rounded-full transition-all duration-500 ${
                    index === active
                      ? "w-7 bg-amber-400 sm:w-10"
                      : "w-1.5 bg-white/20 hover:bg-white/40"
                  }`}
                />
              ))}
            </div>

            <span className="text-[10px] font-medium tracking-widest text-gray-500 sm:text-xs">
              {String(active + 1).padStart(2, "0")}
              {" / "}
              {String(totalSlides).padStart(2, "0")}
            </span>

          </div>
        </div>
      </div>
    </section>
  );
}

/*
 * ============================================================
 * GAMBAR AGENDA
 * ============================================================
 */
function getAgendaImage(
  komite: string
) {
  const images: Record<string, string> = {
    teater: "/gallery/galeri1.jpeg",
    tari: "/gallery/galeri2.jpeg",
    musik: "/gallery/galeri5.jpeg",
    "seni-rupa": "/gallery/galeri3.png",
    sastra: "/gallery/galeri7.jpeg",
    "film-fotografi":
      "/gallery/galeri6.jpeg",
    budaya: "/gallery/galeri8.webp",
  };

  return (
    images[komite] ??
    "/gallery/featured.jpg"
  );
}