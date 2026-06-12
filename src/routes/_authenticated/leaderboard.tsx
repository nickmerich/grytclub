import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { getGlobalLeaderboard, type LeaderboardRow } from "@/lib/social.functions";
import { alignmentFor, displayName } from "@/lib/athlete-alignment";

export const Route = createFileRoute("/_authenticated/leaderboard")({
  head: () => ({
    meta: [
      { title: "Leaderboard — GRYT" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: LeaderboardPage,
});

function LeaderboardPage() {
  const [windowSel, setWindow] = useState<"all" | "month">("all");
  const fetchLb = useServerFn(getGlobalLeaderboard);
  const { data, isLoading } = useQuery({
    queryKey: ["leaderboard", windowSel],
    queryFn: () => fetchLb({ data: { window: windowSel } }),
  });

  const top = data?.top ?? [];
  const podium = top.slice(0, 3);
  const rest = top.slice(3);
  const me = data?.me;
  const meInTop = me && top.some((r) => r.user_id === me.user_id);

  return (
    <main className="mx-auto max-w-5xl px-4 py-8 pb-32">
      <div className="mb-6">
        <p className="label-meta text-muted-foreground">Cross-challenge</p>
        <h1 className="font-display text-4xl mt-2">Leaderboard</h1>
        <p className="mt-2 text-muted-foreground">
          Ranked by steps completed across every challenge. Show up, check boxes, climb.
        </p>
      </div>

      <div className="flex gap-2 mb-6">
        {(["all", "month"] as const).map((w) => (
          <button
            key={w}
            type="button"
            onClick={() => setWindow(w)}
            className={
              "rounded-full px-4 py-1.5 text-sm border transition-colors " +
              (windowSel === w
                ? "bg-foreground text-background border-foreground"
                : "border-border hover:bg-accent")
            }
          >
            {w === "all" ? "All time" : "Last 30 days"}
          </button>
        ))}
      </div>

      {isLoading ? (
        <p className="text-muted-foreground">Loading…</p>
      ) : top.length === 0 ? (
        <p className="text-muted-foreground">No completions yet. Be the first.</p>
      ) : (
        <>
          {podium.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
              {podium.map((r, i) => (
                <PodiumCard key={r.user_id} row={r} rank={i + 1} />
              ))}
            </div>
          )}

          <ol className="rounded-2xl border border-border bg-card divide-y divide-border overflow-hidden">
            {rest.map((r, i) => (
              <LbRow key={r.user_id} row={r} rank={i + 4} isMe={r.user_id === me?.user_id} />
            ))}
          </ol>
        </>
      )}

      {me && !meInTop && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-30 w-full max-w-2xl px-4">
          <div className="rounded-2xl border border-foreground/40 bg-card/95 backdrop-blur shadow-lg p-3">
            <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1.5 px-1">You</p>
            <LbRow row={me} rank={me.rank} isMe flush />
          </div>
        </div>
      )}
    </main>
  );
}

function PodiumCard({ row, rank }: { row: LeaderboardRow; rank: number }) {
  const a = alignmentFor(row.user_id, row.athlete_alignment);
  const medal = rank === 1 ? "🥇" : rank === 2 ? "🥈" : "🥉";
  return (
    <Link
      to="/members/$id"
      params={{ id: row.user_id }}
      className={"rounded-2xl border bg-card p-5 ring-1 block hover:border-foreground/40 transition-colors " + a.ring}
    >
      <div className="flex items-center gap-3">
        <div className="text-3xl">{medal}</div>
        {row.avatar_url ? (
          <img src={row.avatar_url} alt="" className="h-12 w-12 rounded-full object-cover" />
        ) : (
          <div className="h-12 w-12 rounded-full bg-muted" />
        )}
        <div className="min-w-0">
          <p className="font-display text-lg truncate">{displayName(row)}</p>
          <p className="text-xs text-muted-foreground truncate">{row.neighborhood ?? "—"}</p>
        </div>
      </div>
      <dl className="mt-4 grid grid-cols-3 gap-2 text-center">
        <Stat label="Steps" value={row.steps_completed} />
        <Stat label="Done" value={row.challenges_completed} />
        <Stat label="Joined" value={row.challenges_joined} />
      </dl>
    </Link>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="font-display text-2xl tabular-nums">{value}</div>
      <div className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</div>
    </div>
  );
}

function LbRow({ row, rank, isMe, flush }: { row: LeaderboardRow; rank: number; isMe?: boolean; flush?: boolean }) {
  const a = alignmentFor(row.user_id, row.athlete_alignment);
  return (
    <Link
      to="/members/$id"
      params={{ id: row.user_id }}
      className={
        "flex items-center gap-3 px-4 py-3 hover:bg-accent/40 transition-colors " +
        (isMe && !flush ? "bg-foreground/5 " : "") +
        (flush ? "rounded-xl " : "")
      }
    >
      <span className="w-8 text-sm font-medium tabular-nums text-muted-foreground">{rank}</span>
      {row.avatar_url ? (
        <img src={row.avatar_url} alt="" className="h-9 w-9 rounded-full object-cover" />
      ) : (
        <div className="h-9 w-9 rounded-full bg-muted" />
      )}
      <div className="min-w-0 flex-1">
        <p className="font-medium truncate">{displayName(row)}</p>
        <p className="text-xs text-muted-foreground truncate">
          <span className={a.text}>{a.name}</span>
          {row.neighborhood ? ` · ${row.neighborhood}` : ""}
        </p>
      </div>
      <div className="text-right">
        <div className="font-display text-lg tabular-nums">{row.steps_completed}</div>
        <div className="text-[10px] uppercase tracking-wide text-muted-foreground">
          {row.challenges_completed}✓ · {row.challenges_joined} in
        </div>
      </div>
    </Link>
  );
}
