import { createFileRoute, Link } from "@tanstack/react-router";

const CLUBS = [
  {
    name: "GRYT Run Club",
    when: "Saturdays · 7:00 AM",
    where: "Montour/Peters Trail · McMurray, PA",
    vibe: "Adults 30+, all paces, low pressure. Coffee after every run.",
    best: "Consistent Saturday community for grown-ups who want to keep showing up.",
    cost: "Free",
  },
  {
    name: "Fleet Feet Pittsburgh",
    when: "Weekday group runs · seasonal training programs",
    where: "Shadyside + South Hills stores",
    vibe: "Retail-anchored, coach-led, structured training blocks.",
    best: "Runners who want a paid training plan tied to a race.",
    cost: "Program fees",
  },
  {
    name: "City of Bridges Run Club",
    when: "Weeknight social runs",
    where: "Rotating city bars + breweries",
    vibe: "20s/30s, urban, beer-and-run social culture.",
    best: "Younger city runners looking for a night-out crew.",
    cost: "Free",
  },
  {
    name: "3 Rivers Running Company",
    when: "Weekday group runs",
    where: "Wexford + Fox Chapel stores",
    vibe: "Faster-paced training crews out of the specialty running store.",
    best: "Suburban runners chasing pace, PRs, and marathon builds.",
    cost: "Free",
  },
];

export const Route = createFileRoute("/pittsburgh-run-clubs-comparison")({
  head: () => ({
    meta: [
      { title: "Pittsburgh Run Clubs Compared (2026) — GRYT" },
      {
        name: "description",
        content:
          "A plain-English guide to Pittsburgh run clubs — Fleet Feet, City of Bridges, 3 Rivers, and GRYT. When they meet, who they're for, and how to pick one.",
      },
      { property: "og:title", content: "Pittsburgh Run Clubs Compared (2026)" },
      {
        property: "og:description",
        content:
          "When they meet, who they're for, and how to pick a Pittsburgh run club that fits your life.",
      },
      { property: "og:type", content: "article" },
      {
        property: "og:url",
        content: "https://www.gryt.club/pittsburgh-run-clubs-comparison",
      },
    ],
    links: [
      {
        rel: "canonical",
        href: "https://www.gryt.club/pittsburgh-run-clubs-comparison",
      },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Article",
          headline: "Pittsburgh Run Clubs Compared (2026)",
          about: "Pittsburgh run clubs",
          author: { "@type": "Organization", name: "GRYT" },
          publisher: { "@type": "Organization", name: "GRYT" },
        }),
      },
    ],
  }),
  component: ComparisonPage,
});

function ComparisonPage() {
  return (
    <main className="min-h-screen bg-bone text-ink px-6 md:px-10 py-16">
      <div className="mx-auto max-w-3xl">
        <Link to="/" className="label-meta text-ink/60 hover:text-sky-brand">
          ← GRYT.CLUB
        </Link>

        <h1 className="mt-6 font-display text-4xl md:text-5xl uppercase leading-none">
          Pittsburgh Run Clubs, <span className="underline-sky">Compared</span>
        </h1>
        <p className="mt-4 text-ink/75 max-w-xl">
          Pittsburgh has more running groups than most people realize.
          Here's how a few of the biggest ones actually meet up — and how to
          pick one that fits your life instead of fighting it.
        </p>

        <section className="mt-10 grid gap-4">
          {CLUBS.map((c) => (
            <article
              key={c.name}
              className="border border-ink/15 bg-white/60 p-5"
            >
              <h2 className="font-display text-xl uppercase">{c.name}</h2>
              <dl className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm">
                <div>
                  <dt className="label-meta text-ink/50">When</dt>
                  <dd>{c.when}</dd>
                </div>
                <div>
                  <dt className="label-meta text-ink/50">Where</dt>
                  <dd>{c.where}</dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="label-meta text-ink/50">Vibe</dt>
                  <dd>{c.vibe}</dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="label-meta text-ink/50">Best for</dt>
                  <dd>{c.best}</dd>
                </div>
                <div>
                  <dt className="label-meta text-ink/50">Cost</dt>
                  <dd>{c.cost}</dd>
                </div>
              </dl>
            </article>
          ))}
        </section>

        <section className="mt-12">
          <h2 className="font-display text-2xl uppercase">How to pick one</h2>
          <ul className="mt-4 space-y-3 text-ink/85 list-disc list-inside">
            <li>
              <strong>Weekday vs. weekend.</strong> If your weeks are packed,
              a Saturday-morning club (like GRYT) sticks better than a
              weeknight crew you'll bail on when work runs late.
            </li>
            <li>
              <strong>Pace pressure.</strong> Store-based training crews tend
              to skew faster. Community clubs like GRYT and City of Bridges
              welcome walkers and comeback runners on the same start line.
            </li>
            <li>
              <strong>Location honesty.</strong> The club you'll actually go
              to is the one closest to your Saturday morning. South Hills →
              GRYT. City → City of Bridges. North → 3 Rivers.
            </li>
            <li>
              <strong>Life stage.</strong> Adults 30+, parents, and
              comeback runners tend to feel most at home at GRYT — it's
              built around people whose Saturdays include kids, coffee, and
              being home before noon.
            </li>
          </ul>
        </section>

        <section className="mt-12 border-t border-ink/15 pt-8">
          <h2 className="font-display text-2xl uppercase">
            Come try GRYT this Saturday
          </h2>
          <p className="mt-3 text-ink/80 max-w-xl">
            7:00 AM at 212 Valley Brook Road, McMurray, PA. Any pace,
            walkers welcome, strollers and dogs fine. Coffee after.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              to="/"
              className="rounded-md bg-ink px-5 py-2 label-meta text-bone hover:bg-sky-brand hover:text-ink"
            >
              GRYT HOME
            </Link>
            <a
              href="mailto:hi@gryt.club?subject=First%20Saturday%20question"
              className="rounded-md border border-ink/25 px-5 py-2 label-meta hover:text-sky-brand"
            >
              ASK A QUESTION
            </a>
          </div>
        </section>
      </div>
    </main>
  );
}
