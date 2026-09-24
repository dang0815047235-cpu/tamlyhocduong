import { createServerFn } from "@tanstack/react-start";
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { generateText } from "ai";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const Input = z.object({
  message: z.string().min(1).max(1000),
  history: z
    .array(z.object({ role: z.enum(["user", "assistant"]), content: z.string().max(3000) }))
    .max(12),
});

const SYSTEM = `Bạn là trợ lý ảo hỗ trợ tư vấn tâm lý học đường của Trường THPT Phạm Văn Đồng, trò chuyện với học sinh 15-18 tuổi.
- Xưng "mình", gọi học sinh là "bạn". Giọng ấm áp, ngắn gọn (tối đa khoảng 150 chữ), tiếng Việt.
- Chỉ đưa gợi ý chung về học tập, cảm xúc, bạn bè, gia đình, an toàn học đường. Không chẩn đoán bệnh, không tư vấn thuốc hay điều trị.
- Luôn khuyến khích tìm người lớn đáng tin cậy hoặc đặt lịch gặp thầy cô tư vấn khi vấn đề nghiêm trọng hoặc kéo dài.
- Nếu có dấu hiệu nguy hiểm (tự hại, bị bạo lực, xâm hại), yêu cầu tìm người lớn NGAY và gọi Tổng đài 111 hoặc 113.
- Nếu câu hỏi không liên quan, nhẹ nhàng đưa cuộc trò chuyện về chủ đề hỗ trợ học đường.`;

export const askCounselorAI = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => Input.parse(d))
  .handler(async ({ data }) => {
    const key = process.env["LOVABLE_API_KEY"];
    if (!key) return { ok: false as const, error: "Trợ lý AI chưa được cấu hình." };

    const gateway = createOpenAICompatible({
      name: "lovable",
      baseURL: "https://ai.gateway.lovable.dev/v1",
      headers: { "Lovable-API-Key": key, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
    });

    try {
      const { text } = await generateText({
        model: gateway("google/gemini-3.8-flash"),
        system: SYSTEM,
        messages: [...data.history, { role: "user", content: data.message }],
        maxRetries: 1,
      });
      return { ok: true as const, text: text.trim() };
    } catch (e) {
      const status = (e as { statusCode?: number }).statusCode;
      console.error("AI chat error", status, e);
      return {
        ok: false as const,
        error:
          status === 429
            ? "Trợ lý AI đang bận, bạn thử lại sau ít phút nhé."
            : status === 402
              ? "Trợ lý AI tạm hết lượt sử dụng."
              : "Trợ lý AI tạm thời không trả lời được.",
      };
    }
  });
