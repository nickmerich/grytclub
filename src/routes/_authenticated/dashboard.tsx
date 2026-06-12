import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getDashboard } from "@/lib/dashboard.functions";
import { getMyProfile } from "@/lib/profiles.functions";
import { getMyInviteStats } from "@/lib/social.functions";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — GRYT" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: DashboardPage,
});

function formatDate(iso: string) {
  const d = new Date(iso + "T00:00:00Z");
  return d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", timeZone: "UTC" });
}

function formatTime(t: string) {
  // t is "HH:MM:SS"
  const [h, m] = t.split(":").map(Number);
  const hr = ((h + 11) % 12) + 1;
  const ampm = h >= 12 ? "PM" : "AM";
  return `${hr}:${String(m).padStart(2, "0")} ${ampm}`;
}

function DashboardPage() {
  const fetchDashboard = useServerFn(getDashboard);
  const fetchProfile = useServerFn(getMyProfile);
  const fetchInviteStats = useServerFn(getMyInviteStats);

  const dashboard = useQuery({ queryKey: ["dashboard"], queryFn: () => fetchDashboard() });
  const profile = useQuery({ queryKey: ["my-profile"], queryFn: () => fetchProfile() });
  const inviteStats = useQuery({ queryKey: ["my-invite-stats"], queryFn: () => fetchInviteStats() });

  const needsOnboarding = profile.data && !profile.data.onboarded_at;

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-8">
        <p className="label-meta text-muted-foreground">Welcome back</p>
        <h1 className="font-display text-4xl mt-2">
          {profile.data?.display_name ?? "Runner"}
        </h1>
      </div>

      {needsOnboarding && (
        <div className="mb-8 rounded-2xl border border-sky-brand/40 bg-sky-brand/10 p-5 flex items-center justify-between gap-4">
          <div>
            <p className="font-display text-lg">Finish setting up your profile</p>
            <p className="text-sm text-muted-foreground mt-1">
              Add your pace and neighborhood so we can match you with the right crew.
            </p>
          </div>
          <Link
            to="/onboarding"
            className="inline-flex items-center justify-center rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background hover:bg-foreground/90"
          >
            Set up profile
          </Link>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-3">
        <section className="md:col-span-2 rounded-2xl border border-border bg-card p-6">
          <p className="label-meta text-muted-foreground">Next run</p>
          {dashboard.isLoading ? (
            <p className="mt-4 text-muted-foreground">Loading…</p>
          ) : dashboard.data?.nextEvent ? (
            <>
              <h2 className="font-display text-2xl mt-2">{dashboard.data.nextEvent.title}</h2>
              <p className="mt-1 text-foreground">
                {formatDate(dashboard.data.nextEvent.event_date)} · {formatTime(dashboard.data.nextEvent.start_time)}
              </p>
              <p className="text-muted-foreground text-sm mt-1">
                {dashboard.data.nextEvent.location_name}
                {dashboard.data.nextEvent.distance_mi
                  ? ` · ~${dashboard.data.nextEvent.distance_mi} mi`
                  : ""}
                {dashboard.data.nextEvent.pace_label ? ` · ${dashboard.data.nextEvent.pace_label}` : ""}
              </p>
              <div className="mt-5 flex items-center gap-3">
                <Link
                  to="/runs/$slug"
                  params={{ slug: dashboard.data.nextEvent.slug }}
                  className="inline-flex items-center justify-center rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background hover:bg-foreground/90"
                >
                  {dashboard.data.isRsvpd ? "View run" : "RSVP"}
                </Link>
                {dashboard.data.isRsvpd && (
                  <span className="text-sm text-sky-brand font-medium">✓ You're going</span>
                )}
              </div>
            </>
          ) : (
            <p className="mt-4 text-muted-foreground">No upcoming runs scheduled yet.</p>
          )}
        </section>

        <section className="rounded-2xl border border-border bg-card p-6">
          <p className="label-meta text-muted-foreground">Streak</p>
          <p className="font-display text-5xl mt-2">{dashboard.data?.attendanceCount ?? 0}</p>
          <p className="text-sm text-muted-foreground mt-1">RSVPs on record</p>
          <p className="text-xs text-muted-foreground mt-4">
            Real attendance streaks unlock when check-in ships.
          </p>
        </section>
      </div>

      <section className="mt-8 rounded-2xl border border-border bg-card p-6">
        <div className="flex items-center justify-between">
          <p className="label-meta text-muted-foreground">Upcoming</p>
          <Link to="/runs" className="text-sm text-muted-foreground hover:text-foreground">
            See all →
          </Link>
        </div>
        {dashboard.data?.upcoming && dashboard.data.upcoming.length > 0 ? (
          <ul className="mt-4 divide-y divide-border">
            {dashboard.data.upcoming.map((e) => (
              <li key={e.id} className="py-3 flex items-center justify-between gap-3">
                <div>
                  <Link
                    to="/runs/$slug"
                    params={{ slug: e.slug }}
                    className="font-medium hover:text-sky-brand transition-colors"
                  >
                    {e.title}
                  </Link>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(e.event_date)} · {e.location_name}
                  </p>
                </div>
                <span className="text-sm text-muted-foreground shrink-0">
                  {e.distance_mi ? `${e.distance_mi} mi` : ""}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 text-sm text-muted-foreground">No runs on the calendar.</p>
        )}
      </section>
    </main>
  );
}
