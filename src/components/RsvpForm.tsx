import { useEffect, useState, type FormEvent } from "react";
import { z } from "zod";
import { useQueryClient } from "@tanstack/react-query";

const schema = z.object({
  name: z.string().trim().min(1, "Name required").max(100),
  email: z.string().trim().email("Enter a valid email").max(255),
});

type RsvpFormProps = {
  /** Stable identifier for this run (slug). Used to persist RSVP locally. */
  eventKey?: string;
  /** Pretty date string shown in the confirmation, e.g. "Saturday, June 14". */
  eventDateLabel?: string;
  /** Pretty time string shown in the confirmation, e.g. "7 AM". */
  eventTimeLabel?: string;
  /** Pretty meeting spot, e.g. "Trailhead". */
  eventLocationLabel?: string;
};

type StoredRsvp = { name: string; email: string; at: number };

function storageKey(eventKey?: string) {
  return eventKey ? `gryt:rsvp:${eventKey}` : null;
}

function readStored(eventKey?: string): StoredRsvp | null {
  const key = storageKey(eventKey);
  if (!key || typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredRsvp;
    if (parsed && typeof parsed.email === "string") return parsed;
  } catch {
    /* ignore */
  }
  return null;
}

export function RsvpForm({
  eventKey,
  eventDateLabel,
  eventTimeLabel,
  eventLocationLabel,
}: RsvpFormProps = {}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [stored, setStored] = useState<StoredRsvp | null>(null);
  const queryClient = useQueryClient();

  // Hydrate after mount so SSR markup matches client.
  useEffect(() => {
    const existing = readStored(eventKey);
    if (existing) {
      setStored(existing);
      setName(existing.name);
      setEmail(existing.email);
      setStatus("success");
    }
  }, [eventKey]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    const parsed = schema.safeParse({ name, email });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Invalid input");
      return;
    }
    setStatus("loading");
    try {
      const res = await fetch("/api/public/rsvp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      if (!res.ok) throw new Error("request failed");
      const record: StoredRsvp = { ...parsed.data, at: Date.now() };
      const key = storageKey(eventKey);
      if (key && typeof window !== "undefined") {
        try {
          window.localStorage.setItem(key, JSON.stringify(record));
        } catch {
          /* ignore quota / privacy mode */
        }
      }
      setStored(record);
      setStatus("success");
      queryClient.invalidateQueries({ queryKey: ["rsvp-stats"] });
    } catch {
      setStatus("error");
      setError("Something broke. Try again or email hi@gryt.club.");
    }
  }

  function resetForm() {
    const key = storageKey(eventKey);
    if (key && typeof window !== "undefined") {
      try {
        window.localStorage.removeItem(key);
      } catch {
        /* ignore */
      }
    }
    setStored(null);
    setStatus("idle");
    setError(null);
    setName("");
    setEmail("");
  }

  if (status === "success") {
    const firstName = (stored?.name ?? name).split(" ")[0] || "runner";
    const confirmEmail = stored?.email ?? email;
    const dateBit = eventDateLabel ?? "Saturday";
    const timeBit = eventTimeLabel ?? "7 AM";
    const spotBit = eventLocationLabel ?? "Trailhead";
    return (
      <div className="border border-sky-brand/60 bg-sky-brand/10 p-6 md:p-8">
        <p className="label-meta text-sky-brand">● YOU'RE IN</p>
        <div className="rule-thin bg-sky-brand mt-2 mb-3 max-w-[60px]" />
        <p className="font-display text-2xl md:text-3xl leading-tight text-bone">
          See you {dateBit}, {firstName}. {timeBit}.{" "}
          <span className="underline-sky">{spotBit}.</span>
        </p>
        <p className="mt-3 text-bone/70 text-sm">
          {stored
            ? `RSVP saved for ${confirmEmail}. We'll send reminders as it gets closer.`
            : `Check your inbox — we sent a confirmation to ${confirmEmail}.`}
        </p>
        {eventKey && (
          <button
            type="button"
            onClick={resetForm}
            className="mt-4 label-meta text-bone/60 hover:text-sky-brand underline-offset-4 hover:underline"
          >
            NOT YOU? RSVP AGAIN →
          </button>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="border border-bone/20 p-6 md:p-8 bg-ink">
      <p className="label-meta text-bone">RSVP for {eventDateLabel ?? "Saturday"}</p>
      <div className="rule-thin bg-bone mt-2 mb-5 max-w-[60px]" />
      <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr_auto] gap-3">
        <label className="block">
          <span className="sr-only">Name</span>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            maxLength={100}
            className="w-full bg-transparent border border-bone/30 text-bone placeholder:text-bone/40 px-4 py-3 label-meta focus:outline-none focus:border-sky-brand"
          />
        </label>
        <label className="block">
          <span className="sr-only">Email</span>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@email.com"
            maxLength={255}
            className="w-full bg-transparent border border-bone/30 text-bone placeholder:text-bone/40 px-4 py-3 label-meta focus:outline-none focus:border-sky-brand"
          />
        </label>
        <button
          type="submit"
          disabled={status === "loading"}
          className="inline-flex items-center justify-center bg-sky-brand text-ink px-6 py-3.5 label-meta shadow-[0_0_24px_rgba(137,207,240,0.35)] hover:shadow-[0_0_32px_rgba(137,207,240,0.5)] hover:bg-bone transition-all disabled:opacity-60"
        >
          {status === "loading" ? "SENDING..." : "COUNT ME IN →"}
        </button>
      </div>
      {error && <p className="mt-3 text-sm text-sky-brand">{error}</p>}
    </form>
  );
}
