import { createServerFn } from "@tanstack/react-start";

export type RsvpStats = {
  going: number;
  joinedThisWeek: number;
};

/**
 * Returns counts powering the GoingCounter badge.
 * - going: RSVPs created since the most recent Sunday 00:00 UTC (current weekly cycle).
 * - joinedThisWeek: RSVPs created in the last 7 days.
 */
export const getRsvpStats = createServerFn({ method: "GET" }).handler(
  async (): Promise<RsvpStats> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setUTCHours(0, 0, 0, 0);
    startOfWeek.setUTCDate(startOfWeek.getUTCDate() - startOfWeek.getUTCDay());

    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const [goingRes, weekRes] = await Promise.all([
      supabaseAdmin
        .from("rsvps")
        .select("*", { count: "exact", head: true })
        .gte("created_at", startOfWeek.toISOString()),
      supabaseAdmin
        .from("rsvps")
        .select("*", { count: "exact", head: true })
        .gte("created_at", sevenDaysAgo.toISOString()),
    ]);

    if (goingRes.error) throw new Error(goingRes.error.message);
    if (weekRes.error) throw new Error(weekRes.error.message);

    return {
      going: goingRes.count ?? 0,
      joinedThisWeek: weekRes.count ?? 0,
    };
  },
);
