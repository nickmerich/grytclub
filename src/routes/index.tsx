import { createFileRoute } from "@tanstack/react-router";
import { type ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { RouteMap } from "@/components/RouteMap";

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
const STRAVA_EMBED_SRC =
  "https://www.strava.com/clubs/1708552/latest-rides/b76ca42ddb400c392ceee3ee06c641b84d840862";

/* ─── Resources for "Learn More" ─── */
const RESOURCES = [
  {
    tag: "GETTING STARTED",
    title: "Couch to your first Saturday.",
    body: "A simple 4-week walk-run ramp built for people coming back to running after a long break.",
    cta: "Read the guide",
    href: "#",
  },
  {
    tag: "TRAINING",
    title: "Building a base that holds.",
    body: "How to layer easy mileage so Saturday gets easier instead of harder. No junk miles, no plans you'll abandon.",
    cta: "Open the playbook",
    href: "#",
  },
  {
    tag: "CONSISTENCY",
    title: "The Saturday streak system.",
    body: "How members are stacking weeks — and what actually keeps people showing up past week six.",
    cta: "See the system",
    href: "#",
  },
  {
    tag: "RECOVERY",
    title: "Run hard, recover harder.",
    body: "Mobility, sleep, and the small things that let parents and 30+ runners train without breaking down.",
    cta: "Read the basics",
    href: "#",
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
            <a href="#who" className="hover:text-sky-brand transition-colors">WHO SHOWS UP</a>
            <a href="#learn" className="hover:text-sky-brand transition-colors">LEARN MORE</a>
          </nav>
          <a
            href={STRAVA_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden md:inline-flex items-center justify-center bg-sky-brand text-ink px-4 py-2.5 label-meta hover:bg-bone transition-colors"
          >
            EVENTS ON STRAVA →
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
            className="font-display text-[11vw] md:text-[7.5vw] lg:text-[6.2vw] leading-[0.9] max-w-5xl"
          >
            <span className="sr-only">GRYT — </span>
            Pittsburgh run club for{" "}
            <span className="underline-sky">parents and 30+</span>{" "}
            who do hard things together.
          </motion.h1>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.35 }}
            className="mt-10 md:mt-12 max-w-2xl"
          >
            <p className="text-base md:text-lg text-bone/85 leading-snug">
              Every Saturday at 7 AM we meet on the Montour/Peters Trail in McMurray, run a few miles,
              talk through mile two, and stay for coffee. All paces. Just show up.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <a
                href={STRAVA_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center bg-sky-brand text-ink px-6 py-3.5 label-meta hover:bg-bone transition-colors"
              >
                EVENTS & STATS ON STRAVA →
              </a>
              <a
                href={HEYLO_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center border border-bone/60 text-bone px-6 py-3.5 label-meta hover:bg-bone hover:text-ink transition-colors"
              >
                GROUP CHAT ON HEYLO →
              </a>
            </div>

            <p className="mt-6 label-meta text-bone/55">
              25+ MEMBERS · WEEKLY SINCE DAY ONE · PARENTS & 30+ WELCOME
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
                Every Saturday. <br />
                <span className="underline-sky">7:00 AM.</span> McMurray, PA.
              </h2>
              <p className="max-w-md text-bone/70 leading-snug">
                212 Valley Brook Road, McMurray. We run on the Montour/Peters Trail —
                mixed paces, no one left behind, coffee after.
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
                this is what showing up <span className="underline-sky">looks like.</span>
              </p>
              <div className="flex-1 flex items-start justify-center">
                <div className="w-full max-w-[320px] border border-ink/15 bg-pure shadow-[6px_6px_0_0_var(--ink)]">
                  <iframe
                    title="GRYT Strava club — latest rides"
                    src={STRAVA_EMBED_SRC}
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
              EVENTS & STATS ON STRAVA →
            </a>
            <a
              href={HEYLO_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center border border-bone/60 text-bone px-6 py-3.5 label-meta hover:bg-bone hover:text-ink transition-colors"
            >
              GROUP CHAT ON HEYLO →
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
              For people who are <span className="underline-sky">already choosing</span> discomfort.
            </h2>
            <p className="mt-6 max-w-2xl text-ink/70 leading-snug text-base md:text-lg">
              GRYT isn't for everyone — and it's not trying to be. It's for the kind of person who
              already knows the answer is to keep showing up. We just give you the ritual, the route,
              and the people to do it with.
            </p>
          </Reveal>

          <div className="mt-14 md:mt-20 grid grid-cols-1 md:grid-cols-2 gap-px bg-ink/15">
            {[
              {
                tag: "01 · THE PARENT",
                title: "You're back before the kids wake up.",
                body: "You need one thing on the calendar that's just yours — early enough that nobody else is affected, hard enough that it counts. Saturday at 7 is that thing.",
              },
              {
                tag: "02 · THE 30+ COMEBACK",
                title: "You used to run. You will again.",
                body: "It's been a year. Or five. You don't need a plan or a Garmin — you need a group that hangs at every regroup and treats you like you belong. We are that group.",
              },
              {
                tag: "03 · THE BUILDER",
                title: "You want structure and a real community.",
                body: "You're past the phase of optimizing alone in headphones. You want people who'll notice if you don't show up, and a standing time you don't have to negotiate every week.",
              },
              {
                tag: "04 · THE STREAKER",
                title: "You're trying to become someone consistent.",
                body: "One Saturday is a workout. Twelve Saturdays is a habit. Fifty is a different person. You're here for the long version — and you'd rather not do it alone.",
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

          <div className="mt-12 flex flex-wrap items-center gap-3">
            <a
              href={STRAVA_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center bg-ink text-bone px-6 py-3.5 label-meta hover:bg-sky-brand hover:text-ink transition-colors"
            >
              SEE EVENTS ON STRAVA →
            </a>
            <a
              href={HEYLO_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center border border-ink text-ink px-6 py-3.5 label-meta hover:bg-ink hover:text-bone transition-colors"
            >
              JOIN THE GROUP CHAT
            </a>
          </div>
        </div>
      </section>

      {/* ═══════════════════════ 4. LEARN MORE ═══════════════════════ */}
      <section
        id="learn"
        className="bg-ink text-bone py-20 md:py-28 border-t border-bone/10 relative overflow-hidden"
      >
        <div className="absolute inset-0 dot-grid pointer-events-none" />
        <DiagonalSlash className="bottom-[10%] -left-[20%] opacity-50" thickness={1} length="80%" />

        <div className="relative z-10 px-6 md:px-10">
          <Reveal>
            <Label className="text-bone">Learn more</Label>
            <div className="rule-thin bg-bone mt-2 mb-6 max-w-xs" />
            <div className="flex flex-wrap items-end justify-between gap-6">
              <h2 className="font-display text-5xl md:text-7xl max-w-4xl">
                Resources to <span className="underline-sky">run better,</span>
                <br /> stay consistent, become stronger.
              </h2>
              <p className="max-w-md text-bone/70 leading-snug">
                Practical guides built around how we actually train and recover. Less theory, more
                what works for people with full lives.
              </p>
            </div>
          </Reveal>

          <div className="mt-14 md:mt-20 grid grid-cols-1 md:grid-cols-2 gap-px bg-bone/15">
            {RESOURCES.map((r, i) => (
              <Reveal key={r.tag} delay={i * 0.05}>
                <a
                  href={r.href}
                  className="bg-ink p-7 md:p-10 h-full flex flex-col group hover:bg-bone hover:text-ink transition-colors"
                >
                  <div className="label-meta text-sky-brand group-hover:text-ink">{r.tag}</div>
                  <h3 className="font-display text-2xl md:text-3xl mt-3 leading-[1.05]">
                    {r.title}
                  </h3>
                  <p className="mt-4 text-bone/75 group-hover:text-ink/70 leading-snug flex-1">
                    {r.body}
                  </p>
                  <div className="mt-6 label-meta inline-flex items-center gap-2">
                    {r.cta} →
                  </div>
                </a>
              </Reveal>
            ))}
          </div>

          <div className="mt-16 border border-bone/20 p-8 md:p-12 flex flex-wrap items-center justify-between gap-6">
            <div className="max-w-xl">
              <Label className="text-bone">Still here?</Label>
              <div className="rule-thin bg-bone mt-2 mb-4 max-w-[80px]" />
              <p className="font-display text-3xl md:text-4xl leading-tight">
                The resources are nice. The Saturday run is <span className="underline-sky">the point.</span>
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <a
                href={STRAVA_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center bg-sky-brand text-ink px-6 py-3.5 label-meta hover:bg-bone transition-colors"
              >
                EVENTS & STATS ON STRAVA →
              </a>
              <a
                href={HEYLO_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center border border-bone/60 text-bone px-6 py-3.5 label-meta hover:bg-bone hover:text-ink transition-colors"
              >
                GROUP CHAT ON HEYLO →
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
