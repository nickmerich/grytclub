import { createClient } from "@supabase/supabase-js";
import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";

export default defineTool({
  name: "list_challenges",
  title: "List challenges",
  description:
    "List published grytclub challenges (title, tagline, target, dates). Optionally filter to those active today.",
  inputSchema: {
    active_only: z
      .boolean()
      .optional()
      .describe("Only return challenges active today (default false)."),
    limit: z.number().int().min(1).max(25).optional(),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ active_only, limit }) => {
    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_PUBLISHABLE_KEY!,
      { auth: { persistSession: false, autoRefreshToken: false } },
    );
    let q = supabase
      .from("challenges")
      .select(
        "slug,title,tagline,description,target_label,target_value,unit,starts_on,ends_on",
      )
      .eq("published", true)
      .order("starts_on", { ascending: false })
      .limit(limit ?? 10);
    if (active_only) {
      const today = new Date().toISOString().slice(0, 10);
      q = q.lte("starts_on", today).gte("ends_on", today);
    }
    const { data, error } = await q;
    if (error) {
      return {
        content: [{ type: "text", text: `Error: ${error.message}` }],
        isError: true,
      };
    }
    return {
      content: [{ type: "text", text: JSON.stringify(data ?? [], null, 2) }],
      structuredContent: { challenges: data ?? [] },
    };
  },
});
