import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";

/**
 * Daily cron: for every published event whose date has passed and which
 * does not yet have a run_recap row, create one. Attendee count is
 * approximated from total RSVPs created in the 14 days leading up to and
 * including the event date (the rsvps table is not currently tied to a
 * specific event).
 */
export const Route = createFileRoute("/api/public/hooks/generate-recaps")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const expected = process.env.SUPABASE_PUBLISHABLE_KEY;
        const provided =
          request.headers.get("apikey") ??
          request.headers.get("authorization")?.replace("Bearer ", "");
        if (!expected || !provided || provided !== expected) {
          return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
        }

        const url = process.env.SUPABASE_URL!;
        const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
        const supabase = createClient(url, serviceKey, {
          auth: { autoRefreshToken: false, persistSession: false },
        });

        const today = new Date().toISOString().slice(0, 10);

        const { data: pastEvents, error: evErr } = await supabase
          .from("events")
          .select("id, event_date, distance_mi")
          .eq("published", true)
          .lt("event_date", today);

        if (evErr) {
          return new Response(JSON.stringify({ error: evErr.message }), { status: 500 });
        }

        const { data: existing } = await supabase.from("run_recaps").select("event_id");
        const existingIds = new Set((existing ?? []).map((r) => r.event_id));

        const created: string[] = [];
        for (const ev of pastEvents ?? []) {
          if (existingIds.has(ev.id)) continue;

          const windowStart = new Date(`${ev.event_date}T00:00:00Z`);
          windowStart.setUTCDate(windowStart.getUTCDate() - 14);
          const windowEnd = new Date(`${ev.event_date}T23:59:59Z`);

          const { count } = await supabase
            .from("rsvps")
            .select("id", { count: "exact", head: true })
            .gte("created_at", windowStart.toISOString())
            .lte("created_at", windowEnd.toISOString());

          const { error: insErr } = await supabase.from("run_recaps").insert({
            event_id: ev.id,
            attendee_count: count ?? 0,
            distance_mi: ev.distance_mi,
            published: true,
          });
          if (!insErr) created.push(ev.id);
        }

        return Response.json({ ok: true, created: created.length, ids: created });
      },
    },
  },
});
