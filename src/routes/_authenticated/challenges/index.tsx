import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { listChallenges } from "@/lib/challenges.functions";

export const Route = createFileRoute("/_authenticated/challenges/")({
  head: () => ({
    meta: [
      { title: "Challenges — GRYT" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ChallengesIndex,
});

function dateRange(a: string, b: string) {
  const fmt = (d: string) =>
    new Date(d + "T00:00:00Z").toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });
  return `${fmt(a)} – ${fmt(b)}`;
}

function ChallengesIndex() {
  const fetchList = useServerFn(listChallenges);
  const { data, isLoading } = useQuery({ queryKey: ["challenges"], queryFn: () => fetchList() });

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-8">
        <p className="label-meta text-muted-foreground">Habit loops</p>
        <h1 className="font-display text-4xl mt-2">Challenges</h1>
        <p className="mt-2 text-muted-foreground max-w-2xl">
          Join a challenge, mark steps as you finish them, and watch the bar fill. Show up between
          Saturdays — that's the whole game.
        </p>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground">Loading…</p>
      ) : (data ?? []).length === 0 ? (
        <p className="text-muted-foreground">No challenges available yet.</p>
      ) : (
        <ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {(data ?? []).map((c) => {
            const pct = c.step_count > 0 ? Math.round((c.completed_steps / c.step_count) * 100) : 0;
            return (
              <li key={c.id}>
                <Link
                  to="/challenges/$slug"
                  params={{ slug: c.slug }}
                  className="block rounded-2xl border border-border bg-card p-6 hover:border-foreground/40 transition-colors h-full"
                >
                  <div
                    className="inline-flex items-center gap-2 rounded-full px-2.5 py-0.5 text-xs font-medium"
                    style={{ backgroundColor: c.accent_color + "22", color: c.accent_color }}
                  >
                    <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: c.accent_color }} />
                    {c.theme.toUpperCase()}
                  </div>
                  <h2 className="font-display text-2xl mt-3">{c.title}</h2>
                  {c.tagline && <p className="text-sm text-muted-foreground mt-1">{c.tagline}</p>}

                  <div className="mt-4 text-xs text-muted-foreground">
                    {dateRange(c.starts_on, c.ends_on)} · {c.participant_count} joined
                  </div>

                  <div className="mt-3">
                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                      <span>{c.joined ? "Your progress" : "Not joined"}</span>
                      <span>{c.completed_steps}/{c.step_count} · {pct}%</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${pct}%`, backgroundColor: c.accent_color }}
                      />
                    </div>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
