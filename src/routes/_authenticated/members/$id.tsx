import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getMemberProfile } from "@/lib/social.functions";
import { alignmentFor, displayName, formatPr } from "@/lib/athlete-alignment";

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
  const { data, isLoading } = useQuery({
    queryKey: ["member", id],
    queryFn: () => fetchMember({ data: { id } }),
  });

  if (isLoading) {
    return <main className="mx-auto max-w-3xl px-4 py-10"><p className="text-muted-foreground">Loading…</p></main>;
  }
  if (!data) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-10">
        <p className="text-muted-foreground">This member's profile isn't public.</p>
        <Link to="/community" className="text-sm underline">← Back to members</Link>
      </main>
    );
  }

  const a = alignmentFor(data.id, data.athlete_alignment);
  const prs = [
    { label: "5K", value: data.best_5k_seconds },
    { label: "10K", value: data.best_10k_seconds },
    { label: "Half", value: data.best_half_seconds },
    { label: "Marathon", value: data.best_marathon_seconds },
  ];

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <Link to="/community" className="text-sm text-muted-foreground hover:text-foreground">← All members</Link>

      <header
        className={"mt-4 rounded-3xl border p-8 ring-1 " + a.ring}
        style={{ backgroundColor: a.bg.includes("bg-") ? undefined : undefined }}
      >
        <div className="flex items-start gap-5">
          {data.avatar_url ? (
            <img src={data.avatar_url} alt="" className="h-20 w-20 rounded-full object-cover" />
          ) : (
            <div className="h-20 w-20 rounded-full bg-muted" />
          )}
          <div className="min-w-0">
            <h1 className="font-display text-3xl">{displayName(data)}</h1>
            <p className="text-sm text-muted-foreground">
              {data.neighborhood ?? data.city ?? "—"}
            </p>
            <span className={"inline-flex mt-2 rounded-full px-2.5 py-0.5 text-xs font-medium " + a.bg + " " + a.text}>
              {a.name} · {a.discipline}
            </span>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            to="/compare/$otherId"
            params={{ otherId: data.id }}
            className="inline-flex items-center rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background hover:bg-foreground/90"
          >
            Compare with me
          </Link>
        </div>
      </header>

      <section className="mt-8 grid grid-cols-3 gap-3">
        <BigStat label="Steps done" value={data.stats.steps_completed} />
        <BigStat label="Challenges ✓" value={data.stats.challenges_completed} />
        <BigStat label="Joined" value={data.stats.challenges_joined} />
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

function BigStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 text-center">
      <div className="font-display text-3xl tabular-nums">{value}</div>
      <div className="text-xs uppercase tracking-wide text-muted-foreground mt-1">{label}</div>
    </div>
  );
}
