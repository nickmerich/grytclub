import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";

import crew1 from "@/assets/crew-1.jpg";
import crew2 from "@/assets/crew-2.jpg";
import crew3 from "@/assets/crew-3.jpg";
import crew4 from "@/assets/crew-4.jpg";
import crew5 from "@/assets/crew-5.jpg";
import crew6 from "@/assets/crew-6.jpg";
import runGroup from "@/assets/run-group.jpg";
import runTrail from "@/assets/run-trail.jpg";
import runVibes from "@/assets/run-vibes.jpg";
import runIndividual from "@/assets/run-individual.jpg";

const PHOTOS = [
  { src: runGroup, alt: "GRYT Run Club crew on the Montour Trail at sunrise" },
  { src: crew1, alt: "Crew members at the trailhead" },
  { src: runTrail, alt: "Run Club out on the trail" },
  { src: crew4, alt: "Race day faces in the crowd" },
  { src: runVibes, alt: "Saturday morning crew" },
  { src: crew6, alt: "Crew gathered before a long run" },
  { src: runIndividual, alt: "A runner pushing through downtown" },
  { src: crew2, alt: "Run club regulars at a race" },
  { src: crew3, alt: "GRYT crew shield in the wild" },
  { src: crew5, alt: "Moment from a recent Saturday" },
];

