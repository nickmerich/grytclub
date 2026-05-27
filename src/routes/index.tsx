import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState, type ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { RouteMap } from "@/components/RouteMap";
import { ElevationChart } from "@/components/ElevationChart";
import { HowToShowUpCarousel } from "@/components/HowToShowUpCarousel";

/** Restrained, athletic reveal — short fade + small rise, single pass on enter. */
function Reveal({
  children,
  delay = 0,
  className = "",
  as = "div",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  as?: "div" | "section" | "header" | "li" | "h2" | "h3";
}) {
  const reduce = useReducedMotion();
  const MotionTag = motion[as] as typeof motion.div;
  return (
    <MotionTag
      initial={reduce ? false : { opacity: 0, y: 14 }}
      whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10% 0px -10% 0px" }}
      transition={{ duration: 0.55, ease: [0.2, 0.7, 0.2, 1], delay }}
      className={className}
    >
      {children}
    </MotionTag>
  );
}

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "GRYT — Pittsburgh Run Club for Parents & Adults 30+" },
      {
        name: "description",
        content:
          "GRYT is a Pittsburgh, PA run club for parents and adults 30+. Saturdays at 7:00 AM on the Montour Trail in Canonsburg. All paces welcome. Coffee after.",
      },
      { property: "og:title", content: "GRYT — Pittsburgh Run Club" },
      {
        property: "og:description",
        content:
          "Pittsburgh's run club for parents and adults 30+ who want to do hard things together. Saturdays · 7 AM · Montour Trail.",
      },
      { property: "og:url", content: "https://gryt.club/" },
    ],
    links: [{ rel: "canonical", href: "https://gryt.club/" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "SportsClub",
          name: "GRYT",
          alternateName: "GRYT Run Club",
          description:
            "Pittsburgh, PA run club for parents and adults 30+ looking for community. Just show up and grind.",
          url: "https://gryt.club/",
          sport: "Running",
          slogan: "DO HARD THINGS TOGETHER",
          foundingDate: "2026",
          founders: [
            { "@type": "Person", name: "Laura Merich" },
            { "@type": "Person", name: "Nick Merich" },
          ],
          areaServed: { "@type": "Place", name: "Pittsburgh, Pennsylvania" },
          location: {
            "@type": "Place",
            name: "Montour Trail — Canonsburg, PA",
            address: {
              "@type": "PostalAddress",
              addressLocality: "Canonsburg",
              addressRegion: "PA",
              postalCode: "15317",
              addressCountry: "US",
            },
          },
          event: {
            "@type": "SportsEvent",
            name: "GRYT Saturday Run",
            description: "Weekly group run on the Montour Trail. All paces welcome. Coffee after.",
            eventSchedule: {
              "@type": "Schedule",
              repeatFrequency: "P1W",
              byDay: "https://schema.org/Saturday",
              startTime: "07:00",
            },
            location: {
              "@type": "Place",
              name: "Montour Trail — Canonsburg, PA",
              address: {
                "@type": "PostalAddress",
                addressLocality: "Canonsburg",
                addressRegion: "PA",
                postalCode: "15317",
                addressCountry: "US",
              },
            },
            organizer: { "@type": "Organization", name: "GRYT" },
          },
          sameAs: ["https://www.strava.com/clubs/1708552"],
        }),
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
  runners: 11,
  firstTimers: 2,
  miles: 210,
  temp: "41°F",
  prevWeek: "WEEK 3",
  start: "MONTOUR TRAIL · CANONSBURG",
  after: "COFFEE LOCAL",
  roster: [
    { name: "LAURA", firstTimer: false }, { name: "NICK", firstTimer: false },
    { name: "MAIZE", firstTimer: false }, { name: "JON", firstTimer: false },
    { name: "MOE", firstTimer: true }, { name: "DEV", firstTimer: false },
    { name: "ROSA", firstTimer: false }, { name: "SAM", firstTimer: true },
    { name: "KOFI", firstTimer: false }, { name: "LENA", firstTimer: false },
    { name: "JESS", firstTimer: false },
  ] as Roster,
};

