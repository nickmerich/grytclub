import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

const PROFILE_FIELDS =
  "id, display_name, first_name, last_name, avatar_url, neighborhood, athlete_alignment, is_public, best_5k_seconds, best_10k_seconds, best_half_seconds, best_marathon_seconds";

export type LeaderboardRow = {
  user_id: string;
  display_name: string | null;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  neighborhood: string | null;
  athlete_alignment: string | null;
  steps_completed: number;
  challenges_joined: number;
  challenges_completed: number;
};

export type LeaderboardResponse = {
  top: LeaderboardRow[];
  me: (LeaderboardRow & { rank: number }) | null;
};

const windowSchema = z.object({
  window: z.enum(["all", "month"]).default("all"),
});

export const getGlobalLeaderboard = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => windowSchema.parse(data ?? {}))
  .handler(async ({ data, context }): Promise<LeaderboardResponse> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    let compQ = supabaseAdmin
      .from("challenge_step_completions")
      .select("user_id, challenge_id, completed_at");
    if (data.window === "month") {
      const since = new Date();
      since.setDate(since.getDate() - 30);
      compQ = compQ.gte("completed_at", since.toISOString());
    }
    const [compRes, partsRes, stepsRes] = await Promise.all([
      compQ,
      supabaseAdmin.from("challenge_participants").select("user_id, challenge_id"),
      supabaseAdmin.from("challenge_steps").select("challenge_id"),
    ]);
    if (compRes.error) throw new Error(compRes.error.message);
    if (partsRes.error) throw new Error(partsRes.error.message);
    if (stepsRes.error) throw new Error(stepsRes.error.message);

    const stepsByCh = new Map<string, number>();
    (stepsRes.data ?? []).forEach((s) => {
      stepsByCh.set(s.challenge_id, (stepsByCh.get(s.challenge_id) ?? 0) + 1);
    });

    type Agg = {
      steps: number;
      challenges: Set<string>;
      perChallenge: Map<string, number>;
    };
    const agg = new Map<string, Agg>();
    const ensure = (uid: string): Agg => {
      let a = agg.get(uid);
      if (!a) {
        a = { steps: 0, challenges: new Set(), perChallenge: new Map() };
        agg.set(uid, a);
      }
      return a;
    };
    (partsRes.data ?? []).forEach((p) => {
      ensure(p.user_id).challenges.add(p.challenge_id);
    });
    (compRes.data ?? []).forEach((c) => {
      const a = ensure(c.user_id);
      a.steps += 1;
      a.perChallenge.set(c.challenge_id, (a.perChallenge.get(c.challenge_id) ?? 0) + 1);
    });

    const userIds = Array.from(agg.keys());
    let profilesById = new Map<string, {
      id: string;
      display_name: string | null;
      first_name: string | null;
      last_name: string | null;
      avatar_url: string | null;
      neighborhood: string | null;
      athlete_alignment: string | null;
      is_public: boolean | null;
    }>();
    if (userIds.length > 0) {
      const { data: profs, error } = await supabaseAdmin
        .from("profiles")
        .select("id, display_name, first_name, last_name, avatar_url, neighborhood, athlete_alignment, is_public")
        .in("id", userIds);
      if (error) throw new Error(error.message);
      profilesById = new Map((profs ?? []).map((p) => [p.id, p]));
    }

    const rows: LeaderboardRow[] = userIds.map((uid) => {
      const a = agg.get(uid)!;
      let completed = 0;
      a.perChallenge.forEach((done, chId) => {
        const total = stepsByCh.get(chId) ?? 0;
        if (total > 0 && done >= total) completed += 1;
      });
      const p = profilesById.get(uid);
      const isMe = uid === context.userId;
      const isPublic = p?.is_public ?? false;
      return {
        user_id: uid,
        display_name: isPublic || isMe ? p?.display_name ?? null : "Private member",
        first_name: isPublic || isMe ? p?.first_name ?? null : null,
        last_name: isPublic || isMe ? p?.last_name ?? null : null,
        avatar_url: isPublic || isMe ? p?.avatar_url ?? null : null,
        neighborhood: isPublic || isMe ? p?.neighborhood ?? null : null,
        athlete_alignment: p?.athlete_alignment ?? null,
        steps_completed: a.steps,
        challenges_joined: a.challenges.size,
        challenges_completed: completed,
      };
    });
    rows.sort((a, b) => b.steps_completed - a.steps_completed || b.challenges_completed - a.challenges_completed);

    const top = rows.slice(0, 50);
    const myIndex = rows.findIndex((r) => r.user_id === context.userId);
    const me =
      myIndex === -1
        ? null
        : { ...rows[myIndex], rank: myIndex + 1 };

    return { top, me };
  });

