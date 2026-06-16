import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getRecentActivity, type RecentActivityRow } from "@/lib/social.functions";
import { alignmentFor, displayName } from "@/lib/athlete-alignment";

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d`;
  return `${Math.floor(d / 7)}w`;
}

export function RecentActivity({ limit = 10 }: { limit?: number }) {
  const fetchActivity = useServerFn(getRecentActivity);
  const { data, isLoading } = useQuery({
    queryKey: ["recent-activity", limit],
    queryFn: () => fetchActivity({ data: { limit } }),
    staleTime: 60_000,
  });

  return (
    <section className="rounded-2xl border border-border bg-card overflow-hidden">
      <div className="px-5 py-3 border-b border-border flex items-center justify-between">
        <h2 className="font-display text-sm uppercase tracking-wider">Live from the club</h2>
        <span className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted-foreground">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
          </span>
          Live
        </span>
      </div>
      {isLoading ? (
        <p className="px-5 py-6 text-sm text-muted-foreground">Loading…</p>
      ) : !data || data.length === 0 ? (
        <p className="px-5 py-6 text-sm text-muted-foreground">Quiet right now. Check a box, log a run.</p>
      ) : (
        <ol className="divide-y divide-border">
          {data.map((row, i) => (
            <ActivityItem key={`${row.user_id}-${row.occurred_at}-${i}`} row={row} index={i} />
          ))}
        </ol>
      )}
    </section>
  );
}

function ActivityItem({ row, index }: { row: RecentActivityRow; index: number }) {
  const a = alignmentFor(row.user_id, row.athlete_alignment);
  const verb = row.kind === "completion" ? "completed a step in" : "checked in for";
  return (
    <li
      className="opacity-0 animate-fade-in"
      style={{ animationDelay: `${Math.min(index * 30, 300)}ms`, animationFillMode: "forwards" }}
    >
      <Link
        to="/members/$id"
        params={{ id: row.user_id }}
        className="flex items-center gap-3 px-5 py-3 hover:bg-accent/40 transition-colors"
      >
        {row.avatar_url ? (
          <img src={row.avatar_url} alt="" className="h-8 w-8 rounded-full object-cover" />
        ) : (
          <div className={"h-8 w-8 rounded-full ring-1 " + a.ring + " bg-muted"} />
        )}
        <div className="min-w-0 flex-1 text-sm">
          <p className="truncate">
            <span className="font-medium">{displayName(row)}</span>{" "}
            <span className="text-muted-foreground">{verb}</span>{" "}
            <span className="font-medium" style={{ color: row.accent_color }}>{row.title}</span>
          </p>
        </div>
        <span className="text-xs text-muted-foreground tabular-nums shrink-0">{timeAgo(row.occurred_at)}</span>
      </Link>
    </li>
  );
}