const SHARE_BASE = "gryt.club/sat";

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
    `${r.runners}`,
    ``,
    `📍 ${r.start} · ${r.date} · ${r.temp}`,
    `🏃 ${r.runners} runners · ${r.miles} total miles · ${r.prevWeek}`,
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
          <span className="sr-only">Last Saturday recap — </span>
          {RECAP.runners}
          <span className="sr-only"> runners showed up</span>
        </h2>

        {/* Stat row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-ink/15 mt-14 md:mt-20">
          {[
            { label: "Runners", value: String(RECAP.runners), sub: String(RECAP.prevWeek) },
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

/* ─── Strava club embed ─── */

const STRAVA_CLUB_ID = "1708552";
const STRAVA_CLUB_URL = `https://www.strava.com/clubs/${STRAVA_CLUB_ID}`;
// Token from strava.com/clubs/1708552/edit → "Embed" / "Widget".
const STRAVA_EMBED_TOKEN = "b76ca42ddb400c392ceee3ee06c641b84d840862";

type StravaModal = null | "join" | "activity";

function StravaClubSection() {
  const [modal, setModal] = useState<StravaModal>(null);
  const embedSrc = STRAVA_EMBED_TOKEN
    ? `https://www.strava.com/clubs/${STRAVA_CLUB_ID}/latest-rides/${STRAVA_EMBED_TOKEN}`
    : null;

  return (
    <section
      id="strava"
      className="bg-ink text-bone py-20 md:py-28 relative overflow-hidden border-t border-bone/10"
    >
      <div className="absolute inset-0 dot-grid pointer-events-none" />
      <DiagonalSlash className="top-[20%] -right-[20%]" thickness={2} length="80%" />
      <DiagonalSlash className="bottom-[15%] -left-[20%] opacity-50" thickness={1} length="80%" />

      <div className="relative z-10 px-6 md:px-10">
        <Label className="text-bone">Live Club Activity</Label>
        <div className="rule-thin bg-bone mt-2 mb-6 max-w-xs" />
        <div className="flex flex-wrap items-end justify-between gap-6 mb-10 md:mb-14">
          <div className="max-w-3xl">
            <h2 className="font-display text-5xl md:text-7xl">
              REAL PEOPLE. <br />REAL <span className="underline-sky">MILES.</span> EVERY WEEK.
            </h2>
            <p className="mt-5 text-bone/75 text-base md:text-lg max-w-xl leading-snug">
              Pulled live from the GRYT Strava club. No filters, no stock photos —
              just whatever the crew logged this week on the Montour Trail and beyond.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <a
              href={STRAVA_CLUB_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center bg-sky-brand text-ink px-6 py-3.5 label-meta hover:bg-bone transition-colors"
            >
              JOIN THE STRAVA CLUB →
            </a>
            <button
              type="button"
              onClick={() => setModal("activity")}
              className="inline-flex items-center justify-center border border-bone/60 text-bone px-6 py-3.5 label-meta hover:bg-bone hover:text-ink transition-colors"
            >
              EXPAND FEED
            </button>
          </div>
        </div>

        {/* Two-column: editorial proof on the left, live widget on the right */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-px bg-bone/15 border border-bone/20">
          <div className="lg:col-span-3 bg-ink p-6 md:p-10 flex flex-col justify-between gap-8">
            <div className="grid grid-cols-3 gap-px bg-bone/15">
              <div className="bg-ink p-4 md:p-6">
                <Label className="text-bone">Club</Label>
                <div className="rule-thin bg-bone mt-2 mb-3" />
                <div className="font-display text-2xl md:text-3xl leading-none">GRYT</div>
                <div className="label-meta mt-2 text-bone/60" style={{ fontSize: "10px" }}>ID · {STRAVA_CLUB_ID}</div>
              </div>
              <div className="bg-ink p-4 md:p-6">
                <Label className="text-bone">Members</Label>
                <div className="rule-thin bg-bone mt-2 mb-3" />
                <div className="font-display text-2xl md:text-3xl leading-none">{RECAP.runners}+</div>
                <div className="label-meta mt-2 text-bone/60" style={{ fontSize: "10px" }}>AND COUNTING</div>
              </div>
              <div className="bg-ink p-4 md:p-6">
                <Label className="text-bone">Cadence</Label>
                <div className="rule-thin bg-bone mt-2 mb-3" />
                <div className="font-display text-2xl md:text-3xl leading-none">SAT · 7</div>
                <div className="label-meta mt-2 text-bone/60" style={{ fontSize: "10px" }}>WEEKLY · ALL PACES</div>
              </div>
            </div>

            <div>
              <p className="font-display text-2xl md:text-3xl leading-tight max-w-xl">
                this is what showing up <span className="underline-sky">looks like.</span>
              </p>
              <p className="mt-4 text-bone/70 text-sm md:text-base leading-snug max-w-lg">
                Every ride and run on the right is from someone in the club this week.
                Saturday at 7am, Montour Trail — come add yours.
              </p>
              <a
                href={STRAVA_CLUB_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 inline-flex items-center justify-center bg-bone text-ink px-6 py-3.5 label-meta hover:bg-sky-brand transition-colors"
              >
                OPEN GRYT ON STRAVA →
              </a>
            </div>
          </div>

          <div className="lg:col-span-2 bg-bone text-ink p-6 md:p-8 flex flex-col items-center">
            <div className="w-full flex items-center justify-between mb-4">
              <Label>Latest Rides</Label>
              <span className="label-meta text-ink/55" style={{ fontSize: "10px" }}>LIVE · STRAVA</span>
            </div>
            <div className="rule-thin bg-ink w-full mb-5" />
            <div className="w-full flex justify-center">
              <div className="w-full max-w-[320px] border border-ink/15 bg-pure shadow-[6px_6px_0_0_var(--ink)]">
                <iframe
                  title="GRYT Strava club — latest rides"
                  src={embedSrc ?? `${STRAVA_CLUB_URL}/latest-rides`}
                  loading="lazy"
                  width={300}
                  height={454}
                  scrolling="no"
                  allowTransparency
                  className="block w-full"
                  style={{ height: 454, border: 0 }}
                />
              </div>
            </div>
            <p className="label-meta mt-5 text-ink/55 text-center" style={{ fontSize: "10px" }}>
              CLUB ID · {STRAVA_CLUB_ID} · RECENT RIDES & ATHLETES
            </p>
          </div>
        </div>

        <p className="label-meta mt-5 text-bone/55">
          STRAVA CLUB · {STRAVA_CLUB_ID} · ALL ATHLETES, ALL PACES
        </p>
      </div>


      <StravaLightbox modal={modal} onClose={() => setModal(null)} embedSrc={embedSrc} />
    </section>
  );
}

function StravaLightbox({
  modal,
  onClose,
  embedSrc,
}: {
  modal: StravaModal;
  onClose: () => void;
  embedSrc: string | null;
}) {
  const open = modal !== null;
  const isActivity = modal === "activity";
  const title = isActivity ? "GRYT — Recent Activity" : "Join GRYT on Strava";
  const description = isActivity
    ? "Latest rides and runs from the GRYT club, live from Strava."
    : "Strava blocks embedding the join page directly. Use the button below to open the club on Strava.";

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-4xl w-[95vw] p-0 bg-ink text-bone border-bone/20 overflow-hidden">
        <div className="px-6 pt-6 pb-4 border-b border-bone/15">
          <Label className="text-bone">On Strava</Label>
          <div className="rule-thin bg-bone mt-2 mb-3 max-w-[80px]" />
          <DialogTitle className="font-display text-2xl md:text-3xl leading-none">
            {title}
          </DialogTitle>
          <DialogDescription className="text-bone/60 mt-2 text-sm">
            {description}
          </DialogDescription>
        </div>

        <div className="bg-bone text-ink">
          {isActivity && embedSrc ? (
            <iframe
              title="GRYT Strava club latest activity"
              src={embedSrc}
              loading="lazy"
              className="w-full"
              style={{ height: 560, border: 0 }}
              allowTransparency
            />
          ) : (
            <div className="p-8 md:p-10 flex flex-col items-start gap-5">
              <p className="font-display text-2xl md:text-3xl leading-tight max-w-xl">
                {isActivity ? (
                  <>live feed lives on <span className="underline-sky">strava</span>.</>
                ) : (
                  <>one tap. <span className="underline-sky">you're in.</span></>
                )}
              </p>
              <p className="text-sm md:text-base text-ink/70 max-w-xl leading-snug">
                {isActivity
                  ? "the live widget needs an embed token. in the meantime, jump straight to the club feed on strava."
                  : "request to join the GRYT club on strava — saturday 7am, all paces, every week."}
              </p>
              <a
                href={isActivity ? `${STRAVA_CLUB_URL}/recent_activity` : STRAVA_CLUB_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center bg-ink text-bone px-6 py-3.5 label-meta hover:bg-sky-brand hover:text-ink transition-colors"
              >
                {isActivity ? "OPEN RECENT ACTIVITY →" : "OPEN GRYT ON STRAVA →"}
              </a>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

const RSVP_URL =
  "https://www.strava.com/clubs/1708552/group_events/3480014931408029926/occurrences/FQIWzKOM-ozJv8tgHBTUHxQKFAQUDhQAFAAAHBaAjsOFvWcAAA==";
const DIRECTIONS_URL =
  "https://www.google.com/maps/dir/?api=1&destination=Montour+Trail+Canonsburg+PA+15317";

/* ─── Persistent "next move" rail ─── */
function NextMoveRail() {
  const items = [
    { label: "When", value: "SAT · 7:00 AM", sub: "WEEKLY" },
    { label: "Where", value: "MONTOUR TRAIL", sub: "CANONSBURG, PA" },
    { label: "Pace", value: "ANY", sub: "WALK · JOG · RUN" },
    { label: "First-timer?", value: "JUST SHOW UP", sub: "WE'LL FIND YOU" },
  ];
  return (
    <section
      id="next-move"
      aria-label="This Saturday — the next move"
      className="relative bg-sky-brand text-ink border-t border-ink/15"
    >
      <div className="px-6 md:px-10 py-6 md:py-7 flex flex-wrap items-center justify-between gap-x-10 gap-y-5">
        <div className="flex items-center gap-4 min-w-0">
          <span
            aria-hidden
            className="inline-block w-2.5 h-2.5 bg-ink rounded-full animate-pulse"
          />
          <div>
            <div className="label-meta opacity-70" style={{ fontSize: "10px" }}>NEXT MOVE</div>
            <div className="font-display text-xl md:text-2xl leading-none mt-1">
              THIS SATURDAY · MONTOUR TRAIL · 7:00 AM
            </div>
          </div>
        </div>

        <div className="hidden lg:flex items-stretch gap-px bg-ink/20">
          {items.map((it) => (
            <div key={it.label} className="bg-sky-brand px-4 py-1">
              <div className="label-meta opacity-65" style={{ fontSize: "10px" }}>{it.label}</div>
              <div className="font-display text-base leading-tight mt-0.5">{it.value}</div>
              <div className="label-meta opacity-55" style={{ fontSize: "9px" }}>{it.sub}</div>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <a
            href={RSVP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center bg-ink text-bone px-5 py-3 label-meta hover:bg-bone hover:text-ink transition-colors"
          >
            RSVP →
          </a>
          <a
            href={DIRECTIONS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center border border-ink text-ink px-5 py-3 label-meta hover:bg-ink hover:text-bone transition-colors"
          >
            DIRECTIONS
          </a>
        </div>
      </div>

      {/* Compact summary chips for tablet/mobile */}
      <div className="lg:hidden border-t border-ink/15 px-6 md:px-10 py-3 flex flex-wrap items-center gap-x-6 gap-y-1 label-meta">
        {items.map((it) => (
          <span key={it.label}>
            <span className="opacity-60">{it.label.toUpperCase()} · </span>
            <span>{it.value}</span>
          </span>
        ))}
      </div>
    </section>
  );
}

/* ─── Your first Saturday — 4-step orientation flow ─── */
function FirstSaturday() {
  const steps = [
    {
      n: "01",
      label: "PARK",
      title: "Park at the Montour Trail trailhead.",
      body: "Cecil Park / Hendersonville access in Canonsburg, PA 15317. Free lot, plenty of room before 7. Bathrooms on-site.",
    },
    {
      n: "02",
      label: "FIND THE FLAG",
      title: "Look for the sky-blue GRYT flag.",
      body: "We post up near the trail entrance by 6:50. Sky-blue flag, a few coolers, and people who look as cold as you feel.",
    },
    {
      n: "03",
      label: "PICK A PACE GROUP",
      title: "Find your pace — or take the walk-run group.",
      body: "We split into 8:30, 9:30, 10:30, and walk-run. No one runs solo. Tell us it's your first one and we'll walk you over.",
    },
    {
      n: "04",
      label: "COFFEE AFTER",
      title: "Stay 20 minutes for coffee.",
      body: "Two minutes from the trailhead. This is where the club actually gets built — the run is just the reason we're there.",
    },
  ];
  return (
    <section
      id="first-saturday"
      className="bg-bone text-ink py-20 md:py-28 border-t border-ink/10 relative overflow-hidden"
    >
      <div className="px-6 md:px-10">
        <Reveal>
          <Label>Your first Saturday</Label>
          <div className="rule-thin bg-ink mt-2 mb-6 max-w-xs" />
          <div className="flex flex-wrap items-end justify-between gap-6">
            <h2 className="font-display text-5xl md:text-7xl max-w-4xl">
              Never been? <span className="underline-sky">Here's exactly</span> what happens.
            </h2>
            <p className="max-w-md text-ink/65 leading-snug">
              First-timers always show up nervous. So here's the whole thing,
              start to coffee, no surprises.
            </p>
          </div>
        </Reveal>

        <div className="mt-14 md:mt-20 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px bg-ink/15">
          {steps.map((s, i) => (
            <Reveal key={s.n} delay={i * 0.07}>
              <div className="bg-bone p-7 md:p-10 h-full flex flex-col">
                <div className="flex items-baseline justify-between">
                  <div className="font-display text-5xl md:text-6xl leading-none">{s.n}</div>
                  <div className="label-meta text-sky-brand">{s.label}</div>
                </div>
                <div className="rule-thin bg-ink mt-5 mb-5" />
                <h3 className="font-display text-xl md:text-2xl leading-[1.1]">{s.title}</h3>
                <p className="mt-4 text-ink/70 leading-snug text-sm md:text-base flex-1">{s.body}</p>
              </div>
            </Reveal>
          ))}
        </div>

        <div className="mt-12 flex flex-wrap items-center gap-3">
          <a
            href={RSVP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center bg-ink text-bone px-6 py-3.5 label-meta hover:bg-sky-brand hover:text-ink transition-colors"
          >
            I'M IN FOR SATURDAY →
          </a>
          <a
            href="mailto:hi@gryt.club?subject=First%20Saturday"
            className="inline-flex items-center justify-center border border-ink text-ink px-6 py-3.5 label-meta hover:bg-ink hover:text-bone transition-colors"
          >
            ASK A QUESTION FIRST
          </a>
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
        <DiagonalSlash className="top-[20%] -left-[20%]" thickness={2} length="160%" />
        <DiagonalSlash className="top-[55%] -left-[20%] opacity-60" thickness={1} length="160%" />
        <DiagonalSlash className="top-[80%] -left-[20%] opacity-40" thickness={1} length="160%" />

        {/* Top nav */}
        <header className="relative z-10 flex items-center justify-between px-6 md:px-10 pt-6 md:pt-8">
          <GrytLogo className="text-bone" />
          <nav className="hidden md:flex items-center gap-8 label-meta">
            <a href="#next-move" className="hover:text-sky-brand transition-colors">SATURDAY</a>
            <a href="#first-saturday" className="hover:text-sky-brand transition-colors">FIRST RUN</a>
            <a href="#members" className="hover:text-sky-brand transition-colors">MEMBERS</a>
            <a href="#journal" className="hover:text-sky-brand transition-colors">JOURNAL</a>
            <a href="#about" className="hover:text-sky-brand transition-colors">ABOUT</a>
          </nav>
          <a
            href={RSVP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden md:inline-flex items-center justify-center bg-sky-brand text-ink px-4 py-2.5 label-meta hover:bg-bone transition-colors"
          >
            JOIN SATURDAY →
          </a>
          <a
            href={RSVP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="md:hidden label-meta text-sky-brand"
          >
            JOIN →
          </a>
        </header>

        {/* Headline block */}
        <div className="relative z-10 px-6 md:px-10 pt-12 md:pt-20 pb-12 md:pb-16 flex-1 flex flex-col justify-center max-w-6xl">
          {/* Belief eyebrow — sits above the H1 as a statement, not a label */}
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.2, 0.7, 0.2, 1] }}
            className="font-display text-xl md:text-2xl text-sky-brand mb-6 md:mb-8 max-w-3xl leading-[1.05]"
          >
            You don't need more motivation.
            <br className="hidden sm:block" />
            <span className="text-bone"> You need a better Saturday.</span>
          </motion.p>

          <div className="label-meta text-bone/55 mb-5 md:mb-6">
            A RUN CLUB · PITTSBURGH, PA · EST. 2026
          </div>
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, ease: [0.2, 0.7, 0.2, 1], delay: 0.1 }}
            className="font-display text-[11vw] md:text-[7.5vw] lg:text-[6.2vw] leading-[0.9] max-w-5xl"
          >
            <span className="sr-only">GRYT Run Club — </span>
            Pittsburgh's run club for{" "}
            <span className="underline-sky">parents and adults 30+</span>{" "}
            who want to do hard things together.
          </motion.h1>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.35 }}
            className="mt-10 md:mt-12 max-w-2xl"
          >
            <p className="text-base md:text-lg text-bone/85 leading-snug">
              Show up Saturday. All paces welcome. You don't need to be elite — just willing.
              We run the Montour Trail, talk through mile two, and stay for coffee.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <a
                href={RSVP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center bg-sky-brand text-ink px-6 py-3.5 label-meta hover:bg-bone transition-colors"
              >
                JOIN SATURDAY →
              </a>
              <a
                href="#next-move"
                className="inline-flex items-center justify-center border border-bone/60 text-bone px-6 py-3.5 label-meta hover:bg-bone hover:text-ink transition-colors"
              >
                SEE THIS WEEK'S RUN
              </a>
            </div>
          </motion.div>
        </div>

        {/* Proof strip */}
        <div className="relative z-10 border-t border-bone/15 px-6 md:px-10 py-5">
          <div className="flex flex-wrap items-center gap-x-8 gap-y-2 label-meta text-bone/80">
            <span className="text-sky-brand">● LIVE</span>
            <span>25 MEMBERS</span>
            <span className="opacity-30">·</span>
            <span>WEEKLY SATURDAY RUNS</span>
            <span className="opacity-30">·</span>
            <span>PITTSBURGH, PA</span>
            <span className="opacity-30">·</span>
            <span>ALL PACES WELCOME</span>
            <span className="opacity-30">·</span>
            <span>PARENTS &amp; 30+</span>
          </div>
        </div>
      </section>

      {/* ═══════════════════════ NEXT MOVE RAIL ═══════════════════════ */}
      <NextMoveRail />

      {/* ═══════════════════════ STICKY MOBILE CTA ═══════════════════════ */}
      <div className="fixed bottom-0 inset-x-0 z-40 md:hidden bg-ink text-bone border-t border-bone/20 shadow-[0_-6px_20px_rgba(0,0,0,0.35)]">
        <div className="flex items-stretch">
          <div className="flex-1 px-4 py-3 flex flex-col justify-center">
            <div className="label-meta text-sky-brand" style={{ fontSize: "10px" }}>NEXT MOVE · SAT 7:00 AM</div>
            <div className="font-display text-sm leading-tight mt-0.5">Montour Trail · Canonsburg</div>
          </div>
          <a
            href={RSVP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-sky-brand text-ink px-5 flex items-center label-meta"
          >
            RSVP →
          </a>
        </div>
      </div>


      {/* ═══════════════════════ STRAVA CLUB (living evidence) ═══════════════════════ */}
      <StravaClubSection />

      {/* ═══════════════════════ THIS SATURDAY ═══════════════════════ */}

      <section id="run-club" className="bg-ink text-bone border-t border-bone/10">
        <div className="grid grid-cols-1 md:grid-cols-2">
          <div className="relative p-8 md:p-12 lg:p-16 border-b md:border-b-0 md:border-r border-bone/15 overflow-hidden">
            <DiagonalSlash className="top-8 -right-20" thickness={3} length="80%" />
            <Label>This Saturday</Label>
            <div className="rule-thin bg-bone mt-2 mb-8" />
            <div className="font-display text-7xl md:text-8xl lg:text-[8.5rem] leading-[0.85]">
              SATURDAY
            </div>
            <div className="font-display text-5xl md:text-6xl mt-4 text-sky-brand">
              7:00 AM
            </div>
            <p className="mt-8 text-bone/80 max-w-md leading-snug">
              Montour Trail · Canonsburg, PA 15317.
              Run + social, ~4 miles, mixed terrain, all paces.
            </p>
            <p className="mt-4 text-bone/65 text-sm max-w-md leading-snug">
              New here? Come a few minutes early and we'll help you find your pace group.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href={RSVP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center bg-sky-brand text-ink px-5 py-3 label-meta hover:bg-bone transition-colors"
              >
                RSVP ON STRAVA →
              </a>
              <a
                href={DIRECTIONS_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center border border-bone/60 text-bone px-5 py-3 label-meta hover:bg-bone hover:text-ink transition-colors"
              >
                GET DIRECTIONS
              </a>
            </div>
          </div>

          <div className="grid grid-cols-2 text-bone">
            {[
              { label: "Distance", value: "4.0 MI", sub: "OUT & BACK" },
              { label: "Pace", value: "ANY", sub: "ALL WELCOME" },
              { label: "Format", value: "RUN + SOCIAL", sub: "COFFEE AFTER" },
              { label: "Terrain", value: "MIXED", sub: "TRAIL + PATH" },
            ].map((s, i) => (
              <div
                key={s.label}
                className={`p-6 md:p-10 ${i % 2 === 0 ? "border-r border-bone/15" : ""} ${
                  i < 2 ? "border-b border-bone/15" : ""
                }`}
              >
                <Stat label={s.label} value={s.value} sub={s.sub} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════ ROUTE MAP ═══════════════════════ */}
      <section id="route" className="bg-bone text-ink border-t border-ink/10">
        <div className="px-6 md:px-10 pt-20 md:pt-24 pb-10 md:pb-14">
          <Label>The route</Label>
          <div className="rule-thin bg-ink mt-2 mb-6 max-w-xs" />
          <div className="flex flex-wrap items-end justify-between gap-6">
            <h2 className="font-display text-5xl md:text-7xl max-w-3xl">
              FOUR MILES.
              <br />
              MONTOUR TRAIL.
              <br />
              <span className="underline-sky">CANONSBURG, PA</span>
            </h2>
            <div className="flex flex-wrap gap-3">
              <a
                href={RSVP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center bg-ink text-bone px-5 py-3 label-meta hover:bg-sky-brand hover:text-ink transition-colors"
              >
                RSVP →
              </a>
              <a
                href={DIRECTIONS_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center border border-ink text-ink px-5 py-3 label-meta hover:bg-ink hover:text-bone transition-colors"
              >
                OPEN IN MAPS
              </a>
            </div>
          </div>
        </div>

        <div className="px-6 md:px-10 pb-20 md:pb-24">
          <div className="relative border border-ink/15 overflow-hidden">
            <RouteMap />
            <div className="absolute top-4 left-4 z-[400] bg-ink text-bone label-meta px-3 py-2 pointer-events-none">
              ROUTE · MONTOUR TRAIL
            </div>
            <div className="absolute bottom-4 left-4 z-[400] bg-bone border border-ink/20 px-3 py-2 flex items-center gap-4 label-meta text-ink pointer-events-none">
              <span className="flex items-center gap-2">
                <span className="inline-block w-3 h-3 rounded-full bg-sky-brand border-2 border-ink" />
                START
              </span>
              <span className="flex items-center gap-2">
                <span className="inline-block w-3 h-3 bg-ink" />
                FINISH
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-ink/15 mt-px">
            {[
              { label: "Distance", value: "4.0 MI", sub: "OUT & BACK" },
              { label: "Elev gain", value: "~150 FT", sub: "GENTLE" },
              { label: "Surface", value: "CRUSHED", sub: "RAIL TRAIL" },
              { label: "Pace groups", value: "ALL", sub: "NO ONE LEFT" },
            ].map((s) => (
              <div key={s.label} className="bg-bone p-6 md:p-8">
                <Stat label={s.label} value={s.value} sub={s.sub} />
              </div>
            ))}
          </div>

          <div className="mt-8 md:mt-10">
            <ElevationChart />
          </div>
        </div>
      </section>

      {/* ═══════════════════════ WHY PEOPLE JOIN ═══════════════════════ */}
      <section id="why" className="bg-ink text-bone py-20 md:py-28 relative overflow-hidden border-t border-bone/10">
        <div className="absolute inset-0 dot-grid pointer-events-none" />
        <div className="relative z-10 px-6 md:px-10">
          <Label>Why people join</Label>
          <div className="rule-thin bg-bone mt-2 mb-6 max-w-xs" />
          <h2 className="font-display text-5xl md:text-7xl max-w-4xl">
            Why people keep <span className="underline-sky">showing up.</span>
          </h2>

          <div className="mt-14 md:mt-20 grid grid-cols-1 md:grid-cols-2 gap-px bg-bone/15">
            {[
              {
                tag: "01 · PARENTS",
                title: "Built-in accountability before the kids wake up.",
                body: "Saturday at 7 AM is early enough to be home for breakfast. The standing time is the trick — it's already on the calendar, the group is already there, and showing up is easier than not.",
              },
              {
                tag: "02 · ADULTS 30+",
                title: "Real community, not a workout class.",
                body: "Most of us are over 30, carrying a full life. We run, we talk, we get coffee. Friendships happen at mile two and stick after the run is over.",
              },
              {
                tag: "03 · RETURNING RUNNERS",
                title: "Come back at whatever pace you have today.",
                body: "Haven't run in a year? Two? Five? Walk-run it. We hang at every regroup. There is no back of the pack here — we are the pack.",
              },
              {
                tag: "04 · CONSISTENCY",
                title: "One small commitment that compounds.",
                body: "You don't need a plan. You need a Saturday. Stack twelve of them and you'll notice. Stack fifty and people start asking what changed.",
              },
            ].map((c) => (
              <div key={c.tag} className="bg-ink p-7 md:p-10">
                <div className="label-meta text-sky-brand">{c.tag}</div>
                <h3 className="font-display text-2xl md:text-3xl mt-3 leading-[1.05]">
                  {c.title}
                </h3>
                <p className="mt-4 text-bone/75 leading-snug">{c.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════ SOCIAL PROOF ═══════════════════════ */}
      <section className="bg-bone text-ink py-20 md:py-28 border-t border-ink/10">
        <div className="px-6 md:px-10">
          <Label>The club, by the numbers</Label>
          <div className="rule-thin bg-ink mt-2 mb-6 max-w-xs" />
          <h2 className="font-display text-5xl md:text-7xl max-w-4xl">
            Small, steady, <span className="underline-sky">growing.</span>
          </h2>
          <p className="mt-6 max-w-2xl text-ink/70 leading-snug">
            We're not chasing a number. We're chasing a habit. Here's what the last few Saturdays
            actually looked like on the trail and on Strava.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-px bg-ink/15 mt-12">
            {[
              { label: "Members", value: "25", sub: "AND COUNTING" },
              { label: "Cadence", value: "WEEKLY", sub: "EVERY SATURDAY" },
              { label: "Last Saturday", value: "11", sub: "RUNNERS" },
              { label: "First-timers", value: "02", sub: "WELCOMED" },
              { label: "Club miles", value: "210", sub: "RECENT RECAP" },
            ].map((s) => (
              <div key={s.label} className="bg-bone p-6 md:p-8">
                <Stat label={s.label} value={s.value} sub={s.sub} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════ HOW TO SHOW UP ═══════════════════════ */}
      <HowToShowUpCarousel />

      {/* ═══════════════════════ YOUR FIRST SATURDAY ═══════════════════════ */}
      <FirstSaturday />

      {/* ═══════════════════════ MEMBERS SPOTLIGHT ═══════════════════════ */}
      <section id="members" className="bg-bone text-ink py-20 md:py-28 border-t border-ink/10 relative overflow-hidden">
        <div className="px-6 md:px-10 relative z-10">
          <Label>Meet the club</Label>
          <div className="rule-thin bg-ink mt-2 mb-6 max-w-xs" />
          <h2 className="font-display text-5xl md:text-7xl max-w-4xl">
            Becoming who they <span className="underline-sky">said they'd be.</span>
          </h2>
          <p className="mt-6 max-w-2xl text-ink/70 leading-snug">
            GRYT was started by Laura and Nick Merich in Pittsburgh because they wanted a Saturday
            morning that was bigger than them. The club is built one runner — and one earned
            milestone — at a time.
          </p>

          <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-px bg-ink/15">
            {[
              {
                name: "LAURA MERICH",
                role: "Co-founder · Pace setter",
                milestone: "WEEK 28 · FOUNDER",
                identity: "Parent · Pittsburgh",
                quote: "I started GRYT because I needed a reason to be on the trail at 7 AM — turns out everyone else did too.",
                stat: "Runs: 28 · First Race: ✓",
              },
              {
                name: "NICK MERICH",
                role: "Co-founder · Coffee captain",
                milestone: "WEEK 28 · FOUNDER",
                identity: "Parent · Pittsburgh",
                quote: "It's not about how fast you go. It's about who's there when you finish.",
                stat: "Runs: 28 · First Race: ✓",
              },
              {
                name: "MOE",
                role: "Comeback runner · April",
                milestone: "FIRST RUN ✓ · WEEK 4",
                identity: "Returning runner · 3-year gap",
                quote: "Hadn't run in three years. Showed up, walked half, nobody cared. I'm back this Saturday.",
                stat: "Runs: 4 · Next: 5K",
              },
            ].map((m, i) => (
              <Reveal key={m.name} delay={i * 0.08}>
                <div className="bg-bone p-7 md:p-10 flex flex-col justify-between min-h-[320px] h-full">
                  <div>
                    <div className="inline-block bg-ink text-bone label-meta px-2.5 py-1.5" style={{ fontSize: "10px" }}>
                      {m.milestone}
                    </div>
                    <div className="label-meta opacity-60 mt-4">{m.role}</div>
                    <div className="font-display text-2xl md:text-3xl mt-2">{m.name}</div>
                    <div className="label-meta opacity-50 mt-2" style={{ fontSize: "10px" }}>
                      {m.identity}
                    </div>
                  </div>
                  <p className="mt-6 text-ink/80 leading-snug italic">&ldquo;{m.quote}&rdquo;</p>
                  <div className="mt-6 pt-4 border-t border-ink/15 label-meta opacity-70">
                    {m.stat}
                  </div>
                </div>
              </Reveal>
            ))}
          </div>


          {/* Membership card — supporting motif */}
          <div className="mt-20 grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-center">
            <div>
              <Label>Membership · free forever</Label>
              <div className="rule-thin bg-ink mt-2 mb-6 max-w-xs" />
              <h3 className="font-display text-4xl md:text-5xl leading-[0.95]">
                Show up three Saturdays, you're <span className="underline-sky">in.</span>
              </h3>
              <p className="mt-5 text-ink/70 leading-snug max-w-md">
                No fees, no forms. Just the trail, the people, and a card that
                says you're part of the pack.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <a
                  href={RSVP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center bg-ink text-bone px-5 py-3 label-meta hover:bg-sky-brand hover:text-ink transition-colors"
                >
                  JOIN THE CLUB →
                </a>
              </div>
            </div>

            <div className="relative max-w-md md:ml-auto bg-bone text-ink aspect-[1.586/1] flex flex-col border border-ink/15 shadow-[10px_10px_0_0_var(--sky)]">
              <div className="h-7 bg-ink mt-5" />
              <div className="flex-1 px-6 py-5 flex flex-col justify-between">
                <div className="border border-ink px-3 py-2">
                  <span className="font-mono italic text-sm md:text-base">your.name</span>
                </div>
                <div>
                  <div className="font-display text-xl md:text-2xl leading-[0.95]">
                    DO HARD THINGS
                    <br />
                    <span className="underline-sky">TOGETHER.</span>
                  </div>
                </div>
                <div className="flex items-end justify-between">
                  <div className="label-meta opacity-70" style={{ fontSize: "9px" }}>
                    IF FOUND, RETURN TO GRYT · MONTOUR TRAIL · PITTSBURGH, PA
                  </div>
                  <div className="font-display text-2xl">G</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════ RECAP STRIP ═══════════════════════ */}
      <RecapSection />


      {/* ═══════════════════════ JOURNAL ═══════════════════════ */}
      <section id="journal" className="bg-bone text-ink py-20 md:py-28 border-t border-ink/10">
        <div className="px-6 md:px-10">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <Label>Journal</Label>
              <div className="rule-thin bg-ink mt-2 mb-6 max-w-xs" />
              <h2 className="font-display text-5xl md:text-7xl max-w-3xl">
                Notes from the <span className="underline-sky">trail.</span>
              </h2>
            </div>
            <a
              href="#"
              className="inline-flex items-center justify-center border border-ink text-ink px-5 py-3 label-meta hover:bg-ink hover:text-bone transition-colors"
            >
              READ THE JOURNAL →
            </a>
          </div>

          <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-px bg-ink/15">
            {[
              {
                tag: "Saturday recap · 04.19",
                title: "Last Saturday: 11 runners, 2 first-timers, 41°F.",
                body: "A cold start, a warm trail, and the longest post-run coffee yet.",
                href: "#recap",
              },
              {
                tag: "Member story",
                title: "First run with GRYT: what to actually expect.",
                body: "Where to park, what to wear, how the pace groups work, and why you'll stay for coffee.",
                href: "#",
              },
              {
                tag: "Training · Free",
                title: "The GRYT marathon guide.",
                body: "A simple, honest training plan for working adults. No fluff, no jargon.",
                href: "https://grytmarathonguide.netlify.app/",
                external: true,
              },
            ].map((p) => (
              <a
                key={p.title}
                href={p.href}
                target={p.external ? "_blank" : undefined}
                rel={p.external ? "noopener noreferrer" : undefined}
                className="bg-bone p-7 md:p-10 group hover:bg-ink hover:text-bone transition-colors flex flex-col min-h-[260px]"
              >
                <div className="label-meta opacity-60 group-hover:text-sky-brand group-hover:opacity-100">
                  {p.tag}
                </div>
                <h3 className="font-display text-2xl md:text-3xl mt-4 leading-[1.05] flex-1">
                  {p.title}
                </h3>
                <p className="mt-4 opacity-70 leading-snug">{p.body}</p>
                <div className="mt-6 label-meta">READ →</div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════ SHOP + RESOURCES ═══════════════════════ */}
      <section id="shop" className="bg-ink text-bone border-t border-bone/10 relative overflow-hidden">
        <div className="absolute inset-0 dot-grid pointer-events-none" />
        <div className="relative z-10 px-6 md:px-10 pt-20 md:pt-24 pb-6">
          <Label>Tools for the long run</Label>
          <div className="rule-thin bg-bone mt-2 mb-6 max-w-xs" />
          <h2 className="font-display text-5xl md:text-7xl max-w-4xl">
            A little gear. A few <span className="underline-sky">guides.</span>
          </h2>
        </div>

        <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 border-t border-bone/15">
          <div className="p-8 md:p-12 lg:p-16 border-b md:border-b-0 md:border-r border-bone/15">
            <div className="label-meta text-sky-brand">SHOP</div>
            <h3 className="font-display text-3xl md:text-4xl mt-3 leading-[1.05]">
              Club tees, hats, stickers, and small-batch gear.
            </h3>
            <ul className="mt-8 space-y-3 text-bone/85">
              <li className="flex items-baseline justify-between border-b border-bone/15 pb-3">
                <span>GRYT tee · ink</span>
                <span className="label-meta">$28</span>
              </li>
              <li className="flex items-baseline justify-between border-b border-bone/15 pb-3">
                <span>Saturday cap · bone</span>
                <span className="label-meta">$24</span>
              </li>
              <li className="flex items-baseline justify-between border-b border-bone/15 pb-3">
                <span>Sticker pack · 3 ct</span>
                <span className="label-meta">$6</span>
              </li>
            </ul>
            <a
              href="#"
              className="mt-10 inline-flex items-center justify-center border border-bone/60 text-bone px-5 py-3 label-meta hover:bg-bone hover:text-ink transition-colors"
            >
              VISIT THE SHOP →
            </a>
          </div>

          <div className="p-8 md:p-12 lg:p-16">
            <div className="label-meta text-sky-brand">RESOURCES</div>
            <h3 className="font-display text-3xl md:text-4xl mt-3 leading-[1.05]">
              Free guides for showing up, training up, and racing.
            </h3>
            <ul className="mt-8 space-y-3 text-bone/85">
              <li className="flex items-baseline justify-between border-b border-bone/15 pb-3">
                <span>Marathon guide</span>
                <a
                  href="https://grytmarathonguide.netlify.app/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="label-meta text-sky-brand hover:text-bone"
                >
                  DOWNLOAD →
                </a>
              </li>
              <li className="flex items-baseline justify-between border-b border-bone/15 pb-3">
                <span>Beginner plan · 8 weeks</span>
                <span className="label-meta opacity-60">SOON</span>
              </li>
              <li className="flex items-baseline justify-between border-b border-bone/15 pb-3">
                <span>Race-day checklist</span>
                <span className="label-meta opacity-60">SOON</span>
              </li>
            </ul>
            <a
              href="https://grytmarathonguide.netlify.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-10 inline-flex items-center justify-center bg-sky-brand text-ink px-5 py-3 label-meta hover:bg-bone transition-colors"
            >
              GET THE MARATHON GUIDE →
            </a>
          </div>
        </div>
      </section>

      {/* ═══════════════════════ EMAIL CAPTURE ═══════════════════════ */}
      <section className="bg-bone text-ink py-20 md:py-28 border-t border-ink/10">
        <div className="px-6 md:px-10 grid grid-cols-1 md:grid-cols-12 gap-10 items-end">
          <div className="md:col-span-7">
            <Label>The weekly note</Label>
            <div className="rule-thin bg-ink mt-2 mb-6 max-w-xs" />
            <h2 className="font-display text-5xl md:text-6xl leading-[0.95]">
              Get the <span className="underline-sky">weekly note.</span>
            </h2>
            <p className="mt-6 max-w-xl text-ink/70 leading-snug">
              One email a week. Next Saturday's details, a quick recap of the last one,
              and a couple of useful things for the long run. Nothing else.
            </p>
          </div>

          <form
            className="md:col-span-5 flex flex-col sm:flex-row gap-3"
            onSubmit={(e) => e.preventDefault()}
          >
            <label htmlFor="email" className="sr-only">Email address</label>
            <input
              id="email"
              type="email"
              required
              placeholder="you@gryt.club"
              className="flex-1 bg-bone border border-ink px-4 py-3.5 label-meta placeholder:opacity-50 focus:outline-none focus:bg-ink focus:text-bone"
            />
            <button
              type="submit"
              className="inline-flex items-center justify-center bg-ink text-bone px-6 py-3.5 label-meta hover:bg-sky-brand hover:text-ink transition-colors"
            >
              SUBSCRIBE →
            </button>
          </form>
        </div>
      </section>

      {/* ═══════════════════════ FOOTER ═══════════════════════ */}
      <footer id="about" className="bg-ink text-bone pt-20 pb-28 md:pb-12 relative overflow-hidden border-t border-bone/10">
        <div className="absolute inset-0 dot-grid pointer-events-none" />
        <DiagonalSlash className="bottom-[40%] -left-[20%] opacity-50" thickness={1} length="160%" />

        <div className="relative z-10 px-6 md:px-10">
          <h3 className="wordmark text-[32vw] md:text-[24vw] leading-[0.78] -ml-[1vw]">
            gryt
          </h3>

          <div className="mt-12 md:mt-16 grid grid-cols-1 md:grid-cols-4 gap-10 md:gap-6">
            <div>
              <Label>About</Label>
              <div className="rule-thin bg-bone mt-2 mb-4" />
              <p className="text-bone/80 leading-snug text-sm">
                GRYT is a Pittsburgh, PA run club for parents and adults 30+.
                Founded by Laura and Nick Merich. We meet Saturdays at 7 AM on the Montour Trail in Canonsburg.
              </p>
            </div>

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
                <li><a href="#" className="hover:text-sky-brand transition-colors">instagram / @gryt.club</a></li>
                <li><a href="https://www.strava.com/clubs/1708552" target="_blank" rel="noopener noreferrer" className="hover:text-sky-brand transition-colors">strava / gryt</a></li>
                <li><a href="mailto:hi@gryt.club" className="hover:text-sky-brand transition-colors">email / hi@gryt.club</a></li>
              </ul>
            </div>

            <div>
              <Label>This Saturday</Label>
              <div className="rule-thin bg-bone mt-2 mb-4" />
              <a
                href={RSVP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="font-display text-2xl md:text-3xl hover:text-sky-brand transition-colors"
              >
                7 AM · MONTOUR TRAIL →
              </a>
              <p className="text-bone/60 mt-3 text-sm leading-snug">
                Pittsburgh / South Hills · Canonsburg, PA 15317
              </p>
            </div>
          </div>

          <div className="mt-16 pt-6 border-t border-bone/15 flex flex-col md:flex-row md:items-center md:justify-between gap-4 label-meta text-bone/60">
            <div>© GRYT · PITTSBURGH, PA · {new Date().getFullYear()}</div>
            <div>FOUNDED BY LAURA & NICK MERICH</div>
          </div>
        </div>
      </footer>

      {/* ═══════════════════════ STICKY MOBILE CTA ═══════════════════════ */}
      <div className="md:hidden fixed bottom-0 inset-x-0 z-50 bg-ink text-bone border-t border-bone/20 grid grid-cols-2">
        <a
          href={RSVP_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-sky-brand text-ink py-4 text-center label-meta"
        >
          JOIN SATURDAY →
        </a>
        <a
          href={DIRECTIONS_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="py-4 text-center label-meta hover:bg-bone hover:text-ink transition-colors"
        >
          GET DIRECTIONS
        </a>
      </div>
    </main>
  );
}
