/**
 * "How to show up" — auto-advancing story carousel.
 *
 * - Four panels with alternating brand backgrounds (ink / sky / bone / ink).
 * - Swipe support: touch + mouse drag with a ~50px threshold.
 * - Auto-advances every 6s. Pauses on hover, focus, drag, or
 *   prefers-reduced-motion. Resumes on leave/blur.
 * - Keyboard: ← / → to navigate. Buttons and dots are focusable.
 * - Single panel visible per viewport (full width); dots + arrows for nav.
 */

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";

type Panel = {
  n: string;
  tag: string;
  tagColor: string;
  bg: string;
  fg: string;
  title: string;
  titleLine2?: string;
  titleLine3?: string;
  titleInline?: string;
  underline?: boolean;
  inlineUnderline?: boolean;
  meta: string;
  duration: string;
  dotted: string;
};

const PANELS: Panel[] = [
  {
    n: "EP 012",
    tag: "A FIRST RUN",
    tagColor: "text-sky-brand",
    bg: "bg-ink",
    fg: "text-bone",
    title: "MAYA'S",
    titleLine2: "FIRST 5",
    titleLine3: "MILES.",
    underline: true,
    meta: "saturday morning, 54° and a little nervous.",
    duration: "0:47",
    dotted: "dot-grid",
  },
  {
    n: "EP 013",
    tag: "WHAT TO WEAR",
    tagColor: "text-ink/70",
    bg: "bg-sky-brand",
    fg: "text-ink",
    title: "IN",
    titleInline: "54°.",
    underline: true,
    inlineUnderline: true,
    meta: "a forty-second guide to dressing for the weather.",
    duration: "0:38",
    dotted: "dot-grid-sky",
  },
  {
    n: "EP 014",
    tag: "MILE 3",
    tagColor: "text-ink/70",
    bg: "bg-bone border border-ink/15",
    fg: "text-ink",
    title: "WHERE",
    titleLine2: "EVERYONE",
    titleLine3: "CRACKS.",
    underline: true,
    meta: "a very honest stretch of road, told plainly.",
    duration: "1:02",
    dotted: "dot-grid-bone",
  },
  {
    n: "EP 015",
    tag: "AFTER",
    tagColor: "text-sky-brand",
    bg: "bg-ink",
    fg: "text-bone",
    title: "COFFEE",
    titleLine2: "AT SEY,",
    titleLine3: "ALWAYS.",
    underline: true,
    meta: "the real club meets after the run, every time.",
    duration: "0:55",
    dotted: "dot-grid",
  },
];

const AUTO_MS = 6000;
const SWIPE_THRESHOLD = 50;

function GrytLogo({ className = "" }: { className?: string }) {
  return (
    <span className={`logo-lockup text-lg md:text-xl tracking-tight ${className}`}>
      GRYT
    </span>
  );
}

