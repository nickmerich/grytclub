import { createClient } from "@supabase/supabase-js";
import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";

export default defineTool({
  name: "list_upcoming_runs",
  title: "List upcoming runs",
  description:
    "List upcoming published grytclub group runs (title, date, start time, location, distance, pace, host). Returns runs scheduled today or later, soonest first.",
  inputSchema: {
    limit: z
      .number()
      .int()
      .min(1)
      .max(25)
      .optional()
      .describe("Max runs to return (default 10)."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ limit }) => {
    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_PUBLISHABLE_KEY!,
      { auth: { persistSession: false, autoRefreshToken: false } },
    );
    const today = new Date().toISOString().slice(0, 10);
    const { data, error } = await supabase
      .from("events")
      .select(
        "slug,title,event_date,start_time,location_name,location_address,distance_mi,pace_label,host_name,capacity,description",
      )
      .eq("published", true)
      .gte("event_date", today)
      .order("event_date", { ascending: true })
      .order("start_time", { ascending: true })
      .limit(limit ?? 10);
    if (error) {
      return {
        content: [{ type: "text", text: `Error: ${error.message}` }],
        isError: true,
      };
    }
    return {
      content: [{ type: "text", text: JSON.stringify(data ?? [], null, 2) }],
      structuredContent: { runs: data ?? [] },
    };
  },
});
