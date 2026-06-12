import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { toPng, toBlob } from "html-to-image";
import { getRecapBySlug, type RecapDetail } from "@/lib/recaps.functions";
import { getRequestOrigin } from "@/lib/origin.functions";

export const Route = createFileRoute("/runs/$slug/recap")({
  loader: async ({ params }) => {
    const [recap, origin] = await Promise.all([
      getRecapBySlug({ data: { slug: params.slug } }),
      getRequestOrigin(),
    ]);
    return { recap, origin };
  },
  head: ({ params, loaderData }) => {
    const r = loaderData?.recap as RecapDetail | undefined;
    const origin = loaderData?.origin as string | undefined;
    const title = r ? `Recap: ${r.title} — GRYT Run Club` : "Run recap — GRYT Run Club";
    const desc = r
      ? `${r.attendee_count} runners showed up on ${formatLongDate(r.event_date)} for ${r.title}. Tap to share.`
      : "GRYT run recap.";
    const url = origin && r ? `${origin}/runs/${r.slug}/recap` : `/runs/${params.slug}/recap`;
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        { property: "og:url", content: url },
        { property: "og:type", content: "article" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
      links: [
        { rel: "canonical", href: url },
      ],
    };
  },
  component: RecapPage,
  errorComponent: RecapError,
  notFoundComponent: RecapNotFound,
});

function RecapError({ error, reset }: { error: Error; reset: () => void }) {
  const router = useRouter();
  return (
    <main className="min-h-screen bg-ink text-bone px-6 py-24">
      <div className="mx-auto max-w-xl text-center">
        <p className="label-meta text-sky-brand">● COULDN'T LOAD RECAP</p>
        <div className="rule-thin bg-sky-brand mt-2 mb-4 mx-auto max-w-[60px]" />
        <h1 className="font-display text-3xl">Something broke loading this recap.</h1>
        {import.meta.env.DEV && (
          <pre className="mt-4 text-left text-xs text-bone/60 overflow-auto">{error.message}</pre>
        )}
        <button
          onClick={() => { router.invalidate(); reset(); }}
          className="mt-6 inline-flex items-center bg-sky-brand text-ink px-6 py-3 label-meta hover:bg-bone transition-colors"
        >
          TRY AGAIN
        </button>
      </div>
    </main>
  );
}

function RecapNotFound() {
  return (
    <main className="min-h-screen bg-ink text-bone px-6 py-24">
      <div className="mx-auto max-w-xl text-center">
        <p className="label-meta text-sky-brand">● NO RECAP YET</p>
        <div className="rule-thin bg-sky-brand mt-2 mb-4 mx-auto max-w-[60px]" />
        <h1 className="font-display text-3xl">This run doesn't have a recap.</h1>
        <p className="mt-3 text-bone/70">Recaps are auto-generated the day after each run.</p>
        <Link to="/runs" className="mt-6 inline-flex items-center border border-bone/40 text-bone px-6 py-3 label-meta hover:border-sky-brand hover:text-sky-brand transition-colors">
          ← ALL RUNS
        </Link>
      </div>
    </main>
  );
}

