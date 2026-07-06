import { defineMcp } from "@lovable.dev/mcp-js";
import listUpcomingRuns from "./tools/list-upcoming-runs";
import listChallenges from "./tools/list-challenges";
import recentActivity from "./tools/recent-activity";

export default defineMcp({
  name: "grytclub-mcp",
  title: "grytclub MCP",
  version: "0.1.0",
  instructions:
    "Tools for grytclub — a Pittsburgh run + fitness club for parents. Use `list_upcoming_runs` for the Wednesday/Saturday group-run schedule, `list_challenges` for active endurance challenges, and `recent_activity` for the latest community completions and check-ins.",
  tools: [listUpcomingRuns, listChallenges, recentActivity],
});
