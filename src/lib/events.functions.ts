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