export type PublicMemberDetail = {
  id: string;
  display_name: string | null;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  neighborhood: string | null;
  city: string | null;
  athlete_alignment: string | null;
  goals: string[];
  preferred_times: string[];
  pace_min_per_mi: number | null;
  pace_max_per_mi: number | null;
  is_public: boolean;
  best_5k_seconds: number | null;
  best_10k_seconds: number | null;
  best_half_seconds: number | null;
  best_marathon_seconds: number | null;
  stats: {
    steps_completed: number;
    challenges_joined: number;
    challenges_completed: number;
  };
};

export const getMemberProfile = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => z.object({ id: z.string().uuid() }).parse(data))
  .handler(async ({ data, context }): Promise<PublicMemberDetail | null> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: p, error } = await supabaseAdmin
      .from("profiles")
      .select(
        "id, display_name, first_name, last_name, avatar_url, neighborhood, city, athlete_alignment, goals, preferred_times, pace_min_per_mi, pace_max_per_mi, is_public, best_5k_seconds, best_10k_seconds, best_half_seconds, best_marathon_seconds",
      )
      .eq("id", data.id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!p) return null;
    const isSelf = p.id === context.userId;
    if (!p.is_public && !isSelf) return null;

    const stats = await loadStatsFor(p.id);
    return {
      id: p.id,
      display_name: p.display_name,
      first_name: p.first_name,
      last_name: p.last_name,
      avatar_url: p.avatar_url,
      neighborhood: p.neighborhood,
      city: p.city,
      athlete_alignment: p.athlete_alignment,
      goals: p.goals ?? [],
      preferred_times: p.preferred_times ?? [],
      pace_min_per_mi: p.pace_min_per_mi,
      pace_max_per_mi: p.pace_max_per_mi,
      is_public: !!p.is_public,
      best_5k_seconds: p.best_5k_seconds,
      best_10k_seconds: p.best_10k_seconds,
      best_half_seconds: p.best_half_seconds,
      best_marathon_seconds: p.best_marathon_seconds,
      stats,
    };
  });

async function loadStatsFor(userId: string) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const [c, parts, steps] = await Promise.all([
    supabaseAdmin.from("challenge_step_completions").select("challenge_id").eq("user_id", userId),
    supabaseAdmin.from("challenge_participants").select("challenge_id").eq("user_id", userId),
    supabaseAdmin.from("challenge_steps").select("challenge_id"),
  ]);
  const stepsByCh = new Map<string, number>();
  (steps.data ?? []).forEach((s) => stepsByCh.set(s.challenge_id, (stepsByCh.get(s.challenge_id) ?? 0) + 1));
  const myByCh = new Map<string, number>();
  (c.data ?? []).forEach((r) => myByCh.set(r.challenge_id, (myByCh.get(r.challenge_id) ?? 0) + 1));
  let completed = 0;
  myByCh.forEach((done, chId) => {
    const total = stepsByCh.get(chId) ?? 0;
    if (total > 0 && done >= total) completed += 1;
  });
  return {
    steps_completed: c.data?.length ?? 0,
    challenges_joined: parts.data?.length ?? 0,
    challenges_completed: completed,
  };
}

export type ComparisonChallenge = {
  challenge_id: string;
  slug: string;
  title: string;
  accent_color: string;
  step_count: number;
  me_done: number;
  them_done: number;
};

