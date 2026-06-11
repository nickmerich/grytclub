import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { listUpcomingEvents, type EventListItem } from "@/lib/events.functions";

export const Route = createFileRoute("/runs")({
  head: () => ({
    meta: [
      { title: "Upcoming Runs — GRYT Run Club" },
      {
        name: "description",
        content:
          "Every upcoming GRYT run in the Pittsburgh metro. Saturdays at 7 AM on the Montour/Peters Trail in McMurray, PA. All paces welcome.",
      },
      { property: "og:title", content: "Upcoming Runs — GRYT Run Club" },
      {
        property: "og:description",
        content:
          "Every upcoming GRYT run in the Pittsburgh metro. Saturdays at 7 AM. All paces welcome.",
      },
    ],
  }),
  loader: () => listUpcomingEvents(),
  component: RunsPage,
  errorComponent: RunsError,
  notFoundComponent: () => <RunsEmpty />,
});

function RunsError({ error, reset }: { error: Error; reset: () => void }) {
  const router = useRouter();
  return (
    <main className="min-h-screen bg-ink text-bone px-6 py-24">
      <div className="mx-auto max-w-xl text-center">
        <p className="label-meta text-sky-brand">● COULDN'T LOAD RUNS</p>
        <div className="rule-thin bg-sky-brand mt-2 mb-4 mx-auto max-w-[60px]" />
        <h1 className="font-display text-3xl">Something broke loading the schedule.</h1>
        {import.meta.env.DEV && (
          <pre className="mt-4 text-left text-xs text-bone/60 overflow-auto">{error.message}</pre>
        )}
        <button
          onClick={() => {
            router.invalidate();
            reset();
          }}
          className="mt-6 inline-flex items-center bg-sky-brand text-ink px-6 py-3 label-meta hover:bg-bone transition-colors"
        >
          TRY AGAIN
        </button>
      </div>
    </main>
  );
}

function RunsEmpty() {
  return (
    <main className="min-h-screen bg-ink text-bone px-6 py-24">
      <div className="mx-auto max-w-xl text-center">
        <p className="label-meta text-sky-brand">● NOTHING ON THE CALENDAR YET</p>
        <div className="rule-thin bg-sky-brand mt-2 mb-4 mx-auto max-w-[60px]" />
        <h1 className="font-display text-3xl">No upcoming runs are published.</h1>
        <p className="mt-3 text-bone/70">Check back soon — Saturdays at 7 AM are the regular cadence.</p>
        <Link
          to="/"
          className="mt-6 inline-flex items-center border border-bone/40 text-bone px-6 py-3 label-meta hover:border-sky-brand hover:text-sky-brand transition-colors"
        >
          ← BACK HOME
        </Link>
      </div>
    </main>
  );
}

function formatDate(iso: string): { weekday: string; date: string } {
  // iso is YYYY-MM-DD; build a date at noon UTC to avoid TZ slippage.
  const d = new Date(`${iso}T12:00:00Z`);
  const weekday = d.toLocaleDateString("en-US", { weekday: "short", timeZone: "UTC" }).toUpperCase();
  const date = d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
  return { weekday, date };
}

function formatTime(t: string): string {
  // t is HH:MM:SS
  const [hh, mm] = t.split(":");
  const h = Number(hh);
  const suffix = h >= 12 ? "PM" : "AM";
  const h12 = ((h + 11) % 12) + 1;
  return mm === "00" ? `${h12} ${suffix}` : `${h12}:${mm} ${suffix}`;
}

function RunsPage() {
  const events = Route.useLoaderData() as EventListItem[];

  if (events.length === 0) return <RunsEmpty />;

  return (
    <main className="min-h-screen bg-ink text-bone">
      <header className="border-b border-bone/15 px-6 py-10 md:py-14">
        <div className="mx-auto max-w-5xl">
          <Link to="/" className="label-meta text-bone/60 hover:text-sky-brand">
            ← GRYT
          </Link>
          <p className="label-meta text-sky-brand mt-6">● UPCOMING RUNS</p>
          <div className="rule-thin bg-sky-brand mt-2 mb-4 max-w-[60px]" />
          <h1 className="font-display text-4xl md:text-6xl leading-[0.95]">
            Every run on the board.
          </h1>
          <p className="mt-4 text-bone/70 max-w-xl">
            Pittsburgh metro. All paces. Saturdays at 7 AM on the Montour/Peters Trail unless noted.
          </p>
        </div>
      </header>

      <section className="px-6 py-10 md:py-14">
        <ul className="mx-auto max-w-5xl space-y-4">
          {events.map((ev) => {
            const { weekday, date } = formatDate(ev.event_date);
            return (
              <li key={ev.id}>
                {/* TODO: swap to <Link to="/runs/$slug" params={{ slug: ev.slug }} /> once that route exists (Prompt 3). */}
                <a
                  href={`/runs/${ev.slug}`}
                  className="block border border-bone/20 hover:border-sky-brand transition-colors p-6 md:p-8 group"
                >
                  <div className="grid grid-cols-1 md:grid-cols-[160px_1fr_auto] gap-4 md:gap-8 items-start">
                    <div>
                      <p className="label-meta text-sky-brand">{weekday}</p>
                      <p className="font-display text-2xl md:text-3xl mt-1">{date}</p>
                      <p className="label-meta text-bone/60 mt-1">{formatTime(ev.start_time)}</p>
                    </div>
                    <div>
                      <h2 className="font-display text-xl md:text-2xl leading-tight">{ev.title}</h2>
                      <p className="mt-2 text-bone/70 text-sm">
                        {ev.location_name}
                        {ev.location_address ? ` · ${ev.location_address}` : ""}
                      </p>
                      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 label-meta text-bone/60">
                        {ev.distance_mi != null && <span>~{ev.distance_mi} MI</span>}
                        {ev.pace_label && <span>{ev.pace_label.toUpperCase()}</span>}
                        {ev.host_name && <span>HOST: {ev.host_name.toUpperCase()}</span>}
                      </div>
                    </div>
                    <div className="md:self-center">
                      <span className="label-meta text-bone group-hover:text-sky-brand transition-colors">
                        DETAILS →
                      </span>
                    </div>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>
    </main>
  );
}
