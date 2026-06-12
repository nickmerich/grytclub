import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { notFound } from "@tanstack/react-router";
import { z } from "zod";

export type Challenge = {
  id: string;
  slug: string;
  title: string;
  tagline: string | null;
  description: string | null;
  theme: string;
  accent_color: string;
  starts_on: string;
  ends_on: string;
  target_label: string | null;
  target_value: number | null;
  unit: string | null;
};

export type ChallengeStep = {
  id: string;
  challenge_id: string;
  ordinal: number;
  title: string;
  description: string | null;
  target_value: number | null;
  unit: string | null;
};

export type ChallengeSummary = Challenge & {
  step_count: number;
  participant_count: number;
  joined: boolean;
  completed_steps: number;
};

const CHALLENGE_FIELDS =
  "id, slug, title, tagline, description, theme, accent_color, starts_on, ends_on, target_label, target_value, unit";

export const listChallenges = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<ChallengeSummary[]> => {
    const [chRes, stepsRes, partsRes, myPartsRes, myCompRes] = await Promise.all([
      context.supabase
        .from("challenges")
        .select(CHALLENGE_FIELDS)
        .eq("published", true)
        .order("starts_on", { ascending: true }),
      context.supabase.from("challenge_steps").select("id, challenge_id"),
      context.supabase.from("challenge_participants").select("challenge_id"),
      context.supabase
        .from("challenge_participants")
        .select("challenge_id")
        .eq("user_id", context.userId),
      context.supabase
        .from("challenge_step_completions")
        .select("challenge_id")
        .eq("user_id", context.userId),
    ]);
    if (chRes.error) throw new Error(chRes.error.message);
    if (stepsRes.error) throw new Error(stepsRes.error.message);
    if (partsRes.error) throw new Error(partsRes.error.message);

    const stepsByCh = new Map<string, number>();
    (stepsRes.data ?? []).forEach((s) => {
      stepsByCh.set(s.challenge_id, (stepsByCh.get(s.challenge_id) ?? 0) + 1);
    });
    const partsByCh = new Map<string, number>();
    (partsRes.data ?? []).forEach((p) => {
      partsByCh.set(p.challenge_id, (partsByCh.get(p.challenge_id) ?? 0) + 1);
    });
    const joinedSet = new Set((myPartsRes.data ?? []).map((p) => p.challenge_id));
    const myCompByCh = new Map<string, number>();
    (myCompRes.data ?? []).forEach((c) => {
      myCompByCh.set(c.challenge_id, (myCompByCh.get(c.challenge_id) ?? 0) + 1);
    });

    return (chRes.data ?? []).map((c) => ({
      ...(c as Challenge),
      step_count: stepsByCh.get(c.id) ?? 0,
      participant_count: partsByCh.get(c.id) ?? 0,
      joined: joinedSet.has(c.id),
      completed_steps: myCompByCh.get(c.id) ?? 0,
    }));
  });

export type ChallengeMe = {
  user_id: string;
  display_name: string | null;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  neighborhood: string | null;
  athlete_alignment: string | null;
  best_5k_seconds: number | null;
  best_10k_seconds: number | null;
  best_half_seconds: number | null;
  best_marathon_seconds: number | null;
};

export type ChallengeDetail = {
  challenge: Challenge;
  steps: ChallengeStep[];
  participants: Array<{
    user_id: string;
    display_name: string | null;
    first_name: string | null;
    last_name: string | null;
    avatar_url: string | null;
    neighborhood: string | null;
    athlete_alignment: string | null;
    best_5k_seconds: number | null;
    best_10k_seconds: number | null;
    best_half_seconds: number | null;
    best_marathon_seconds: number | null;
    completed: number;
  }>;
  participantCount: number;
  joined: boolean;
  myCompletedStepIds: string[];
  me: ChallengeMe | null;
};