export type ComparisonResponse = {
  me: PublicMemberDetail;
  them: PublicMemberDetail;
  shared: ComparisonChallenge[];
  scores: { me: number; them: number };
};

export const getComparison = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => z.object({ otherId: z.string().uuid() }).parse(data))
  .handler(async ({ data, context }): Promise<ComparisonResponse | null> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const [meRow, themRow] = await Promise.all([
      supabaseAdmin
        .from("profiles")
        .select(
          "id, display_name, first_name, last_name, avatar_url, neighborhood, city, athlete_alignment, goals, preferred_times, pace_min_per_mi, pace_max_per_mi, is_public, best_5k_seconds, best_10k_seconds, best_half_seconds, best_marathon_seconds",
        )
        .eq("id", context.userId)
        .maybeSingle(),
      supabaseAdmin
        .from("profiles")
        .select(
          "id, display_name, first_name, last_name, avatar_url, neighborhood, city, athlete_alignment, goals, preferred_times, pace_min_per_mi, pace_max_per_mi, is_public, best_5k_seconds, best_10k_seconds, best_half_seconds, best_marathon_seconds",
        )
        .eq("id", data.otherId)
        .maybeSingle(),
    ]);
    if (!meRow.data || !themRow.data) return null;
    if (!themRow.data.is_public && themRow.data.id !== context.userId) return null;

    const [meStats, themStats] = await Promise.all([
      loadStatsFor(meRow.data.id),
      loadStatsFor(themRow.data.id),
    ]);

    const meDetail: PublicMemberDetail = {
      ...(meRow.data as any),
      goals: meRow.data.goals ?? [],
      preferred_times: meRow.data.preferred_times ?? [],
      is_public: !!meRow.data.is_public,
      stats: meStats,
    };
    const themDetail: PublicMemberDetail = {
      ...(themRow.data as any),
      goals: themRow.data.goals ?? [],
      preferred_times: themRow.data.preferred_times ?? [],
      is_public: !!themRow.data.is_public,
      stats: themStats,
    };

    // Shared challenges
    const [mineParts, themParts, steps, allCh, comps] = await Promise.all([
      supabaseAdmin.from("challenge_participants").select("challenge_id").eq("user_id", context.userId),
      supabaseAdmin.from("challenge_participants").select("challenge_id").eq("user_id", data.otherId),
      supabaseAdmin.from("challenge_steps").select("challenge_id"),
      supabaseAdmin.from("challenges").select("id, slug, title, accent_color").eq("published", true),
      supabaseAdmin
        .from("challenge_step_completions")
        .select("user_id, challenge_id")
        .in("user_id", [context.userId, data.otherId]),
    ]);
    const mineSet = new Set((mineParts.data ?? []).map((r) => r.challenge_id));
    const themSet = new Set((themParts.data ?? []).map((r) => r.challenge_id));
    const sharedIds = Array.from(mineSet).filter((id) => themSet.has(id));
    const stepsByCh = new Map<string, number>();
    (steps.data ?? []).forEach((s) => stepsByCh.set(s.challenge_id, (stepsByCh.get(s.challenge_id) ?? 0) + 1));
    const compByUserCh = new Map<string, number>();
    (comps.data ?? []).forEach((c) => {
      const k = `${c.user_id}|${c.challenge_id}`;
      compByUserCh.set(k, (compByUserCh.get(k) ?? 0) + 1);
    });
    const chById = new Map((allCh.data ?? []).map((c) => [c.id, c]));
    const shared: ComparisonChallenge[] = sharedIds
      .map((id) => {
        const c = chById.get(id);
        if (!c) return null;
        return {
          challenge_id: id,
          slug: c.slug,
          title: c.title,
          accent_color: c.accent_color,
          step_count: stepsByCh.get(id) ?? 0,
          me_done: compByUserCh.get(`${context.userId}|${id}`) ?? 0,
          them_done: compByUserCh.get(`${data.otherId}|${id}`) ?? 0,
        };
      })
      .filter((x): x is ComparisonChallenge => !!x);

    // Scoring: PR wins (lower seconds, nonzero) + challenge leads
    let meScore = 0;
    let themScore = 0;
    const prFields: (keyof PublicMemberDetail)[] = [
      "best_5k_seconds",
      "best_10k_seconds",
      "best_half_seconds",
      "best_marathon_seconds",
    ];
    for (const f of prFields) {
      const a = meDetail[f] as number | null;
      const b = themDetail[f] as number | null;
      if (a && b) {
        if (a < b) meScore += 1;
        else if (b < a) themScore += 1;
      }
    }
    shared.forEach((c) => {
      if (c.me_done > c.them_done) meScore += 1;
      else if (c.them_done > c.me_done) themScore += 1;
    });

    return { me: meDetail, them: themDetail, shared, scores: { me: meScore, them: themScore } };
  });

