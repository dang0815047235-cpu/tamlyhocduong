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

const SYSTEM = `Bạn là một người tư vấn tâm lý học đường giàu kinh nghiệm, ấm áp và kiên nhẫn của Trường THCS & THPT Phạm Văn Đồng. Người trò chuyện có thể là học sinh hoặc giáo viên; đừng mặc định họ là học sinh.

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

// Model cố định (không dùng alias "-latest" vì Google đổi model phía sau mà không báo,
// có thể làm lỗi tham số như thinkingLevel). Đổi model bằng biến môi trường, không cần sửa code.
 const DEFAULT_MODELS = [
    process.env["GEMINI_MODEL"] ?? "gemini-3.5-flash-lite",
    process.env["GEMINI_FALLBACK_MODEL"] ?? "gemini-flash-lite-latest",
    "gemini-3.1-flash-lite",
    "gemini-3.8-flash",
    "gemini-flash-latest",
type ApiFailure = {
  statusCode?: number;
  message?: string;
  responseBody?: string;
  name?: string;
  cause?: ApiFailure;
  lastError?: ApiFailure;
  errors?: ApiFailure[];
};

function statusOf(e: unknown): number | undefined {
  const f = e as ApiFailure | undefined;
  return (
    f?.statusCode ??
    f?.lastError?.statusCode ??
    f?.cause?.statusCode ??
    f?.errors?.find((x) => x.statusCode)?.statusCode
  );
}

// Ghi log đủ để biết nguyên nhân thật (trước đây chỉ log mỗi mã trạng thái).
function describe(e: unknown): string {
  const f = e as ApiFailure | undefined;
  const inner = f?.lastError ?? f?.cause ?? f;
  return [
    f?.name,
    statusOf(e),
    (inner?.message ?? "").slice(0, 300),
    (inner?.responseBody ?? "").slice(0, 300),
  ]
    .filter(Boolean)
    .join(" | ");
}

export const askCounselorAI = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((d: unknown) => Input.parse(d))
  .handler(async ({ data, context }) => {
    const key = process.env["GEMINI_API_KEY"];
    if (!key) return { ok: false as const, error: "Trợ lý AI chưa được cấu hình." };

    const google = createGoogleGenerativeAI({ apiKey: key });
    const messages = buildGeminiMessages(data.history, data.message);

  const ask = (modelId: string) =>
    generateText({
      model: google(modelId),
      system: SYSTEM,
      messages,
      maxOutputTokens: 1500,
      maxRetries: 1,
      abortSignal: AbortSignal.timeout(20_000),
    });

    // minimal thinking = nhanh, nhưng không phải model nào cũng nhận tham số này.
    // Khi tắt thinkingConfig, model có thể "nghĩ" nhiều hơn và tốn token đầu ra, nên nới maxOutputTokens.
    const ask = (modelId: string, minimalThinking: boolean) =>
      generateText({
        model: google(modelId),
        system: SYSTEM,
        messages,
        maxOutputTokens: minimalThinking ? 600 : 1500,
        maxRetries: 1,
        abortSignal: AbortSignal.timeout(20_000),
        ...(minimalThinking
          ? { providerOptions: { google: { thinkingConfig: { thinkingLevel: "minimal" } } } }
          : {}),
      });

    let text = "";
    let lastStatus: number | undefined;
    let failed = false;

    outer: for (const modelId of [PRIMARY_MODEL, FALLBACK_MODEL]) {
      for (const minimalThinking of [true, false]) {
        try {
          text = (await ask(modelId, minimalThinking)).text.trim();
          if (text) break outer;
          console.error("AI empty reply", modelId, minimalThinking ? "minimal" : "default");
        } catch (e) {
          failed = true;
          const status = statusOf(e);
          if (status !== undefined) lastStatus = status;
          console.error("AI call failed", modelId, minimalThinking ? "minimal" : "default", describe(e));
          if (status === 401 || status === 403) break outer; // lỗi khóa/quyền: thử model khác cũng vô ích
          if (status !== 400) break; // chỉ lỗi 400 mới thử lại cùng model nhưng bỏ thinkingConfig
        }
      }
    }

    if (!text) {
      const code = lastStatus ?? (failed ? "mạng/hết giờ" : "rỗng");
      return {
        ok: false as const,
        error:
          lastStatus === 429
            ? "Trợ lý AI đang bận, bạn thử lại sau ít phút nhé."
            : lastStatus === 402
              ? "Trợ lý AI tạm hết lượt sử dụng."
              : lastStatus === 403 || lastStatus === 401
                ? "Trợ lý AI chưa thể kết nối với Gemini. Bạn có thể gặp giáo viên tư vấn để được hỗ trợ nhé."
                : `Mình chưa thể trả lời lúc này (mã: ${code}). Bạn thử lại sau hoặc gặp giáo viên tư vấn nhé.`,
      };
    }

    const { error: logError } = await context.supabase.from("chat_logs").insert([
      { user_id: context.userId, role: "user", content: data.message },
      { user_id: context.userId, role: "assistant", content: text },
    ]);
    if (logError) console.error("chat_logs insert failed", logError.message);

    return { ok: true as const, text };
  });
