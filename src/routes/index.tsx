import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { RouteMap } from "@/components/RouteMap";
import { CrewCarousel } from "@/components/CrewCarousel";
import { RsvpForm } from "@/components/RsvpForm";
import { CountdownPill, GoingCounter, RotatingTicker } from "@/components/StickyBits";
import { trackCta, withUtm } from "@/lib/track";
import foundersPhoto from "@/assets/founders.jpg";
import grytLogoMark from "@/assets/gryt-logo-mark.jpg";

/** Track which #section is currently in view for nav highlighting. */
const NAV_SECTIONS = ["next-run", "runs", "how", "first-saturday", "who"] as const;
type NavSectionId = (typeof NAV_SECTIONS)[number];

function useActiveSection(): NavSectionId | null {
  const initial = (() => {
    if (typeof window === "undefined") return null;
    const hash = window.location.hash.replace(/^#/, "") as NavSectionId;
    return (NAV_SECTIONS as readonly string[]).includes(hash) ? hash : null;
  })();
  const [active, setActive] = useState<NavSectionId | null>(initial);

  useEffect(() => {
    const compute = () => {
      // Anchor line ~30% down the viewport.
      const line = window.innerHeight * 0.3;
      let current: NavSectionId | null = null;
      let bestTop = -Infinity;
      for (const id of NAV_SECTIONS) {
        const el = document.getElementById(id);
        if (!el) continue;
        const top = el.getBoundingClientRect().top;
        // Choose the section whose top is closest above the line.
        if (top - line <= 0 && top > bestTop) {
          bestTop = top;
          current = id;
        }
      }
      // Bottom of page → force last nav section active.
      if (
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 4
      ) {
        current = NAV_SECTIONS[NAV_SECTIONS.length - 1];
      }
      setActive(current);
    };

    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = window.requestAnimationFrame(() => {
        raf = 0;
        compute();
      });
    };

    compute();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    // Re-run after load so images/fonts settling don't leave stale offsets.
    window.addEventListener("load", compute);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      window.removeEventListener("load", compute);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return active;
}

function NavLink({
  href,
  label,
  active,
}: {
  href: string;
  label: string;
  active: boolean;
}) {
  const id = href.replace(/^#/, "");
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const el = document.getElementById(id);
    if (!el) return;
    e.preventDefault();
    el.scrollIntoView({ behavior: "smooth", block: "start" });
    if (history.replaceState) history.replaceState(null, "", href);
  };
  return (
    <a
      href={href}
      onClick={handleClick}
      aria-current={active ? "true" : undefined}
      className={`shrink-0 snap-center transition-colors ${
        active
          ? "text-sky-brand underline underline-offset-[6px] decoration-2"
          : "hover:text-sky-brand"
      }`}
    >
      {label}
    </a>
  );
}


/** Restrained, athletic reveal - short fade + small rise, single pass on enter. */
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
      { title: "GRYT Run Club - Do Hard Things Together | McMurray, PA" },
      {
        name: "description",
        content:
          "GRYT is a run club for adults 30+ in the Pittsburgh metro. Saturdays at 7:00 AM at 212 Valley Brook Road, McMurray, PA on the Montour/Peters Trail. All paces welcome.",
      },
      { property: "og:title", content: "GRYT Run Club - Do Hard Things Together" },
      {
        property: "og:description",
        content:
          "Adults 30+ doing hard things together. Saturdays · 7 AM · Montour/Peters Trail, McMurray, PA.",
      },
      { property: "og:url", content: "https://www.gryt.club/" },
      { property: "og:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/aXy5H4jaWqdrchHlxfIBtB67rN43/social-images/social-1776911888989-Screen_Shot_2026-04-22_at_9.59.08_PM.webp" },
      { name: "twitter:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/aXy5H4jaWqdrchHlxfIBtB67rN43/social-images/social-1776911888989-Screen_Shot_2026-04-22_at_9.59.08_PM.webp" },
    ],
    links: [{ rel: "canonical", href: "https://www.gryt.club/" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "SportsClub",
          name: "GRYT",
          alternateName: "GRYT Run Club",
          description:
            "Pittsburgh-area run club for adults 30+ who do hard things together.",
          url: "https://www.gryt.club/",
          sport: "Running",
          slogan: "DO HARD THINGS TOGETHER",
          areaServed: { "@type": "Place", name: "Pittsburgh, Pennsylvania" },
          location: {
            "@type": "Place",
            name: "Montour/Peters Trail - McMurray, PA",
            address: {
              "@type": "PostalAddress",
              streetAddress: "212 Valley Brook Road",
              addressLocality: "McMurray",
              addressRegion: "PA",
              addressCountry: "US",
            },
          },
          event: {
            "@type": "SportsEvent",
            name: "GRYT Saturday Run",
            description: "Weekly group run. All paces welcome.",
            eventSchedule: {
              "@type": "Schedule",
              repeatFrequency: "P1W",
              byDay: "https://schema.org/Saturday",
              startTime: "07:00",
            },
          },
          sameAs: ["https://www.strava.com/clubs/1708552"],
        }),
      },
    ],
  }),
});

/* ─── Reusable bits ─── */

function Label({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`label-meta opacity-70 ${className}`}>{children}</div>;
}

function GrytLogo({ className = "" }: { className?: string }) {
  return (
    <span className={`wordmark text-2xl md:text-3xl ${className}`}>gryt</span>
  );
}

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

/* ─── Links ─── */
const STRAVA_URL = "https://www.strava.com/clubs/1708552";
const HEYLO_URL =
  "https://www.heylo.com/g/9446d69d-0852-4e63-b925-a934d79ebb15?inviteId=CiNFJ4Xn";
const STRAVA_EMBED_BASE =
  "https://www.strava.com/clubs/1708552/latest-rides/b76ca42ddb400c392ceee3ee06c641b84d840862";
