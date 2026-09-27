export const QUIZ_OPTIONS = [
  { label: "Không bao giờ", value: 0 },
  { label: "Đôi khi", value: 1 },
  { label: "Thường xuyên", value: 2 },
];

export type QuizCategory = "study" | "anxiety" | "mood" | "sleep" | "social";

export const CATEGORY_LABELS: Record<QuizCategory, string> = {
  study: "Áp lực học tập",
  anxiety: "Lo âu",
  mood: "Tâm trạng",
  sleep: "Giấc ngủ và năng lượng",
  social: "Quan hệ bạn bè, gia đình",
};

export const CATEGORY_TIPS: Record<QuizCategory, string> = {
  study: "Chia nhỏ việc học, nghỉ 5 phút sau mỗi 25-30 phút và trao đổi với thầy cô về phần còn khó.",
  anxiety: "Tập thở 4-7-8, viết nỗi lo ra giấy và tự hỏi điều đó có chắc chắn xảy ra không.",
  mood: "Dành thời gian cho việc bạn thích, vận động nhẹ và kể cảm xúc của mình cho người tin cậy.",
  sleep: "Đi ngủ đúng giờ, tắt điện thoại 30 phút trước khi ngủ và hạn chế đồ uống có caffeine.",
  social: "Chủ động trò chuyện với một người bạn, tham gia câu lạc bộ và chia sẻ với gia đình mỗi ngày.",
};

export type QuizQuestion = { text: string; category: QuizCategory; safety?: boolean };

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  { text: "Bạn cảm thấy áp lực nặng nề về điểm số.", category: "study" },
  { text: "Bạn lo lắng mình không theo kịp bài vở trên lớp.", category: "study" },
  { text: "Bạn thấy khó tập trung khi học bài hoặc nghe giảng.", category: "study" },
  { text: "Bạn cảm thấy kỳ vọng của gia đình, thầy cô là quá sức với mình.", category: "study" },
  { text: "Bạn cảm thấy lo lắng hoặc bồn chồn mà không rõ lý do.", category: "anxiety" },
  { text: "Bạn hay suy nghĩ lặp đi lặp lại về những điều tồi tệ có thể xảy ra.", category: "anxiety" },
  { text: "Bạn bị tim đập nhanh, khó thở hoặc đau bụng khi căng thẳng.", category: "anxiety" },
  { text: "Bạn sợ hãi hoặc né tránh khi phải phát biểu, thuyết trình trước lớp.", category: "anxiety" },
  { text: "Bạn cảm thấy buồn bã, chán nản kéo dài nhiều ngày.", category: "mood" },
  { text: "Bạn mất hứng thú với những việc trước đây bạn rất thích.", category: "mood" },
  { text: "Bạn cảm thấy mình vô dụng hoặc kém cỏi hơn người khác.", category: "mood" },
  { text: "Bạn dễ nổi nóng, cáu gắt với mọi người xung quanh.", category: "mood" },
  { text: "Bạn khó ngủ, ngủ không sâu hoặc hay thức giấc giữa đêm.", category: "sleep" },
  { text: "Bạn thức dậy vẫn thấy mệt mỏi, thiếu năng lượng.", category: "sleep" },
  { text: "Bạn ăn uống thất thường (ăn quá ít hoặc quá nhiều).", category: "sleep" },
  { text: "Bạn dùng điện thoại đến khuya và khó dừng lại.", category: "sleep" },
  { text: "Bạn cảm thấy cô đơn, không có ai để chia sẻ.", category: "social" },
  { text: "Bạn có mâu thuẫn hoặc bị bạn bè cô lập, trêu chọc.", category: "social" },
  { text: "Bạn thấy khó nói chuyện, chia sẻ với bố mẹ.", category: "social" },
  { text: "Bạn có ý nghĩ muốn làm hại bản thân hoặc không muốn sống nữa.", category: "mood", safety: true },
];

export const MAX_SCORE = QUIZ_QUESTIONS.length * 2;

export type QuizResult = {
  level: string;
  headline: string;
  advice: string[];
  tone: "good" | "warn" | "alert";
  categories: { key: QuizCategory; label: string; percent: number }[];
  safetyFlag: boolean;
};

export function evaluateQuiz(answers: number[]): QuizResult {
  const score = answers.reduce((s, a) => s + a, 0);
  const safetyFlag = QUIZ_QUESTIONS.some((q, i) => q.safety && (answers[i] ?? 0) > 0);

  const sums = new Map<QuizCategory, { got: number; max: number }>();
  QUIZ_QUESTIONS.forEach((q, i) => {
    const cur = sums.get(q.category) ?? { got: 0, max: 0 };
    cur.got += answers[i] ?? 0;
    cur.max += 2;
    sums.set(q.category, cur);
  });
  const categories = Array.from(sums, ([key, v]) => ({
    key,
    label: CATEGORY_LABELS[key],
    percent: Math.round((v.got / v.max) * 100),
  })).sort((a, b) => b.percent - a.percent);

  const focus = categories.filter((c) => c.percent >= 50).map((c) => CATEGORY_TIPS[c.key]);

  let base: Omit<QuizResult, "categories" | "safetyFlag">;
  if (score <= 10 && !safetyFlag) {
    base = {
      level: "Ổn định",
      tone: "good",
      headline: "Cảm xúc của bạn nhìn chung khá ổn định.",
      advice: [
        "Tiếp tục duy trì giấc ngủ đều đặn và vận động nhẹ mỗi ngày.",
        "Giữ kết nối với bạn bè và gia đình.",
      ],
    };
  } else if (score <= 22 && !safetyFlag) {
    base = {
      level: "Cần chú ý",
      tone: "warn",
      headline: "Bạn đang có một số dấu hiệu căng thẳng cần quan tâm.",
      advice: [
        "Chia sẻ với một người bạn hoặc người lớn mà bạn tin tưởng.",
        "Nếu tình trạng kéo dài hơn hai tuần, hãy đặt lịch gặp thầy cô tư vấn.",
      ],
    };
  } else {
    base = {
      level: "Nên tìm hỗ trợ",
      tone: "alert",
      headline: "Bạn đang gặp khá nhiều khó khăn về cảm xúc.",
      advice: [
        "Hãy đặt lịch gặp giáo viên tư vấn tâm lý của trường trong tuần này.",
        "Nói với bố mẹ hoặc người lớn mà bạn tin tưởng về cảm giác hiện tại.",
      ],
    };
  }

  if (safetyFlag) {
    base.advice.unshift(
      "Bạn đã chia sẻ rằng có lúc muốn làm hại bản thân. Hãy nói ngay với bố mẹ, thầy cô hoặc gọi Tổng đài 111 (miễn phí, 24/7). Bạn không phải một mình.",
    );
  }

  return { ...base, advice: [...base.advice, ...focus], categories, safetyFlag };
}
