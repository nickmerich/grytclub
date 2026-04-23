import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { RouteMap } from "@/components/RouteMap";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "GRYT — DO HARD THINGS TOGETHER" },
      {
        name: "description",
        content:
          "GRYT is an NYC run club. We meet at the river. Saturdays, 6:30 AM. Any pace. Coffee after.",
      },
      { property: "og:title", content: "GRYT — DO HARD THINGS TOGETHER" },
      {
        property: "og:description",
        content: "NYC run club. East River Park. Saturdays 6:30 AM.",
      },
    ],
  }),
});

/* ─── Reusable bits ─── */

function Label({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`label-meta opacity-70 ${className}`}>{children}</div>;
}

function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="flex flex-col gap-2">
      <Label>{label}</Label>
      <div className="rule-thin" />
      <div className="font-display text-2xl md:text-3xl leading-none">{value}</div>
      {sub && <div className="label-meta opacity-50">{sub}</div>}
    </div>
  );
}

/* GRYT logo lockup — used in card headers */
function GrytLogo({ className = "" }: { className?: string }) {
  return (
    <span className={`logo-lockup text-lg md:text-xl tracking-tight ${className}`}>
      GRYT
    </span>
  );
}

/* Diagonal slash — thin sky-blue line at ~15° */
function DiagonalSlash({
  className = "",
  thickness = 4,
  length = "140%",
  rotate = -15,
}: {
  className?: string;
  thickness?: number;
  length?: string;
  rotate?: number;
}) {
  return (
    <div
      className={`slash-line ${className}`}
      style={{
        width: length,
        height: `${thickness}px`,
        transform: `rotate(${rotate}deg)`,
        transformOrigin: "center",
      }}
    />
  );
}

/* ─── Recap data + widget ─── */

type Roster = { name: string; firstTimer: boolean }[];

const RECAP = {
  date: "SAT 04.19",
  runners: 42,
  firstTimers: 9,
  miles: 210,
  temp: "41°F",
  prevWeek: 38,
  start: "EAST RIVER PARK",
  after: "SEY COFFEE",
  roster: [
    { name: "MAYA", firstTimer: false }, { name: "JON", firstTimer: false },
    { name: "PRIYA", firstTimer: true }, { name: "DEV", firstTimer: false },
    { name: "ROSA", firstTimer: false }, { name: "SAM", firstTimer: true },
    { name: "KOFI", firstTimer: false }, { name: "LENA", firstTimer: false },
    { name: "MIKAEL", firstTimer: true }, { name: "JESS", firstTimer: false },
    { name: "TONY", firstTimer: false }, { name: "AYA", firstTimer: true },
    { name: "HAN", firstTimer: false }, { name: "BEN", firstTimer: false },
    { name: "NORA", firstTimer: true }, { name: "ZAK", firstTimer: false },
    { name: "ELI", firstTimer: false }, { name: "RUTH", firstTimer: true },
    { name: "CARLO", firstTimer: false }, { name: "MEI", firstTimer: false },
    { name: "JAS", firstTimer: true }, { name: "OMAR", firstTimer: false },
    { name: "LULU", firstTimer: false }, { name: "DREW", firstTimer: true },
    { name: "KAI", firstTimer: false }, { name: "VERA", firstTimer: false },
    { name: "TEO", firstTimer: false }, { name: "NIA", firstTimer: true },
    { name: "ISA", firstTimer: false }, { name: "WILL", firstTimer: false },
    { name: "FINN", firstTimer: false }, { name: "AMARA", firstTimer: true },
  ] as Roster,
};

const SHARE_BASE = "gryt.run/sat";

const UTM_SOURCES = [
  { id: "instagram", label: "Instagram" },
  { id: "twitter", label: "X / Twitter" },
  { id: "strava", label: "Strava" },
  { id: "text", label: "Text / DM" },
] as const;

type UtmSource = (typeof UTM_SOURCES)[number]["id"];

function buildShareUrl(source: UtmSource): string {
  const params = new URLSearchParams({
    utm_source: source,
    utm_medium: "social",
    utm_campaign: "recap_sat",
  });
  return `${SHARE_BASE}?${params.toString()}`;
}

