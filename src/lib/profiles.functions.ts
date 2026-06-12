import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

export type ProfileRow = {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  city: string | null;
  neighborhood: string | null;
  pace_min_per_mi: number | null;
  pace_max_per_mi: number | null;
  goals: string[];
  preferred_times: string[];
  is_public: boolean;
  onboarded_at: string | null;
};

const PROFILE_FIELDS =
  "id, display_name, avatar_url, city, neighborhood, pace_min_per_mi, pace_max_per_mi, goals, preferred_times, is_public, onboarded_at";

export const getMyProfile = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<ProfileRow | null> => {
    const { data, error } = await context.supabase
      .from("profiles")
      .select(PROFILE_FIELDS)
      .eq("id", context.userId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return (data ?? null) as ProfileRow | null;
  });

const onboardingSchema = z.object({
  display_name: z.string().min(1).max(80),
  neighborhood: z.string().max(80).optional().nullable(),
  city: z.string().max(80).optional().nullable(),
  pace_min_per_mi: z.number().min(4).max(20).nullable(),
  pace_max_per_mi: z.number().min(4).max(20).nullable(),
  goals: z.array(z.string().max(40)).max(8),
  preferred_times: z.array(z.string().max(20)).max(8),
  is_public: z.boolean(),
});

export const saveOnboarding = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => onboardingSchema.parse(data))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("profiles")
      .update({
        display_name: data.display_name,
        neighborhood: data.neighborhood ?? null,
        city: data.city ?? null,
        pace_min_per_mi: data.pace_min_per_mi,
        pace_max_per_mi: data.pace_max_per_mi,
        goals: data.goals,
        preferred_times: data.preferred_times,
        is_public: data.is_public,
        onboarded_at: new Date().toISOString(),
      })
      .eq("id", context.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export type PublicMember = {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  city: string | null;
  neighborhood: string | null;
  pace_min_per_mi: number | null;
  pace_max_per_mi: number | null;
  goals: string[];
  preferred_times: string[];
};

export const listPublicMembers = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<PublicMember[]> => {
    const { data, error } = await context.supabase
      .from("profiles")
      .select(
        "id, display_name, avatar_url, city, neighborhood, pace_min_per_mi, pace_max_per_mi, goals, preferred_times",
      )
      .eq("is_public", true)
      .order("display_name", { ascending: true })
      .limit(200);
    if (error) throw new Error(error.message);
    return (data ?? []) as PublicMember[];
  });
