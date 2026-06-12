import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useMemo, useRef, useState } from "react";
import { toBlob } from "html-to-image";
import { toast } from "sonner";
import {
  getChallenge,
  joinChallenge,
  leaveChallenge,
  toggleStep,
} from "@/lib/challenges.functions";
import { alignmentFor, displayName, formatPr } from "@/lib/athlete-alignment";
import {
  deleteSnapshot,
  listSnapshots,
  saveSnapshot,
  type ProgressSnapshot,
} from "@/lib/progress-gallery";

export const Route = createFileRoute("/_authenticated/challenges/$slug")({
  head: () => ({
    meta: [
      { title: "Challenge — GRYT" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ChallengeDetailPage,
});

function dateRange(a: string, b: string) {
  const fmt = (d: string) =>
    new Date(d + "T00:00:00Z").toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });
  return `${fmt(a)} – ${fmt(b)}`;
}

function ChallengeDetailPage() {
  const { slug } = Route.useParams();
  const queryClient = useQueryClient();
  const fetchChallenge = useServerFn(getChallenge);
  const join = useServerFn(joinChallenge);
  const leave = useServerFn(leaveChallenge);
  const toggle = useServerFn(toggleStep);

  const { data, isLoading, error } = useQuery({
    queryKey: ["challenge", slug],
    queryFn: () => fetchChallenge({ data: { slug } }),
  });

  const completedSet = useMemo(
    () => new Set(data?.myCompletedStepIds ?? []),
    [data?.myCompletedStepIds],
  );

  const stepCount = data?.steps.length ?? 0;
  const myCompleted = data?.myCompletedStepIds.length ?? 0;
  const pct = stepCount > 0 ? Math.round((myCompleted / stepCount) * 100) : 0;

  const cardRef = useRef<HTMLDivElement>(null);
  const [exporting, setExporting] = useState<null | "download" | "share">(null);
  const canShareFiles =
    typeof navigator !== "undefined" &&
    typeof navigator.canShare === "function" &&
    (() => {
      try {
        return navigator.canShare({
          files: [new File([new Blob([""], { type: "image/png" })], "t.png", { type: "image/png" })],
        });
      } catch {
        return false;
      }
    })();

  const joinMut = useMutation({
    mutationFn: (challenge_id: string) => join({ data: { challenge_id } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["challenge", slug] });
      queryClient.invalidateQueries({ queryKey: ["challenges"] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Could not join"),
  });

  const leaveMut = useMutation({
    mutationFn: (challenge_id: string) => leave({ data: { challenge_id } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["challenge", slug] });
      queryClient.invalidateQueries({ queryKey: ["challenges"] });
      toast.success("Left the challenge");
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Could not leave"),
  });

  const toggleMut = useMutation({
    mutationFn: (vars: { step_id: string; challenge_id: string; completed: boolean }) =>
      toggle({ data: vars }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["challenge", slug] });
      queryClient.invalidateQueries({ queryKey: ["challenges"] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Could not update"),
  });

  if (isLoading) {
    return <main className="mx-auto max-w-6xl px-4 py-10"><p className="text-muted-foreground">Loading…</p></main>;
  }
  if (error || !data) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-10">
        <p className="text-muted-foreground">Couldn't load this challenge.</p>
        <Link to="/challenges" className="text-sm underline">← Back to challenges</Link>
      </main>
    );
  }

  const c = data.challenge;
  const accent = c.accent_color;
  const me = data.me;
  const meName = me ? displayName(me) : "Member";
  const meAlignment = me ? alignmentFor(me.user_id, me.athlete_alignment) : null;
  const pngFilename = `gryt-challenge-${c.slug}-${pct}pct.png`;

  const [gallery, setGallery] = useState<ProgressSnapshot[]>([]);
  const galleryUrls = useMemo(() => {
    const map = new Map<string, string>();
    gallery.forEach((s) => map.set(s.id, URL.createObjectURL(s.blob)));
    return map;
  }, [gallery]);
  useEffect(() => {
    return () => {
      galleryUrls.forEach((u) => URL.revokeObjectURL(u));
    };
  }, [galleryUrls]);

  async function refreshGallery() {
    try {
      const items = await listSnapshots(slug);
      setGallery(items);
    } catch {
      // ignore — gallery is best-effort, browser-only
    }
  }

  useEffect(() => {
    refreshGallery();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  async function exportPng(mode: "download" | "share") {
    if (!cardRef.current || exporting) return;
    setExporting(mode);
    try {
      const blob = await toBlob(cardRef.current, {
        pixelRatio: 2,
        cacheBust: true,
        backgroundColor: "#0a0a0a",
      });
      if (!blob) throw new Error("Failed to render image");

      // Persist to local gallery (best-effort, IndexedDB)
      saveSnapshot({
        slug,
        pct,
        completed: myCompleted,
        stepCount,
        source: mode,
        blob,
      })
        .then(refreshGallery)
        .catch(() => {});

      const file = new File([blob], pngFilename, { type: "image/png" });

      if (
        mode === "share" &&
        typeof navigator !== "undefined" &&
        typeof navigator.canShare === "function" &&
        navigator.canShare({ files: [file] })
      ) {
        await navigator.share({
          files: [file],
          title: `${c.title} — ${pct}% complete`,
          text: `${meName} · ${myCompleted}/${stepCount} steps · ${pct}% on ${c.title}`,
        });
      } else {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = pngFilename;
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      if ((err as Error)?.name !== "AbortError") {
        toast.error(err instanceof Error ? err.message : "Couldn't render image");
      }
    } finally {
      setExporting(null);
    }
  }

  async function downloadSnapshot(s: ProgressSnapshot) {
    const url = URL.createObjectURL(s.blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `gryt-challenge-${s.slug}-${s.pct}pct-${s.capturedAt}.png`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function removeSnapshot(id: string) {
    await deleteSnapshot(id);
    refreshGallery();
  }


  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <Link to="/challenges" className="text-sm text-muted-foreground hover:text-foreground">← All challenges</Link>

      {/* Hero */}
      <header
        className="mt-4 rounded-3xl p-8 md:p-10 border"
        style={{
          backgroundColor: accent + "12",
          borderColor: accent + "55",
        }}
      >
        <div
          className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium"
          style={{ backgroundColor: accent + "33", color: accent }}
        >
          <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: accent }} />
          {c.theme.toUpperCase()}
        </div>
        <h1 className="font-display text-4xl md:text-5xl mt-3">{c.title}</h1>
        {c.tagline && <p className="text-lg text-muted-foreground mt-2">{c.tagline}</p>}

        {/* Key metrics row */}
        <dl className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
          <Metric label="Window" value={dateRange(c.starts_on, c.ends_on)} />
          <Metric
            label={c.target_label ?? "Target"}
            value={c.target_value != null ? `${c.target_value} ${c.unit ?? ""}`.trim() : "—"}
          />
          <Metric label="Joined" value={`${data.participantCount}`} />
          <Metric label="Steps" value={`${stepCount}`} />
        </dl>

        {/* Progress bar */}
        <div className="mt-8">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="font-medium">{data.joined ? "Your progress" : "Join to track progress"}</span>
            <span className="tabular-nums">{myCompleted}/{stepCount} · {pct}%</span>
          </div>
          <div className="h-3 w-full rounded-full bg-background/60 overflow-hidden border" style={{ borderColor: accent + "55" }}>
            <div
              className="h-full rounded-full transition-all"
              style={{ width: `${pct}%`, backgroundColor: accent }}
            />
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          {!data.joined ? (
            <button
              type="button"
              onClick={() => joinMut.mutate(c.id)}
              disabled={joinMut.isPending}
              className="inline-flex items-center rounded-md px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
              style={{ backgroundColor: accent }}
            >
              {joinMut.isPending ? "Joining…" : "Join challenge"}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => leaveMut.mutate(c.id)}
              disabled={leaveMut.isPending}
              className="inline-flex items-center rounded-md border border-border px-4 py-2 text-sm font-medium hover:bg-accent disabled:opacity-60"
            >
              {leaveMut.isPending ? "Leaving…" : "Leave"}
            </button>
          )}
          <button
            type="button"
            onClick={() => exportPng("share")}
            disabled={!!exporting}
            className="inline-flex items-center rounded-md border border-border px-4 py-2 text-sm font-medium hover:bg-accent disabled:opacity-60"
            title={canShareFiles ? "Share progress image" : "Save progress image"}
          >
            {exporting === "share"
              ? "Preparing…"
              : canShareFiles
                ? "↗ Share progress"
                : "↗ Save progress PNG"}
          </button>
          <button
            type="button"
            onClick={() => exportPng("download")}
            disabled={!!exporting}
            className="inline-flex items-center rounded-md border border-border px-4 py-2 text-sm font-medium hover:bg-accent disabled:opacity-60"
          >
            {exporting === "download" ? "Rendering…" : "↓ Download PNG"}
          </button>
        </div>
      </header>

      {c.description && (
        <p className="mt-6 max-w-3xl text-muted-foreground">{c.description}</p>
      )}

      {/* Steps */}
      <section className="mt-10">
        <h2 className="font-display text-2xl mb-4">Steps</h2>
        <ol className="space-y-3">
          {data.steps.map((s) => {
            const done = completedSet.has(s.id);
            return (
              <li
                key={s.id}
                className={
                  "rounded-2xl border bg-card p-5 flex items-start gap-4 transition-colors " +
                  (done ? "border-foreground/40" : "border-border")
                }
              >
                <button
                  type="button"
                  onClick={() =>
                    toggleMut.mutate({ step_id: s.id, challenge_id: c.id, completed: !done })
                  }
                  disabled={toggleMut.isPending}
                  aria-pressed={done}
                  className={
                    "mt-0.5 h-6 w-6 shrink-0 rounded-md border flex items-center justify-center transition-all " +
                    (done ? "text-white" : "bg-background hover:border-foreground/60 border-border")
                  }
                  style={done ? { backgroundColor: accent, borderColor: accent } : undefined}
                >
                  {done && (
                    <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                      <path
                        fillRule="evenodd"
                        d="M16.704 5.296a1 1 0 010 1.408l-7.5 7.5a1 1 0 01-1.408 0l-3.5-3.5a1 1 0 011.408-1.408L8.5 12.092l6.796-6.796a1 1 0 011.408 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </button>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-3">
                    <p className={"font-medium " + (done ? "line-through text-muted-foreground" : "")}>
                      <span className="text-muted-foreground mr-2 tabular-nums">{String(s.ordinal).padStart(2, "0")}</span>
                      {s.title}
                    </p>
                    {s.target_value != null && (
                      <span className="text-xs text-muted-foreground shrink-0">
                        {s.target_value} {s.unit}
                      </span>
                    )}
                  </div>
                  {s.description && (
                    <p className="text-sm text-muted-foreground mt-1">{s.description}</p>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
      </section>

      {/* Participants — each with unique athlete alignment */}
      <section className="mt-12">
        <div className="flex items-baseline justify-between mb-4">
          <h2 className="font-display text-2xl">Who's in</h2>
          <span className="text-sm text-muted-foreground">{data.participants.length} members</span>
        </div>
        {data.participants.length === 0 ? (
          <p className="text-sm text-muted-foreground">Be the first to join.</p>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data.participants.map((p) => {
              const a = alignmentFor(p.user_id, p.athlete_alignment);
              const memberPct = stepCount > 0 ? Math.round((p.completed / stepCount) * 100) : 0;
              return (
                <li
                  key={p.user_id}
                  className={"rounded-2xl border bg-card p-5 ring-1 " + a.ring}
                >
                  <div className="flex items-start gap-3">
                    {p.avatar_url ? (
                      <img src={p.avatar_url} alt="" className="h-12 w-12 rounded-full object-cover" />
                    ) : (
                      <div
                        className={"h-12 w-12 rounded-full flex items-center justify-center text-sm font-semibold " + a.bg + " " + a.text}
                      >
                        {displayName(p).slice(0, 1).toUpperCase()}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="font-display text-lg leading-tight truncate">{displayName(p)}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {p.neighborhood ?? "—"}
                      </p>
                    </div>
                  </div>

                  <div className={"mt-4 rounded-lg px-3 py-2 " + a.bg}>
                    <p className={"text-xs uppercase tracking-wide font-semibold " + a.text}>
                      Aligned with
                    </p>
                    <p className="text-sm font-medium mt-0.5">{a.name}</p>
                    <p className="text-xs text-muted-foreground">{a.discipline}</p>
                  </div>

                  <dl className="mt-4 grid grid-cols-2 gap-2 text-xs">
                    <PrStat label="5K"  value={formatPr(p.best_5k_seconds)} />
                    <PrStat label="10K" value={formatPr(p.best_10k_seconds)} />
                    <PrStat label="Half"     value={formatPr(p.best_half_seconds)} />
                    <PrStat label="Marathon" value={formatPr(p.best_marathon_seconds)} />
                  </dl>

                  <div className="mt-4">
                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                      <span>Progress</span>
                      <span className="tabular-nums">{p.completed}/{stepCount} · {memberPct}%</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${memberPct}%`, backgroundColor: a.accent }}
                      />
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* Off-screen shareable card — rendered at 1080x1350 (4:5, Insta-friendly) */}
      <div
        aria-hidden
        style={{
          position: "fixed",
          left: -10000,
          top: 0,
          pointerEvents: "none",
          opacity: 0,
        }}
      >
        <div
          ref={cardRef}
          style={{
            width: 1080,
            height: 1350,
            background: `linear-gradient(155deg, #0a0a0a 0%, #0a0a0a 55%, ${accent}33 100%)`,
            color: "#f5f5f0",
            position: "relative",
            overflow: "hidden",
            fontFamily: "ui-sans-serif, system-ui",
            padding: 80,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          {/* Accent bar */}
          <div
            style={{
              position: "absolute",
              top: -80,
              right: -120,
              width: 700,
              height: 180,
              background: accent,
              transform: "rotate(-12deg)",
              opacity: 0.95,
            }}
          />
          {/* Watermark % */}
          <div
            style={{
              position: "absolute",
              right: 60,
              bottom: -140,
              fontSize: 720,
              lineHeight: 1,
              fontWeight: 900,
              color: "rgba(255,255,255,0.05)",
              letterSpacing: "-0.05em",
              userSelect: "none",
            }}
          >
            {pct}
          </div>

          <div style={{ position: "relative" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <span
                style={{
                  width: 18,
                  height: 18,
                  background: accent,
                  borderRadius: 999,
                  display: "inline-block",
                }}
              />
              <span
                style={{
                  fontFamily: "ui-monospace, SFMono-Regular, monospace",
                  fontSize: 22,
                  letterSpacing: "0.2em",
                  color: "rgba(255,255,255,0.7)",
                }}
              >
                GRYT · CHALLENGE PROGRESS
              </span>
            </div>
            <div style={{ height: 4, width: 90, background: accent, marginTop: 16 }} />
            <p
              style={{
                marginTop: 28,
                fontSize: 28,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: "rgba(255,255,255,0.55)",
              }}
            >
              {c.theme}
            </p>
            <h2
              style={{
                fontSize: 84,
                fontWeight: 900,
                lineHeight: 0.95,
                marginTop: 10,
                letterSpacing: "-0.02em",
              }}
            >
              {c.title}
            </h2>
            {c.tagline && (
              <p
                style={{
                  marginTop: 18,
                  fontSize: 30,
                  fontWeight: 500,
                  color: "rgba(255,255,255,0.75)",
                  maxWidth: 880,
                }}
              >
                {c.tagline}
              </p>
            )}
          </div>

          {/* Big % + name */}
          <div style={{ position: "relative" }}>
            <div
              style={{
                fontSize: 36,
                fontWeight: 700,
                color: "rgba(255,255,255,0.7)",
                letterSpacing: "-0.01em",
              }}
            >
              {meName}
            </div>
            {meAlignment && (
              <div
                style={{
                  marginTop: 8,
                  fontFamily: "ui-monospace, SFMono-Regular, monospace",
                  fontSize: 22,
                  letterSpacing: "0.18em",
                  color: meAlignment.accent,
                }}
              >
                ALIGNED · {meAlignment.name.toUpperCase()}
              </div>
            )}
            <div style={{ display: "flex", alignItems: "baseline", gap: 24, marginTop: 24 }}>
              <span
                style={{
                  fontSize: 280,
                  fontWeight: 900,
                  lineHeight: 0.85,
                  letterSpacing: "-0.04em",
                  color: accent,
                }}
              >
                {pct}
                <span style={{ fontSize: 120, color: "rgba(255,255,255,0.85)" }}>%</span>
              </span>
              <div style={{ paddingBottom: 24 }}>
                <div
                  style={{
                    fontSize: 30,
                    fontWeight: 800,
                    color: "rgba(255,255,255,0.9)",
                  }}
                >
                  {myCompleted}/{stepCount}
                </div>
                <div
                  style={{
                    fontSize: 20,
                    letterSpacing: "0.18em",
                    color: "rgba(255,255,255,0.55)",
                    marginTop: 4,
                  }}
                >
                  STEPS COMPLETE
                </div>
              </div>
            </div>

            {/* Progress bar */}
            <div
              style={{
                marginTop: 24,
                height: 18,
                width: "100%",
                borderRadius: 999,
                background: "rgba(255,255,255,0.08)",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: `${pct}%`,
                  background: accent,
                  borderRadius: 999,
                }}
              />
            </div>
          </div>

          {/* PRs */}
          <div style={{ position: "relative", borderTop: "1px solid rgba(255,255,255,0.18)", paddingTop: 32 }}>
            <div
              style={{
                fontFamily: "ui-monospace, SFMono-Regular, monospace",
                fontSize: 20,
                letterSpacing: "0.2em",
                color: "rgba(255,255,255,0.55)",
                marginBottom: 18,
              }}
            >
              PERSONAL RECORDS
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 24 }}>
              <PrCard label="5K" value={formatPr(me?.best_5k_seconds ?? null)} />
              <PrCard label="10K" value={formatPr(me?.best_10k_seconds ?? null)} />
              <PrCard label="HALF" value={formatPr(me?.best_half_seconds ?? null)} />
              <PrCard label="MARATHON" value={formatPr(me?.best_marathon_seconds ?? null)} />
            </div>
            <div
              style={{
                marginTop: 32,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span
                style={{
                  fontFamily: "ui-monospace, SFMono-Regular, monospace",
                  fontSize: 20,
                  letterSpacing: "0.2em",
                  color: "rgba(255,255,255,0.55)",
                }}
              >
                GRYT.CLUB
              </span>
              <span
                style={{
                  fontFamily: "ui-monospace, SFMono-Regular, monospace",
                  fontSize: 20,
                  letterSpacing: "0.2em",
                  color: accent,
                }}
              >
                {dateRange(c.starts_on, c.ends_on).toUpperCase()}
              </span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

function PrCard({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        background: "rgba(255,255,255,0.06)",
        borderRadius: 16,
        padding: "18px 20px",
      }}
    >
      <div
        style={{
          fontFamily: "ui-monospace, SFMono-Regular, monospace",
          fontSize: 16,
          letterSpacing: "0.2em",
          color: "rgba(255,255,255,0.55)",
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: 40,
          fontWeight: 800,
          marginTop: 6,
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {value}
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-muted-foreground">{label}</dt>
      <dd className="font-display text-xl mt-0.5">{value}</dd>
    </div>
  );
}

function PrStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-muted/50 px-2 py-1.5">
      <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{label} PR</p>
      <p className="text-sm tabular-nums">{value}</p>
    </div>
  );
}
