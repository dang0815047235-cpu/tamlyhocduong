import { createFileRoute } from "@tanstack/react-router";
import { authenticateCronRequest } from "@/integrations/supabase/cron-auth";

export const Route = createFileRoute("/api/public/weekly-reports")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const denied = await authenticateCronRequest(request);
        if (denied) return denied;
        const { runWeeklyReports } = await import("@/lib/weekly-reports.server");
        const result = await runWeeklyReports();
        return Response.json(result);
      },
    },
  },
});
