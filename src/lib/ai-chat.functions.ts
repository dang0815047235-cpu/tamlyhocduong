import { createServerFn } from "@tanstack/react-start";
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { streamText } from "ai";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const Input = z.object({
  message: z.string().min(1).max(1000),
  history: z
    .array(z.object({ role: z.enum(["user", "assistant"]), content: z.string() })),
});

const SYSTEM = `Bạn là người bạn đồng hành ảo của cộng đồng Trường THPT Phạm Văn Đồng. Người trò chuyện có thể là học sinh hoặc giáo viên; tuyệt đối không mặc định họ là học sinh.
- Luôn viết tiếng Việt, xưng "mình", gọi người đối thoại là "bạn"; không gọi họ là "em". Lắng nghe với sự dịu dàng, chân thành, không lên lớp, không sáo rỗng hoặc áp đặt phải tích cực.
- Trước tiên công nhận điều họ đang trải qua bằng một câu tự nhiên và cụ thể; nếu có thể, gợi mở một góc nhìn nâng đỡ, cho họ biết cảm xúc ấy đáng được lắng nghe. Sau đó đưa một hoặc hai bước nhỏ thực tế, kết bằng câu hỏi mở phù hợp để tiếp tục trò chuyện. Đừng lặp một mẫu câu ở mọi lượt; viết ngắn vừa đủ, không máy móc.
- Với câu hỏi lạ, mơ hồ hoặc tưởng như ngoài chủ đề, hãy trả lời điều họ thực sự hỏi trước; chỉ nhẹ nhàng liên hệ tới cảm xúc, sự căng thẳng, quan hệ hoặc nhu cầu được hỗ trợ nếu có cơ sở từ lời họ. Không suy diễn người hỏi đang mắc vấn đề tâm lý; có thể hỏi họ muốn tìm hiểu kiến thức hay đang trải qua chuyện riêng.
- Không chẩn đoán, không khẳng định mức độ chính xác của bài tự đánh giá, không tư vấn thuốc hoặc điều trị. Với khó khăn nghiêm trọng hoặc kéo dài, khuyến khích gặp giáo viên tư vấn hoặc chuyên gia và tìm người tin cậy.
- Nếu có dấu hiệu tự hại, bị bạo lực, xâm hại hoặc nguy hiểm tức thời: không chỉ an ủi; hướng dẫn tìm người ở gần ngay, liên hệ người lớn đáng tin cậy (nếu phù hợp), gọi 111 để được hỗ trợ bảo vệ trẻ em hoặc 113 khi nguy hiểm tức thời. Không hứa giữ bí mật tuyệt đối.`;

export const askCounselorAI = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => Input.parse(d))
  .handler(async ({ data }) => {
    const key = process.env["XKIRO_API_KEY"];
    if (!key) return { ok: false as const, error: "Trợ lý AI chưa được cấu hình." };

    const gateway = createOpenAICompatible({
      name: "xkiro",
      baseURL: "https://api.xkiro.com/v1",
      headers: { Authorization: `Bearer ${key}` },
    });

    try {
      const result = streamText({
        model: gateway("google/gemini-3.8-flash"),
        system: SYSTEM,
        messages: [...data.history, { role: "user", content: data.message }],
        maxRetries: 0,
      });
      const text = await result.text;
      if (!text.trim()) return { ok: false as const, error: "Mình chưa thể trả lời lúc này. Bạn thử lại sau nhé." };
      return { ok: true as const, text: text.trim() };
    } catch (e) {
      const failure = e as { statusCode?: number; cause?: { statusCode?: number }; errors?: Array<{ statusCode?: number }> };
      const status = failure.statusCode ?? failure.cause?.statusCode ?? failure.errors?.find((item) => item.statusCode)?.statusCode;
      console.error("AI chat error", status, e instanceof Error ? e.name : "unknown");
      return {
        ok: false as const,
        error:
          status === 429
            ? "Trợ lý AI đang bận, bạn thử lại sau ít phút nhé."
            : status === 402
              ? "Trợ lý AI tạm hết lượt sử dụng."
              : status === 403
                ? "Xkiro cần gói trả phí hoặc số dư đã nạp để dùng mẫu AI này. Mình chưa thể trả lời bằng AI lúc này; bạn có thể gặp giáo viên tư vấn nhé."
                : status === 401
                  ? "Trợ lý AI chưa thể kết nối với Xkiro. Bạn có thể gặp giáo viên tư vấn để được hỗ trợ nhé."
                : "Mình chưa thể trả lời lúc này. Bạn thử lại sau hoặc gặp giáo viên tư vấn nhé.",
      };
    }
  });
