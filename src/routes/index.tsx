import { createFileRoute } from "@tanstack/react-router";

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

function Label({ children }: { children: React.ReactNode }) {
  return <div className="label-meta text-current/70">{children}</div>;
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-2">
      <Label>{label}</Label>
      <div className="rule-thin" />
      <div className="font-display text-2xl md:text-3xl">{value}</div>
    </div>
  );
}

function Index() {
  return (
    <main className="bg-bone text-ink overflow-hidden">
      {/* ─────────── HERO ─────────── */}
      <section className="relative bg-ink text-bone min-h-screen flex flex-col justify-between overflow-hidden">
        <div className="absolute inset-0 dot-grid pointer-events-none" />
        <div className="slash-hero" />

        {/* Top bar */}
        <header className="relative z-10 flex items-center justify-between px-6 md:px-10 pt-6 md:pt-8">
          <div className="font-display text-2xl md:text-3xl tracking-tight lowercase">
            gryt
          </div>
          <div className="label-meta text-bone/70">NYC · EST. RUN</div>
        </header>

        {/* Headline */}
        <div className="relative z-10 px-6 md:px-10 pb-16 md:pb-24 pt-24 md:pt-32">
          <div className="label-meta text-sky-brand mb-6 md:mb-10">
            ◣ THIS SATURDAY
          </div>
          <h1 className="font-display text-[18vw] md:text-[14vw] lg:text-[12vw] leading-[0.85]">
            <span className="block">WE RUN</span>
            <span className="block">
              THE <span className="underline-sky">RIVER.</span>
            </span>
          </h1>

          {/* Meta row + CTA */}
          <div className="mt-12 md:mt-16 flex flex-col md:flex-row md:items-end md:justify-between gap-8">
            <div className="flex flex-col gap-2 max-w-md">
              <Label>Meet up</Label>
              <div className="rule-thin bg-bone" />
              <p className="text-base md:text-lg text-bone/90 leading-snug">
                gryt.run · this saturday · 6:30 am · east river park.
                any pace. all welcome.
              </p>
            </div>

            <a
              href="#rsvp"
              className="group inline-flex items-center justify-center bg-bone text-ink px-10 py-5 font-display text-xl md:text-2xl hover:bg-sky-brand transition-colors"
            >
              RSVP →
            </a>
          </div>
        </div>
      </section>

      {/* ─────────── NEXT RUN CARD ─────────── */}
      <section className="bg-ink text-bone border-t border-bone/10">
        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Left: Date */}
          <div className="relative p-8 md:p-12 lg:p-16 border-b md:border-b-0 md:border-r border-bone/15 overflow-hidden">
            <div className="slash-corner -top-4 -right-10" />
            <Label>Next run</Label>
            <div className="rule-thin bg-bone mt-2 mb-8" />
            <div className="font-display text-7xl md:text-8xl lg:text-[9rem] leading-[0.85]">
              SAT
              <span className="text-sky-brand">.</span>
            </div>
            <div className="font-display text-4xl md:text-5xl mt-4">
              6:30 AM
            </div>
            <p className="mt-8 text-bone/70 max-w-sm">
              show up. shut up. run. the river doesn't care if you're tired.
            </p>
          </div>

          {/* Right: 2x2 grid */}
          <div className="grid grid-cols-2 text-bone">
            {[
              { label: "Distance", value: "5 MI" },
              { label: "Pace", value: "ANY" },
              { label: "Start", value: "EAST RIVER PARK" },
              { label: "After", value: "COFFEE AT SEY" },
            ].map((s, i) => (
              <div
                key={s.label}
                className={`p-6 md:p-10 ${
                  i % 2 === 0 ? "border-r" : ""
                } ${i < 2 ? "border-b" : ""} border-bone/15`}
              >
                <Stat label={s.label} value={s.value} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────── HOW TO SHOW UP ─────────── */}
      <section className="bg-bone text-ink py-16 md:py-24">
        <div className="px-6 md:px-10 mb-10 md:mb-14">
          <Label>How to show up</Label>
          <div className="rule-thin bg-ink mt-2 mb-6 max-w-xs" />
          <h2 className="font-display text-5xl md:text-7xl max-w-3xl">
            FOUR RULES.
            <br />
            THAT'S <span className="underline-sky">IT.</span>
          </h2>
        </div>

        <div className="flex gap-4 md:gap-6 overflow-x-auto px-6 md:px-10 pb-6 snap-x snap-mandatory">
          {[
            {
              n: "1/4",
              bg: "bg-ink",
              fg: "text-bone",
              title: "JUST COME",
              body: "no rsvp form. no group chat tax. you saw the post, you're invited.",
            },
            {
              n: "2/4",
              bg: "bg-sky-brand",
              fg: "text-ink",
              title: "ANY PACE",
              body: "front of the pack, back of the pack, walking it in. all the same to us.",
            },
            {
              n: "3/4",
              bg: "bg-bone border border-ink",
              fg: "text-ink",
              title: "RUN HARD",
              body: "soft is fine. easy is fine. but pick one mile and try.",
            },
            {
              n: "4/4",
              bg: "bg-ink",
              fg: "text-bone",
              title: "STAY FOR COFFEE",
              body: "the run is half of it. meet someone. talk. then go live your life.",
            },
          ].map((card) => (
            <article
              key={card.n}
              className={`relative shrink-0 snap-start w-[80vw] sm:w-[60vw] md:w-[360px] aspect-[9/14] ${card.bg} ${card.fg} p-6 md:p-8 flex flex-col justify-between overflow-hidden`}
            >
              {card.bg.includes("ink") && (
                <div className="absolute inset-0 dot-grid pointer-events-none" />
              )}
              <div className="relative z-10 flex items-start justify-between">
                <div className="label-meta">GRYT · STORY</div>
                <div className="font-display text-2xl">{card.n}</div>
              </div>
              <div className="relative z-10">
                <h3 className="font-display text-4xl md:text-5xl leading-[0.9]">
                  {card.title}
                </h3>
                <div
                  className={`h-[3px] w-16 my-5 ${
                    card.bg.includes("sky") ? "bg-ink" : "bg-sky-brand"
                  }`}
                />
                <p className="text-base leading-snug max-w-[28ch]">
                  {card.body}
                </p>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* ─────────── RECAP STRIP ─────────── */}
      <section className="bg-bone text-ink py-16 md:py-24 border-t border-ink/10">
        <div className="px-6 md:px-10">
          <Label>Last saturday</Label>
          <div className="rule-thin bg-ink mt-2 mb-6 max-w-xs" />
          <h2 className="font-display text-6xl md:text-8xl lg:text-9xl">
            42 SHOWED <span className="underline-sky">UP.</span>
          </h2>

          {/* Stat row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-ink/15 mt-12 md:mt-16">
            {[
              { label: "Runners", value: "42" },
              { label: "First-timers", value: "09" },
              { label: "Miles", value: "210" },
              { label: "Temp", value: "41°F" },
            ].map((s) => (
              <div key={s.label} className="bg-bone p-6 md:p-8">
                <Stat label={s.label} value={s.value} />
              </div>
            ))}
          </div>

          {/* Tag cloud of names */}
          <div className="mt-14 md:mt-20">
            <Label>On the roster</Label>
            <div className="rule-thin bg-ink mt-2 mb-6 max-w-xs" />
            <p className="font-display text-2xl md:text-4xl leading-tight max-w-5xl flex flex-wrap gap-x-3 gap-y-2">
              {[
                ["MAYA", false],
                ["JON", false],
                ["PRIYA", true],
                ["DEV", false],
                ["ROSA", false],
                ["SAM", true],
                ["KOFI", false],
                ["LENA", false],
                ["MIKAEL", true],
                ["JESS", false],
                ["TONY", false],
                ["AYA", true],
                ["HAN", false],
                ["BEN", false],
                ["NORA", true],
                ["ZAK", false],
                ["ELI", false],
                ["RUTH", true],
                ["CARLO", false],
                ["MEI", false],
                ["JAS", true],
                ["OMAR", false],
                ["LULU", false],
                ["DREW", true],
                ["KAI", false],
                ["VERA", false],
                ["TEO", false],
                ["NIA", true],
                ["ISA", false],
                ["WILL", false],
                ["FINN", false],
                ["AMARA", true],
              ].map(([name, isFirst]) => (
                <span key={name as string}>
                  {isFirst ? (
                    <span className="mark-sky">{name}</span>
                  ) : (
                    <span>{name}</span>
                  )}
                  <span className="text-ink/30">·</span>
                </span>
              ))}
            </p>
            <p className="label-meta mt-6 text-ink/60">
              ◣ HIGHLIGHTED = FIRST RUN WITH GRYT
            </p>
          </div>
        </div>
      </section>

      {/* ─────────── MEMBERSHIP CARD ─────────── */}
      <section
        id="rsvp"
        className="bg-ink text-bone py-20 md:py-28 relative overflow-hidden"
      >
        <div className="absolute inset-0 dot-grid pointer-events-none" />
        <div className="px-6 md:px-10 relative z-10">
          <Label>Membership · free forever</Label>
          <div className="rule-thin bg-bone mt-2 mb-6 max-w-xs" />
          <h2 className="font-display text-5xl md:text-7xl mb-12 md:mb-16 max-w-3xl">
            CARRY THE <span className="underline-sky">CARD.</span>
          </h2>

          {/* Card mockup */}
          <div className="relative max-w-xl bg-bone text-ink p-7 md:p-9 aspect-[1.6/1] flex flex-col justify-between shadow-[12px_12px_0_0_var(--sky)] overflow-hidden">
            <div className="absolute -top-6 -right-12 w-2/3 h-12 bg-sky-brand -rotate-[15deg]" />
            <div className="relative z-10 flex items-start justify-between">
              <div className="font-display text-4xl lowercase tracking-tight">
                gryt
              </div>
              <div className="label-meta text-ink/60">NO. 0042</div>
            </div>

            <div className="relative z-10">
              <Label>Member</Label>
              <div className="rule-thin bg-ink mt-1 mb-2" />
              <div className="font-display text-2xl md:text-3xl">
                ____________________
              </div>
            </div>

            <div className="relative z-10">
              <p className="font-display text-sm md:text-base leading-tight max-w-[28ch]">
                DO HARD THINGS{" "}
                <span className="underline-sky">TOGETHER.</span>
              </p>
              <p className="label-meta mt-4 text-ink/60 leading-relaxed">
                IF FOUND, RETURN TO GRYT
                <br />
                EAST RIVER PARK · NYC
              </p>
            </div>
          </div>

          <a
            href="#"
            className="inline-flex items-center justify-center bg-sky-brand text-ink px-10 py-5 mt-12 font-display text-xl md:text-2xl hover:bg-bone transition-colors"
          >
            CLAIM YOUR CARD →
          </a>
        </div>
      </section>

      {/* ─────────── FOOTER ─────────── */}
      <footer className="bg-ink text-bone pt-20 pb-10 relative overflow-hidden border-t border-bone/10">
        <div className="absolute inset-0 dot-grid pointer-events-none" />
        <div className="slash-corner -bottom-4 -left-10" />

        <div className="relative z-10 px-6 md:px-10">
          <h3 className="font-display lowercase text-[28vw] md:text-[20vw] leading-[0.8] tracking-tighter">
            gryt
          </h3>

          <div className="mt-10 md:mt-14 grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-6">
            <div>
              <Label>Tagline</Label>
              <div className="rule-thin bg-bone mt-2 mb-4" />
              <p className="font-display text-2xl md:text-3xl leading-tight">
                DO HARD THINGS{" "}
                <span className="underline-sky">TOGETHER.</span>
              </p>
            </div>

            <div>
              <Label>Find us</Label>
              <div className="rule-thin bg-bone mt-2 mb-4" />
              <ul className="space-y-2 text-base">
                <li>
                  <a href="#" className="hover:text-sky-brand">
                    instagram / @gryt.run
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-sky-brand">
                    strava / gryt nyc
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-sky-brand">
                    email / hi@gryt.run
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <Label>This week</Label>
              <div className="rule-thin bg-bone mt-2 mb-4" />
              <a
                href="#"
                className="font-display text-3xl md:text-4xl hover:text-sky-brand"
              >
                gryt.run/sat →
              </a>
              <p className="text-bone/60 mt-3 text-sm">
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
