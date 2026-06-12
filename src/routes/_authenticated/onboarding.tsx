import { createFileRoute, useNavigate, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getMyProfile, saveOnboarding } from "@/lib/profiles.functions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/onboarding")({
  head: () => ({
    meta: [
      { title: "Set up your profile — GRYT" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: OnboardingPage,
});

const GOAL_OPTIONS = [
  "Build a weekly habit",
  "Run my first 5K",
  "Train for a half",
  "Train for a marathon",
  "Meet new people",
  "Stay social, low pressure",
];

const TIME_OPTIONS = ["Early AM", "Mid morning", "Lunch", "Evening", "Weekends only"];

function OnboardingPage() {
  const navigate = useNavigate();
  const router = useRouter();
  const queryClient = useQueryClient();
  const fetchProfile = useServerFn(getMyProfile);
  const submit = useServerFn(saveOnboarding);

  const { data: profile, isLoading } = useQuery({
    queryKey: ["my-profile"],
    queryFn: () => fetchProfile(),
  });

  const [displayName, setDisplayName] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [city, setCity] = useState("Pittsburgh");
  const [paceMin, setPaceMin] = useState<string>("");
  const [paceMax, setPaceMax] = useState<string>("");
  const [goals, setGoals] = useState<string[]>([]);
  const [times, setTimes] = useState<string[]>([]);
  const [isPublic, setIsPublic] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!profile) return;
    setDisplayName(profile.display_name ?? "");
    setNeighborhood(profile.neighborhood ?? "");
    setCity(profile.city ?? "Pittsburgh");
    setPaceMin(profile.pace_min_per_mi != null ? String(profile.pace_min_per_mi) : "");
    setPaceMax(profile.pace_max_per_mi != null ? String(profile.pace_max_per_mi) : "");
    setGoals(profile.goals ?? []);
    setTimes(profile.preferred_times ?? []);
    setIsPublic(profile.is_public ?? true);
  }, [profile]);

  function toggle(list: string[], v: string, setter: (next: string[]) => void) {
    setter(list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!displayName.trim()) {
      toast.error("Add a display name");
      return;
    }
    setSaving(true);
    try {
      await submit({
        data: {
          display_name: displayName.trim(),
          neighborhood: neighborhood.trim() || null,
          city: city.trim() || null,
          pace_min_per_mi: paceMin ? Number(paceMin) : null,
          pace_max_per_mi: paceMax ? Number(paceMax) : null,
          goals,
          preferred_times: times,
          is_public: isPublic,
        },
      });
      toast.success("Profile saved");
      await queryClient.invalidateQueries({ queryKey: ["my-profile"] });
      await router.invalidate();
      navigate({ to: "/dashboard" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save");
    } finally {
      setSaving(false);
    }
  }

  if (isLoading) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-12">
        <p className="label-meta text-muted-foreground">Loading…</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <div className="mb-8">
        <p className="label-meta text-muted-foreground">Step 1 of 1</p>
        <h1 className="font-display text-4xl mt-2">Set up your profile</h1>
        <p className="mt-2 text-muted-foreground">
          Help us match you with the right pace group and crews. You can change all of this later.
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-8">
        <section className="space-y-4">
          <h2 className="font-display text-lg">Identity</h2>
          <div className="space-y-2">
            <Label htmlFor="display_name">Display name</Label>
            <Input id="display_name" value={displayName} onChange={(e) => setDisplayName(e.target.value)} required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input id="city" value={city} onChange={(e) => setCity(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="neighborhood">Neighborhood</Label>
              <Input id="neighborhood" placeholder="Mt Lebanon" value={neighborhood} onChange={(e) => setNeighborhood(e.target.value)} />
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="font-display text-lg">Pace (min / mile)</h2>
          <p className="text-sm text-muted-foreground">
            Your usual easy pace range. Leave blank if you're not sure.
          </p>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="pace_min">Fast end</Label>
              <Input id="pace_min" type="number" step="0.1" min="4" max="20" placeholder="8.5" value={paceMin} onChange={(e) => setPaceMin(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pace_max">Easy end</Label>
              <Input id="pace_max" type="number" step="0.1" min="4" max="20" placeholder="10.5" value={paceMax} onChange={(e) => setPaceMax(e.target.value)} />
            </div>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-lg">Goals</h2>
          <div className="flex flex-wrap gap-2">
            {GOAL_OPTIONS.map((g) => {
              const on = goals.includes(g);
              return (
                <button
                  key={g}
                  type="button"
                  onClick={() => toggle(goals, g, setGoals)}
                  className={
                    "rounded-full border px-3 py-1.5 text-sm transition-colors " +
                    (on
                      ? "bg-foreground text-background border-foreground"
                      : "bg-background text-foreground border-border hover:bg-accent")
                  }
                >
                  {g}
                </button>
              );
            })}
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-lg">Preferred times</h2>
          <div className="flex flex-wrap gap-2">
            {TIME_OPTIONS.map((t) => {
              const on = times.includes(t);
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => toggle(times, t, setTimes)}
                  className={
                    "rounded-full border px-3 py-1.5 text-sm transition-colors " +
                    (on
                      ? "bg-foreground text-background border-foreground"
                      : "bg-background text-foreground border-border hover:bg-accent")
                  }
                >
                  {t}
                </button>
              );
            })}
          </div>
        </section>

        <section className="space-y-2">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
              className="mt-1 h-4 w-4 accent-foreground"
            />
            <span>
              <span className="block font-medium">Show me in the member directory</span>
              <span className="block text-sm text-muted-foreground">
                Other signed-in members can find you by pace and neighborhood. Uncheck to stay private.
              </span>
            </span>
          </label>
        </section>

        <div className="flex items-center gap-3">
          <Button type="submit" disabled={saving}>
            {saving ? "Saving…" : "Save and continue"}
          </Button>
          <button
            type="button"
            onClick={() => navigate({ to: "/dashboard" })}
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Skip for now
          </button>
        </div>
      </form>
    </main>
  );
}
