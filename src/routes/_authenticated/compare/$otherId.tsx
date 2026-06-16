import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
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
    return (
      <main className="mx-auto max-w-4xl px-4 py-10">
        <div className="h-32 rounded-2xl bg-muted/40 animate-pulse" />
        <div className="mt-6 grid grid-cols-2 gap-4">
          <div className="h-28 rounded-2xl bg-muted/30 animate-pulse" />
          <div className="h-28 rounded-2xl bg-muted/30 animate-pulse" />
        </div>
      </main>
    );
  }
  if (!data) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-10">
        <div className="rounded-2xl border border-dashed border-border p-10 text-center">
          <p className="font-display text-xl">Couldn't load this comparison.</p>
          <Link to="/community" className="mt-3 inline-flex text-sm underline">← Back to members</Link>
        </div>
      </main>
    );
  }

  const { me, them, shared, scores } = data;
  const winner = scores.me === scores.them ? "tie" : scores.me > scores.them ? "me" : "them";
  const winnerText =
    winner === "tie"
      ? "Dead even."
      : winner === "me"
        ? `You're ahead.`
        : `${displayName(them)} is ahead.`;
  const winnerColor =
    winner === "tie"
      ? "text-muted-foreground"
      : winner === "me"
        ? "text-emerald-500"
        : "text-amber-500";

  return (
    <main className="mx-auto max-w-4xl px-4 py-8 animate-fade-in">
      <Link to="/members/$id" params={{ id: otherId }} className="text-sm text-muted-foreground hover:text-foreground">
        ← Back to member
      </Link>

      <section className="mt-4 rounded-3xl border border-border bg-card p-6 sm:p-8 relative overflow-hidden">
        <div className="flex items-baseline justify-between flex-wrap gap-3">
          <div>
            <p className="label-meta text-muted-foreground">Head to head</p>
            <h1 className={"font-display text-4xl mt-1 " + winnerColor}>{winnerText}</h1>
          </div>
          <div className="flex items-baseline gap-3 font-display text-4xl tabular-nums">
            <span className={winner === "me" ? "" : "text-muted-foreground"}>{scores.me}</span>
            <span className="text-muted-foreground text-2xl">·</span>
            <span className={winner === "them" ? "" : "text-muted-foreground"}>{scores.them}</span>
          </div>
        </div>
      </section>

      <section className="mt-6 grid grid-cols-2 gap-4">
        <PersonHeader p={me} label="You" winning={winner === "me"} />
        <PersonHeader p={them} label={displayName(them)} winning={winner === "them"} />
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
          <div className="rounded-xl border border-dashed border-border p-6 text-center">
            <p className="text-sm">No overlap yet.</p>
            <p className="mt-1 text-xs text-muted-foreground">Join one of theirs, or invite them to one of yours.</p>
            <div className="mt-4 flex justify-center gap-2">
              <Link
                to="/challenges"
                className="inline-flex rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background hover:bg-foreground/90"
              >
                Browse challenges
              </Link>
            </div>
          </div>
        ) : (
          <ul className="space-y-5">
            {shared.map((c, i) => {
              const mePct = c.step_count ? Math.round((c.me_done / c.step_count) * 100) : 0;
              const themPct = c.step_count ? Math.round((c.them_done / c.step_count) * 100) : 0;
              return (
                <li
                  key={c.challenge_id}
                  className="opacity-0 animate-fade-in"
                  style={{ animationDelay: `${i * 50}ms`, animationFillMode: "forwards" }}
                >
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

function PersonHeader({ p, label, winning }: { p: PublicMemberDetail; label: string; winning: boolean }) {
  const a = alignmentFor(p.id, p.athlete_alignment);
  return (
    <div
      className={
        "rounded-2xl border bg-card p-5 ring-1 transition-all " +
        a.ring +
        (winning ? " ring-2 shadow-lg -translate-y-0.5" : " opacity-90")
      }
    >
      <div className="flex items-center justify-between">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
        {winning && <span className="text-lg" aria-label="Leading">🏆</span>}
      </div>
      <div className="mt-2 flex items-center gap-3">
        {p.avatar_url ? (
          <img src={p.avatar_url} alt="" className="h-14 w-14 rounded-full object-cover ring-2 ring-background" />
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
        {aWin && <span className="mr-1">🏆</span>}{formatPr(a)}
      </div>
      <div className="text-xs uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className={"tabular-nums " + (bWin ? "font-semibold text-foreground" : "text-muted-foreground")}>
        {formatPr(b)}{bWin && <span className="ml-1">🏆</span>}
      </div>
    </div>
  );
}

function Bar({ label, pct, accent, highlight }: { label: string; pct: number; accent: string; highlight?: boolean }) {
  // Animate from 0 to target on mount.
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setWidth(pct), 50);
    return () => clearTimeout(t);
  }, [pct]);
  return (
    <div>
      <div className="flex items-center justify-between text-xs text-muted-foreground mb-0.5">
        <span>{label}</span>
        <span className="tabular-nums">{pct}%</span>
      </div>
      <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
        <div
          className={"h-full rounded-full transition-[width] duration-700 ease-out " + (highlight ? "" : "opacity-60")}
          style={{ width: `${width}%`, backgroundColor: accent }}
        />
      </div>
    </div>
  );
}

function CompareStat({ label, a, b }: { label: string; a: number; b: number }) {
  const aWin = a > b;
  const bWin = b > a;
  return (
    <div className="rounded-2xl border border-border bg-card p-4 text-center transition-all hover:border-foreground/30">
      <div className="text-xs uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="mt-1 flex items-baseline justify-center gap-2">
        <span className={"font-display text-2xl tabular-nums " + (aWin ? "" : "text-muted-foreground")}>{a}</span>
        <span className="text-muted-foreground">·</span>
        <span className={"font-display text-2xl tabular-nums " + (bWin ? "" : "text-muted-foreground")}>{b}</span>
      </div>
    </div>
  );
}
