import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { getGlobalLeaderboard, type LeaderboardRow } from "@/lib/social.functions";
import { alignmentFor, displayName } from "@/lib/athlete-alignment";
import { RecentActivity } from "@/components/RecentActivity";

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
  const chasing = data?.chasing;
  const meInTop = me && top.some((r) => r.user_id === me.user_id);

  return (
    <main className="mx-auto max-w-5xl px-4 py-8 pb-40">
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
              "rounded-full px-4 py-1.5 text-sm border transition-all " +
              (windowSel === w
                ? "bg-foreground text-background border-foreground"
                : "border-border hover:bg-accent hover:-translate-y-0.5")
            }
          >
            {w === "all" ? "All time" : "Last 30 days"}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          <div className="h-40 rounded-2xl bg-muted/40 animate-pulse" />
          <div className="h-12 rounded-xl bg-muted/30 animate-pulse" />
          <div className="h-12 rounded-xl bg-muted/30 animate-pulse" />
        </div>
      ) : top.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-10 text-center">
          <p className="font-display text-xl">No completions yet.</p>
          <p className="mt-1 text-muted-foreground">Be the first to put a name on the board.</p>
          <Link
            to="/challenges"
            className="mt-4 inline-flex rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background hover:bg-foreground/90"
          >
            Browse challenges →
          </Link>
        </div>
      ) : (
        <>
          {podium.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-6 gap-3 mb-8">
              {podium[0] && (
                <div className="sm:col-span-6">
                  <PodiumCard row={podium[0]} rank={1} prime />
                </div>
              )}
              {podium[1] && (
                <div className="sm:col-span-3">
                  <PodiumCard row={podium[1]} rank={2} />
                </div>
              )}
              {podium[2] && (
                <div className="sm:col-span-3">
                  <PodiumCard row={podium[2]} rank={3} />
                </div>
              )}
            </div>
          )}

          <ol className="rounded-2xl border border-border bg-card divide-y divide-border overflow-hidden">
            {rest.map((r, i) => (
              <LbRow key={r.user_id} row={r} rank={i + 4} isMe={r.user_id === me?.user_id} index={i} />
            ))}
          </ol>

          <div className="mt-10">
            <RecentActivity limit={10} />
          </div>
        </>
      )}

      {me && !meInTop && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-30 w-full max-w-2xl px-4">
          <div className="rounded-2xl border border-foreground/40 bg-card/95 backdrop-blur shadow-lg p-3 animate-fade-in">
            <div className="flex items-center justify-between px-1 mb-1.5">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">You</p>
              {chasing && (
                <Link
                  to="/members/$id"
                  params={{ id: chasing.user_id }}
                  className="text-xs text-muted-foreground hover:text-foreground tabular-nums"
                >
                  {chasing.gap} step{chasing.gap === 1 ? "" : "s"} to catch{" "}
                  <span className="font-medium text-foreground">{displayName(chasing)}</span> →
                </Link>
              )}
            </div>
            <LbRow row={me} rank={me.rank} isMe flush />
          </div>
        </div>
      )}
    </main>
  );
}

function PodiumCard({ row, rank, prime }: { row: LeaderboardRow; rank: number; prime?: boolean }) {
  const a = alignmentFor(row.user_id, row.athlete_alignment);
  const medal = rank === 1 ? "🥇" : rank === 2 ? "🥈" : "🥉";
  const delay = (rank - 1) * 60;
  return (
    <Link
      to="/members/$id"
      params={{ id: row.user_id }}
      style={{ animationDelay: `${delay}ms`, animationFillMode: "forwards" }}
      className={
        "group relative rounded-2xl border bg-card p-5 ring-1 block transition-all hover:-translate-y-1 hover:shadow-lg opacity-0 animate-fade-in overflow-hidden " +
        a.ring +
        (prime ? " sm:p-7" : "")
      }
    >
      {prime && (
        <div
          className="absolute inset-x-0 top-0 h-1"
          style={{ background: "linear-gradient(90deg, transparent, currentColor, transparent)" }}
        />
      )}
      <div className={"flex items-center gap-3 " + (prime ? "sm:gap-5" : "")}>
        <div className={prime ? "text-5xl" : "text-3xl"}>{medal}</div>
        {row.avatar_url ? (
          <img
            src={row.avatar_url}
            alt=""
            className={
              "rounded-full object-cover ring-2 ring-background " +
              (prime ? "h-20 w-20" : "h-12 w-12")
            }
          />
        ) : (
          <div className={"rounded-full bg-muted " + (prime ? "h-20 w-20" : "h-12 w-12")} />
        )}
        <div className="min-w-0 flex-1">
          <p className={"font-display truncate " + (prime ? "text-2xl sm:text-3xl" : "text-lg")}>
            {displayName(row)}
          </p>
          <p className={"text-xs text-muted-foreground truncate " + a.text}>
            {a.name}
            {row.neighborhood ? ` · ${row.neighborhood}` : ""}
          </p>
        </div>
        {prime && (
          <div className="hidden sm:block text-right pl-4 border-l border-border">
            <div className="font-display text-4xl tabular-nums">{row.steps_completed}</div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Steps</div>
          </div>
        )}
      </div>
      <dl className={"mt-4 grid grid-cols-3 gap-2 text-center " + (prime ? "sm:hidden" : "")}>
        <Stat label="Steps" value={row.steps_completed} />
        <Stat label="Done" value={row.challenges_completed} />
        <Stat label="Joined" value={row.challenges_joined} />
      </dl>
      {prime && (
        <dl className="mt-4 hidden sm:grid grid-cols-3 gap-2 max-w-md">
          <Stat label="Steps" value={row.steps_completed} />
          <Stat label="Done" value={row.challenges_completed} />
          <Stat label="Joined" value={row.challenges_joined} />
        </dl>
      )}
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

function LbRow({
  row,
  rank,
  isMe,
  flush,
  index = 0,
}: {
  row: LeaderboardRow;
  rank: number;
  isMe?: boolean;
  flush?: boolean;
  index?: number;
}) {
  const a = alignmentFor(row.user_id, row.athlete_alignment);
  return (
    <Link
      to="/members/$id"
      params={{ id: row.user_id }}
      style={
        flush ? undefined : { animationDelay: `${Math.min(index * 25, 250)}ms`, animationFillMode: "forwards" }
      }
      className={
        "flex items-center gap-3 px-4 py-3 transition-all hover:bg-accent/40 hover:pl-5 " +
        (flush ? "rounded-xl " : "opacity-0 animate-fade-in ") +
        (isMe && !flush ? "bg-foreground/5 " : "")
      }
    >
      <span className="w-8 text-sm font-medium tabular-nums text-muted-foreground">{rank}</span>
      {row.avatar_url ? (
        <img src={row.avatar_url} alt="" className="h-9 w-9 rounded-full object-cover" />
      ) : (
        <div className={"h-9 w-9 rounded-full bg-muted ring-1 " + a.ring} />
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
