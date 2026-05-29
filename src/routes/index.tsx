import { createFileRoute } from "@tanstack/react-router";
import { type ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { RouteMap } from "@/components/RouteMap";
import foundersPhoto from "@/assets/founders.jpg";


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
          "GRYT is a Pittsburgh run club for parents and adults 30+. Saturdays at 7:00 AM at 212 Valley Brook Road, McMurray, PA on the Montour/Peters Trail. All paces welcome.",
      },
      { property: "og:title", content: "GRYT — Pittsburgh Run Club" },
      {
        property: "og:description",
        content:
          "Pittsburgh run club for parents and 30+ who do hard things together. Saturdays · 7 AM · Montour/Peters Trail.",
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
            "Pittsburgh run club for parents and adults 30+ who do hard things together.",
          url: "https://gryt.club/",
          sport: "Running",
          slogan: "DO HARD THINGS TOGETHER",
          areaServed: { "@type": "Place", name: "Pittsburgh, Pennsylvania" },
          location: {
            "@type": "Place",
            name: "Montour/Peters Trail — McMurray, PA",
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
    body: "Free parking right at the trailhead. Look for the group near the trail sign — we'll wave you over. Bathrooms are open at the trailhead.",
  },
  {
    step: "7:00 AM",
    title: "Quick hello, then we move.",
    body: "30-second intro circle — names, who's new, who's coming back. Then we head out together. No pace pressure, no drop policy.",
  },
  {
    step: "MILE 1–2",
    title: "Find a person, find a pace.",
    body: "Walkers, joggers, runners — we naturally split into small groups. Somebody will fall in next to you. That's the whole point.",
  },
  {
    step: "AFTER",
    title: "Coffee. Stay as long as you want.",
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
    a: "Yes — most people do their first time. Show up 10 minutes early, introduce yourself, you'll know people by mile one.",
  },
  {
    q: "Do I need Strava?",
    a: "No, but it helps. Strava is where we post the event each week and track who's coming. Heylo is where we chat day-to-day. Both are free.",
  },
  {
    q: "What if it rains?",
    a: "We run. Light rain, cold, whatever — we go. If conditions are actually unsafe (ice, lightning), we'll call it off in the Heylo chat the night before.",
  },
  {
    q: "Can I bring a friend? A dog? A stroller?",
    a: "Yes, yes, and yes. Bring whoever. The trail is wide, flat, and stroller/dog friendly.",
  },
  {
    q: "How long does the whole thing take?",
    a: "Plan on about 90 minutes start to finish — 45–60 min on the trail, plus coffee. You'll be home before most people are awake.",
  },
];