// ---- Invites ----

export type InvitePreview = {
  invite_id: string;
  challenge_id: string;
  challenge_slug: string;
  challenge_title: string;
  challenge_tagline: string | null;
  challenge_theme: string;
  challenge_accent: string;
  step_count: number;
  participant_count: number;
  inviter_display_name: string | null;
  inviter_avatar_url: string | null;
};

export const createInvite = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z.object({ challenge_id: z.string().uuid() }).parse(data),
  )
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    // Reuse existing invite for this user+challenge if present
    const existing = await supabaseAdmin
      .from("challenge_invites")
      .select("token")
      .eq("inviter_id", context.userId)
      .eq("challenge_id", data.challenge_id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (existing.data?.token) return { token: existing.data.token };

    const token = makeToken();
    const { error } = await supabaseAdmin
      .from("challenge_invites")
      .insert({ challenge_id: data.challenge_id, inviter_id: context.userId, token });
    if (error) throw new Error(error.message);
    return { token };
  });

function makeToken() {
  // 16-char base36 token
  const a = Math.random().toString(36).slice(2, 10);
  const b = Math.random().toString(36).slice(2, 10);
  return (a + b).slice(0, 16);
}

export const getInvitePreview = createServerFn({ method: "GET" })
  .inputValidator((data: unknown) => z.object({ token: z.string().min(4).max(64) }).parse(data))
  .handler(async ({ data }): Promise<InvitePreview | null> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: rows, error } = await supabaseAdmin.rpc("get_invite_preview", { _token: data.token });
    if (error) throw new Error(error.message);
    const row = (rows ?? [])[0];
    if (!row) return null;
    return {
      invite_id: row.invite_id,
      challenge_id: row.challenge_id,
      challenge_slug: row.challenge_slug,
      challenge_title: row.challenge_title,
      challenge_tagline: row.challenge_tagline,
      challenge_theme: row.challenge_theme,
      challenge_accent: row.challenge_accent,
      step_count: Number(row.step_count ?? 0),
      participant_count: Number(row.participant_count ?? 0),
      inviter_display_name: row.inviter_display_name,
      inviter_avatar_url: row.inviter_avatar_url,
    };
  });

export const acceptInvite = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => z.object({ token: z.string().min(4).max(64) }).parse(data))
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: rows, error } = await supabaseAdmin.rpc("accept_invite", {
      _token: data.token,
      _user_id: context.userId,
    });
    if (error) throw new Error(error.message);
    const row = (rows ?? [])[0];
    return { slug: row?.challenge_slug ?? null };
  });

export type InviteAcceptedStat = { accepted_count: number };

export const getMyInviteStats = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<InviteAcceptedStat> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: invites } = await supabaseAdmin
      .from("challenge_invites")
      .select("id")
      .eq("inviter_id", context.userId);
    const ids = (invites ?? []).map((i) => i.id);
    if (ids.length === 0) return { accepted_count: 0 };
    const { count } = await supabaseAdmin
      .from("challenge_invite_acceptances")
      .select("*", { count: "exact", head: true })
      .in("invite_id", ids);
    return { accepted_count: count ?? 0 };
  });
// Silence unused import warning for shared field list
void PROFILE_FIELDS;