export const getChallenge = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => z.object({ slug: z.string().min(1).max(120) }).parse(data))
  .handler(async ({ data, context }): Promise<ChallengeDetail> => {
    const { data: challenge, error: chErr } = await context.supabase
      .from("challenges")
      .select(CHALLENGE_FIELDS)
      .eq("slug", data.slug)
      .eq("published", true)
      .maybeSingle();
    if (chErr) throw new Error(chErr.message);
    if (!challenge) throw notFound();

    const [stepsRes, partsRes, compsRes, mineRes] = await Promise.all([
      context.supabase
        .from("challenge_steps")
        .select("id, challenge_id, ordinal, title, description, target_value, unit")
        .eq("challenge_id", challenge.id)
        .order("ordinal", { ascending: true }),
      context.supabase
        .from("challenge_participants")
        .select("user_id, joined_at")
        .eq("challenge_id", challenge.id),
      context.supabase
        .from("challenge_step_completions")
        .select("user_id, step_id")
        .eq("challenge_id", challenge.id),
      context.supabase
        .from("challenge_step_completions")
        .select("step_id")
        .eq("challenge_id", challenge.id)
        .eq("user_id", context.userId),
    ]);
    if (stepsRes.error) throw new Error(stepsRes.error.message);
    if (partsRes.error) throw new Error(partsRes.error.message);
    if (compsRes.error) throw new Error(compsRes.error.message);
    if (mineRes.error) throw new Error(mineRes.error.message);

    const userIds = Array.from(new Set((partsRes.data ?? []).map((p) => p.user_id)));
    let profilesById = new Map<string, {
      id: string;
      display_name: string | null;
      first_name: string | null;
      last_name: string | null;
      avatar_url: string | null;
      neighborhood: string | null;
      athlete_alignment: string | null;
      best_5k_seconds: number | null;
      best_10k_seconds: number | null;
      best_half_seconds: number | null;
      best_marathon_seconds: number | null;
    }>();

    if (userIds.length > 0) {
      const { data: profiles, error: pErr } = await context.supabase
        .from("profiles")
        .select(
          "id, display_name, first_name, last_name, avatar_url, neighborhood, athlete_alignment, best_5k_seconds, best_10k_seconds, best_half_seconds, best_marathon_seconds",
        )
        .in("id", userIds);
      if (pErr) throw new Error(pErr.message);
      profilesById = new Map((profiles ?? []).map((p) => [p.id, p]));
    }

    const completedByUser = new Map<string, number>();
    (compsRes.data ?? []).forEach((c) => {
      completedByUser.set(c.user_id, (completedByUser.get(c.user_id) ?? 0) + 1);
    });

    const myCompletedStepIds = (mineRes.data ?? []).map((m) => m.step_id);
    const joined = (partsRes.data ?? []).some((p) => p.user_id === context.userId);

    const participants = (partsRes.data ?? [])
      .map((p) => {
        const prof = profilesById.get(p.user_id);
        return {
          user_id: p.user_id,
          display_name: prof?.display_name ?? null,
          first_name: prof?.first_name ?? null,
          last_name: prof?.last_name ?? null,
          avatar_url: prof?.avatar_url ?? null,
          neighborhood: prof?.neighborhood ?? null,
          athlete_alignment: prof?.athlete_alignment ?? null,
          best_5k_seconds: prof?.best_5k_seconds ?? null,
          best_10k_seconds: prof?.best_10k_seconds ?? null,
          best_half_seconds: prof?.best_half_seconds ?? null,
          best_marathon_seconds: prof?.best_marathon_seconds ?? null,
          completed: completedByUser.get(p.user_id) ?? 0,
        };
      })
      .sort((a, b) => b.completed - a.completed);

    return {
      challenge: challenge as Challenge,
      steps: (stepsRes.data ?? []) as ChallengeStep[],
      participants,
      participantCount: (partsRes.data ?? []).length,
      joined,
      myCompletedStepIds,
    };
  });

export const joinChallenge = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => z.object({ challenge_id: z.string().uuid() }).parse(data))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("challenge_participants")
      .insert({ challenge_id: data.challenge_id, user_id: context.userId });
    if (error && !error.message.includes("duplicate")) throw new Error(error.message);
    return { ok: true };
  });

export const leaveChallenge = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => z.object({ challenge_id: z.string().uuid() }).parse(data))
  .handler(async ({ data, context }) => {
    const { error: cErr } = await context.supabase
      .from("challenge_step_completions")
      .delete()
      .eq("challenge_id", data.challenge_id)
      .eq("user_id", context.userId);
    if (cErr) throw new Error(cErr.message);
    const { error } = await context.supabase
      .from("challenge_participants")
      .delete()
      .eq("challenge_id", data.challenge_id)
      .eq("user_id", context.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const toggleStep = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z
      .object({
        step_id: z.string().uuid(),
        challenge_id: z.string().uuid(),
        completed: z.boolean(),
      })
      .parse(data),
  )
  .handler(async ({ data, context }) => {
    if (data.completed) {
      // ensure participation
      const { error: jErr } = await context.supabase
        .from("challenge_participants")
        .insert({ challenge_id: data.challenge_id, user_id: context.userId });
      if (jErr && !jErr.message.includes("duplicate")) throw new Error(jErr.message);
      const { error } = await context.supabase
        .from("challenge_step_completions")
        .insert({
          step_id: data.step_id,
          challenge_id: data.challenge_id,
          user_id: context.userId,
        });
      if (error && !error.message.includes("duplicate")) throw new Error(error.message);
    } else {
      const { error } = await context.supabase
        .from("challenge_step_completions")
        .delete()
        .eq("step_id", data.step_id)
        .eq("user_id", context.userId);
      if (error) throw new Error(error.message);
    }
    return { ok: true };
  });
