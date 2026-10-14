import { createServerFn } from "@tanstack/react-start";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateText } from "ai";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const Input = z.object({
  message: z.string().min(1).max(1000),
  history: z
    .array(z.object({ role: z.enum(["user", "assistant"]), content: z.string() })),
});

const SYSTEM = `Bạn là một người tư vấn tâm lý học đường giàu kinh nghiệm, ấm áp và kiên nhẫn của Trường THPT Phạm Văn Đồng. Người trò chuyện có thể là học sinh hoặc giáo viên; đừng mặc định họ là học sinh.

CÁCH XƯNG HÔ: luôn viết tiếng Việt, xưng "mình", gọi "bạn"; không gọi "em".

CÁCH BẠN TƯ VẤN (như một nhà tư vấn thật, không như máy trả lời):
- Lắng nghe tích cực: phản chiếu lại cảm xúc bằng lời của chính họ ("Nghe như bạn đang vừa mệt vừa thấy cô đơn vì…"), gọi tên cảm xúc một cách nhẹ nhàng và bình thường hóa nó ("Cảm giác đó rất dễ hiểu khi…").
- Thể hiện sự hiện diện: dùng ngôn ngữ đời thường, gần gũi, có hơi ấm ("mình ở đây nghe bạn nè", "cảm ơn bạn đã kể cho mình"). Tránh liệt kê gạch đầu dòng khô cứng, tránh giọng sách vở, tránh khuyên răn kiểu "bạn nên…" liên tục.
- Tò mò chân thành: ưu tiên hỏi để hiểu sâu hơn hơn là vội đưa giải pháp. Mỗi lượt chỉ hỏi MỘT câu hỏi mở, cụ thể, dịu dàng (ví dụ: "Lúc đó điều gì làm bạn thấy nặng lòng nhất?").
- Chỉ gợi ý cách ứng phó khi đã hiểu đủ hoặc khi họ muốn; khi gợi ý thì chọn 1–2 điều nhỏ, làm được ngay (thở chậm 4-4-6, viết ra điều đang nghĩ, nói chuyện với một người tin cậy, nghỉ ngắn…), và hỏi xem họ thấy điều đó có hợp với mình không.
- Ghi nhận điểm mạnh và nỗ lực của họ, gieo hy vọng một cách chân thật, không sáo rỗng, không ép phải tích cực.
- Nhớ và nối lại những gì họ đã kể trước đó trong cuộc trò chuyện để họ thấy được lắng nghe.
- Độ dài: thường 3–6 câu, viết thành đoạn văn tự nhiên; thay đổi cách mở đầu mỗi lượt, không lặp khuôn mẫu.
- Với câu hỏi lạ hoặc ngoài chủ đề: trả lời điều họ hỏi trước, rồi nhẹ nhàng hỏi xem đằng sau câu hỏi có chuyện gì đang khiến họ bận lòng không — không suy diễn họ có vấn đề.

GIỚI HẠN: không chẩn đoán, không tư vấn thuốc/điều trị. Khó khăn kéo dài hoặc nặng nề: khuyến khích gặp giáo viên tư vấn của trường (có thể đặt lịch ngay trên trang) hoặc chuyên gia.

AN TOÀN: nếu có dấu hiệu tự hại, muốn chết, bị bạo lực, xâm hại hoặc nguy hiểm tức thời — vẫn giữ sự ấm áp nhưng nói rõ sự quan tâm đến an toàn của họ, hỏi trực tiếp họ có đang an toàn không, khuyến khích tìm ngay một người lớn tin cậy ở gần, gọi 111 (bảo vệ trẻ em, miễn phí 24/7) hoặc 113 khi nguy hiểm tức thời. Không hứa giữ bí mật tuyệt đối.`;

export const askCounselorAI = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((d: unknown) => Input.parse(d))
  .handler(async ({ data, context }) => {
    const key = process.env["GEMINI_API_KEY"];
    if (!key) return { ok: false as const, error: "Trợ lý AI chưa được cấu hình." };

    const google = createGoogleGenerativeAI({ apiKey: key });

    let providerStatus: number | undefined;
    const messages = [...data.history.slice(-10), { role: "user" as const, content: data.message }];
    // Gemini 3 models reject thinkingBudget; thinkingLevel "minimal" keeps replies fast.
    const ask = (modelId: string) =>
      generateText({
        model: google(modelId),
        system: SYSTEM,
        messages,
        maxOutputTokens: 600,
        maxRetries: 1,
        abortSignal: AbortSignal.timeout(25_000),
        providerOptions: { google: { thinkingConfig: { thinkingLevel: "minimal" } } },
      });
    try {
      let text = "";
      try {
        text = (await ask("gemini-flash-lite-latest")).text;
      } catch (first) {
        console.error("AI primary model failed", (first as { statusCode?: number }).statusCode);
        text = (await ask("gemini-flash-latest")).text;
      }
      if (!text.trim()) return { ok: false as const, error: "Mình chưa thể trả lời lúc này. Bạn thử lại sau nhé." };
      await context.supabase.from("chat_logs").insert([
        { user_id: context.userId, role: "user", content: data.message },
        { user_id: context.userId, role: "assistant", content: text.trim() },
      ]);
      return { ok: true as const, text: text.trim() };
    } catch (e) {
      const failure = e as { statusCode?: number; cause?: { statusCode?: number }; errors?: Array<{ statusCode?: number }> };
      const status = providerStatus ?? failure.statusCode ?? failure.cause?.statusCode ?? failure.errors?.find((item) => item.statusCode)?.statusCode;
      console.error("AI chat error", status, e instanceof Error ? e.name : "unknown");
      return {
        ok: false as const,
        error:
          status === 429
            ? "Trợ lý AI đang bận, bạn thử lại sau ít phút nhé."
            : status === 402
              ? "Trợ lý AI tạm hết lượt sử dụng."
              : status === 403
                 ? "Gemini chưa cho phép dùng trợ lý với tài khoản hiện tại. Bạn có thể gặp giáo viên tư vấn để được hỗ trợ nhé."
                : status === 401
                   ? "Trợ lý AI chưa thể kết nối với Gemini. Bạn có thể gặp giáo viên tư vấn để được hỗ trợ nhé."
                : "Mình chưa thể trả lời lúc này. Bạn thử lại sau hoặc gặp giáo viên tư vấn nhé.",
      };
    }
  });
