import { createClient } from "@supabase/supabase-js";
import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

const schema = z.object({
  name: z.string().trim().min(1).max(100),
  email: z.string().trim().email().max(255),
  inviter_user_id: z.string().uuid().nullable().optional(),
  inviter_freeform: z.string().trim().max(120).nullable().optional(),
  event_id: z.string().uuid().nullable().optional(),
});

export const Route = createFileRoute("/api/public/welcome")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
        if (!supabaseUrl || !serviceKey) {
          return Response.json({ error: "Server misconfigured" }, { status: 500 });
        }

        let body;
        try {
          body = schema.parse(await request.json());
        } catch {
          return Response.json({ error: "Invalid input" }, { status: 400 });
        }

        const supabase = createClient(supabaseUrl, serviceKey);

        // 1. RSVP row — feeds existing Saturday reminder + RSVP counter.
        const { error: rsvpErr } = await supabase
          .from("rsvps")
          .insert({ name: body.name, email: body.email });
        if (rsvpErr) {
          console.error("welcome rsvp insert failed", rsvpErr);
          return Response.json({ error: "Failed to save RSVP" }, { status: 500 });
        }

        // 2. Welcome attribution row — captures inviter + event for later credit.
        const { error: welcomeErr } = await supabase.from("welcome_signups").insert({
          name: body.name,
          email: body.email.toLowerCase(),
          inviter_user_id: body.inviter_user_id ?? null,
          inviter_freeform: body.inviter_freeform?.trim() || null,
          event_id: body.event_id ?? null,
          source: "qr-welcome",
        });
        if (welcomeErr) {
          // Non-fatal — RSVP already saved, just log.
          console.error("welcome signup insert failed", welcomeErr);
        }

        return Response.json({ success: true });
      },
    },
  },
});
