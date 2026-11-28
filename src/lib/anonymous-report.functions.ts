import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const AnonymousReportInput = z.object({
  incidentType: z.enum([
    "Bắt nạt học đường",
    "Bạo lực, xô xát",
    "Bắt nạt trên mạng",
    "Mâu thuẫn bạn bè",
    "Khó khăn tâm lý cá nhân",
    "Sự việc khác",
  ]),
  occurredAt: z.string().trim().max(200).optional(),
  location: z.string().trim().max(200).optional(),
  description: z.string().trim().min(10).max(5000),
  severity: z.enum(["low", "medium", "high"]),
});

export const submitAnonymousReport = createServerFn({ method: "POST" })
  .validator((value: unknown) => AnonymousReportInput.parse(value))
  .handler(async ({ data, request }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const forwardedFor = request.headers.get("x-forwarded-for") ?? "";
    const ip = forwardedFor.split(",")[0]?.trim() || "unknown";

    const rateKey = ip;
    const now = Date.now();
    const windowStarted = (globalThis as typeof globalThis & {
      __anonymousReportWindow?: number;
      __anonymousReportCount?: number;
      __anonymousReportIp?: string;
    });

    if (windowStarted.__anonymousReportIp !== rateKey ||
        !windowStarted.__anonymousReportWindow ||
        now - windowStarted.__anonymousReportWindow >= 60 * 60 * 1000) {
      windowStarted.__anonymousReportIp = rateKey;
      windowStarted.__anonymousReportWindow = now;
      windowStarted.__anonymousReportCount = 1;
    } else {
      windowStarted.__anonymousReportCount = (windowStarted.__anonymousReportCount ?? 0) + 1;
      if (windowStarted.__anonymousReportCount > 5) {
        throw new Error("Bạn đã gửi quá nhiều báo cáo. Vui lòng thử lại sau ít phút.");
      }
    }

    const { error } = await supabaseAdmin.from("reports").insert({
      reporter_id: null,
      is_anonymous: true,
      incident_type: data.incidentType,
      occurred_at: data.occurredAt || null,
      location: data.location || null,
      description: data.description,
      severity: data.severity,
      status: "new",
    });

    if (error) {
      console.error("Anonymous report insert failed", error.message);
      throw new Error("Không gửi được báo cáo. Vui lòng thử lại sau.");
    }

    return { ok: true as const };
  });
