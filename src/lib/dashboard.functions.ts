import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type DashboardEvent = {
  id: string;
  slug: string;
  title: string;
  event_date: string;
  start_time: string;
  location_name: string;
  distance_mi: number | null;
  pace_label: string | null;
};

export type DashboardData = {
  email: string | null;
  nextEvent: DashboardEvent | null;
  isRsvpd: boolean;
  attendanceCount: number;
  upcoming: DashboardEvent[];
};

const EVENT_FIELDS =
  "id, slug, title, event_date, start_time, location_name, distance_mi, pace_label";

export const getDashboard = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<DashboardData> => {
    const today = new Date().toISOString().slice(0, 10);
    const email = (context.claims.email as string | undefined) ?? null;

    const [upcomingRes, pastRes, rsvpRes] = await Promise.all([
      context.supabase
        .from("events")
        .select(EVENT_FIELDS)
        .eq("published", true)
        .gte("event_date", today)
        .order("event_date", { ascending: true })
        .order("start_time", { ascending: true })
        .limit(5),
      context.supabase
        .from("run_recaps")
        .select("event_id")
        .eq("published", true),
      email
        ? context.supabase.from("rsvps").select("email,created_at").eq("email", email)
        : Promise.resolve({ data: [], error: null } as { data: { email: string; created_at: string }[]; error: null }),
    ]);

    if (upcomingRes.error) throw new Error(upcomingRes.error.message);
    if (rsvpRes.error) throw new Error(rsvpRes.error.message);

    const upcoming = (upcomingRes.data ?? []) as DashboardEvent[];
    const nextEvent = upcoming[0] ?? null;
    const rsvps = (rsvpRes.data ?? []) as { created_at: string }[];

    // Naive "is RSVP'd for next event" — RSVP table has no event_id, so we
    // treat an RSVP within 30 days before the next event as a sign-up.
    let isRsvpd = false;
    if (nextEvent && rsvps.length > 0) {
      const eventTs = new Date(nextEvent.event_date).getTime();
      const windowMs = 30 * 24 * 60 * 60 * 1000;
      isRsvpd = rsvps.some((r) => {
        const t = new Date(r.created_at).getTime();
        return eventTs - t < windowMs && eventTs - t >= 0;
      });
    }

    return {
      email,
      nextEvent,
      isRsvpd,
      attendanceCount: rsvps.length, // placeholder until check-in lands
      upcoming,
    };
  });
