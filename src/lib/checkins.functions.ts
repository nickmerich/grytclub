import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

const EDIT_WINDOW_HOURS = 48;

async function loadAdmin() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

async function assertHost(eventId: string, userId: string) {
  const admin = await loadAdmin();
  const { data, error } = await admin
    .from("events")
    .select("id, host_user_id, event_date")
    .eq("id", eventId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) throw new Error("Event not found");
  if (!data.host_user_id || data.host_user_id !== userId) {
    throw new Error("Only the event host can manage check-ins");
  }
  // 48h edit window after event date
  const eventEnd = new Date(`${data.event_date}T23:59:59Z`).getTime();
  const now = Date.now();
  const lockedAt = eventEnd + EDIT_WINDOW_HOURS * 60 * 60 * 1000;
  if (now > lockedAt) throw new Error("Check-in window is closed");
  return data;
}

export type CheckinPanelRsvp = {
  id: string;
  name: string;
  email: string;
  checked_in: boolean;
  checkin_id: string | null;
};

export type CheckinPanelWalkup = {
  checkin_id: string;
  walkup_name: string;
};

export type CheckinPanel = {
  is_host: boolean;
  event_locked: boolean;
  rsvps: CheckinPanelRsvp[];
  walkups: CheckinPanelWalkup[];
  member_checkins: { user_id: string; checkin_id: string }[];
  totals: { rsvps: number; checked_in: number; walkups: number };
};

export const getEventCheckinPanel = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ event_id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }): Promise<CheckinPanel> => {
    const admin = await loadAdmin();
    const { data: ev } = await admin
      .from("events")
      .select("id, host_user_id, event_date")
      .eq("id", data.event_id)
      .maybeSingle();
    if (!ev) throw new Error("Event not found");
    const isHost = !!ev.host_user_id && ev.host_user_id === context.userId;
    if (!isHost) {
      return {
        is_host: false,
        event_locked: false,
        rsvps: [],
        walkups: [],
        member_checkins: [],
        totals: { rsvps: 0, checked_in: 0, walkups: 0 },
      };
    }
    const eventEnd = new Date(`${ev.event_date}T23:59:59Z`).getTime();
    const eventLocked = Date.now() > eventEnd + EDIT_WINDOW_HOURS * 60 * 60 * 1000;

    const [rsvpsRes, checkinsRes] = await Promise.all([
      admin.from("rsvps").select("id, name, email").order("created_at", { ascending: true }),
      admin
        .from("event_checkins")
        .select("id, user_id, walkup_name")
        .eq("event_id", data.event_id),
    ]);
    if (rsvpsRes.error) throw new Error(rsvpsRes.error.message);
    if (checkinsRes.error) throw new Error(checkinsRes.error.message);

    // Match rsvps to checkins by email→user_id where possible. Rsvps table is email-only
    // (legacy). We map by email to auth users via profiles is unavailable; instead, we
    // expose the rsvp row and let the host check it in as a walk-up keyed by name.
    // For member check-ins, we list any explicit user_id rows separately.
    const memberCheckins = (checkinsRes.data ?? [])
      .filter((c) => c.user_id)
      .map((c) => ({ user_id: c.user_id as string, checkin_id: c.id }));
    const walkupRows = (checkinsRes.data ?? [])
      .filter((c) => c.walkup_name)
      .map((c) => ({ checkin_id: c.id, walkup_name: c.walkup_name as string }));

    // For RSVPs, mark checked_in if a walkup with same lowered name exists.
    const walkupByName = new Map(walkupRows.map((w) => [w.walkup_name.trim().toLowerCase(), w.checkin_id]));
    const rsvps: CheckinPanelRsvp[] = (rsvpsRes.data ?? []).map((r) => {
      const key = r.name.trim().toLowerCase();
      const checkinId = walkupByName.get(key) ?? null;
      return {
        id: r.id,
        name: r.name,
        email: r.email,
        checked_in: !!checkinId,
        checkin_id: checkinId,
      };
    });
    // Walk-ups not matched to an rsvp name
    const rsvpNameSet = new Set((rsvpsRes.data ?? []).map((r) => r.name.trim().toLowerCase()));
    const walkups = walkupRows.filter((w) => !rsvpNameSet.has(w.walkup_name.trim().toLowerCase()));

    const checkedInCount = rsvps.filter((r) => r.checked_in).length;
    return {
      is_host: true,
      event_locked: eventLocked,
      rsvps,
      walkups,
      member_checkins: memberCheckins,
      totals: {
        rsvps: rsvps.length,
        checked_in: checkedInCount + memberCheckins.length,
        walkups: walkups.length,
      },
    };
  });

