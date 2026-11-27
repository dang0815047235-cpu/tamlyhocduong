import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateText } from "ai";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { statusOf } from "./ai-chat.functions";

export const WEEKLY_REPORT_BATCH = 10;
const LOCK = "weekly_reports";

export function currentWeekStart(d = new Date()) {
  const x = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  const day = (x.getUTCDay() + 6) % 7; // Monday = 0
  x.setUTCDate(x.getUTCDate() - day);
  return x.toISOString().slice(0, 10);
}

type Result = { created: number; remaining: boolean; paused?: string };

export async function runWeeklyReports(): Promise<Result> {
  const db = supabaseAdmin;
  const now = new Date();
  // Single-flight lease
  const { data: lock } = await db.from("job_locks").select("*").eq("name", LOCK).maybeSingle();
  if (lock && new Date(lock.locked_until) > now) return { created: 0, remaining: true, paused: "Đang có lượt tổng hợp khác chạy." };
  await db.from("job_locks").upsert({ name: LOCK, locked_until: new Date(now.getTime() + 5 * 60_000).toISOString(), paused_reason: null });

  try {
    const key = process.env["GEMINI_API_KEY"];
    if (!key) return { created: 0, remaining: false, paused: "Chưa cấu hình AI." };
    // Đi qua proxy ở Mỹ nếu có GEMINI_BASE_URL (tránh lỗi 400 "User location is not supported").
    const baseURL = process.env["GEMINI_BASE_URL"];
    const proxyToken = process.env["GEMINI_PROXY_TOKEN"];
    const google = createGoogleGenerativeAI({
      apiKey: key,
      ...(baseURL ? { baseURL } : {}),
      ...(proxyToken ? { headers: { "x-proxy-token": proxyToken } } : {}),
    });

    const weekStart = currentWeekStart(now);
    const since = new Date(now.getTime() - 7 * 86400_000).toISOString();
    const sinceDate = since.slice(0, 10);

    const { data: students } = await db.from("user_roles").select("user_id").eq("role", "student");
    const ids = (students ?? []).map((s) => s.user_id);
    const { data: done } = await db.from("weekly_reports").select("student_id").eq("week_start", weekStart);
    const doneSet = new Set((done ?? []).map((d) => d.student_id));
    const todo = ids.filter((id) => !doneSet.has(id));

    let created = 0;
    for (const sid of todo.slice(0, WEEKLY_REPORT_BATCH)) {
      const [{ data: prof }, { data: chats }, { data: checks }, { data: appts }, { data: reps }] = await Promise.all([
        db.from("profiles").select("display_name, class_name").eq("id", sid).maybeSingle(),
        db.from("chat_logs").select("content").eq("user_id", sid).eq("role", "user").gte("created_at", since).order("created_at").limit(40),
        db.from("checkins").select("score, level, created_at").eq("user_id", sid).gte("created_at", since),
        db.from("appointments").select("topic, status, appointment_date").eq("student_id", sid).gte("appointment_date", sinceDate),
        db.from("reports").select("incident_type, severity, description").eq("reporter_id", sid).gte("created_at", since),
      ]);
      const stats = { chats: chats?.length ?? 0, checkins: checks?.length ?? 0, appointments: appts?.length ?? 0, reports: reps?.length ?? 0 };
      const name = prof?.display_name ?? "Học sinh";
      if (!stats.chats && !stats.checkins && !stats.appointments && !stats.reports) {
        await db.from("weekly_reports").insert({
          student_id: sid, student_name: name, week_start: weekStart, sentiment: "neutral", stats,
          summary: "Tuần này học sinh chưa có hoạt động trên hệ thống.",
          guidance: "Giáo viên có thể hỏi thăm nhẹ nhàng khi gặp trực tiếp.",
        });
        created++;
        continue;
      }
      const prompt = `Dữ liệu 7 ngày qua của học sinh "${name}"${prof?.class_name ? ` lớp ${prof.class_name}` : ""}:
- Tin nhắn gửi trợ lý AI: ${JSON.stringify((chats ?? []).map((c) => c.content.slice(0, 300)))}
- Bài kiểm tra cảm xúc (điểm càng cao càng căng thẳng, tối đa 40): ${JSON.stringify(checks ?? [])}
- Lịch hẹn tư vấn: ${JSON.stringify(appts ?? [])}
- Báo cáo sự việc: ${JSON.stringify((reps ?? []).map((r) => ({ ...r, description: r.description?.slice(0, 300) })))}

Viết báo cáo tình hình tâm lý tuần cho giáo viên tư vấn bằng tiếng Việt. Không chẩn đoán bệnh. Trả về JSON đúng dạng:
{"sentiment":"positive|neutral|negative","summary":"3-5 câu tóm tắt tình hình","guidance":"nếu tiêu cực: 3-4 hướng giải quyết cụ thể cho giáo viên; nếu tích cực/ổn: lời khích lệ ấm áp gửi học sinh và cách duy trì"}`;
      try {
        const { text } = await generateText({
          model: google("gemini-3.1-flash-lite"),
          prompt,
          maxOutputTokens: 800,
          maxRetries: 0,
          abortSignal: AbortSignal.timeout(30_000),
          providerOptions: { google: { responseMimeType: "application/json", thinkingConfig: { thinkingLevel: "minimal" } } },
        });
        const parsed = JSON.parse(text.replace(/```json|```/g, "").trim()) as { sentiment?: string; summary?: string; guidance?: string };
        const sentiment = parsed.sentiment === "positive" || parsed.sentiment === "neutral" || parsed.sentiment === "negative"
          ? parsed.sentiment
          : "neutral";
        await db.from("weekly_reports").insert({
          student_id: sid, student_name: name, week_start: weekStart, sentiment, stats,
          summary: parsed.summary ?? "", guidance: parsed.guidance ?? "",
        });
        created++;
      } catch (e) {
        const status = statusOf(e);
        if (status === 429 || status === 402 || status === 403 || status === 401) {
          const reason = status === 429
            ? "AI đang quá tải, sẽ thử lại lượt sau."
            : status === 402
              ? "AI tạm hết lượt sử dụng."
              : "AI chưa thể kết nối; hãy kiểm tra khóa và quyền truy cập.";
          await db.from("job_locks").update({ paused_reason: reason }).eq("name", LOCK);
          return { created, remaining: true, paused: reason };
        }
        console.error("weekly report failed", status);
        const { error: fallbackError } = await db.from("weekly_reports").insert({
          student_id: sid,
          student_name: name,
          week_start: weekStart,
          sentiment: "neutral",
          stats,
          summary: "Chưa tạo được báo cáo tự động tuần này.",
          guidance: "Giáo viên có thể hỏi thăm nhẹ nhàng khi gặp trực tiếp.",
        });
        if (fallbackError) {
          console.error("weekly report fallback insert failed", fallbackError.message);
        } else {
          created++;
        }
      }
    }
    const remaining = todo.length > WEEKLY_REPORT_BATCH;
    if (!remaining) {
      // Whole week done -> build the overall weekly digest (once per week)
      const { data: existing } = await db.from("weekly_summaries").select("id").eq("week_start", weekStart).maybeSingle();
      if (!existing) {
        const { data: all } = await db.from("weekly_reports").select("student_name, sentiment, summary, stats").eq("week_start", weekStart);
        const rows = all ?? [];
        type Totals = { students: number; positive: number; neutral: number; negative: number; chats: number; checkins: number; appointments: number; reports: number };
        const totals = rows.reduce<Totals>(
          (acc, r) => {
            const st = (r.stats ?? {}) as { chats?: number; checkins?: number; appointments?: number; reports?: number };
            acc.students++;
            const sent = r.sentiment as "positive" | "neutral" | "negative";
            if (sent === "positive" || sent === "neutral" || sent === "negative") acc[sent]++;
            acc.chats += st.chats ?? 0; acc.checkins += st.checkins ?? 0; acc.appointments += st.appointments ?? 0; acc.reports += st.reports ?? 0;
            return acc;
          },
          { students: 0, positive: 0, neutral: 0, negative: 0, chats: 0, checkins: 0, appointments: 0, reports: 0 },
        );
        const notable = rows.filter((r) => r.sentiment === "negative").map((r) => ({ name: r.student_name, note: r.summary.slice(0, 200) }));
        const digestPrompt = `Bạn là giáo viên tư vấn tâm lý học đường. Dưới đây là thống kê tuần (từ ${weekStart}) của toàn trường:
- Tổng học sinh có báo cáo: ${totals.students} (tích cực: ${totals.positive}, ổn định: ${totals.neutral}, cần quan tâm: ${totals.negative})
- Hoạt động: ${totals.chats} tin nhắn AI, ${totals.checkins} bài kiểm tra cảm xúc, ${totals.appointments} lịch hẹn, ${totals.reports} báo cáo sự việc
- Các em cần quan tâm: ${JSON.stringify(notable.slice(0, 15))}

Viết bản báo cáo tổng hợp đầu tuần gửi ban giám hiệu và giáo viên tư vấn bằng tiếng Việt, giọng chuyên nghiệp, ấm áp. Không chẩn đoán bệnh. Trả về JSON đúng dạng:
{"summary":"5-8 câu tóm tắt tình hình tâm lý chung của học sinh trong tuần, xu hướng nổi bật","recommendations":"4-6 đề xuất hướng xử lý/chăm sóc cụ thể cho tuần tới"}`;
        try {
          const { text } = await generateText({
            model: google("gemini-3.1-flash-lite"),
            prompt: digestPrompt,
            maxOutputTokens: 1200,
            maxRetries: 0,
            abortSignal: AbortSignal.timeout(30_000),
            providerOptions: { google: { responseMimeType: "application/json", thinkingConfig: { thinkingLevel: "minimal" } } },
          });
          const parsed = JSON.parse(text.replace(/```json|```/g, "").trim()) as { summary?: string; recommendations?: string };
          await db.from("weekly_summaries").insert({
            week_start: weekStart,
            summary: parsed.summary ?? "",
            recommendations: parsed.recommendations ?? "",
            stats: totals,
          });
        } catch (e) {
          const status = statusOf(e);
          console.error("weekly digest failed", status);
          if (status === 429 || status === 402 || status === 403 || status === 401) {
            const reason = status === 429
              ? "AI đang quá tải, sẽ thử lại lượt sau."
              : status === 402
                ? "AI tạm hết lượt sử dụng."
                : "AI chưa thể kết nối; hãy kiểm tra khóa và quyền truy cập.";
            await db.from("job_locks").update({ paused_reason: reason }).eq("name", LOCK);
            return { created, remaining: true, paused: reason };
          }
          return { created, remaining: true };
        }
      }
    }
    return { created, remaining };
  } finally {
    await db.from("job_locks").update({ locked_until: new Date().toISOString() }).eq("name", LOCK);
  }
}