function formatLongDate(iso: string): string {
  const d = new Date(`${iso}T12:00:00Z`);
  return d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric", timeZone: "UTC" });
}
function formatShortDate(iso: string): string {
  const d = new Date(`${iso}T12:00:00Z`);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" }).toUpperCase();
}
function filenameDate(iso: string): string {
  const d = new Date(`${iso}T12:00:00Z`);
  const yyyy = d.getUTCFullYear();
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(d.getUTCDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function RecapPage() {
  const { recap: r, origin } = Route.useLoaderData() as { recap: RecapDetail; origin: string };
  const cardRef = useRef<HTMLDivElement>(null);
  const [busy, setBusy] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [progress, setProgress] = useState(0);
  const progressRef = useRef<number>(0);
  const rafRef = useRef<number | null>(null);

  const isExporting = busy || sharing;

  function startProgress() {
    setProgress(0);
    progressRef.current = 0;
    const start = performance.now();
    const duration = 2500; // ms — typical render time for 1080@2x

    function tick(now: number) {
      const elapsed = now - start;
      const p = Math.min((elapsed / duration) * 100, 99);
      progressRef.current = p;
      setProgress(p);
      if (p < 99) {
        rafRef.current = requestAnimationFrame(tick);
      }
    }
    rafRef.current = requestAnimationFrame(tick);
  }

  function stopProgress() {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    setProgress(100);
    setTimeout(() => setProgress(0), 400);
  }

  const canShareFiles =
    typeof navigator !== "undefined" &&
    typeof navigator.canShare === "function" &&
    // feature-test with a tiny dummy file
    (() => {
      try {
        return navigator.canShare({
          files: [new File([new Blob([""], { type: "image/png" })], "t.png", { type: "image/png" })],
        });
      } catch {
        return false;
      }
    })();

  const publicUrl = `${origin}/runs/${r.slug}/recap`;
  const pngFilename = `gryt-${filenameDate(r.event_date)}-${r.slug}.png`;

  async function download() {
    if (!cardRef.current || isExporting) return;
    setBusy(true);
    startProgress();
    try {
      const dataUrl = await toPng(cardRef.current, {
        pixelRatio: 2,
        cacheBust: true,
        backgroundColor: "#0a0a0a",
      });
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = `gryt-recap-${r.slug}.png`;
      a.click();
    } finally {
      stopProgress();
      setBusy(false);
    }
  }

  async function shareImage() {
    if (!cardRef.current || isExporting) return;
    setSharing(true);
    startProgress();
    try {
      const blob = await toBlob(cardRef.current, {
        pixelRatio: 2,
        cacheBust: true,
        backgroundColor: "#0a0a0a",
      });
      if (!blob) throw new Error("Failed to render image");
      const file = new File([blob], `gryt-recap-${r.slug}.png`, { type: "image/png" });

      if (
        typeof navigator !== "undefined" &&
        typeof navigator.canShare === "function" &&
        navigator.canShare({ files: [file] })
      ) {
        await navigator.share({
          files: [file],
          title: `Recap: ${r.title}`,
          text: `${r.attendee_count} runners showed up for ${r.title}.`,
          url: publicUrl,
        });
      } else {
        // Fallback: download
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `gryt-recap-${r.slug}.png`;
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      // AbortError = user dismissed; ignore
      if ((err as Error)?.name !== "AbortError") {
        console.error(err);
      }
    } finally {
      stopProgress();
      setSharing(false);
    }
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(publicUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for browsers that block clipboard
      const input = document.createElement("input");
      input.value = publicUrl;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <main className="min-h-screen bg-ink text-bone px-6 py-12 md:py-16">
      <div className="mx-auto max-w-3xl">
        <Link to="/runs/$slug" params={{ slug: r.slug }} className="label-meta text-bone/60 hover:text-sky-brand">
          ← BACK TO RUN
        </Link>

        <p className="label-meta text-sky-brand mt-8">● POST-RUN RECAP</p>
        <div className="rule-thin bg-sky-brand mt-2 mb-4 max-w-[60px]" />
        <h1 className="font-display text-4xl md:text-5xl leading-[0.95]">Shareable card</h1>
        <p className="mt-3 text-bone/70">
          Download and post to Instagram, Strava, or anywhere else. 1080×1080 PNG.
        </p>

        <div className="mt-8 flex justify-center">
          {/* Shareable card — fixed 1080x1080 at scale; scaled down for preview via wrapper */}
          <div className="origin-top" style={{ transform: "scale(min(1, calc((100vw - 48px) / 1080)))" }}>
            <div
              ref={cardRef}
              className="relative overflow-hidden text-bone"
              style={{
                width: 1080,
                height: 1080,
                background: "linear-gradient(155deg, #0a0a0a 0%, #0a0a0a 55%, #112233 100%)",
                fontFamily: "var(--font-display, ui-sans-serif)",
              }}
            >
              {/* Diagonal sky-brand bar */}
              <div
                className="absolute"
                style={{
                  top: -80, right: -120, width: 600, height: 160,
                  background: "hsl(200 95% 58%)",
                  transform: "rotate(-12deg)",
                  opacity: 0.95,
                }}
              />
              {/* Big watermark mileage */}
              {r.distance_mi != null && (
                <div
                  className="absolute select-none"
                  style={{
                    right: 40, bottom: -60,
                    fontSize: 720, lineHeight: 1, fontWeight: 900,
                    color: "rgba(255,255,255,0.04)",
                    letterSpacing: "-0.05em",
                  }}
                >
                  {r.distance_mi}
                </div>
              )}

              <div className="relative h-full flex flex-col justify-between p-20">
                <div>
                  <div className="flex items-center gap-4">
                    <span style={{ width: 18, height: 18, background: "hsl(200 95% 58%)", borderRadius: 999, display: "inline-block" }} />
                    <span style={{ fontFamily: "ui-monospace, SFMono-Regular, monospace", fontSize: 22, letterSpacing: "0.2em", color: "rgba(255,255,255,0.7)" }}>
                      GRYT RUN CLUB · {formatShortDate(r.event_date)}
                    </span>
                  </div>
                  <div style={{ height: 4, width: 90, background: "hsl(200 95% 58%)", marginTop: 16 }} />
                  <h2
                    style={{
                      fontFamily: "var(--font-display, ui-sans-serif)",
                      fontSize: 132, fontWeight: 900, lineHeight: 0.92,
                      marginTop: 40, letterSpacing: "-0.02em",
                    }}
                  >
                    {r.attendee_count}
                    <span style={{ fontSize: 56, fontWeight: 700, marginLeft: 18, color: "rgba(255,255,255,0.65)" }}>
                      SHOWED UP
                    </span>
                  </h2>
                  <p
                    style={{
                      marginTop: 28, fontSize: 44, fontWeight: 700, lineHeight: 1.1,
                      maxWidth: 800,
                    }}
                  >
                    {r.hero_caption ?? r.title}
                  </p>
                </div>

                <div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 32, borderTop: "1px solid rgba(255,255,255,0.18)", paddingTop: 36 }}>
                    <Stat label="DISTANCE" value={r.distance_mi != null ? `${r.distance_mi} mi` : "—"} />
                    <Stat label="PACE" value={r.pace_label ?? "All paces"} />
                    <Stat label="WHERE" value={r.location_name} />
                  </div>
                  <div style={{ marginTop: 36, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontFamily: "ui-monospace, SFMono-Regular, monospace", fontSize: 20, letterSpacing: "0.2em", color: "rgba(255,255,255,0.55)" }}>
                      GRYT.CLUB
                    </span>
                    <span style={{ fontFamily: "ui-monospace, SFMono-Regular, monospace", fontSize: 20, letterSpacing: "0.2em", color: "hsl(200 95% 58%)" }}>
                      SATURDAYS · 7 AM
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={download}
            disabled={isExporting}
            className="bg-sky-brand text-ink px-8 py-4 label-meta hover:bg-bone transition-colors disabled:opacity-60"
          >
            {busy ? "RENDERING…" : "↓ DOWNLOAD PNG"}
          </button>
          <button
            onClick={shareImage}
            disabled={isExporting}
            className="bg-bone text-ink px-8 py-4 label-meta hover:bg-sky-brand transition-colors disabled:opacity-60"
          >
            {sharing ? "PREPARING…" : canShareFiles ? "↗ SHARE IMAGE" : "↗ SHARE / SAVE PNG"}
          </button>
          <button
            onClick={copyLink}
            disabled={isExporting}
            className="border border-bone/40 text-bone px-8 py-4 label-meta hover:border-sky-brand hover:text-sky-brand transition-colors text-center disabled:opacity-40"
          >
            {copied ? "✓ LINK COPIED" : "↗ COPY LINK"}
          </button>
          <Link
            to="/runs/$slug"
            params={{ slug: r.slug }}
            className="border border-bone/40 text-bone px-8 py-4 label-meta hover:border-sky-brand hover:text-sky-brand transition-colors text-center"
          >
            BACK TO RUN
          </Link>
        </div>

        {/* Export progress bar */}
        {isExporting && (
          <div className="mt-6 mx-auto max-w-xl">
            <div className="flex justify-between items-center mb-2">
              <span className="label-meta text-bone/70">
                {busy ? "RENDERING CARD" : "PREPARING SHARE"}
              </span>
              <span className="label-meta text-sky-brand">
                {Math.round(progress)}%
              </span>
            </div>
            <div className="h-1.5 w-full bg-bone/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-sky-brand transition-[width] duration-100 ease-linear rounded-full"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div style={{ fontFamily: "ui-monospace, SFMono-Regular, monospace", fontSize: 18, letterSpacing: "0.2em", color: "rgba(255,255,255,0.55)" }}>
        {label}
      </div>
      <div style={{ fontSize: 36, fontWeight: 800, marginTop: 8, lineHeight: 1.1 }}>{value}</div>
    </div>
  );
}