function Index() {
  return (
    <main className="bg-bone text-ink overflow-hidden pb-[68px] md:pb-0">
      {/* ═══════════════════════ 1. HERO ═══════════════════════ */}
      <section className="relative bg-ink text-bone min-h-screen flex flex-col overflow-hidden">
        <div className="absolute inset-0 dot-grid pointer-events-none" />
        <DiagonalSlash className="top-[22%] -left-[20%]" thickness={2} length="160%" />
        <DiagonalSlash className="top-[60%] -left-[20%] opacity-50" thickness={1} length="160%" />

        {/* Top nav */}
        <header className="relative z-10 flex items-center justify-between px-6 md:px-10 pt-6 md:pt-8">
          <GrytLogo className="text-bone" />
          <nav className="hidden md:flex items-center gap-8 label-meta">
            <a href="#runs" className="hover:text-sky-brand transition-colors">RUNS</a>
            <a href="#who" className="hover:text-sky-brand transition-colors">YOUR PEOPLE</a>
            <a href="#first-saturday" className="hover:text-sky-brand transition-colors">FIRST TIME</a>
            <a href="#faq" className="hover:text-sky-brand transition-colors">FAQ</a>
          </nav>
          <a
            href={STRAVA_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden md:inline-flex items-center justify-center bg-sky-brand text-ink px-4 py-2.5 label-meta hover:bg-bone transition-colors"
          >
            SIGN UP FOR SATURDAY →
          </a>
          <a
            href={STRAVA_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="md:hidden label-meta text-sky-brand"
          >
            JOIN →
          </a>
        </header>

        {/* Headline block */}
        <div className="relative z-10 px-6 md:px-10 pt-12 md:pt-20 pb-12 md:pb-16 flex-1 flex flex-col justify-center max-w-6xl">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.2, 0.7, 0.2, 1] }}
            className="label-meta text-sky-brand mb-6"
          >
            ● LIVE · PITTSBURGH, PA · SATURDAYS 7 AM
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, ease: [0.2, 0.7, 0.2, 1], delay: 0.1 }}
            className="font-display font-black text-[18vw] md:text-[13vw] lg:text-[11vw] leading-[0.85] tracking-tight max-w-6xl uppercase"
          >
            <span className="sr-only">GRYT — </span>
            Come do <span className="underline-sky">hard things</span> together.

          </motion.h1>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.35 }}
            className="mt-10 md:mt-12 max-w-2xl"
          >
            <p className="text-base md:text-lg text-bone/85 leading-snug">
              Here's the deal: meet us Saturday at 7 AM on the Montour/Peters Trail in McMurray. Run a few miles
              with us, talk through mile two, stay for coffee. Any pace. Just you and a pair of shoes.
              <span className="block mt-3 text-bone/65">
                Sign up for this Saturday on Strava. Join our chat on Heylo so you know who's coming and where to meet.
              </span>
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <a
                href={STRAVA_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center bg-sky-brand text-ink px-6 py-3.5 label-meta hover:bg-bone transition-colors"
              >
                SIGN UP FOR SATURDAY →
              </a>
              <a
                href={HEYLO_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center border border-bone/60 text-bone px-6 py-3.5 label-meta hover:bg-bone hover:text-ink transition-colors"
              >
                JOIN THE CHAT →
              </a>
            </div>

            <p className="mt-6 label-meta text-bone/55">
              FIRST TIME? JUST SHOW UP 10 MIN EARLY · YOU DON'T NEED TO KNOW ANYONE
            </p>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════ STICKY MOBILE CTA ═══════════════════════ */}
      <div className="fixed bottom-0 inset-x-0 z-40 md:hidden bg-ink text-bone border-t border-bone/20 shadow-[0_-6px_20px_rgba(0,0,0,0.35)]">
        <div className="flex items-stretch">
          <a
            href={STRAVA_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 bg-sky-brand text-ink px-4 py-3.5 flex items-center justify-center label-meta"
          >
            STRAVA · EVENTS →
          </a>
          <a
            href={HEYLO_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 bg-bone text-ink px-4 py-3.5 flex items-center justify-center label-meta border-l border-ink/20"
          >
            HEYLO · CHAT →
          </a>
        </div>
      </div>

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
                Run with us, walk with us — nobody gets dropped, coffee's on after.
              </p>
            </div>
          </Reveal>

          {/* Map + Live Strava feed side-by-side */}
          <div className="mt-12 md:mt-16 grid grid-cols-1 lg:grid-cols-5 gap-px bg-bone/15 border border-bone/20">
            {/* Map */}
            <div className="lg:col-span-3 bg-bone text-ink relative">
              <RouteMap />
              <div className="absolute top-4 left-4 z-[400] bg-ink text-bone label-meta px-3 py-2 pointer-events-none">
                ROUTE · MONTOUR / PETERS TRAIL
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

            {/* Live Strava */}
            <div className="lg:col-span-2 bg-bone text-ink p-6 md:p-8 flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <Label>Live activity</Label>
                <span className="label-meta text-ink/55" style={{ fontSize: "10px" }}>
                  ● LIVE · STRAVA
                </span>
              </div>
              <div className="rule-thin bg-ink mb-5" />
              <p className="font-display text-xl md:text-2xl leading-tight mb-5">
                this is what your <span className="underline-sky">Saturday looks like.</span>
              </p>
              <div className="flex-1 flex items-start justify-center">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 w-full place-items-center">
                  <div className="w-full max-w-[320px] border border-ink/15 bg-pure shadow-[6px_6px_0_0_var(--ink)]">
                    <iframe
                      title="GRYT Strava club — summary"
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
                  <div className="w-full max-w-[320px] border border-ink/15 bg-pure shadow-[6px_6px_0_0_var(--ink)]">
                    <iframe
                      title="GRYT Strava club — latest rides"
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
              href={STRAVA_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center bg-sky-brand text-ink px-6 py-3.5 label-meta hover:bg-bone transition-colors"
            >
              SIGN UP FOR SATURDAY →
            </a>
            <a
              href={HEYLO_URL}
              target="_blank"
              rel="noopener noreferrer"
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
        <div className="px-6 md:px-10">
          <Reveal>
            <Label>Who shows up</Label>
            <div className="rule-thin bg-ink mt-2 mb-6 max-w-xs" />
            <h2 className="font-display text-5xl md:text-7xl max-w-4xl">
              If you're <span className="underline-sky">already choosing</span> discomfort — you're one of us.
            </h2>
            <p className="mt-6 max-w-2xl text-ink/70 leading-snug text-base md:text-lg">
              We're not for everyone, and we're not trying to be. We're for you if you already know the
              answer is to keep showing up. Come find your people. We'll hold the time, the route, and the ritual.
            </p>
          </Reveal>

          <div className="mt-14 md:mt-20 grid grid-cols-1 md:grid-cols-2 gap-px bg-ink/15">
            {[
              {
                tag: "01 · IF YOU'RE A PARENT",
                title: "Be home before the kids wake up.",
                body: "You need one thing on the calendar that's just yours — early enough nobody else is affected, hard enough that it counts. Come make Saturday at 7 that thing.",
              },
              {
                tag: "02 · IF YOU'RE 30+ & COMING BACK",
                title: "You used to run. Start again with us.",
                body: "It's been a year. Or five. You don't need a plan or a Garmin — you need a group that waits at every regroup and treats you like you belong. That's us. Show up.",
              },
              {
                tag: "03 · IF YOU WANT REAL COMMUNITY",
                title: "Run with people who'll notice you.",
                body: "You're done optimizing alone in headphones. Join a standing time you don't have to negotiate, with people who'll text you when you miss a week.",
              },
              {
                tag: "04 · IF YOU'RE BUILDING A STREAK",
                title: "Become someone consistent.",
                body: "One Saturday is a workout. Twelve Saturdays is a habit. Fifty is a different person. Come start the long version with us — you won't have to do it alone.",
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

          {/* Founder / host strip */}
          <Reveal>
            <div className="mt-16 md:mt-24 bg-ink text-bone p-7 md:p-10 flex flex-wrap items-center gap-6 md:gap-10">
              <img
                src={foundersPhoto}
                alt="Laura and Nick Merich, founders of GRYT"
                className="w-32 h-32 md:w-40 md:h-40 object-cover grayscale shrink-0"
              />
              <div className="flex-1 min-w-[260px]">
                <Label className="text-bone">Who's running this</Label>
                <div className="rule-thin bg-bone mt-2 mb-4 max-w-[60px]" />
                <p className="font-display text-2xl md:text-3xl leading-tight">
                  Run with <span className="underline-sky">Laura & Nick Merich</span> — and the crew.
                </p>
                <p className="mt-4 text-bone/75 leading-snug max-w-xl">
                  Founders of GRYT. 27 marathons finished between them. They started this with a
                  handful of friends who wanted one thing on the calendar that wouldn't move — same
                  trail, same time, every Saturday. You're not joining a brand. You're joining a
                  standing time with people who actually show up.
                </p>
              </div>
              <div className="label-meta text-bone/55 flex flex-col gap-1">
                <span>● 27 MARATHONS FINISHED · COMBINED</span>
                <span>● RUNNING WEEKLY SINCE 2024</span>
                <span>● 25+ REGULARS · ALL PACES</span>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ═══════════════════════ FIRST SATURDAY ═══════════════════════ */}
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
                Here's exactly <span className="underline-sky">what to expect</span> when you show up.
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
                <div className="bg-bone p-6 md:p-8 h-full flex flex-col">
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
              href={STRAVA_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center bg-sky-brand text-ink px-6 py-3.5 label-meta hover:bg-bone transition-colors"
            >
              SIGN UP FOR SATURDAY →
            </a>
            <a
              href={HEYLO_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center border border-bone/60 text-bone px-6 py-3.5 label-meta hover:bg-bone hover:text-ink transition-colors"
            >
              JOIN THE CHAT →
            </a>
          </div>
        </div>
      </section>


      {/* ═══════════════════════ TECH STACK STRIP ═══════════════════════ */}
      <section className="bg-bone text-ink border-t border-ink/10 py-10 md:py-14">
        <div className="px-6 md:px-10">
          <div className="flex flex-wrap items-center justify-between gap-x-10 gap-y-6">
            <div className="flex items-center gap-4">
              <Label>The stack</Label>
              <div className="rule-thin bg-ink w-12" />
              <p className="label-meta text-ink/60">HOW THE CLUB RUNS</p>
            </div>
            <div className="flex flex-wrap items-center gap-x-8 gap-y-3">
              {[
                { name: "STRAVA", role: "EVENTS · STATS", href: STRAVA_URL },
                { name: "HEYLO", role: "GROUP CHAT", href: HEYLO_URL },
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
                Reading about it is fine. Showing up Saturday is <span className="underline-sky">the real thing.</span> Come do it with us.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <a
                href={STRAVA_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center bg-sky-brand text-ink px-6 py-3.5 label-meta hover:bg-bone transition-colors"
              >
                SIGN UP FOR SATURDAY →
              </a>
              <a
                href={HEYLO_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center border border-bone/60 text-bone px-6 py-3.5 label-meta hover:bg-bone hover:text-ink transition-colors"
              >
                JOIN THE CHAT →
              </a>
            </div>
          </div>
        </div>
      </section>


      {/* Footer */}
      <footer className="bg-bone text-ink border-t border-ink/15 px-6 md:px-10 py-10 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <GrytLogo className="on-light" />
          <span className="label-meta opacity-60">PITTSBURGH, PA · DO HARD THINGS TOGETHER</span>
        </div>
        <div className="flex items-center gap-6 label-meta">
          <a href={STRAVA_URL} target="_blank" rel="noopener noreferrer" className="hover:text-sky-brand">STRAVA</a>
          <a href={HEYLO_URL} target="_blank" rel="noopener noreferrer" className="hover:text-sky-brand">HEYLO</a>
          <a href="mailto:hi@gryt.club" className="hover:text-sky-brand">CONTACT</a>
        </div>
      </footer>
    </main>
  );
}
