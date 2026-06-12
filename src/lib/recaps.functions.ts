import { createServerFn } from "@tanstack/react-start";
import { notFound } from "@tanstack/react-router";
import { z } from "zod";

export type RecapDetail = {
  event_id: string;
  slug: string;
  title: string;
  event_date: string;
  start_time: string;
  location_name: string;
  distance_mi: number | null;
  pace_label: string | null;
  attendee_count: number;
  vibe_word: string | null;
  hero_caption: string | null;
};

export const getRecapBySlug = createServerFn({ method: "GET" })
  .inputValidator((data: unknown) =>
    z.object({ slug: z.string().min(1).max(120) }).parse(data),
  )
  .handler(async ({ data }): Promise<RecapDetail> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: ev, error: evErr } = await supabaseAdmin
      .from("events")
      .select("id, slug, title, event_date, start_time, location_name, distance_mi, pace_label")
      .eq("slug", data.slug)
      .eq("published", true)
      .maybeSingle();

    if (evErr) throw new Error(evErr.message);
    if (!ev) throw notFound();

    const { data: recap, error: rErr } = await supabaseAdmin
      .from("run_recaps")
      .select("attendee_count, distance_mi, vibe_word, hero_caption, published")
      .eq("event_id", ev.id)
      .maybeSingle();

    if (rErr) throw new Error(rErr.message);
    if (!recap || !recap.published) throw notFound();

    return {
      event_id: ev.id,
      slug: ev.slug,
      title: ev.title,
      event_date: ev.event_date,
      start_time: ev.start_time,
      location_name: ev.location_name,
      distance_mi: recap.distance_mi != null ? Number(recap.distance_mi) : ev.distance_mi,
      pace_label: ev.pace_label,
      attendee_count: recap.attendee_count,
      vibe_word: recap.vibe_word,
      hero_caption: recap.hero_caption,
    };
  });