const STRAVA_EMBED_SUMMARY = STRAVA_EMBED_BASE;
const STRAVA_EMBED_RIDES = `${STRAVA_EMBED_BASE}?show_rides=true`;

/* ─── First Saturday walkthrough ─── */
const FIRST_SATURDAY = [
  {
    step: "10 MIN BEFORE",
    title: "Pull into 212 Valley Brook Rd.",
    body: "Free parking right at the trailhead. Look for the group near the trail sign - we'll wave you over. Bathrooms are open at the trailhead.",
  },
  {
    step: "7:00 AM",
    title: "Quick hello, then we move.",
    body: "30-second intro circle - names, who's new, who's coming back. Then we head out together. No pace pressure, no drop policy.",
  },
  {
    step: "MILE 1–2",
    title: "Talk through mile two.",
    body: "Walkers, joggers, runners - we naturally split into small groups. The real work happens in the conversation. Somebody will fall in next to you. That's the whole point.",
  },
  {
    step: "AFTER",
    title: "Stay for coffee.",
    body: "We grab coffee nearby. Stay 10 minutes or an hour. Most weeks people hang around longer than they planned.",
  },
];

/* ─── FAQ ─── */
const FAQ = [
  {
    q: "Do I need to be in shape?",
    a: "No. We have walkers, comeback runners, and people training for marathons. All paces, every Saturday. If you can move for 30 minutes, you belong here.",
  },
  {
    q: "Can I come alone?",
    a: "Yes - most people do their first time. Show up 10 minutes early, introduce yourself, you'll know people by mile one.",
  },
  {
    q: "Do I need Strava?",
    a: "No, but it helps. Strava is where we post the event each week and track who's coming. Heylo is where we chat day-to-day. Both are free.",
  },
  {
    q: "What if it rains?",
    a: "We run. Light rain, cold, whatever - we go. If conditions are actually unsafe (ice, lightning), we'll call it off in the Heylo chat the night before.",
  },
  {
    q: "Can I bring a friend? A dog? A stroller?",
    a: "Yes, yes, and yes. Bring whoever. The trail is wide, flat, and stroller/dog friendly.",
  },
  {
    q: "How long does the whole thing take?",
    a: "Plan on about 90 minutes start to finish - 45–60 min on the trail, plus coffee. You'll be home before most people are awake.",
  },
];


