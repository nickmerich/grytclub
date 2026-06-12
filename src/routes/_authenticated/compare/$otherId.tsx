import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getComparison, type PublicMemberDetail } from "@/lib/social.functions";
import { alignmentFor, displayName, formatPr } from "@/lib/athlete-alignment";

export const Route = createFileRoute("/_authenticated/compare/$otherId")({
  head: () => ({
    meta: [
      { title: "Head-to-head — GRYT" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ComparePage,
});

function ComparePage() {
  const { otherId } = Route.useParams();
  const fetchComp = useServerFn(getComparison);
  const { data, isLoading } = useQuery({
    queryKey: ["compare", otherId],
    queryFn: () => fetchComp({ data: { otherId } }),
  });

  if (isLoading) {
    return <main className="mx-auto max-w-4xl px-4 py-10"><p className="text-muted-foreground">Loading…</p></main>;
  }
  if (!data) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-10">
        <p className="text-muted-foreground">Couldn't load this comparison.</p>
        <Link to="/community" className="text-sm underline">← Back to members</Link>
      </main>
    );
  }

  const { me, them, shared, scores } = data;
  const winner = scores.me === scores.them ? "tie" : scores.me > scores.them ? "me" : "them";

  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <Link to="/members/$id" params={{ id: otherId }} className="text-sm text-muted-foreground hover:text-foreground">
        ← Back to member
      </Link>

      <h1 className="font-display text-4xl mt-4">Head to head</h1>
      <p className="mt-1 text-muted-foreground">
        {winner === "tie"
          ? "Dead even so far."
          : winner === "me"
            ? `You're ahead ${scores.me}–${scores.them}.`
            : `${displayName(them)} is ahead ${scores.them}–${scores.me}.`}
      </p>

      <section className="mt-8 grid grid-cols-2 gap-4">
        <PersonHeader p={me} label="You" />
        <PersonHeader p={them} label={displayName(them)} />
      </section>

      <section className="mt-8 rounded-2xl border border-border bg-card p-6">
        <h2 className="font-display text-xl mb-4">Personal records</h2>
        <PrCompare label="5K" a={me.best_5k_seconds} b={them.best_5k_seconds} />
        <PrCompare label="10K" a={me.best_10k_seconds} b={them.best_10k_seconds} />
        <PrCompare label="Half" a={me.best_half_seconds} b={them.best_half_seconds} />
        <PrCompare label="Marathon" a={me.best_marathon_seconds} b={them.best_marathon_seconds} />
      </section>

      <section className="mt-8 rounded-2xl border border-border bg-card p-6">
        <h2 className="font-display text-xl mb-4">Shared challenges</h2>
        {shared.length === 0 ? (
          <p className="text-sm text-muted-foreground">No overlap yet — join one of their challenges.</p>
        ) : (
          <ul className="space-y-5">
            {shared.map((c) => {
              const mePct = c.step_count ? Math.round((c.me_done / c.step_count) * 100) : 0;
              const themPct = c.step_count ? Math.round((c.them_done / c.step_count) * 100) : 0;
              return (
                <li key={c.challenge_id}>
                  <div className="flex items-center justify-between mb-2">
                    <Link
                      to="/challenges/$slug"
                      params={{ slug: c.slug }}
                      className="font-medium hover:underline"
                    >
                      {c.title}
                    </Link>
                    <span className="text-xs text-muted-foreground tabular-nums">
                      {mePct}% vs {themPct}%
                    </span>
                  </div>
                  <div className="space-y-1.5">
                    <Bar label="You" pct={mePct} accent={c.accent_color} highlight={mePct >= themPct} />
                    <Bar label="Them" pct={themPct} accent={c.accent_color} highlight={themPct > mePct} />
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className="mt-6 grid grid-cols-3 gap-3">
        <CompareStat label="Steps" a={me.stats.steps_completed} b={them.stats.steps_completed} />
        <CompareStat label="Done" a={me.stats.challenges_completed} b={them.stats.challenges_completed} />
        <CompareStat label="Joined" a={me.stats.challenges_joined} b={them.stats.challenges_joined} />
      </section>
    </main>
  );
}

function PersonHeader({ p, label }: { p: PublicMemberDetail; label: string }) {
  const a = alignmentFor(p.id, p.athlete_alignment);
  return (
    <div className={"rounded-2xl border bg-card p-5 ring-1 " + a.ring}>
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <div className="mt-2 flex items-center gap-3">
        {p.avatar_url ? (
          <img src={p.avatar_url} alt="" className="h-14 w-14 rounded-full object-cover" />
        ) : (
          <div className="h-14 w-14 rounded-full bg-muted" />
        )}
        <div className="min-w-0">
          <p className="font-display text-xl truncate">{displayName(p)}</p>
          <p className="text-xs text-muted-foreground truncate">{p.neighborhood ?? "—"}</p>
        </div>
      </div>
      <p className={"text-xs mt-2 " + a.text}>{a.name}</p>
    </div>
  );
}

function PrCompare({ label, a, b }: { label: string; a: number | null; b: number | null }) {
  const aWin = a && b ? a < b : false;
  const bWin = a && b ? b < a : false;
  return (
    <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 py-2 border-b border-border last:border-0">
      <div className={"text-right tabular-nums " + (aWin ? "font-semibold text-foreground" : "text-muted-foreground")}>
        {aWin && "✓ "}{formatPr(a)}
      </div>
      <div className="text-xs uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className={"tabular-nums " + (bWin ? "font-semibold text-foreground" : "text-muted-foreground")}>
        {formatPr(b)}{bWin && " ✓"}
      </div>
    </div>
  );
}

function Bar({ label, pct, accent, highlight }: { label: string; pct: number; accent: string; highlight?: boolean }) {
  return (
    <div>
      <div className="flex items-center justify-between text-xs text-muted-foreground mb-0.5">
        <span>{label}</span>
        <span className="tabular-nums">{pct}%</span>
      </div>
      <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
        <div
          className={"h-full rounded-full transition-all " + (highlight ? "" : "opacity-60")}
          style={{ width: `${pct}%`, backgroundColor: accent }}
        />
      </div>
    </div>
  );
}

function CompareStat({ label, a, b }: { label: string; a: number; b: number }) {
  const aWin = a > b;
  const bWin = b > a;
  return (
    <div className="rounded-2xl border border-border bg-card p-4 text-center">
      <div className="text-xs uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="mt-1 flex items-baseline justify-center gap-2">
        <span className={"font-display text-2xl tabular-nums " + (aWin ? "" : "text-muted-foreground")}>{a}</span>
        <span className="text-muted-foreground">·</span>
        <span className={"font-display text-2xl tabular-nums " + (bWin ? "" : "text-muted-foreground")}>{b}</span>
      </div>
    </div>
  );
}
