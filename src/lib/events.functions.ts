import { createServerFn } from "@tanstack/react-start";
import { notFound } from "@tanstack/react-router";
import { z } from "zod";


export type EventListItem = {
  id: string;
  slug: string;
  title: string;
  event_date: string;
  start_time: string;
  location_name: string;
  location_address: string | null;
  distance_mi: number | null;
  pace_label: string | null;
  host_name: string | null;
  description: string | null;
};

/**
 * Public listing of upcoming, published events.
 * Uses supabaseAdmin (loaded inside the handler) because the loader runs
 * during SSR/prerender with no bearer token. RLS still only permits
 * published rows, but admin keeps it simple and avoids `anon` policy
 * surface area.
 */
export const listUpcomingEvents = createServerFn({ method: "GET" }).handler(
  async (): Promise<EventListItem[]> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const today = new Date().toISOString().slice(0, 10);
    const { data, error } = await supabaseAdmin
      .from("events")
      .select(
        "id, slug, title, event_date, start_time, location_name, location_address, distance_mi, pace_label, host_name, description",
      )
      .eq("published", true)
      .gte("event_date", today)
      .order("event_date", { ascending: true })
      .order("start_time", { ascending: true })
      .limit(50);

    if (error) throw new Error(error.message);
    return (data ?? []) as EventListItem[];
  },
);

export type EventDetail = EventListItem & {
  capacity: number | null;
};

/**
 * Fetch one published event by slug. Throws notFound() so the route's
 * notFoundComponent renders for missing/unpublished slugs.
 */
export const getEventBySlug = createServerFn({ method: "GET" })
  .inputValidator((data: unknown) =>
    z.object({ slug: z.string().min(1).max(120) }).parse(data),
  )
  .handler(async ({ data }): Promise<EventDetail> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row, error } = await supabaseAdmin
      .from("events")
      .select(
        "id, slug, title, event_date, start_time, location_name, location_address, distance_mi, pace_label, host_name, description, capacity",
      )
      .eq("slug", data.slug)
      .eq("published", true)
      .maybeSingle();

    if (error) throw new Error(error.message);
    if (!row) throw notFound();
    return row as EventDetail;
  });