export const toggleRsvpCheckin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        event_id: z.string().uuid(),
        rsvp_name: z.string().min(1).max(120),
        present: z.boolean(),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    await assertHost(data.event_id, context.userId);
    const admin = await loadAdmin();
    const trimmed = data.rsvp_name.trim();
    if (data.present) {
      const { error } = await admin
        .from("event_checkins")
        .upsert(
          {
            event_id: data.event_id,
            walkup_name: trimmed,
            checked_in_by: context.userId,
          },
          { onConflict: "event_id,walkup_name", ignoreDuplicates: true },
        );
      if (error) throw new Error(error.message);
    } else {
      const { error } = await admin
        .from("event_checkins")
        .delete()
        .eq("event_id", data.event_id)
        .ilike("walkup_name", trimmed);
      if (error) throw new Error(error.message);
    }
    return { ok: true };
  });

export const addWalkup = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({ event_id: z.string().uuid(), walkup_name: z.string().min(1).max(120) }).parse(d),
  )
  .handler(async ({ data, context }) => {
    await assertHost(data.event_id, context.userId);
    const admin = await loadAdmin();
    const trimmed = data.walkup_name.trim();
    if (!trimmed) throw new Error("Name required");
    const { error } = await admin.from("event_checkins").insert({
      event_id: data.event_id,
      walkup_name: trimmed,
      checked_in_by: context.userId,
    });
    if (error && !error.message.includes("duplicate")) throw new Error(error.message);
    return { ok: true };
  });

export const removeCheckin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({ event_id: z.string().uuid(), checkin_id: z.string().uuid() }).parse(d),
  )
  .handler(async ({ data, context }) => {
    await assertHost(data.event_id, context.userId);
    const admin = await loadAdmin();
    const { error } = await admin
      .from("event_checkins")
      .delete()
      .eq("id", data.checkin_id)
      .eq("event_id", data.event_id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export type AttendanceSummary = {
  total_runs: number;
  current_streak: number;
  last_run_date: string | null;
  recent: { event_id: string; slug: string; title: string; event_date: string }[];
};

async function buildAttendance(userId: string): Promise<AttendanceSummary> {
  const admin = await loadAdmin();
  const { data, error } = await admin
    .from("event_checkins")
    .select("event_id, events!inner(slug, title, event_date)")
    .eq("user_id", userId)
    .order("checked_in_at", { ascending: false });
  if (error) throw new Error(error.message);
  const rows = (data ?? []) as unknown as {
    event_id: string;
    events: { slug: string; title: string; event_date: string };
  }[];
  const dates = rows
    .map((r) => r.events?.event_date)
    .filter((d): d is string => !!d)
    .sort((a, b) => (a < b ? 1 : -1));

  // Streak: count consecutive Saturdays back from most recent run's Saturday
  let streak = 0;
  if (dates.length > 0) {
    const dateSet = new Set(dates);
    // Start from most recent Saturday >= last run date's Saturday
    const first = new Date(`${dates[0]}T12:00:00Z`);
    // Find that week's Saturday in UTC
    const dow = first.getUTCDay();
    const offsetToSat = (6 - dow + 7) % 7;
    const cursor = new Date(first);
    cursor.setUTCDate(cursor.getUTCDate() + offsetToSat);
    // Walk back 1 week at a time
    while (true) {
      const iso = cursor.toISOString().slice(0, 10);
      if (dateSet.has(iso)) {
        streak += 1;
        cursor.setUTCDate(cursor.getUTCDate() - 7);
      } else {
        break;
      }
    }
  }

  return {
    total_runs: rows.length,
    current_streak: streak,
    last_run_date: dates[0] ?? null,
    recent: rows.slice(0, 5).map((r) => ({
      event_id: r.event_id,
      slug: r.events.slug,
      title: r.events.title,
      event_date: r.events.event_date,
    })),
  };
}

export const getMyAttendance = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<AttendanceSummary> => {
    return buildAttendance(context.userId);
  });

export const getMemberAttendance = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ user_id: z.string().uuid() }).parse(d))
  .handler(async ({ data }): Promise<AttendanceSummary> => {
    return buildAttendance(data.user_id);
  });