function buildRecapText(r: typeof RECAP, shareUrl: string): string {
  const firstTimers = r.roster.filter((x) => x.firstTimer).map((x) => x.name);
  const regulars = r.roster.filter((x) => !x.firstTimer).map((x) => x.name);
  return [
    `${r.runners} SHOWED UP.`,
    ``,
    `📍 ${r.start} · ${r.date} · ${r.temp}`,
    `🏃 ${r.runners} runners · ${r.miles} total miles · vs ${r.prevWeek} last week`,
    ``,
    `★ FIRST RUN WITH GRYT (${firstTimers.length}):`,
    firstTimers.map((n) => `★ ${n}`).join("  "),
    ``,
    `THE ROSTER:`,
    regulars.join(" · "),
    ``,
    `coffee after at ${r.after}.`,
    `do hard things together.`,
    ``,
    shareUrl,
  ].join("\n");
}

function RecapSection() {
  const [copied, setCopied] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [source, setSource] = useState<UtmSource>("instagram");
  const shareUrl = useMemo(() => buildShareUrl(source), [source]);
  const text = useMemo(() => buildRecapText(RECAP, shareUrl), [shareUrl]);

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  const onCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    } catch {
      setLinkCopied(false);
    }
  };

  return (
    <section id="recap" className="bg-bone text-ink py-20 md:py-28 border-t border-ink/10">
      <div className="px-6 md:px-10">
        <Label>Last saturday</Label>
        <div className="rule-thin bg-ink mt-2 mb-6 max-w-xs" />
        <h2 className="font-display text-6xl md:text-8xl lg:text-9xl">
          {RECAP.runners} SHOWED <span className="underline-sky">UP.</span>
        </h2>

        {/* Stat row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-ink/15 mt-14 md:mt-20">
          {[
            { label: "Runners", value: String(RECAP.runners), sub: `VS ${RECAP.prevWeek} LAST WK` },
            { label: "First-timers", value: String(RECAP.firstTimers).padStart(2, "0"), sub: "WELCOME" },
            { label: "Miles", value: String(RECAP.miles), sub: "TOTAL CLUB" },
            { label: "Temp", value: RECAP.temp, sub: "CRISP" },
          ].map((s) => (
            <div key={s.label} className="bg-bone p-6 md:p-8">
              <Stat label={s.label} value={s.value} sub={s.sub} />
            </div>
          ))}
        </div>

        {/* Tag cloud of names */}
        <div className="mt-16 md:mt-24">
          <Label>On the roster</Label>
          <div className="rule-thin bg-ink mt-2 mb-6 max-w-xs" />
          <p className="font-display text-2xl md:text-4xl leading-tight max-w-5xl">
            {RECAP.roster.map((r, i, arr) => (
              <span key={r.name} className="inline-block mr-2">
                {r.firstTimer ? (
                  <span className="mark-sky">{r.name}</span>
                ) : (
                  <span>{r.name}</span>
                )}
                {i < arr.length - 1 && <span className="text-ink/25 ml-2">·</span>}
              </span>
            ))}
          </p>
          <p className="label-meta mt-8 text-ink/60">
            <span className="inline-block w-3 h-3 bg-sky-brand mr-2 align-middle" />
            FIRST RUN WITH GRYT
          </p>
        </div>

        {/* ─── Copy-for-social widget ─── */}
        <div className="mt-16 md:mt-24 relative bg-ink text-bone overflow-hidden">
          <DiagonalSlash className="top-6 -right-20" thickness={2} length="60%" />
          <div className="absolute inset-0 dot-grid pointer-events-none" />

          <div className="relative z-10 p-6 md:p-10">
            <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
              <div>
                <Label className="text-bone">Share the recap</Label>
                <div className="rule-thin bg-bone mt-2 mb-4 max-w-[160px]" />
                <h3 className="font-display text-3xl md:text-5xl leading-[0.9]">
                  POST IT.
                  <br />
                  <span className="underline-sky">TAG US.</span>
                </h3>
              </div>
              <button
                type="button"
                onClick={onCopy}
                aria-live="polite"
                className={`label-meta px-5 py-3 transition-colors ${
                  copied
                    ? "bg-sky-brand text-ink"
                    : "bg-bone text-ink hover:bg-sky-brand"
                }`}
              >
                {copied ? "COPIED ✓" : "COPY TEXT →"}
              </button>
            </div>

            <pre
              className="relative bg-bone text-ink p-5 md:p-6 text-[13px] md:text-sm leading-relaxed whitespace-pre-wrap font-mono max-h-[420px] overflow-auto"
              aria-label="Recap text ready to copy"
            >
{text}
            </pre>

            {/* ─── Trackable share link ─── */}
            <div className="mt-6 border-t border-bone/15 pt-6">
              <div className="flex flex-wrap items-end justify-between gap-3 mb-3">
                <div>
                  <Label className="text-bone">Tracked share link</Label>
                  <div className="rule-thin bg-bone mt-2 max-w-[140px]" />
                </div>
                <div className="flex flex-wrap gap-1" role="radiogroup" aria-label="UTM source">
                  {UTM_SOURCES.map((s) => {
                    const active = source === s.id;
                    return (
                      <button
                        key={s.id}
                        type="button"
                        role="radio"
                        aria-checked={active}
                        onClick={() => setSource(s.id)}
                        className={`label-meta px-3 py-2 transition-colors ${
                          active
                            ? "bg-sky-brand text-ink"
                            : "bg-bone/10 text-bone hover:bg-bone/20"
                        }`}
                      >
                        {s.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-px bg-bone/15">
                <code className="flex-1 bg-bone text-ink px-4 py-3 font-mono text-xs md:text-sm break-all">
                  {shareUrl}
                </code>
                <button
                  type="button"
                  onClick={onCopyLink}
                  aria-live="polite"
                  className={`label-meta px-5 py-3 whitespace-nowrap transition-colors ${
                    linkCopied
                      ? "bg-sky-brand text-ink"
                      : "bg-bone text-ink hover:bg-sky-brand"
                  }`}
                >
                  {linkCopied ? "COPIED ✓" : "COPY LINK →"}
                </button>
              </div>
            </div>

            <p className="label-meta mt-5 text-bone/60">
              auto-formatted from saturday's roster · {RECAP.firstTimers} first-timers highlighted · link tracks back via utm
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function Index() {
  return (
    <main className="bg-bone text-ink overflow-hidden">
      {/* ═══════════════════════ HERO ═══════════════════════ */}
      <section className="relative bg-ink text-bone min-h-screen flex flex-col overflow-hidden">
        <div className="absolute inset-0 dot-grid pointer-events-none" />

        {/* Diagonal slash lines through hero */}
        <DiagonalSlash className="top-[20%] -left-[20%]" thickness={2} length="160%" />
        <DiagonalSlash className="top-[55%] -left-[20%] opacity-60" thickness={1} length="160%" />
        <DiagonalSlash className="top-[80%] -left-[20%] opacity-40" thickness={1} length="160%" />

        {/* Top nav */}
        <header className="relative z-10 flex items-center justify-between px-6 md:px-10 pt-6 md:pt-8">
          <GrytLogo className="text-bone" />
          <nav className="hidden md:flex items-center gap-10 label-meta">
            <a href="#runs" className="hover:text-sky-brand transition-colors">RUNS</a>
            <a href="#how" className="hover:text-sky-brand transition-colors">CLUB</a>
            <a href="#recap" className="hover:text-sky-brand transition-colors">JOURNAL</a>
            <a href="#card" className="hover:text-sky-brand transition-colors">MEMBERS</a>
          </nav>
          <a href="#rsvp" className="md:hidden label-meta text-sky-brand">RSVP →</a>
        </header>

        {/* Headline block */}
        <div className="relative z-10 px-6 md:px-10 pt-20 md:pt-28 pb-12 md:pb-16 flex-1 flex flex-col justify-center">
          <div className="label-meta text-sky-brand mb-6 md:mb-10">
            A RUN CLUB · EST. 2024
          </div>
          <h1 className="font-display text-[16vw] md:text-[12vw] lg:text-[10.5vw] leading-[0.85]">
            <span className="block">DO HARD</span>
            <span className="block">THINGS</span>
            <span className="block">
              <span className="underline-sky">TOGETHER</span>
            </span>
          </h1>

          {/* Sub + CTA */}
          <div className="mt-10 md:mt-14 max-w-xl">
            <p className="text-base md:text-lg text-bone/85 leading-snug">
              a run club for everyone who shows up. saturdays, 6:30 am. all paces welcome.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <a
                href="#rsvp"
                className="inline-flex items-center justify-center bg-sky-brand text-ink px-6 py-3.5 label-meta hover:bg-bone transition-colors"
              >
                JOIN SATURDAY'S RUN →
              </a>
              <a
                href="#how"
                className="inline-flex items-center justify-center border border-bone/60 text-bone px-6 py-3.5 label-meta hover:bg-bone hover:text-ink transition-colors"
              >
                MEET THE CLUB
              </a>
            </div>
          </div>
        </div>

        {/* Bottom meta strip */}
        <div className="relative z-10 border-t border-bone/15 px-6 md:px-10 py-5">
          <div className="flex flex-wrap items-center gap-x-8 gap-y-2 label-meta text-bone/80">
            <span>FREE</span>
            <span className="opacity-30">·</span>
            <span>OPEN TO ALL PACES</span>
            <span className="opacity-30">·</span>
            <span>EAST RIVER PARK</span>
            <span className="opacity-30">·</span>
            <span>COFFEE AFTER</span>
          </div>
        </div>
      </section>

      {/* ═══════════════════════ NEXT RUN ═══════════════════════ */}
      <section id="runs" className="bg-ink text-bone border-t border-bone/10">
        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Left: Date */}
          <div className="relative p-8 md:p-12 lg:p-16 border-b md:border-b-0 md:border-r border-bone/15 overflow-hidden">
            <DiagonalSlash className="top-8 -right-20" thickness={3} length="80%" />
            <Label>Next run</Label>
            <div className="rule-thin bg-bone mt-2 mb-8" />
            <div className="font-display text-7xl md:text-8xl lg:text-[8.5rem] leading-[0.85]">
              SATURDAY
            </div>
            <div className="font-display text-5xl md:text-6xl mt-4 text-sky-brand">
              6:30 AM
            </div>
            <p className="mt-10 text-bone/70 max-w-sm leading-snug">
              show up. shut up. run. the river doesn't care if you're tired.
            </p>
          </div>

          {/* Right: 2x2 grid */}
          <div className="grid grid-cols-2 text-bone">
            {[
              { label: "Distance", value: "5 MI" },
              { label: "Pace", value: "ANY" },
              { label: "Start", value: "EAST RIVER" },
              { label: "After", value: "SEY COFFEE" },
            ].map((s, i) => (
              <div
                key={s.label}
                className={`p-6 md:p-10 ${
                  i % 2 === 0 ? "border-r border-bone/15" : ""
                } ${i < 2 ? "border-b border-bone/15" : ""}`}
              >
                <Stat label={s.label} value={s.value} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════ HOW TO SHOW UP — STORY CARDS ═══════════════════════ */}
      <section id="how" className="bg-bone text-ink py-20 md:py-28">
        <div className="px-6 md:px-10 mb-12 md:mb-16">
          <Label>How to show up</Label>
          <div className="rule-thin bg-ink mt-2 mb-6 max-w-xs" />
          <h2 className="font-display text-5xl md:text-7xl max-w-3xl">
            FOUR RULES.
            <br />
            THAT'S <span className="underline-sky">IT.</span>
          </h2>
        </div>

        <div className="flex gap-4 md:gap-5 overflow-x-auto px-6 md:px-10 pb-6 snap-x snap-mandatory">
          {[
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
              meta: "SAT · 04.19 · 54°",
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
              meta: "A 40-SECOND GUIDE",
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
              meta: "A VERY HONEST STRETCH",
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
              meta: "THE REAL CLUB",
              duration: "0:55",
              dotted: "dot-grid",
            },
          ].map((c, i) => {
            const isSky = c.bg.includes("sky");
            return (
              <article
                key={i}
                className={`relative shrink-0 snap-start w-[78vw] sm:w-[58vw] md:w-[340px] aspect-[9/16] ${c.bg} ${c.fg} flex flex-col overflow-hidden`}
              >
                <div className={`absolute inset-0 ${c.dotted} pointer-events-none`} />

                {/* Header */}
                <div className="relative z-10 flex items-start justify-between p-5">
                  <GrytLogo className={c.fg} />
                  <div className="label-meta opacity-80">{c.n}</div>
                </div>

                {/* Title block */}
                <div className="relative z-10 px-5 mt-8 flex-1">
                  <div className={`label-meta mb-4 ${c.tagColor}`}>{c.tag}</div>
                  <h3 className="font-display text-[44px] md:text-[52px] leading-[0.88]">
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
                        {c.titleLine2 && <span className="block">{c.titleLine2}</span>}
                        {c.titleLine3 && (
                          <span className="block">
                            {c.underline ? (
                              <span className="underline-sky">{c.titleLine3}</span>
                            ) : (
                              c.titleLine3
                            )}
                          </span>
                        )}
                      </>
                    )}
                  </h3>

                  {/* Play button */}
                  <button
                    aria-label="Play"
                    className={`mt-6 w-12 h-12 rounded-full border-2 flex items-center justify-center ${
                      isSky ? "border-ink" : "border-current"
                    }`}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </button>

                  {/* Mid meta */}
                  <div className="label-meta mt-5 opacity-80">{c.meta}</div>
                </div>

                {/* Footer duration chip */}
                <div className="relative z-10 flex justify-end p-5">
                  <span
                    className={`font-display text-lg px-2 py-0.5 ${
                      isSky ? "bg-ink text-bone" : "bg-current/10"
                    }`}
                  >
                    {c.duration}
                  </span>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* ═══════════════════════ RECAP STRIP ═══════════════════════ */}
      <RecapSection />

      {/* ═══════════════════════ PR CARD ═══════════════════════ */}
      <section className="bg-bone text-ink pb-20 md:pb-28">
        <div className="px-6 md:px-10">
          <Label>Personal record</Label>
          <div className="rule-thin bg-ink mt-2 mb-6 max-w-xs" />
          <h2 className="font-display text-5xl md:text-7xl mb-12 md:mb-16 max-w-3xl">
            BEAT YOUR <span className="underline-sky">SELF.</span>
          </h2>

          {/* Square share card */}
          <div className="relative max-w-xl bg-sky-brand text-ink p-7 md:p-9 aspect-square flex flex-col overflow-hidden">
            <div className="absolute inset-0 dot-grid-sky pointer-events-none" />

            {/* Header */}
            <div className="relative z-10 flex items-start justify-between">
              <GrytLogo />
              <div className="bg-ink text-bone label-meta px-3 py-1.5">
                PERSONAL RECORD
              </div>
            </div>

            {/* Name */}
            <div className="relative z-10 mt-6 md:mt-8">
              <div className="font-display text-3xl md:text-4xl">MAYA OKONKWO</div>
              <div className="text-sm font-semibold mt-1">5 mile · saturday long run</div>
            </div>

            {/* Massive time */}
            <div className="relative z-10 flex-1 flex items-center">
              <div className="font-display text-[22vw] md:text-[10rem] leading-[0.85] tracking-tighter">
                46:32
              </div>
            </div>

            <div className="relative z-10 rule-thick bg-ink mb-4" />

            {/* Stats row */}
            <div className="relative z-10 grid grid-cols-3 gap-4 mb-6">
              {[
                { l: "PREV BEST", v: "49:10", s: "03.15.26" },
                { l: "IMPROVEMENT", v: "−2:38", s: "5.4% FASTER" },
                { l: "AVG PACE", v: "9:19/MI", s: "NEW BEST" },
              ].map((x) => (
                <div key={x.l}>
                  <div className="label-meta opacity-70">{x.l}</div>
                  <div className="font-display text-xl md:text-2xl mt-1">{x.v}</div>
                  <div className="label-meta mt-1 opacity-50">{x.s}</div>
                </div>
              ))}
            </div>

            {/* Footer with diagonal slash */}
            <div className="relative z-10 flex items-end justify-between">
              <div>
                <DiagonalSlash
                  className="-mb-3 -ml-2 relative"
                  thickness={2}
                  length="60px"
                  rotate={-45}
                />
                <div className="font-display text-base md:text-lg mt-2">
                  DO HARD THINGS <span className="underline-sky">TOGETHER.</span>
                </div>
              </div>
              <div className="text-right">
                <div className="label-meta">04.19.26</div>
                <div className="label-meta">RUN 28</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════ MEMBERSHIP CARD ═══════════════════════ */}
      <section
        id="card"
        className="bg-ink text-bone py-20 md:py-28 relative overflow-hidden border-t border-bone/10"
      >
        <div className="absolute inset-0 dot-grid pointer-events-none" />
        <DiagonalSlash className="top-[15%] -right-[20%]" thickness={2} length="80%" />

        <div className="px-6 md:px-10 relative z-10">
          <Label>Membership · free forever</Label>
          <div className="rule-thin bg-bone mt-2 mb-6 max-w-xs" />
          <h2 className="font-display text-5xl md:text-7xl mb-12 md:mb-16 max-w-3xl">
            CARRY THE <span className="underline-sky">CARD.</span>
          </h2>

          {/* Card mockup — credit card aspect */}
          <div
            id="rsvp"
            className="relative max-w-md bg-bone text-ink aspect-[1.586/1] flex flex-col shadow-[10px_10px_0_0_var(--sky)]"
          >
            {/* Magstripe */}
            <div className="h-7 bg-ink mt-5" />

            {/* Body */}
            <div className="flex-1 px-6 py-5 flex flex-col justify-between">
              {/* Username field */}
              <div className="border border-ink px-3 py-2">
                <span className="font-mono italic text-sm md:text-base">maya.okonkwo</span>
              </div>

              {/* Tagline */}
              <div>
                <div className="font-display text-xl md:text-2xl leading-[0.95]">
                  DO HARD THINGS
                  <br />
                  <span className="underline-sky">TOGETHER.</span>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-end justify-between">
                <div className="label-meta opacity-70" style={{ fontSize: "9px" }}>
                  IF FOUND, RETURN TO GRYT · EAST RIVER PARK · NYC
                </div>
                <div className="font-display text-2xl">G</div>
              </div>
            </div>
          </div>

          <div className="mt-12 flex flex-wrap gap-3">
            <a
              href="#"
              className="inline-flex items-center justify-center bg-sky-brand text-ink px-6 py-3.5 label-meta hover:bg-bone transition-colors"
            >
              CLAIM YOUR CARD →
            </a>
            <a
              href="#"
              className="inline-flex items-center justify-center border border-bone/60 text-bone px-6 py-3.5 label-meta hover:bg-bone hover:text-ink transition-colors"
            >
              ABOUT MEMBERSHIP
            </a>
          </div>
        </div>
      </section>

      {/* ═══════════════════════ FOOTER ═══════════════════════ */}
      <footer className="bg-ink text-bone pt-20 pb-10 relative overflow-hidden border-t border-bone/10">
        <div className="absolute inset-0 dot-grid pointer-events-none" />
        <DiagonalSlash className="bottom-[40%] -left-[20%] opacity-50" thickness={1} length="160%" />

        <div className="relative z-10 px-6 md:px-10">
          <h3 className="wordmark text-[32vw] md:text-[24vw] leading-[0.78] -ml-[1vw]">
            gryt
          </h3>

          <div className="mt-12 md:mt-16 grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-6">
            <div>
              <Label>Tagline</Label>
              <div className="rule-thin bg-bone mt-2 mb-4" />
              <p className="font-display text-2xl md:text-3xl leading-[0.95]">
                DO HARD THINGS
                <br />
                <span className="underline-sky">TOGETHER.</span>
              </p>
            </div>

            <div>
              <Label>Find us</Label>
              <div className="rule-thin bg-bone mt-2 mb-4" />
              <ul className="space-y-2 text-base">
                <li><a href="#" className="hover:text-sky-brand transition-colors">instagram / @gryt.run</a></li>
                <li><a href="#" className="hover:text-sky-brand transition-colors">strava / gryt nyc</a></li>
                <li><a href="#" className="hover:text-sky-brand transition-colors">email / hi@gryt.run</a></li>
              </ul>
            </div>

            <div>
              <Label>This week</Label>
              <div className="rule-thin bg-bone mt-2 mb-4" />
              <a
                href="#"
                className="font-display text-3xl md:text-4xl hover:text-sky-brand transition-colors"
              >
                gryt.run/sat →
              </a>
              <p className="text-bone/60 mt-3 text-sm leading-snug">
                drop your email. one note a week. nothing else.
              </p>
            </div>
          </div>

          <div className="mt-16 pt-6 border-t border-bone/15 flex flex-col md:flex-row md:items-center md:justify-between gap-4 label-meta text-bone/60">
            <div>© GRYT · NYC · {new Date().getFullYear()}</div>
            <div>BUILT ON THE EAST RIVER</div>
          </div>
        </div>
      </footer>
    </main>
  );
}
