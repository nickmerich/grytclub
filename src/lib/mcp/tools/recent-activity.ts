import { createClient } from "@supabase/supabase-js";
import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";

export default defineTool({
  name: "recent_activity",
  title: "Recent community activity",
  description:
    "Latest public grytclub community activity: challenge step completions and event check-ins by public members. Returns display name, first name, activity kind (completion or checkin), the related run/challenge title, and when it happened.",
  inputSchema: {
    limit: z.number().int().min(1).max(50).optional().describe("Default 12."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ limit }) => {
    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false, autoRefreshToken: false } },
    );
    const { data, error } = await supabase.rpc("get_recent_activity" as never, {
      _limit: limit ?? 12,
    });
    if (error) {
      return {
        content: [{ type: "text", text: `Error: ${error.message}` }],
        isError: true,
      };
    }
    return {
      content: [{ type: "text", text: JSON.stringify(data ?? [], null, 2) }],
      structuredContent: { activity: data ?? [] },
    };
  },
});
