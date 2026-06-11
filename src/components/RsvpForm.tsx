import { useState, type FormEvent } from "react";
import { z } from "zod";

const schema = z.object({
  name: z.string().trim().min(1, "Name required").max(100),
  email: z.string().trim().email("Enter a valid email").max(255),
});

export function RsvpForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

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
      setStatus("success");
    } catch {
      setStatus("error");
      setError("Something broke. Try again or email hi@gryt.club.");
    }
  }

  if (status === "success") {
    return (
      <div className="border border-sky-brand/60 bg-sky-brand/10 p-6 md:p-8">
        <p className="label-meta text-sky-brand">● YOU'RE IN</p>
        <div className="rule-thin bg-sky-brand mt-2 mb-3 max-w-[60px]" />
        <p className="font-display text-2xl md:text-3xl leading-tight text-bone">
          See you Saturday, {name.split(" ")[0]}. 7 AM. <span className="underline-sky">Trailhead.</span>
        </p>
        <p className="mt-3 text-bone/70 text-sm">
          Check your inbox — we sent a confirmation to {email}.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="border border-bone/20 p-6 md:p-8 bg-ink">
      <p className="label-meta text-bone">RSVP for Saturday</p>
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
