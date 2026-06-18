import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { z } from "zod";
import { getWelcomeContext, type WelcomeContext } from "@/lib/welcome.functions";

export const Route = createFileRoute("/welcome")({
  loader: () => getWelcomeContext(),
  head: () => ({
    meta: [
      { title: "Welcome to GRYT — Saturday Run Club" },
      {
        name: "description",
        content:
          "You found us. Drop your name, get on the Saturday list, and we'll see you at the trailhead.",
      },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Welcome to GRYT" },
      { property: "og:description", content: "Saturday run club. Pittsburgh. All paces." },
    ],
  }),
  component: WelcomePage,
  errorComponent: WelcomeError,
});

function WelcomeError() {
  return (
    <main className="min-h-screen bg-black text-white grid place-items-center p-8">
      <div className="text-center space-y-4">
        <p className="text-sm uppercase tracking-[0.14em] text-sky-400">Something broke</p>
        <p>Refresh, or DM @grytclub on IG and we'll get you on the list.</p>
      </div>
    </main>
  );
}

const schema = z.object({
  name: z.string().trim().min(1, "Name required").max(100),
  email: z.string().trim().email("Enter a valid email").max(255),
});

function formatLongDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}

function formatTime(t: string): string {
  const [h, m] = t.split(":").map(Number);
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return d.toLocaleTimeString("en-US", { hour: "numeric", minute: m ? "2-digit" : undefined });
}

function WelcomePage() {
  const { nextSaturday, inviters } = Route.useLoaderData() as WelcomeContext;

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [inviterId, setInviterId] = useState<string>("");
  const [inviterFreeform, setInviterFreeform] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setErrorMsg(null);
    const parsed = schema.safeParse({ name, email });
    if (!parsed.success) {
      setErrorMsg(parsed.error.issues[0]?.message ?? "Check your inputs");
      return;
    }
    setStatus("loading");
    try {
      const res = await fetch("/api/public/welcome", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...parsed.data,
          inviter_user_id: inviterId || null,
          inviter_freeform: inviterId ? null : inviterFreeform || null,
          event_id: nextSaturday?.id ?? null,
        }),
      });
      if (!res.ok) throw new Error("request failed");
      setStatus("success");
    } catch {
      setStatus("error");
      setErrorMsg("Couldn't save. Try again in a sec.");
    }
  }

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-md px-6 py-12">
        <header className="space-y-3 mb-10">
          <p className="text-xs uppercase tracking-[0.14em] text-sky-400">gryt run club</p>
          <h1 className="font-display text-5xl leading-[0.92] tracking-tight">
            Welcome to <span className="lowercase italic">gryt</span>.
          </h1>
          <p className="text-white/70 text-base leading-relaxed">
            You found us. Drop your info and you're on the Saturday list.
          </p>
        </header>

        {status === "success" ? (
          <ConfirmationCard
            name={name}
            nextSaturday={nextSaturday}
            email={email}
          />
        ) : (
          <form onSubmit={onSubmit} className="space-y-5">
            <Field label="Your name">
              <input
                type="text"
                required
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-white/5 border border-white/15 rounded-none px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-sky-400"
                placeholder="Jordan Smith"
              />
            </Field>

            <Field label="Email">
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white/5 border border-white/15 rounded-none px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-sky-400"
                placeholder="you@example.com"
              />
            </Field>

            <Field label="Who invited you?" optional>
              <select
                value={inviterId}
                onChange={(e) => setInviterId(e.target.value)}
                className="w-full bg-white/5 border border-white/15 rounded-none px-4 py-3 text-white focus:outline-none focus:border-sky-400"
              >
                <option value="">Walked up / saw the QR</option>
                {inviters.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.display_name ?? p.first_name ?? "GRYT member"}
                  </option>
                ))}
              </select>
              {!inviterId && (
                <input
                  type="text"
                  value={inviterFreeform}
                  onChange={(e) => setInviterFreeform(e.target.value)}
                  className="mt-2 w-full bg-white/5 border border-white/15 rounded-none px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-sky-400"
                  placeholder="Or type a name (optional)"
                  maxLength={120}
                />
              )}
            </Field>

            {errorMsg && (
              <p className="text-sm text-red-400" role="alert">
                {errorMsg}
              </p>
            )}

            <button
              type="submit"
              disabled={status === "loading"}
              className="w-full bg-sky-400 hover:bg-sky-300 active:translate-y-px text-black font-display font-bold uppercase tracking-[0.04em] px-6 py-4 transition-colors disabled:opacity-60"
            >
              {status === "loading" ? "Saving…" : "I'm in"}
            </button>

            <p className="text-xs text-white/40 text-center pt-2">
              We'll only email you about the run. Unsubscribe anytime.
            </p>
          </form>
        )}
      </div>
    </main>
  );
}

function Field({
  label,
  optional,
  children,
}: {
  label: string;
  optional?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block space-y-2">
      <span className="text-xs uppercase tracking-[0.14em] text-white/60">
        {label}
        {optional && <span className="text-white/30 normal-case tracking-normal"> · optional</span>}
      </span>
      {children}
    </label>
  );
}

function ConfirmationCard({
  name,
  nextSaturday,
  email,
}: {
  name: string;
  nextSaturday: WelcomeContext["nextSaturday"];
  email: string;
}) {
  const firstName = name.trim().split(/\s+/)[0] || "Runner";
  return (
    <div className="border border-sky-400/40 bg-sky-400/5 p-6 space-y-5">
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-[0.14em] text-sky-400">You're in</p>
        <h2 className="font-display text-3xl leading-tight">See you Saturday, {firstName}.</h2>
      </div>

      {nextSaturday ? (
        <div className="space-y-1 text-white/90">
          <p className="text-lg font-medium">{formatLongDate(nextSaturday.event_date)}</p>
          <p className="text-white/70">
            {formatTime(nextSaturday.start_time)} ·{" "}
            <span className="underline decoration-sky-400 underline-offset-4">
              {nextSaturday.location_name}
            </span>
          </p>
          {nextSaturday.location_address && (
            <p className="text-sm text-white/50">{nextSaturday.location_address}</p>
          )}
        </div>
      ) : (
        <p className="text-white/70">
          Next Saturday's run gets posted Monday. We'll ping <strong>{email}</strong> with details.
        </p>
      )}

      <div className="pt-2 border-t border-white/10 space-y-3">
        <p className="text-sm text-white/70">
          Want to track your streak and see the leaderboard?
        </p>
        <Link
          to="/auth"
          className="inline-block border border-white/30 hover:border-sky-400 hover:text-sky-300 px-5 py-2.5 text-xs uppercase tracking-[0.14em] transition-colors"
        >
          Create your account
        </Link>
      </div>
    </div>
  );
}
