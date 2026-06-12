import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { listPublicMembers, type PublicMember } from "@/lib/profiles.functions";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/_authenticated/community")({
  head: () => ({
    meta: [
      { title: "Members — GRYT" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: CommunityPage,
});

const PACE_BUCKETS = [
  { id: "any", label: "Any pace", test: (_p: PublicMember) => true },
  { id: "fast", label: "< 8:30", test: (p: PublicMember) => (p.pace_min_per_mi ?? Infinity) < 8.5 },
  { id: "mid", label: "8:30 – 10:00", test: (p: PublicMember) => {
    const min = p.pace_min_per_mi;
    if (min == null) return false;
    return min >= 8.5 && min <= 10;
  } },
  { id: "easy", label: "10:00+", test: (p: PublicMember) => (p.pace_min_per_mi ?? 0) > 10 },
];

function paceText(m: PublicMember) {
  if (m.pace_min_per_mi == null && m.pace_max_per_mi == null) return "—";
  const a = m.pace_min_per_mi != null ? m.pace_min_per_mi.toFixed(1) : "?";
  const b = m.pace_max_per_mi != null ? m.pace_max_per_mi.toFixed(1) : "?";
  return `${a}–${b}/mi`;
}

function initials(name: string | null) {
  if (!name) return "?";
  return name.split(" ").filter(Boolean).slice(0, 2).map((p) => p[0]?.toUpperCase()).join("") || "?";
}

function CommunityPage() {
  const fetchMembers = useServerFn(listPublicMembers);
  const { data, isLoading } = useQuery({ queryKey: ["public-members"], queryFn: () => fetchMembers() });

  const [query, setQuery] = useState("");
  const [pace, setPace] = useState("any");
  const [neighborhood, setNeighborhood] = useState("");

  const neighborhoods = useMemo(() => {
    const set = new Set<string>();
    (data ?? []).forEach((m) => m.neighborhood && set.add(m.neighborhood));
    return Array.from(set).sort();
  }, [data]);

  const filtered = useMemo(() => {
    if (!data) return [];
    const q = query.trim().toLowerCase();
    const bucket = PACE_BUCKETS.find((b) => b.id === pace) ?? PACE_BUCKETS[0];
    return data.filter((m) => {
      if (q && !(m.display_name ?? "").toLowerCase().includes(q)) return false;
      if (neighborhood && m.neighborhood !== neighborhood) return false;
      if (!bucket.test(m)) return false;
      return true;
    });
  }, [data, query, pace, neighborhood]);

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6">
        <p className="label-meta text-muted-foreground">Community</p>
        <h1 className="font-display text-4xl mt-2">Members</h1>
        <p className="mt-2 text-muted-foreground">
          Find people running your pace, in your neighborhood. Only members who opted in are listed here.
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-3 mb-6">
        <Input
          placeholder="Search by name"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <select
          value={pace}
          onChange={(e) => setPace(e.target.value)}
          className="h-9 rounded-md border border-input bg-background px-3 text-sm"
        >
          {PACE_BUCKETS.map((b) => (
            <option key={b.id} value={b.id}>{b.label}</option>
          ))}
        </select>
        <select
          value={neighborhood}
          onChange={(e) => setNeighborhood(e.target.value)}
          className="h-9 rounded-md border border-input bg-background px-3 text-sm"
        >
          <option value="">Any neighborhood</option>
          {neighborhoods.map((n) => (
            <option key={n} value={n}>{n}</option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground">Loading members…</p>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-10 text-center">
          <p className="font-display text-lg">No matches yet</p>
          <p className="text-sm text-muted-foreground mt-1">
            Try widening the pace range or clearing filters.
          </p>
        </div>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((m) => (
            <li key={m.id} className="rounded-2xl border border-border bg-card p-5">
              <div className="flex items-start gap-3">
                {m.avatar_url ? (
                  <img src={m.avatar_url} alt="" className="h-12 w-12 rounded-full object-cover" />
                ) : (
                  <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center text-sm font-medium">
                    {initials(m.display_name)}
                  </div>
                )}
                <div className="min-w-0">
                  <p className="font-display text-lg truncate">{m.display_name ?? "Member"}</p>
                  <p className="text-sm text-muted-foreground truncate">
                    {m.neighborhood ?? m.city ?? "—"}
                  </p>
                </div>
              </div>
              <dl className="mt-4 grid grid-cols-2 gap-2 text-sm">
                <div>
                  <dt className="text-xs uppercase tracking-wide text-muted-foreground">Pace</dt>
                  <dd className="mt-0.5">{paceText(m)}</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wide text-muted-foreground">Times</dt>
                  <dd className="mt-0.5 truncate">{m.preferred_times?.[0] ?? "—"}</dd>
                </div>
              </dl>
              {m.goals && m.goals.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {m.goals.slice(0, 3).map((g) => (
                    <span key={g} className="rounded-full bg-muted px-2 py-0.5 text-xs">{g}</span>
                  ))}
                </div>
              )}
              <div className="mt-4 flex gap-2">
                <Link
                  to="/members/$id"
                  params={{ id: m.id }}
                  className="flex-1 inline-flex items-center justify-center rounded-md border border-border px-3 py-1.5 text-xs hover:bg-accent"
                >
                  View profile
                </Link>
                <Link
                  to="/compare/$otherId"
                  params={{ otherId: m.id }}
                  className="flex-1 inline-flex items-center justify-center rounded-md bg-foreground px-3 py-1.5 text-xs font-medium text-background hover:bg-foreground/90"
                >
                  Compare
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
