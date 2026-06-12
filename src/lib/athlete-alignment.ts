// Deterministic "athlete alignment" archetypes — gives each member a unique
// vibe tied to a real distance runner. We hash the user_id so the assignment
// is stable across sessions even when the profile doesn't pick one explicitly.
export type AthleteAlignment = {
  name: string;
  discipline: string;
  accent: string; // hex
  ring: string; // tailwind ring class
  bg: string; // tailwind bg class for the badge tint
  text: string; // tailwind text class
};

export const ATHLETE_POOL: AthleteAlignment[] = [
  { name: "Eliud Kipchoge",   discipline: "Marathon · patience",     accent: "#0ea5e9", ring: "ring-sky-500/40",     bg: "bg-sky-500/10",     text: "text-sky-700 dark:text-sky-300" },
  { name: "Sifan Hassan",     discipline: "Range · fearlessness",    accent: "#f97316", ring: "ring-orange-500/40",  bg: "bg-orange-500/10",  text: "text-orange-700 dark:text-orange-300" },
  { name: "Steve Prefontaine",discipline: "Front-running · grit",    accent: "#eab308", ring: "ring-yellow-500/40",  bg: "bg-yellow-500/10",  text: "text-yellow-700 dark:text-yellow-300" },
  { name: "Des Linden",       discipline: "Marathon · stubbornness", accent: "#84cc16", ring: "ring-lime-500/40",    bg: "bg-lime-500/10",    text: "text-lime-700 dark:text-lime-300" },
  { name: "Jakob Ingebrigtsen",discipline: "1500m · precision",      accent: "#ef4444", ring: "ring-red-500/40",     bg: "bg-red-500/10",     text: "text-red-700 dark:text-red-300" },
  { name: "Faith Kipyegon",   discipline: "1500m · finishing kick",  accent: "#ec4899", ring: "ring-pink-500/40",    bg: "bg-pink-500/10",    text: "text-pink-700 dark:text-pink-300" },
  { name: "Mo Farah",         discipline: "10K · tactical patience", accent: "#8b5cf6", ring: "ring-violet-500/40",  bg: "bg-violet-500/10",  text: "text-violet-700 dark:text-violet-300" },
  { name: "Shalane Flanagan", discipline: "Marathon · leadership",   accent: "#14b8a6", ring: "ring-teal-500/40",    bg: "bg-teal-500/10",    text: "text-teal-700 dark:text-teal-300" },
  { name: "Galen Rupp",       discipline: "Marathon · consistency",  accent: "#22c55e", ring: "ring-green-500/40",   bg: "bg-green-500/10",   text: "text-green-700 dark:text-green-300" },
  { name: "Allyson Felix",    discipline: "Sprint · longevity",      accent: "#a855f7", ring: "ring-purple-500/40",  bg: "bg-purple-500/10",  text: "text-purple-700 dark:text-purple-300" },
  { name: "Emil Zátopek",     discipline: "All-distances · hard work",accent: "#f59e0b", ring: "ring-amber-500/40",   bg: "bg-amber-500/10",   text: "text-amber-700 dark:text-amber-300" },
  { name: "Paula Radcliffe",  discipline: "Marathon · workrate",     accent: "#06b6d4", ring: "ring-cyan-500/40",    bg: "bg-cyan-500/10",    text: "text-cyan-700 dark:text-cyan-300" },
];

function hash(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = (h * 16777619) >>> 0;
  }
  return h;
}

export function alignmentFor(userId: string, override?: string | null): AthleteAlignment {
  if (override) {
    const match = ATHLETE_POOL.find((a) => a.name.toLowerCase() === override.toLowerCase());
    if (match) return match;
  }
  return ATHLETE_POOL[hash(userId) % ATHLETE_POOL.length];
}

export function formatPr(seconds: number | null): string {
  if (seconds == null || seconds <= 0) return "—";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export function displayName(p: {
  first_name?: string | null;
  last_name?: string | null;
  display_name?: string | null;
}): string {
  const full = [p.first_name, p.last_name].filter(Boolean).join(" ").trim();
  return full || p.display_name || "Member";
}
