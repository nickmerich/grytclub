import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { getMemberProfile } from "@/lib/social.functions";
import { getMemberAttendance } from "@/lib/checkins.functions";
import { alignmentFor, displayName, formatPr } from "@/lib/athlete-alignment";
import { PropsRow } from "@/components/PropsRow";

export const Route = createFileRoute("/_authenticated/members/$id")({
  head: () => ({
    meta: [
      { title: "Member — GRYT" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: MemberPage,
});

function MemberPage() {
  const { id } = Route.useParams();
  const fetchMember = useServerFn(getMemberProfile);
  const fetchAttendance = useServerFn(getMemberAttendance);
  const [myId, setMyId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setMyId(data.user?.id ?? null));
  }, []);

  const { data, isLoading } = useQuery({
    queryKey: ["member", id],
    queryFn: () => fetchMember({ data: { id } }),
  });
  const attendance = useQuery({
    queryKey: ["member-attendance", id],
    queryFn: () => fetchAttendance({ data: { user_id: id } }),
    enabled: !!data,
  });

  if (isLoading) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-10">
        <div className="h-44 rounded-3xl bg-muted/40 animate-pulse" />
        <div className="mt-6 grid grid-cols-3 gap-3">
          <div className="h-24 rounded-2xl bg-muted/30 animate-pulse" />
          <div className="h-24 rounded-2xl bg-muted/30 animate-pulse" />
          <div className="h-24 rounded-2xl bg-muted/30 animate-pulse" />
        </div>
      </main>
    );
  }
  if (!data) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-10">
        <div className="rounded-2xl border border-dashed border-border p-10 text-center">
          <p className="font-display text-xl">This profile is private.</p>
          <p className="mt-1 text-muted-foreground">Only the owner can see it.</p>
          <Link to="/community" className="mt-4 inline-flex text-sm underline">← Back to members</Link>
        </div>
      </main>
    );
  }

  const isSelf = myId === data.id;
  const a = alignmentFor(data.id, data.athlete_alignment);
  const prs = [
    { label: "5K", value: data.best_5k_seconds },
    { label: "10K", value: data.best_10k_seconds },
    { label: "Half", value: data.best_half_seconds },
    { label: "Marathon", value: data.best_marathon_seconds },
  ];

  const onShare = async () => {
    const url = `${window.location.origin}/members/${data.id}`;
    const name = displayName(data);
    try {
      if (typeof navigator !== "undefined" && (navigator as any).share) {
        await (navigator as any).share({ title: `${name} on GRYT`, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      toast.success("Profile link copied");
    } catch {
      // user cancelled, no-op
    }
  };

  return (
    <main className="mx-auto max-w-3xl px-4 py-8 animate-fade-in">
      <Link to="/community" className="text-sm text-muted-foreground hover:text-foreground">← All members</Link>

      <header
        className={"mt-4 rounded-3xl border p-8 ring-1 relative overflow-hidden " + a.ring}
      >
        <div
          aria-hidden
          className="absolute -top-20 -right-20 h-56 w-56 rounded-full opacity-20 blur-3xl"
          style={{ background: "currentColor" }}
        />
        <div className="relative flex items-start gap-5">
          {data.avatar_url ? (
            <img src={data.avatar_url} alt="" className="h-20 w-20 rounded-full object-cover ring-2 ring-background" />
          ) : (
            <div className="h-20 w-20 rounded-full bg-muted" />
          )}
          <div className="min-w-0 flex-1">
            <h1 className="font-display text-3xl">{displayName(data)}</h1>
            <p className="text-sm text-muted-foreground">
              {data.neighborhood ?? data.city ?? "—"}
            </p>
            <span className={"inline-flex mt-2 rounded-full px-2.5 py-0.5 text-xs font-medium " + a.bg + " " + a.text}>
              {a.name} · {a.discipline}
            </span>
          </div>
        </div>

        <div className="relative mt-6 flex flex-wrap items-center gap-3">
          {!isSelf && (
            <Link
              to="/compare/$otherId"
              params={{ otherId: data.id }}
              className="inline-flex items-center rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background transition-all hover:bg-foreground/90 hover:-translate-y-0.5"
            >
              Compare with me
            </Link>
          )}
          <button
            type="button"
            onClick={onShare}
            className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-4 py-2 text-sm font-medium hover:border-foreground/40 hover:-translate-y-0.5 transition-all"
          >
            <ShareIcon /> Share
          </button>
          {isSelf && (
            <span className="text-xs text-muted-foreground">This is how others see you.</span>
          )}
        </div>

        <div className="relative mt-5 pt-5 border-t border-border/60">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">
            {isSelf ? "Props received" : "Send props"}
          </p>
          <PropsRow recipientId={data.id} isSelf={isSelf} />
        </div>
      </header>

      <section className="mt-8 grid grid-cols-3 gap-3">
        <BigStat label="Steps done" value={data.stats.steps_completed} />
        <BigStat label="Challenges ✓" value={data.stats.challenges_completed} />
        <BigStat label="Joined" value={data.stats.challenges_joined} />
      </section>

      <section className="mt-4 grid grid-cols-3 gap-3">
        <BigStat label="Runs attended" value={attendance.data?.total_runs ?? 0} />
        <BigStat
          label="Saturday streak"
          value={
            attendance.data?.current_streak
              ? `🔥 ${attendance.data.current_streak}`
              : "0"
          }
        />
        <BigStat
          label="Last run"
          value={
            attendance.data?.last_run_date
              ? new Date(attendance.data.last_run_date + "T12:00:00Z").toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  timeZone: "UTC",
                })
              : "—"
          }
        />
      </section>

      <section className="mt-8 rounded-2xl border border-border bg-card p-6">
        <h2 className="font-display text-xl">Personal records</h2>
        <dl className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
          {prs.map((p) => (
            <div key={p.label}>
              <dt className="text-xs uppercase tracking-wide text-muted-foreground">{p.label}</dt>
              <dd className="font-display text-2xl tabular-nums mt-1">{formatPr(p.value)}</dd>
            </div>
          ))}
        </dl>
      </section>

      {(data.goals.length > 0 || data.preferred_times.length > 0) && (
        <section className="mt-6 rounded-2xl border border-border bg-card p-6">
          {data.goals.length > 0 && (
            <>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Goals</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {data.goals.map((g) => (
                  <span key={g} className="rounded-full bg-muted px-2 py-0.5 text-xs">{g}</span>
                ))}
              </div>
            </>
          )}
          {data.preferred_times.length > 0 && (
            <>
              <p className="text-xs uppercase tracking-wide text-muted-foreground mt-4">Runs</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {data.preferred_times.map((t) => (
                  <span key={t} className="rounded-full bg-muted px-2 py-0.5 text-xs">{t}</span>
                ))}
              </div>
            </>
          )}
        </section>
      )}
    </main>
  );
}

function BigStat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 text-center transition-all hover:border-foreground/30 hover:-translate-y-0.5">
      <div className="font-display text-3xl tabular-nums">{value}</div>
      <div className="text-xs uppercase tracking-wide text-muted-foreground mt-1">{label}</div>
    </div>
  );
}

function ShareIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
      <polyline points="16 6 12 2 8 6" />
      <line x1="12" y1="2" x2="12" y2="15" />
    </svg>
  );
}
