import { createServerFn } from "@tanstack/react-start";

export type NextSaturday = {
  id: string;
  slug: string;
  title: string;
  event_date: string;
  start_time: string;
  location_name: string;
  location_address: string | null;
} | null;

export type WelcomeInviter = {
  id: string;
  display_name: string | null;
  first_name: string | null;
};

export type WelcomeContext = {
  nextSaturday: NextSaturday;
  inviters: WelcomeInviter[];
};

/**
 * Public, unauthenticated bootstrap for the /welcome QR landing.
 * Returns the next upcoming Saturday event + the list of public members
 * available as inviter options.
 */
export const getWelcomeContext = createServerFn({ method: "GET" }).handler(
  async (): Promise<WelcomeContext> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const today = new Date().toISOString().slice(0, 10);

    // Pull next ~30 days of published events and pick the first Saturday.
    const { data: events } = await supabaseAdmin
      .from("events")
      .select("id, slug, title, event_date, start_time, location_name, location_address")
      .eq("published", true)
      .gte("event_date", today)
      .order("event_date", { ascending: true })
      .order("start_time", { ascending: true })
      .limit(20);

    const nextSaturday =
      (events ?? []).find((e) => {
        // event_date is YYYY-MM-DD; parse as UTC so dow is stable across runtime tz.
        const [y, m, d] = e.event_date.split("-").map(Number);
        const dow = new Date(Date.UTC(y, m - 1, d)).getUTCDay();
        return dow === 6;
      }) ?? null;

    const { data: profiles } = await supabaseAdmin
      .from("profiles")
      .select("id, display_name, first_name")
      .eq("is_public", true)
      .order("display_name", { ascending: true })
      .limit(500);

    return {
      nextSaturday: nextSaturday
        ? {
            id: nextSaturday.id,
            slug: nextSaturday.slug,
            title: nextSaturday.title,
            event_date: nextSaturday.event_date,
            start_time: nextSaturday.start_time,
            location_name: nextSaturday.location_name,
            location_address: nextSaturday.location_address,
          }
        : null,
      inviters: (profiles ?? []) as WelcomeInviter[],
    };
  },
);
