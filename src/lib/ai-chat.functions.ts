import { createServerFn } from "@tanstack/react-start";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateText } from "ai";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const Input = z.object({
  message: z.string().min(1).max(1000),
  history: z.array(z.object({ role: z.enum(["user", "assistant"]), content: z.string() })),
});

const SYSTEM = `Bạn là một người tư vấn tâm lý học đường giàu kinh nghiệm, ấm áp và kiên nhẫn. Luôn viết tiếng Việt, xưng “mình”, gọi “bạn”; không gọi “em”.

Nghe và phản chiếu cảm xúc trước, hỏi tối đa một câu mở cụ thể mỗi lượt, gợi ý một hoặc hai cách ứng phó nhỏ khi phù hợp. Không chẩn đoán hoặc tư vấn thuốc/điều trị.

Nếu có dấu hiệu tự hại, bạo lực hoặc nguy hiểm tức thời, nói rõ sự quan tâm, khuyến khích tìm người lớn tin cậy ngay và liên hệ 111 hoặc 113 theo tình huống của Việt Nam. Hướng dẫn gặp giáo viên tư vấn hoặc chuyên gia khi khó khăn kéo dài hoặc nặng.`;

// Chỉ dùng tên model ổn định. Mọi key và cuộc trò chuyện đều nằm ở hàm server.
const DEFAULT_MODELS = [
  process.env.GEMINI_MODEL || "gemini-2.5-flash-lite",
  process.env.GEMINI_FALLBACK_MODEL || "gemini-2.5-flash",
];

type ApiFailure = {
  statusCode?: number;
  message?: string;
  responseBody?: string;
  name?: string;
  cause?: ApiFailure;
  lastError?: ApiFailure;
  errors?: ApiFailure[];
};

function statusOf(error: unknown): number | undefined {
  const value = error as ApiFailure | undefined;
  return (
    value?.statusCode ??
    value?.lastError?.statusCode ??
    value?.cause?.statusCode ??
    value?.errors?.find((item) => item.statusCode)?.statusCode
  );
}

function describe(error: unknown): string {
  const value = error as ApiFailure | undefined;
  const inner = value?.lastError ?? value?.cause ?? value;
  return [
    value?.name,
    statusOf(error),
    inner?.message?.slice(0, 300),
    inner?.responseBody?.slice(0, 300),
  ].filter(Boolean).join(" | ");
}

export const askCounselorAI = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((value: unknown) => Input.parse(value))
  .handler(async ({ data, context }) => {
    const key = process.env.GEMINI_API_KEY;
    if (!key) return { ok: false as const, error: "Trợ lý AI chưa được cấu hình." };

    const google = createGoogleGenerativeAI({ apiKey: key });
    const messages = [
      ...data.history.map((item) => ({
        role: item.role,
        content: item.content,
      })),
      { role: "user" as const, content: data.message },
    ];

    let text = "";
    let lastStatus: number | undefined;

    // Mỗi model chỉ thử một lần. Không tự retry 429 và không quay vòng vô hạn.
    for (const modelId of DEFAULT_MODELS) {
      try {
        const result = await generateText({
          model: google(modelId),
          system: SYSTEM,
          messages,
          maxOutputTokens: 600,
          maxRetries: 0,
          abortSignal: AbortSignal.timeout(20_000),
        });
        text = result.text.trim();
        if (text) break;
      } catch (error) {
        const status = statusOf(error);
        if (status !== undefined) lastStatus = status;
        console.error("AI call failed", modelId, describe(error));

        if (status === 429) break;
        if (status === 401 || status === 403) break;
      }
    }

    if (!text) {
      const error = lastStatus === 429
        ? "Trợ lý AI đang bận, bạn thử lại sau ít phút nhé."
        : lastStatus === 402
          ? "Trợ lý AI tạm hết lượt sử dụng."
          : lastStatus === 403 || lastStatus === 401
            ? "Trợ lý AI chưa thể kết nối. Bạn có thể gặp giáo viên tư vấn để được hỗ trợ nhé."
            : `Mình chưa thể trả lời lúc này (mã: ${lastStatus ?? "mạng/hết giờ"}). Bạn thử lại sau hoặc gặp giáo viên tư vấn nhé.`;
      return { ok: false as const, error };
    }

    const { error: logError } = await context.supabase.from("chat_logs").insert([
      { user_id: context.userId, role: "user", content: data.message },
      { user_id: context.userId, role: "assistant", content: text },
    ]);
    if (logError) console.error("chat_logs insert failed", logError.message);

    return { ok: true as const, text };
  });