export function CrewCarousel() {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const reduce = useReducedMotion();
  const hoverRef = useRef(false);

  const total = PHOTOS.length;
  const advance = (dir: number) => {
    setDirection(dir);
    setIndex((i) => (i + dir + total) % total);
  };

  useEffect(() => {
    if (reduce) return;
    const id = setInterval(() => {
      if (!hoverRef.current) advance(1);
    }, 3800);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduce]);

  // Touch swipe
  const touchX = useRef<number | null>(null);
  const onTouchStart = (e: React.TouchEvent) => {
    touchX.current = e.touches[0]?.clientX ?? null;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchX.current == null) return;
    const dx = (e.changedTouches[0]?.clientX ?? 0) - touchX.current;
    if (Math.abs(dx) > 40) advance(dx < 0 ? 1 : -1);
    touchX.current = null;
  };

  const prevIdx = (index - 1 + total) % total;
  const nextIdx = (index + 1) % total;

  return (
    <div
      className="relative w-full select-none"
      onMouseEnter={() => (hoverRef.current = true)}
      onMouseLeave={() => (hoverRef.current = false)}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {/* Baby-blue paint splatter accents — corner washes */}
      <div className="pointer-events-none absolute -top-8 -left-10 w-48 h-48 z-0 opacity-70">
        <svg viewBox="0 0 200 200" className="w-full h-full">
          <defs>
            <radialGradient id="splat-tl" cx="40%" cy="40%" r="60%">
              <stop offset="0%" stopColor="#89CFF0" stopOpacity="0.85" />
              <stop offset="60%" stopColor="#89CFF0" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#89CFF0" stopOpacity="0" />
            </radialGradient>
          </defs>
          <circle cx="80" cy="80" r="65" fill="url(#splat-tl)" />
          <circle cx="140" cy="50" r="8" fill="#89CFF0" opacity="0.55" />
          <circle cx="40" cy="140" r="5" fill="#89CFF0" opacity="0.7" />
          <circle cx="150" cy="120" r="3" fill="#89CFF0" opacity="0.8" />
        </svg>
      </div>
      <div className="pointer-events-none absolute -bottom-10 -right-12 w-56 h-56 z-0 opacity-70">
        <svg viewBox="0 0 200 200" className="w-full h-full">
          <defs>
            <radialGradient id="splat-br" cx="60%" cy="60%" r="60%">
              <stop offset="0%" stopColor="#89CFF0" stopOpacity="0.9" />
              <stop offset="55%" stopColor="#89CFF0" stopOpacity="0.18" />
              <stop offset="100%" stopColor="#89CFF0" stopOpacity="0" />
            </radialGradient>
          </defs>
          <circle cx="120" cy="120" r="75" fill="url(#splat-br)" />
          <circle cx="50" cy="80" r="6" fill="#89CFF0" opacity="0.65" />
          <circle cx="60" cy="160" r="4" fill="#89CFF0" opacity="0.7" />
          <circle cx="170" cy="60" r="3" fill="#89CFF0" opacity="0.8" />
        </svg>
      </div>

      {/* Stage */}
      <div className="relative z-10 mx-auto w-full max-w-5xl">
        <div
          className="relative h-[360px] sm:h-[440px] md:h-[540px] flex items-center justify-center"
          style={{ perspective: "1400px" }}
        >
          {/* Side preview - prev */}
          <motion.div
            key={`prev-${prevIdx}`}
            className="hidden md:block absolute left-0 top-1/2 w-[28%] h-[70%] -translate-y-1/2 overflow-hidden bg-ink/10 shadow-[0_20px_40px_-20px_rgba(0,0,0,0.4)]"
            style={{ transform: "translateY(-50%) rotateY(18deg) translateX(0)" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.55 }}
            transition={{ duration: 0.5 }}
            onClick={() => advance(-1)}
          >
            <img
              src={PHOTOS[prevIdx].src}
              alt=""
              aria-hidden
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-bone/40 via-transparent to-transparent" />
          </motion.div>

          {/* Center main image */}
          <div className="relative z-20 h-full w-[88%] md:w-[56%] overflow-hidden bg-ink/20 shadow-[0_30px_60px_-25px_rgba(0,0,0,0.55)]">
            <AnimatePresence initial={false} custom={direction} mode="popLayout">
              <motion.img
                key={index}
                src={PHOTOS[index].src}
                alt={PHOTOS[index].alt}
                className="absolute inset-0 w-full h-full object-cover"
                custom={direction}
                initial={
                  reduce
                    ? { opacity: 0 }
                    : { x: direction > 0 ? "60%" : "-60%", opacity: 0, scale: 1.04 }
                }
                animate={{ x: 0, opacity: 1, scale: 1 }}
                exit={
                  reduce
                    ? { opacity: 0 }
                    : { x: direction > 0 ? "-40%" : "40%", opacity: 0, scale: 0.98 }
                }
                transition={{ duration: 0.7, ease: [0.22, 0.8, 0.2, 1] }}
                draggable={false}
              />
            </AnimatePresence>

            {/* Baby-blue edge wash overlays */}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-sky/25 via-transparent to-transparent mix-blend-screen" />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-bl from-sky/15 via-transparent to-transparent mix-blend-screen" />
            {/* Inner ink frame for editorial feel */}
            <div className="pointer-events-none absolute inset-0 border border-ink/30" />

            {/* Frame counter */}
            <div className="absolute bottom-3 left-3 z-10 label-meta text-bone/90 bg-ink/55 px-2 py-1 backdrop-blur-sm">
              {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
            </div>
          </div>

          {/* Side preview - next */}
          <motion.div
            key={`next-${nextIdx}`}
            className="hidden md:block absolute right-0 top-1/2 w-[28%] h-[70%] -translate-y-1/2 overflow-hidden bg-ink/10 shadow-[0_20px_40px_-20px_rgba(0,0,0,0.4)]"
            style={{ transform: "translateY(-50%) rotateY(-18deg) translateX(0)" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.55 }}
            transition={{ duration: 0.5 }}
            onClick={() => advance(1)}
          >
            <img
              src={PHOTOS[nextIdx].src}
              alt=""
              aria-hidden
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-l from-bone/40 via-transparent to-transparent" />
          </motion.div>
        </div>

        {/* Controls + progress */}
        <div className="relative z-10 mt-6 flex items-center gap-4">
          <button
            type="button"
            onClick={() => advance(-1)}
            className="font-display text-xl px-3 py-1 border border-ink/70 hover:bg-ink hover:text-bone transition-colors"
            aria-label="Previous photo"
          >
            ←
          </button>
          <div className="flex-1 flex gap-1.5">
            {PHOTOS.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => {
                  setDirection(i > index ? 1 : -1);
                  setIndex(i);
                }}
                aria-label={`Go to photo ${i + 1}`}
                className="flex-1 h-1.5 bg-ink/15 relative overflow-hidden"
              >
                <span
                  className={`absolute inset-y-0 left-0 ${
                    i === index ? "w-full bg-sky" : i < index ? "w-full bg-ink/60" : "w-0"
                  } transition-all duration-500`}
                />
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => advance(1)}
            className="font-display text-xl px-3 py-1 border border-ink/70 hover:bg-ink hover:text-bone transition-colors"
            aria-label="Next photo"
          >
            →
          </button>
        </div>
      </div>
    </div>
  );
}