function Index() {
  const activeSection = useActiveSection();
  return (
    <main className="bg-bone text-ink overflow-hidden pb-[88px] md:pb-0">
      {/* ═══════════════════════ 1. HERO ═══════════════════════ */}
      <section className="relative bg-ink text-bone min-h-screen flex flex-col overflow-hidden">
        <div className="absolute inset-0 dot-grid pointer-events-none" />
        <DiagonalSlash className="top-[22%] -left-[20%]" thickness={2} length="160%" />
        <DiagonalSlash className="top-[60%] -left-[20%] opacity-50" thickness={1} length="160%" />

        {/* Top nav */}
        <header className="relative z-10 flex items-center justify-between px-6 md:px-10 pt-6 md:pt-8">
          <GrytLogo className="text-bone" />
          <div className="relative flex flex-none mx-2 md:mx-0">
            <nav className="flex items-center gap-3 md:gap-8 label-meta overflow-x-auto scrollbar-hide whitespace-nowrap snap-x snap-mandatory">
              <NavLink href="#next-run" label="RSVP" active={activeSection === "next-run"} />
              <NavLink href="#runs" label="RUN" active={activeSection === "runs"} />
              <NavLink href="#how" label="HOW" active={activeSection === "how"} />
              <NavLink href="#first-saturday" label="LEARN" active={activeSection === "first-saturday"} />
              <NavLink href="#who" label="CONNECT" active={activeSection === "who"} />
            </nav>
            <div className="md:hidden absolute inset-y-0 right-0 w-5 bg-gradient-to-l from-sky-brand/30 to-transparent pointer-events-none" />
          </div>
          <a
            href={withUtm(STRAVA_URL, "strava_header_desktop")}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackCta("strava_header_desktop", withUtm(STRAVA_URL, "strava_header_desktop"))}
            className="hidden md:inline-flex items-center justify-center bg-sky-brand text-ink px-4 py-2.5 label-meta hover:bg-bone transition-colors"
          >
            SIGN UP FOR SATURDAY →
          </a>
          <a
            href={withUtm(STRAVA_URL, "strava_header_mobile")}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackCta("strava_header_mobile", withUtm(STRAVA_URL, "strava_header_mobile"))}
            className="md:hidden flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-sky-brand px-2 py-1 -mr-2"
          >
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-sky-brand animate-pulse" />
            JOIN
          </a>
        </header>

        {/* Headline block */}
        <div className="relative z-10 px-6 md:px-10 pt-12 md:pt-20 pb-12 md:pb-16 flex-1 flex flex-col justify-center max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.2, 0.7, 0.2, 1] }}
            className="mb-6 flex flex-wrap items-center gap-x-5 gap-y-2"
          >
            <p className="label-meta text-sky-brand">● LIVE · PITTSBURGH, PA · SATURDAYS 7 AM</p>
            <CountdownPill />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, ease: [0.2, 0.7, 0.2, 1], delay: 0.1 }}
            className="font-display font-black text-[18vw] md:text-[13vw] lg:text-[11vw] leading-[0.9] md:leading-[0.85] tracking-tight max-w-6xl uppercase [overflow-wrap:break-word]"
          >
            <span className="sr-only">GRYT Run Club, Pittsburgh - </span>
            Do <span className="underline-sky">hard</span>{" "}
            <span className="underline-sky">things</span> together.



          </motion.h1>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.35 }}
            className="mt-10 md:mt-12 max-w-2xl"
          >
            <p className="text-base md:text-lg text-bone/85 leading-snug">
              We're mostly 30+ former athletes who needed a group to grind with. Saturday at 7 AM on the Montour/Peters Trail in McMurray. Run a few miles, talk through mile two, stay for coffee. Any pace. Just you and a pair of shoes.
              <span className="block mt-3 text-bone/65">
                Sign up for this Saturday on Strava. Join our chat on Heylo so you know who's coming and where to meet.
              </span>
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <a
                href={withUtm(STRAVA_URL, "strava_hero")}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackCta("strava_hero", withUtm(STRAVA_URL, "strava_hero"))}
                className="inline-flex items-center justify-center bg-sky-brand text-ink px-6 py-3.5 label-meta hover:bg-bone transition-colors"
              >
                SIGN UP FOR SATURDAY →
              </a>
              <a
                href="#next-run"
                onClick={() => trackCta("next_run_hero", "#next-run")}
                className="inline-flex items-center justify-center border border-bone/60 text-bone px-6 py-3.5 label-meta hover:bg-bone hover:text-ink transition-colors"
              >
                SEE THIS SATURDAY →
              </a>
            </div>

            <div className="mt-6 flex flex-col gap-2">
              <GoingCounter />
              <p className="label-meta text-bone/55">
                FIRST TIME? JUST SHOW UP 10 MIN EARLY · YOU DON'T NEED TO KNOW ANYONE
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════ MEMBERS RUNNER ═══════════════════════ */}
      <div className="bg-bone text-ink border-y border-ink/15 overflow-hidden marquee-mask">
        <div className="flex w-max animate-marquee py-4">
          {Array.from({ length: 2 }).map((_, dup) => (
            <div key={dup} className="flex items-center gap-10 pr-10 shrink-0" aria-hidden={dup === 1}>
              <span className="shrink-0 flex items-baseline gap-1.5">
                <span className="label-meta text-ink/55">●</span>
                <span className="label-meta text-ink/55">THE</span>
                <span className="bubble-name-sm text-sm md:text-base">CREW</span>
              </span>
              {[
                "Matthew Bianco",
                "Jay Wysocki",
                "Caleb Wysocki",
                "Aaron Maize",
                "Pete Ross",
                "Kyle Bloser",
                "Laura Merich",
                "Matt Paden",
                "Matt Messerly",
                "Ian Baun",
                "Zac Kuchta",
                "Nathan J",
                "Dave Friedman",
                "Leo Merich",
                "Winston Maize",
                "Sonny Merich",

              ].map((name) => {
                const [first, ...rest] = name.split(" ");
                const last = rest.join(" ");
                return (
                  <span key={name} className="shrink-0 flex items-baseline gap-1.5">
                    <span className="bubble-name-sm text-sm md:text-base">{first}</span>
                    {last && (
                      <span className="label-meta text-ink/85" style={{ fontSize: "10px" }}>
                        {last}
                      </span>
                    )}
                  </span>
                );
              })}
              <span className="shrink-0 flex items-baseline gap-1.5">
                <span className="label-meta text-ink/55">DO HARD THINGS</span>
                <span className="bubble-name-sm text-sm md:text-base">TOGETHER</span>
                <span className="label-meta text-ink/55">→</span>
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ═══════════════════════ STICKY MOBILE CTA ═══════════════════════ */}
      <div className="fixed bottom-0 inset-x-0 z-40 md:hidden bg-ink border-t border-bone/15 shadow-[0_-8px_24px_rgba(0,0,0,0.45)]">
        {/* Rotating context bar */}
        <RotatingTicker />

        {/* Action buttons */}
        <div className="flex items-stretch px-3 pb-3 pt-1 gap-2">
          <a
            href={withUtm(STRAVA_URL, "strava_sticky_mobile")}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackCta("strava_sticky_mobile", withUtm(STRAVA_URL, "strava_sticky_mobile"))}
            className="flex-[1.3] bg-sky-brand text-ink px-4 py-3.5 flex items-center justify-center gap-2 text-sm font-bold uppercase tracking-wide rounded-sm active:scale-[0.98] transition-transform"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M14 7l5 5-5 5" />
            </svg>
            Sign Up
          </a>
          <a
            href={withUtm(HEYLO_URL, "heylo_sticky_mobile")}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackCta("heylo_sticky_mobile", withUtm(HEYLO_URL, "heylo_sticky_mobile"))}
            className="flex-1 bg-bone/10 text-bone px-3 py-3.5 flex items-center justify-center gap-1.5 text-xs font-semibold uppercase tracking-wide rounded-sm active:scale-[0.98] transition-transform border border-bone/20"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            Chat
          </a>
        </div>
      </div>

      {/* ═══════════════════════ NEXT RUN PREVIEW ═══════════════════════ */}
      <section
        id="next-run"
        className="bg-bone text-ink py-16 md:py-24 border-t border-ink/10 relative overflow-hidden"
      >
        <div className="absolute inset-0 dot-grid-bone pointer-events-none opacity-70" />
        <div className="relative z-10 px-6 md:px-10 max-w-6xl">
          <Reveal>
            <Label>This Saturday</Label>
            <div className="rule-thin bg-ink mt-2 mb-6 max-w-xs" />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-start">
              <div>
                <h2 className="font-display text-4xl md:text-6xl leading-[0.95]">
                  Lock in <span className="underline-sky">your</span> <span className="underline-sky">spot.</span>
                </h2>
                <p className="mt-5 text-ink/70 leading-snug max-w-md">
                  Drop your name and we'll send a short heads-up Friday with weather, parking,
                  and who's coming. No spam. One email a week, tops.
                </p>
                <div className="mt-7 flex flex-wrap items-center gap-3">
                  <CountdownPill />
                  <GoingCounter />
                </div>
                <ul className="mt-8 flex flex-col gap-2 label-meta text-ink/60">
                  <li>● SAT · 7:00 AM · 212 VALLEY BROOK RD, MCMURRAY PA</li>
                  <li>● ~4 MI · WALK · JOG · RUN · ANY PACE</li>
                  <li>● COFFEE AFTER · NO ACCOUNT NEEDED</li>
                </ul>
              </div>
              <div className="bg-ink text-bone p-6 md:p-8 shadow-[6px_6px_0_0_var(--ink)] border border-ink">
                <Label className="text-bone">RSVP</Label>
                <div className="rule-thin bg-bone mt-2 mb-5 max-w-[60px]" />
                <RsvpForm />
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ═══════════════════════ 2. RUNS ═══════════════════════ */}
      <section
        id="runs"
        className="bg-ink text-bone py-20 md:py-28 border-t border-bone/10 relative overflow-hidden"
      >
        <div className="absolute inset-0 dot-grid pointer-events-none" />
        <DiagonalSlash className="top-[10%] -right-[20%] opacity-60" thickness={2} length="80%" />

        <div className="relative z-10 px-6 md:px-10">
          <Reveal>
            <Label className="text-bone">The runs</Label>
            <div className="rule-thin bg-bone mt-2 mb-6 max-w-xs" />
            <div className="flex flex-wrap items-end justify-between gap-6">
              <h2 className="font-display text-5xl md:text-7xl max-w-4xl">
                Meet us Saturday. <br />
                <span className="underline-sky">7:00 AM.</span> McMurray, PA.
              </h2>
              <p className="max-w-md text-bone/70 leading-snug">
                Pull into 212 Valley Brook Road. We'll be the group stretching by the trailhead.
                Run with us, walk with us - nobody gets dropped, coffee's on after.
              </p>
            </div>
          </Reveal>

          {/* Map + Live Strava feed side-by-side */}
          <div className="mt-12 md:mt-16 grid grid-cols-1 lg:grid-cols-5 gap-px bg-bone/15 border border-bone/20">
            {/* Map */}
            <div className="lg:col-span-3 bg-bone text-ink relative ring-2 ring-sky-brand/70 ring-offset-0">
              {/* Sky corner brackets */}
              <span className="absolute top-0 left-0 w-5 h-5 border-t-[3px] border-l-[3px] border-sky-brand z-[401] pointer-events-none" />
              <span className="absolute top-0 right-0 w-5 h-5 border-t-[3px] border-r-[3px] border-sky-brand z-[401] pointer-events-none" />
              <span className="absolute bottom-0 left-0 w-5 h-5 border-b-[3px] border-l-[3px] border-sky-brand z-[401] pointer-events-none" />
              <span className="absolute bottom-0 right-0 w-5 h-5 border-b-[3px] border-r-[3px] border-sky-brand z-[401] pointer-events-none" />
              {/* Sky diagonal slash accent */}
              <span className="absolute top-6 right-[-12px] w-24 h-[3px] bg-sky-brand rotate-[-18deg] z-[401] pointer-events-none shadow-[0_0_8px_rgba(137,207,240,0.6)]" />
              <RouteMap />
              <div className="absolute top-4 left-4 z-[400] bg-ink text-bone label-meta px-3 py-2 pointer-events-none border-l-[3px] border-sky-brand">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-sky-brand mr-2 align-middle" />
                ROUTE · MONTOUR / PETERS TRAIL
              </div>
              {/* Sky pin marker chip */}
              <div className="absolute top-16 left-4 z-[400] bg-sky-brand text-ink label-meta px-2.5 py-1.5 pointer-events-none border border-ink/80 shadow-[3px_3px_0_var(--ink)]">
                ● MEET HERE · 7:00 AM
              </div>
              <div className="absolute bottom-4 left-4 z-[400] bg-ink border border-sky-brand/40 px-4 py-3 flex items-center gap-5 label-meta text-bone shadow-[4px_4px_0_0_var(--sky)] select-none">
                <span className="group flex items-center gap-2.5 cursor-pointer transition-transform duration-150 active:scale-95">
                  <span className="inline-block w-3.5 h-3.5 rounded-full bg-sky-brand border-2 border-bone shadow-[0_0_6px_rgba(137,207,240,0.5)] transition-all duration-200 group-hover:shadow-[0_0_12px_rgba(137,207,240,0.9)] group-hover:scale-110 active:shadow-[0_0_16px_rgba(137,207,240,1)] active:scale-110" />
                  <span className="underline-sky underline-sky-sm transition-all duration-200 group-hover:text-sky-brand group-active:text-sky-brand">START</span>
                </span>
                <span className="group flex items-center gap-2.5 cursor-pointer transition-transform duration-150 active:scale-95">
                  <span className="inline-block w-3.5 h-3.5 bg-bone border-2 border-sky-brand transition-all duration-200 group-hover:bg-sky-brand group-hover:shadow-[0_0_12px_rgba(137,207,240,0.9)] group-hover:scale-110 active:bg-sky-brand active:shadow-[0_0_16px_rgba(137,207,240,1)] active:scale-110" />
                  <span className="underline-sky underline-sky-sm transition-all duration-200 group-hover:text-sky-brand group-active:text-sky-brand">FINISH</span>
                </span>
                <span className="group flex items-center gap-2.5 cursor-pointer transition-transform duration-150 active:scale-95">
                  <span className="inline-block w-5 h-[3px] bg-sky-brand shadow-[0_0_6px_rgba(137,207,240,0.5)] transition-all duration-200 group-hover:shadow-[0_0_12px_rgba(137,207,240,0.9)] group-hover:h-[4px] group-hover:w-6 active:shadow-[0_0_16px_rgba(137,207,240,1)] active:h-[4px] active:w-6" />
                  <span className="underline-sky underline-sky-sm transition-all duration-200 group-hover:text-sky-brand group-active:text-sky-brand">ROUTE</span>
                </span>
              </div>
            </div>


            {/* Live Strava */}
            <div className="lg:col-span-2 bg-bone text-ink p-6 md:p-8 flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <Label>Live activity</Label>
                <span className="label-meta text-ink/55" style={{ fontSize: "10px" }}>
                  ● LIVE · STRAVA
                </span>
              </div>
              <div className="rule-thin bg-ink mb-5" />
              <p className="font-display text-xl md:text-2xl leading-tight mb-3">
                this is what your <span className="underline-sky">Saturday</span> <span className="underline-sky">looks</span> <span className="underline-sky">like.</span>
              </p>
              <p className="text-ink/65 leading-snug text-sm mb-5">
                Not on Strava? No problem - this is just our live receipt. Real people, real miles, every week. You can show up without an account.
              </p>
              <div className="flex-1 flex items-start justify-center">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 w-full">
                  <div className="w-full border border-ink/15 bg-pure shadow-[6px_6px_0_0_var(--ink)]">
                    <iframe
                      title="GRYT Strava club - summary"
                      src={STRAVA_EMBED_SUMMARY}
                      loading="lazy"
                      width={300}
                      height={454}
                      scrolling="no"
                      allowTransparency
                      className="block w-full"
                      style={{ height: 454, border: 0 }}
                    />
                  </div>
                  <div className="w-full border border-ink/15 bg-pure shadow-[6px_6px_0_0_var(--ink)]">
                    <iframe
                      title="GRYT Strava club - latest rides"
                      src={STRAVA_EMBED_RIDES}
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
              </div>
            </div>
          </div>


          {/* Run details strip */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-bone/15 mt-px border border-bone/20 border-t-0">
            {[
              { label: "When", value: "SAT · 7 AM", sub: "WEEKLY" },
              { label: "Where", value: "MCMURRAY, PA", sub: "212 VALLEY BROOK RD" },
              { label: "Distance", value: "~4 MI", sub: "OUT & BACK" },
              { label: "Pace", value: "ALL", sub: "WALK · JOG · RUN" },
            ].map((s) => (
              <div key={s.label} className="bg-ink p-6 md:p-8">
                <Label className="text-bone">{s.label}</Label>
                <div className="rule-thin bg-bone mt-2 mb-3" />
                <div className="font-display text-2xl md:text-3xl leading-none">{s.value}</div>
                <div className="label-meta opacity-50 mt-2" style={{ fontSize: "10px" }}>
                  {s.sub}
                </div>
              </div>
            ))}
          </div>




          <div className="mt-10 flex flex-wrap items-center gap-3">
            <a
              href={withUtm(STRAVA_URL, "strava_first_saturday")}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackCta("strava_first_saturday", withUtm(STRAVA_URL, "strava_first_saturday"))}
              className="inline-flex items-center justify-center bg-sky-brand text-ink px-6 py-3.5 label-meta hover:bg-bone transition-colors"
            >
              SIGN UP FOR SATURDAY →
            </a>
            <a
              href={withUtm(HEYLO_URL, "heylo_first_saturday")}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackCta("heylo_first_saturday", withUtm(HEYLO_URL, "heylo_first_saturday"))}
              className="inline-flex items-center justify-center border border-bone/60 text-bone px-6 py-3.5 label-meta hover:bg-bone hover:text-ink transition-colors"
            >
              JOIN THE CHAT →
            </a>
          </div>
        </div>
      </section>


      {/* ═══════════════════════ 3. WHO SHOWS UP ═══════════════════════ */}
      <section
        id="who"
        className="bg-bone text-ink py-20 md:py-28 border-t border-ink/10 relative overflow-hidden"
      >
        <div className="absolute inset-0 dot-grid-bone pointer-events-none opacity-70" />
        <div className="relative z-10 px-6 md:px-10">
          <Reveal>
            <Label>Who shows up</Label>
            <div className="rule-thin bg-ink mt-2 mb-6 max-w-xs" />
            <h2 className="font-display text-5xl md:text-7xl max-w-4xl">
              If you're <span className="underline-sky">already</span> <span className="underline-sky">choosing</span> discomfort - you're one of us.
            </h2>
            <p className="mt-6 max-w-2xl text-ink/70 leading-snug text-base md:text-lg">
              We're not for everyone, and we're not trying to be. Our core group is 30+ year-old
              parents, former athletes, and friends who wanted to find time on the schedule to grind
              together — and that's how this run club was birthed. We meet Saturday at 7 AM on the
              Montour/Peters Trail in McMurray. Run a few miles, talk through mile two, stay for
              coffee. Any pace. Just you and a pair of shoes.
            </p>
          </Reveal>

          <div className="mt-14 md:mt-20 grid grid-cols-1 md:grid-cols-2 gap-px bg-ink/15">
            {[
              {
                tag: "01 · IF YOU'RE A PARENT",
                title: "Be home before the kids wake up.",
                body: "You need one thing on the calendar that's just yours - early enough nobody else is affected, hard enough that it counts. Come make Saturday at 7 that thing.",
              },
              {
                tag: "02 · IF YOU'RE 30+ & NEED A GROUP",
                title: "Former athletes who needed people to grind with.",
                body: "You used to compete. You still have the engine, but you've been going alone - or not going at all. You don't need a plan or a Garmin. You need a crew that shows up. That's us.",
              },
              {
                tag: "03 · IF YOU WANT REAL COMMUNITY",
                title: "Run with people who'll notice you.",
                body: "You're done optimizing alone in headphones. Join a standing time you don't have to negotiate, with people who'll text you when you miss a week.",
              },
              {
                tag: "04 · IF YOU'RE BUILDING A STREAK",
                title: "Become someone consistent.",
                body: "One Saturday is a workout. Twelve Saturdays is a habit. Fifty is a different person. Come start the long version with us - you won't have to do it alone.",
              },
            ].map((c) => (
              <Reveal key={c.tag}>
                <div className="bg-bone p-7 md:p-10 h-full">
                  <div className="label-meta text-sky-brand">{c.tag}</div>
                  <h3 className="font-display text-2xl md:text-3xl mt-3 leading-[1.05]">
                    {c.title}
                  </h3>
                  <p className="mt-4 text-ink/70 leading-snug">{c.body}</p>
                </div>
              </Reveal>
            ))}
          </div>

          {/* ── Who's running this — founders + crew carousel, one unified block ── */}
          <Reveal>
            <div className="relative mt-16 md:mt-24 bg-ink text-bone">
              <div className="relative z-10 px-6 md:px-14 py-12 md:py-20">
                {/* Founders header */}
                <div className="grid grid-cols-1 md:grid-cols-[auto_1fr] gap-8 md:gap-14 items-start">
                  <img
                    src={foundersPhoto}
                    alt="Laura and Nick Merich, founders of GRYT"
                    className="w-28 h-28 md:w-36 md:h-36 object-cover grayscale shrink-0"
                  />
                  <div className="min-w-0">
                    <Label className="text-bone">Who's running this</Label>
                    <div className="rule-thin bg-bone mt-2 mb-8 md:mb-10 max-w-[60px]" />

                    <h3 className="font-display text-4xl md:text-6xl leading-none text-bone tracking-wide">
                      Laura <span className="text-sky">&amp;</span> Nick Merich
                    </h3>
                    <p className="mt-3 label-meta text-bone/70">- and the crew</p>

                    <p className="mt-5 text-bone/75 leading-relaxed max-w-xl">
                      Founders of GRYT. 27 marathons between them. One thing on the calendar that
                      doesn't move - same trail, same time, every Saturday.
                    </p>

                    <ul className="mt-8 flex flex-col gap-2 label-meta text-bone/60">
                      <li>● 27 marathons finished · combined</li>
                      <li>● Running races together since 2014</li>
                      <li>● 25+ regulars · all paces</li>
                    </ul>
                  </div>
                </div>

                {/* Divider */}
                <div className="mt-12 md:mt-16 mb-10 md:mb-14 h-px bg-bone/15" />

                {/* Crew carousel sub-header */}
                <div className="flex flex-wrap items-end justify-between gap-4 mb-8 md:mb-10">
                  <div>
                    <Label className="text-bone">The crew · in motion</Label>
                    <div className="rule-thin bg-bone mt-2 mb-4 max-w-[60px]" />
                    <h3 className="font-display text-3xl md:text-5xl leading-[1.02] max-w-2xl text-bone">
                      Become someone <span className="text-sky underline-sky">consistent.</span>
                    </h3>
                  </div>
                  <p className="max-w-sm text-bone/70 leading-snug">
                    Not a highlight reel. Just the Saturdays — the people who keep showing up,
                    one mile at a time.
                  </p>
                </div>

                <CrewCarousel />
              </div>
            </div>
          </Reveal>

        </div>
      </section>

      {/* ═══════════════════════ HOW IT WORKS ═══════════════════════ */}
      <section
        id="how"
        className="bg-ink text-bone py-20 md:py-28 border-t border-bone/10 relative overflow-hidden"
      >
        <div className="absolute inset-0 dot-grid pointer-events-none" />
        <div className="relative z-10 px-6 md:px-10">
          <Reveal>
            <Label className="text-bone">How GRYT works</Label>
            <div className="rule-thin bg-bone mt-2 mb-6 max-w-xs" />
            <h2 className="font-display text-5xl md:text-7xl max-w-4xl">
              Three <span className="underline-sky">steps.</span> No app. No fee.
            </h2>
          </Reveal>
          <div className="mt-12 md:mt-16 grid grid-cols-1 md:grid-cols-3 gap-px bg-bone/15 border border-bone/20">
            {[
              {
                n: "01",
                title: "Show up",
                body: "Saturday, 7 AM. 212 Valley Brook Road. We're the group stretching by the trailhead. Park, walk over, say hi.",
              },
              {
                n: "02",
                title: "Run your pace",
                body: "Out and back, about 4 miles. Walk it, jog it, run it. Nobody gets dropped. You'll find someone moving your speed inside the first quarter mile.",
              },
              {
                n: "03",
                title: "Stay for coffee",
                body: "Twenty minutes after, a few of us hang back at the cars or grab coffee nearby. That's where you actually meet people. That's the whole point.",
              },
            ].map((s, i) => (
              <Reveal key={s.n} delay={i * 0.05}>
                <div className="bg-ink p-7 md:p-10 h-full relative">
                  <div className="absolute top-4 right-5 font-display text-7xl md:text-8xl leading-none text-bone/10 select-none pointer-events-none">
                    {s.n}
                  </div>
                  <div className="label-meta text-sky-brand">STEP {s.n}</div>
                  <div className="rule-thin bg-bone mt-2 mb-4 max-w-[40px]" />
                  <h3 className="font-display text-3xl md:text-4xl leading-[1.05]">{s.title}</h3>
                  <p className="mt-4 text-bone/75 leading-snug">{s.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════ VOICES ═══════════════════════ */}
      <section
        id="voices"
        className="bg-bone text-ink py-20 md:py-28 border-t border-ink/10 relative overflow-hidden"
      >
        <div className="absolute inset-0 dot-grid-bone pointer-events-none opacity-70" />
        <div className="relative z-10 px-6 md:px-10">
          <Reveal>
            <Label>In their words</Label>
            <div className="rule-thin bg-ink mt-2 mb-6 max-w-xs" />
            <h2 className="font-display text-5xl md:text-7xl max-w-4xl">
              People who keep <span className="underline-sky">showing</span> <span className="underline-sky">up.</span>
            </h2>
          </Reveal>
          <div className="mt-12 md:mt-16 grid grid-cols-1 md:grid-cols-3 gap-px bg-ink/15 border border-ink/15">
            {[
              {
                quote:
                  "I hadn't run consistently in five years. Three Saturdays in, it's the thing I won't move on my calendar.",
                name: "Matt P.",
                meta: "MCMURRAY · DAD OF 2",
              },
              {
                quote:
                  "Showed up not knowing anyone. By mile two I was deep in a conversation about marathon training and parenting. That's the trick.",
                name: "Laura M.",
                meta: "PETERS TWP · MARATHONER",
              },
              {
                quote:
                  "I'm slow. Nobody cared. Somebody hung back and ran my pace the whole way. Came back the next week.",
                name: "Aaron M.",
                meta: "BETHEL PARK · BUILDING THE HABIT",
              },
            ].map((v, i) => (
              <Reveal key={v.name} delay={i * 0.05}>
                <div className="bg-bone p-7 md:p-10 h-full flex flex-col">
                  <div className="font-display text-5xl text-sky-brand leading-none mb-4 select-none">"</div>
                  <p className="text-ink/85 leading-snug text-lg flex-1">{v.quote}</p>
                  <div className="mt-6">
                    <div className="bubble-name-sm text-base">{v.name}</div>
                    <div className="label-meta text-ink/55 mt-1" style={{ fontSize: "10px" }}>
                      {v.meta}
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════ FIRST SATURDAY ═══════════════════════ */}
      <section
        id="first-saturday"
        className="bg-bone text-ink py-20 md:py-28 border-t border-ink/10 relative overflow-hidden"
      >
        <div className="absolute inset-0 dot-grid-bone pointer-events-none opacity-70" />
        <div className="relative z-10 px-6 md:px-10">
          <Reveal>
            <Label>Your first Saturday</Label>
            <div className="rule-thin bg-ink mt-2 mb-6 max-w-xs" />
            <div className="flex flex-wrap items-end justify-between gap-6">
              <h2 className="font-display text-5xl md:text-7xl max-w-4xl">
                Here's exactly <span className="underline-sky">what</span> <span className="underline-sky">to</span> <span className="underline-sky">expect</span> when you show up.
              </h2>
              <p className="max-w-md text-ink/70 leading-snug">
                No mystery. No insider stuff. Read this once and you'll know more than half the
                people who've been coming for months.
              </p>
            </div>
          </Reveal>

          <div className="mt-12 md:mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px bg-ink/15 border border-ink/15">
            {FIRST_SATURDAY.map((s, i) => (
              <Reveal key={s.step} delay={i * 0.05}>
                <div className="bg-bone p-6 md:p-8 h-full flex flex-col relative">
                  <div className="absolute top-4 right-5 font-display text-6xl md:text-7xl leading-none text-ink/10 select-none pointer-events-none">
                    {String(i + 1).padStart(2, "0")}
                  </div>
                  <div className="label-meta text-sky-brand">{s.step}</div>
                  <div className="rule-thin bg-ink mt-2 mb-4 max-w-[40px]" />
                  <h3 className="font-display text-xl md:text-2xl leading-[1.1]">{s.title}</h3>
                  <p className="mt-3 text-ink/70 leading-snug flex-1">{s.body}</p>
                </div>
              </Reveal>
            ))}
          </div>

          {/* Logistics quick-strip */}
          <div className="mt-px grid grid-cols-2 md:grid-cols-4 gap-px bg-ink/15 border border-ink/15 border-t-0">
            {[
              { label: "Parking", value: "FREE · ON-SITE" },
              { label: "Bathrooms", value: "AT TRAILHEAD" },
              { label: "Rain policy", value: "WE STILL RUN" },
              { label: "Cost", value: "$0 · ALWAYS" },
            ].map((s) => (
              <div key={s.label} className="bg-bone p-5 md:p-6">
                <Label>{s.label}</Label>
                <div className="rule-thin bg-ink mt-2 mb-2 max-w-[30px]" />
                <div className="font-display text-lg md:text-xl leading-none">{s.value}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════ FAQ ═══════════════════════ */}
      <section
        id="faq"
        className="bg-ink text-bone py-20 md:py-28 border-t border-bone/10 relative overflow-hidden"
      >
        <div className="absolute inset-0 dot-grid pointer-events-none" />
        <div className="relative z-10 px-6 md:px-10">
          <Reveal>
            <Label className="text-bone">Questions you're probably about to ask</Label>
            <div className="rule-thin bg-bone mt-2 mb-6 max-w-xs" />
            <h2 className="font-display text-5xl md:text-7xl max-w-4xl">
              The <span className="underline-sky">honest answers.</span>
            </h2>
          </Reveal>

          <div className="mt-12 md:mt-16 grid grid-cols-1 md:grid-cols-2 gap-px bg-bone/15 border border-bone/20">
            {FAQ.map((item, i) => (
              <Reveal key={item.q} delay={i * 0.04}>
                <div className="bg-ink p-7 md:p-9 h-full">
                  <h3 className="font-display text-xl md:text-2xl leading-[1.15]">{item.q}</h3>
                  <div className="rule-thin bg-bone/40 mt-3 mb-4 max-w-[40px]" />
                  <p className="text-bone/75 leading-snug">{item.a}</p>
                </div>
              </Reveal>
            ))}
          </div>

          <div className="mt-12 flex flex-wrap items-center gap-3">
            <a
              href={withUtm(STRAVA_URL, "strava_faq")}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackCta("strava_faq", withUtm(STRAVA_URL, "strava_faq"))}
              className="inline-flex items-center justify-center bg-sky-brand text-ink px-6 py-3.5 label-meta shadow-[0_0_24px_rgba(137,207,240,0.35)] hover:shadow-[0_0_32px_rgba(137,207,240,0.5)] hover:bg-bone transition-all"
            >
              SIGN UP FOR SATURDAY →
            </a>
            <a
              href={withUtm(HEYLO_URL, "heylo_faq")}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackCta("heylo_faq", withUtm(HEYLO_URL, "heylo_faq"))}
              className="inline-flex items-center justify-center border border-bone text-bone px-6 py-3.5 label-meta hover:bg-bone hover:text-ink hover:border-bone transition-colors"
            >
              JOIN THE CHAT →
            </a>
          </div>
        </div>
      </section>


      {/* ═══════════════════════ TECH STACK STRIP ═══════════════════════ */}
      <section className="bg-bone text-ink border-t border-ink/10 py-10 md:py-14 relative overflow-hidden">
        <div className="absolute inset-0 dot-grid-bone pointer-events-none opacity-70" />
        <div className="relative z-10 px-6 md:px-10">
          <div className="flex flex-wrap items-center justify-between gap-x-10 gap-y-6">
            <div className="flex items-center gap-4">
              <Label>The stack</Label>
              <div className="rule-thin bg-ink w-12" />
              <p className="label-meta text-ink/60">HOW THE CLUB RUNS</p>
            </div>
            <div className="flex flex-wrap items-center gap-x-8 gap-y-3">
              {[
                { name: "STRAVA", role: "EVENTS · STATS", href: withUtm(STRAVA_URL, "strava_stack_strip") },
                { name: "HEYLO", role: "GROUP CHAT", href: withUtm(HEYLO_URL, "heylo_stack_strip") },
                { name: "GARMIN", role: "WATCHES" },
                { name: "APPLE HEALTH", role: "SYNC" },
                { name: "SPOTIFY", role: "MILE 2 PLAYLIST" },
              ].map((tool) =>
                tool.href ? (
                  <a
                    key={tool.name}
                    href={tool.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => trackCta(`${tool.name.toLowerCase()}_stack_strip`, tool.href)}
                    className="group inline-flex items-baseline gap-2 hover:text-sky-brand transition-colors"
                  >
                    <span className="font-display text-xl md:text-2xl leading-none">{tool.name}</span>
                    <span className="label-meta text-ink/45 group-hover:text-sky-brand/70" style={{ fontSize: "9px" }}>{tool.role}</span>
                  </a>
                ) : (
                  <div key={tool.name} className="inline-flex items-baseline gap-2">
                    <span className="font-display text-xl md:text-2xl leading-none">{tool.name}</span>
                    <span className="label-meta text-ink/45" style={{ fontSize: "9px" }}>{tool.role}</span>
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════ 4. FINAL CTA ═══════════════════════ */}
      <section
        id="join"
        className="bg-ink text-bone py-20 md:py-28 border-t border-bone/10 relative overflow-hidden"
      >
        <div className="absolute inset-0 dot-grid pointer-events-none" />
        <DiagonalSlash className="bottom-[10%] -left-[20%] opacity-50" thickness={1} length="80%" />

        <div className="relative z-10 px-6 md:px-10">
          <div className="border border-bone/20 p-8 md:p-12 flex flex-wrap items-center justify-between gap-6">
            <div className="max-w-xl">
              <Label className="text-bone">Still here?</Label>
              <div className="rule-thin bg-bone mt-2 mb-4 max-w-[80px]" />
              <p className="font-display text-3xl md:text-4xl leading-tight">
                Reading about it is fine. Showing up Saturday is <span className="underline-sky">the</span> <span className="underline-sky">real</span> <span className="underline-sky">thing.</span> Come do it with us.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <a
                href={withUtm(STRAVA_URL, "strava_final")}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackCta("strava_final", withUtm(STRAVA_URL, "strava_final"))}
                className="inline-flex items-center justify-center bg-sky-brand text-ink px-6 py-3.5 label-meta shadow-[0_0_24px_rgba(137,207,240,0.35)] hover:shadow-[0_0_32px_rgba(137,207,240,0.5)] hover:bg-bone transition-all"
              >
                SIGN UP FOR SATURDAY →
              </a>
              <a
                href={withUtm(HEYLO_URL, "heylo_final")}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackCta("heylo_final", withUtm(HEYLO_URL, "heylo_final"))}
                className="inline-flex items-center justify-center border border-bone text-bone px-6 py-3.5 label-meta hover:bg-bone hover:text-ink hover:border-bone transition-colors"
              >
                JOIN THE CHAT →
              </a>
            </div>
          </div>

          <div className="mt-8">
            <RsvpForm />
          </div>
        </div>
      </section>


      {/* Footer */}
      <footer className="bg-bone text-ink border-t border-ink/15 px-6 md:px-10 py-10">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div className="flex items-center gap-4">
            <GrytLogo className="on-light" />
            <span className="label-meta opacity-60">PITTSBURGH, PA · DO HARD THINGS <span className="underline-sky">TOGETHER</span></span>
          </div>
          <div className="flex items-center gap-6 label-meta">
            <a href={withUtm(STRAVA_URL, "strava_footer")} target="_blank" rel="noopener noreferrer" onClick={() => trackCta("strava_footer", withUtm(STRAVA_URL, "strava_footer"))} className="hover:text-sky-brand">STRAVA</a>
            <a href={withUtm(HEYLO_URL, "heylo_footer")} target="_blank" rel="noopener noreferrer" onClick={() => trackCta("heylo_footer", withUtm(HEYLO_URL, "heylo_footer"))} className="hover:text-sky-brand">HEYLO</a>
            <a href="mailto:hi@gryt.club" className="hover:text-sky-brand">CONTACT</a>
          </div>
        </div>
        <div className="mt-6 pt-6 border-t border-ink/10 flex flex-wrap items-center justify-between gap-3">
          <p className="text-ink/65 leading-snug max-w-2xl text-sm">
            First Saturday nerves? Text or email us before you come - we'll meet you at the trailhead.
            No one runs alone unless they want to.
          </p>
          <a href="mailto:hi@gryt.club?subject=First%20Saturday%20question" className="label-meta text-sky-brand hover:text-ink">
            HI@GRYT.CLUB →
          </a>
        </div>
      </footer>
    </main>
  );
}
