import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const generateWeeklyReportsNow = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const [{ data: t }, { data: a }] = await Promise.all([
      context.supabase.rpc("has_role", { _user_id: context.userId, _role: "teacher" }),
      context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" }),
    ]);
    if (!t && !a) throw new Error("Chỉ giáo viên được tạo báo cáo.");
    const { runWeeklyReports } = await import("./weekly-reports.server");
    return runWeeklyReports();
  });