export function HowToShowUpCarousel() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);
  const dragStartX = useRef<number | null>(null);
  const dragWidth = useRef<number>(0);
  const wasDragged = useRef(false);

  const total = PANELS.length;
  const reducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

  const goTo = useCallback(
    (i: number) => setIndex(((i % total) + total) % total),
    [total],
  );
  const next = useCallback(() => goTo(index + 1), [goTo, index]);
  const prev = useCallback(() => goTo(index - 1), [goTo, index]);

  /* Auto-advance — pause when interacting or reduced motion. */
  useEffect(() => {
    if (paused || reducedMotion) return;
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % total);
    }, AUTO_MS);
    return () => window.clearInterval(id);
  }, [paused, reducedMotion, total]);

  /* Keyboard navigation when the region has focus. */
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      prev();
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      next();
    }
  };

  /* Pointer drag — works for touch + mouse + pen. */
  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!trackRef.current) return;
    dragStartX.current = e.clientX;
    dragWidth.current = trackRef.current.clientWidth;
    wasDragged.current = false;
    setPaused(true);
    (e.target as Element).setPointerCapture?.(e.pointerId);
  };

  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (dragStartX.current === null) return;
    const delta = e.clientX - dragStartX.current;
    if (Math.abs(delta) > 4) wasDragged.current = true;
    setDragOffset(delta);
  };

  const endDrag = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (dragStartX.current === null) return;
    const delta = e.clientX - dragStartX.current;
    dragStartX.current = null;
    setDragOffset(0);
    if (delta <= -SWIPE_THRESHOLD) next();
    else if (delta >= SWIPE_THRESHOLD) prev();
    /* small grace before re-enabling auto so users can read */
    window.setTimeout(() => setPaused(false), 1500);
  };

  /* Translate calc — base on index, plus live drag offset as a percentage. */
  const dragPct = dragWidth.current
    ? (dragOffset / dragWidth.current) * 100
    : 0;
  const translate = `calc(-${index * 100}% + ${dragPct}%)`;

  return (
    <section
      id="how"
      className="bg-bone text-ink py-20 md:py-28"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div className="px-6 md:px-10 mb-12 md:mb-16">
        <div className="label-meta opacity-70">How to show up</div>
        <div className="rule-thin bg-ink mt-2 mb-6 max-w-xs" />
        <div className="flex flex-wrap items-end justify-between gap-6">
          <h2 className="font-display text-5xl md:text-7xl max-w-3xl">
            FOUR RULES.
            <br />
            THAT'S <span className="underline-sky">IT.</span>
          </h2>
          <div className="label-meta text-ink/60">
            EP {String(index + 1).padStart(3, "0")} / {String(total).padStart(3, "0")}
          </div>
        </div>
      </div>

      {/* Carousel viewport */}
      <div
        className="relative px-6 md:px-10"
        role="region"
        aria-roledescription="carousel"
        aria-label="How to show up — four story panels"
        tabIndex={0}
        onKeyDown={onKeyDown}
      >
        <div
          ref={trackRef}
          className="relative overflow-hidden touch-pan-y select-none"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          onClickCapture={(e) => {
            /* swallow clicks that came from a drag */
            if (wasDragged.current) {
              e.preventDefault();
              e.stopPropagation();
              wasDragged.current = false;
            }
          }}
          style={{ cursor: dragStartX.current !== null ? "grabbing" : "grab" }}
        >
          <div
            className="flex"
            style={{
              transform: `translate3d(${translate}, 0, 0)`,
              transition:
                dragStartX.current !== null
                  ? "none"
                  : "transform 600ms cubic-bezier(0.22, 0.61, 0.36, 1)",
            }}
            aria-live="polite"
          >
            {PANELS.map((c, i) => {
              const isSky = c.bg.includes("sky");
              const active = i === index;
              return (
                <article
                  key={i}
                  className="shrink-0 w-full px-0"
                  role="group"
                  aria-roledescription="slide"
                  aria-label={`Panel ${i + 1} of ${total}`}
                  aria-hidden={!active}
                >
                  <div
                    className={`relative w-full aspect-[16/10] md:aspect-[16/7] ${c.bg} ${c.fg} flex flex-col overflow-hidden`}
                  >
                    <div
                      className={`absolute inset-0 ${c.dotted} pointer-events-none`}
                    />

                    {/* Header */}
                    <div className="relative z-10 flex items-start justify-between p-6 md:p-10">
                      <GrytLogo className={c.fg} />
                      <div className="label-meta opacity-80">{c.n}</div>
                    </div>

                    {/* Body */}
                    <div className="relative z-10 px-6 md:px-10 flex-1 flex flex-col md:flex-row md:items-end md:justify-between gap-8">
                      <div className="max-w-2xl">
                        <div className={`label-meta mb-4 ${c.tagColor}`}>
                          {c.tag}
                        </div>
                        <h3 className="font-display text-[44px] md:text-[88px] leading-[0.88]">
                          {c.titleInline ? (
                            <span>
                              {c.title}{" "}
                              <span className={c.inlineUnderline ? "underline-sky" : ""}>
                                {c.titleInline}
                              </span>
                            </span>
                          ) : (
                            <>
                              <span className="block">{c.title}</span>
                              {c.titleLine2 && (
                                <span className="block">{c.titleLine2}</span>
                              )}
                              {c.titleLine3 && (
                                <span className="block">
                                  {c.underline ? (
                                    <span className="underline-sky">
                                      {c.titleLine3}
                                    </span>
                                  ) : (
                                    c.titleLine3
                                  )}
                                </span>
                              )}
                            </>
                          )}
                        </h3>

                        <p className="mt-5 text-base md:text-lg leading-snug normal-case lowercase opacity-85 max-w-md">
                          {c.meta}
                        </p>
                      </div>

                      <div className="flex md:flex-col items-center md:items-end justify-between md:justify-end gap-4">
                        <button
                          aria-label={`Play ${c.tag}`}
                          className={`w-14 h-14 md:w-16 md:h-16 rounded-full border-2 flex items-center justify-center transition-transform hover:scale-105 ${
                            isSky ? "border-ink" : "border-current"
                          }`}
                        >
                          <svg
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                          >
                            <path d="M8 5v14l11-7z" />
                          </svg>
                        </button>
                        <span
                          className={`font-display text-lg px-2 py-0.5 ${
                            isSky ? "bg-ink text-bone" : "bg-current/10"
                          }`}
                        >
                          {c.duration}
                        </span>
                      </div>
                    </div>

                    {/* Footer rule */}
                    <div className="relative z-10 p-6 md:p-10 pt-4 md:pt-6">
                      <div
                        className={`h-px w-full ${
                          isSky ? "bg-ink/30" : "bg-current/25"
                        }`}
                      />
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>

        {/* Controls strip */}
        <div className="mt-6 flex items-center justify-between gap-6">
          {/* Dots */}
          <div
            className="flex items-center gap-2"
            role="tablist"
            aria-label="Select panel"
          >
            {PANELS.map((_, i) => {
              const active = i === index;
              return (
                <button
                  key={i}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  aria-label={`Go to panel ${i + 1}`}
                  onClick={() => goTo(i)}
                  className={`h-[6px] transition-all ${
                    active ? "w-10 bg-ink" : "w-5 bg-ink/25 hover:bg-ink/50"
                  }`}
                />
              );
            })}
          </div>

          {/* Arrows */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={prev}
              aria-label="Previous panel"
              className="label-meta px-4 py-2.5 border border-ink hover:bg-ink hover:text-bone transition-colors"
            >
              ← PREV
            </button>
            <button
              type="button"
              onClick={next}
              aria-label="Next panel"
              className="label-meta px-4 py-2.5 border border-ink bg-ink text-bone hover:bg-sky-brand hover:text-ink hover:border-ink transition-colors"
            >
              NEXT →
            </button>
          </div>
        </div>

        {/* Auto-advance progress bar */}
        <div className="mt-4 h-[2px] w-full bg-ink/10 overflow-hidden">
          <div
            key={`${index}-${paused ? "p" : "r"}`}
            className="h-full bg-sky-brand"
            style={{
              width: paused || reducedMotion ? "0%" : "100%",
              transition:
                paused || reducedMotion
                  ? "none"
                  : `width ${AUTO_MS}ms linear`,
            }}
          />
        </div>
      </div>
    </section>
  );
}
