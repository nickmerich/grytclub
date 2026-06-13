import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { getEventBySlug, type EventDetail } from "@/lib/events.functions";
import { RsvpForm } from "@/components/RsvpForm";
import { RouteMap } from "@/components/RouteMap";
import { CheckinPanel } from "@/components/CheckinPanel";

export const Route = createFileRoute("/runs/$slug")({
  loader: ({ params }) => getEventBySlug({ data: { slug: params.slug } }),
  head: ({ loaderData }) => {
    const ev = loaderData as EventDetail | undefined;
    const title = ev ? `${ev.title} — GRYT Run Club` : "Run — GRYT Run Club";
    const desc = ev
      ? `${formatLongDate(ev.event_date)} at ${formatTime(ev.start_time)}. ${ev.location_name}${ev.distance_mi ? ` · ~${ev.distance_mi} mi` : ""}. All paces welcome.`
      : "Upcoming GRYT run.";
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
      ],
    };
  },
  component: RunDetailPage,
  errorComponent: RunError,
  notFoundComponent: RunNotFound,
});

function RunError({ error, reset }: { error: Error; reset: () => void }) {
  const router = useRouter();
  return (
    <main className="min-h-screen bg-ink text-bone px-6 py-24">
      <div className="mx-auto max-w-xl text-center">
        <p className="label-meta text-sky-brand">● COULDN'T LOAD RUN</p>
        <div className="rule-thin bg-sky-brand mt-2 mb-4 mx-auto max-w-[60px]" />
        <h1 className="font-display text-3xl">Something broke loading this run.</h1>
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

function RunNotFound() {
  return (
    <main className="min-h-screen bg-ink text-bone px-6 py-24">
      <div className="mx-auto max-w-xl text-center">
        <p className="label-meta text-sky-brand">● RUN NOT FOUND</p>
        <div className="rule-thin bg-sky-brand mt-2 mb-4 mx-auto max-w-[60px]" />
        <h1 className="font-display text-3xl">That run isn't on the board.</h1>
        <p className="mt-3 text-bone/70">It may have already happened or isn't published yet.</p>
        <Link
          to="/runs"
          className="mt-6 inline-flex items-center border border-bone/40 text-bone px-6 py-3 label-meta hover:border-sky-brand hover:text-sky-brand transition-colors"
        >
          ← ALL UPCOMING RUNS
        </Link>
      </div>
    </main>
  );
}

function formatLongDate(iso: string): string {
  const d = new Date(`${iso}T12:00:00Z`);
  return d.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

function formatTime(t: string): string {
  const [hh, mm] = t.split(":");
  const h = Number(hh);
  const suffix = h >= 12 ? "PM" : "AM";
  const h12 = ((h + 11) % 12) + 1;
  return mm === "00" ? `${h12} ${suffix}` : `${h12}:${mm} ${suffix}`;
}

function RunDetailPage() {
  const ev = Route.useLoaderData() as EventDetail;

  return (
    <main className="min-h-screen bg-ink text-bone">
      <header className="border-b border-bone/15 px-6 py-10 md:py-14">
        <div className="mx-auto max-w-5xl">
          <Link to="/runs" className="label-meta text-bone/60 hover:text-sky-brand">
            ← ALL RUNS
          </Link>
          <p className="label-meta text-sky-brand mt-6">● {formatLongDate(ev.event_date).toUpperCase()}</p>
          <div className="rule-thin bg-sky-brand mt-2 mb-4 max-w-[60px]" />
          <h1 className="font-display text-4xl md:text-6xl leading-[0.95]">{ev.title}</h1>
          <p className="mt-4 text-bone/70 text-lg">
            {formatTime(ev.start_time)} · {ev.location_name}
          </p>
          {ev.event_date < new Date().toISOString().slice(0, 10) && (
            <Link
              to="/runs/$slug/recap"
              params={{ slug: ev.slug }}
              className="mt-6 inline-flex items-center bg-sky-brand text-ink px-6 py-3 label-meta hover:bg-bone transition-colors"
            >
              ↓ POST-RUN RECAP CARD
            </Link>
          )}
        </div>
      </header>

      <section className="px-6 py-10 md:py-14">
        <div className="mx-auto max-w-5xl grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-10">
          <div className="md:col-span-2 space-y-8">
            <dl className="grid grid-cols-2 gap-6 border border-bone/20 p-6 md:p-8">
              <Field label="DATE" value={formatLongDate(ev.event_date)} />
              <Field label="TIME" value={formatTime(ev.start_time)} />
              <Field
                label="DISTANCE"
                value={ev.distance_mi != null ? `~${ev.distance_mi} mi` : "—"}
              />
              <Field label="PACE" value={ev.pace_label ?? "All paces"} />
              <Field label="HOST" value={ev.host_name ?? "GRYT Crew"} />
              <Field
                label="CAPACITY"
                value={ev.capacity != null ? `${ev.capacity} runners` : "Open"}
              />
            </dl>

            {ev.description && (
              <div>
                <p className="label-meta text-sky-brand">● THE RUN</p>
                <div className="rule-thin bg-sky-brand mt-2 mb-4 max-w-[60px]" />
                <p className="text-bone/80 whitespace-pre-line leading-relaxed">
                  {ev.description}
                </p>
              </div>
            )}

            <div>
              <p className="label-meta text-sky-brand">● MEETING SPOT</p>
              <div className="rule-thin bg-sky-brand mt-2 mb-4 max-w-[60px]" />
              <p className="text-bone/80">
                {ev.location_name}
                {ev.location_address && (
                  <>
                    <br />
                    <span className="text-bone/60">{ev.location_address}</span>
                  </>
                )}
              </p>
              <div className="mt-4">
                <RouteMap />
              </div>
            </div>

            <CheckinPanel eventId={ev.id} eventDate={ev.event_date} />
          </div>

          <aside className="md:col-span-1">
            <div className="md:sticky md:top-6">
              <RsvpForm
                eventKey={ev.slug}
                eventDateLabel={formatLongDate(ev.event_date)}
                eventTimeLabel={formatTime(ev.start_time)}
                eventLocationLabel={ev.location_name}
              />
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="label-meta text-bone/50">{label}</dt>
      <dd className="font-display text-xl mt-1">{value}</dd>
    </div>
  );
}
