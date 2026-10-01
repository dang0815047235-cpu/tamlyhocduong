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

export const TEACHER_QUIZ_QUESTIONS: QuizQuestion[] = [
  { text: "Bạn cảm thấy khối lượng công việc giảng dạy quá sức.", category: "study" },
  { text: "Bạn lo lắng về tiến độ bài giảng hoặc chất lượng giờ dạy.", category: "study" },
  { text: "Bạn khó tập trung khi chuẩn bị bài hoặc chấm bài.", category: "study" },
  { text: "Bạn thấy áp lực từ kỳ vọng của phụ huynh, nhà trường hoặc bản thân.", category: "study" },
  { text: "Bạn thường bồn chồn khi nghĩ đến ngày làm việc tiếp theo.", category: "anxiety" },
  { text: "Bạn hay nghĩ đi nghĩ lại về một tình huống khó trong lớp.", category: "anxiety" },
  { text: "Bạn thấy cơ thể căng cứng hoặc tim đập nhanh khi làm việc.", category: "anxiety" },
  { text: "Bạn lo sợ mắc sai sót khi trao đổi với học sinh hoặc phụ huynh.", category: "anxiety" },
  { text: "Bạn thấy kiệt sức về cảm xúc sau giờ dạy.", category: "mood" },
  { text: "Bạn ít còn hứng thú với những hoạt động từng yêu thích.", category: "mood" },
  { text: "Bạn cảm thấy công sức của mình không được ghi nhận.", category: "mood" },
  { text: "Bạn dễ cáu gắt với đồng nghiệp hoặc người thân.", category: "mood" },
  { text: "Bạn khó ngủ hoặc hay thức giấc vì nghĩ về công việc.", category: "sleep" },
  { text: "Bạn thức dậy vẫn mệt và thiếu năng lượng để bắt đầu ngày mới.", category: "sleep" },
  { text: "Bạn bỏ bữa hoặc ăn uống thất thường vì bận rộn.", category: "sleep" },
  { text: "Bạn khó dành thời gian nghỉ ngơi sau giờ làm.", category: "sleep" },
  { text: "Bạn cảm thấy cô đơn khi cần chia sẻ khó khăn trong công việc.", category: "social" },
  { text: "Bạn có mâu thuẫn chưa giải quyết được với đồng nghiệp hoặc phụ huynh.", category: "social" },
  { text: "Bạn thấy khó cân bằng thời gian cho người thân và công việc.", category: "social" },
  { text: "Bạn có ý nghĩ muốn làm hại bản thân hoặc không muốn sống nữa.", category: "mood", safety: true },
];

export const TEACHER_CATEGORY_LABELS: Record<QuizCategory, string> = {
  study: "Áp lực công việc",
  anxiety: "Lo âu",
  mood: "Tâm trạng và kiệt sức",
  sleep: "Giấc ngủ và năng lượng",
  social: "Quan hệ và cân bằng cuộc sống",
};

export const TEACHER_CATEGORY_TIPS: Record<QuizCategory, string> = {
  study: "Chọn một việc ưu tiên trong ngày, trao đổi với tổ chuyên môn khi khối lượng công việc quá tải.",
  anxiety: "Tạm dừng vài phút để thở chậm, ghi lại điều bạn có thể kiểm soát và tìm đồng nghiệp tin cậy để trao đổi.",
  mood: "Cho phép mình nghỉ ngơi và tìm hỗ trợ từ người tin cậy hoặc chuyên gia nếu cảm giác kiệt sức kéo dài.",
  sleep: "Thử khép lại công việc vào một giờ cố định, hạn chế màn hình trước giờ ngủ và duy trì thời gian nghỉ.",
  social: "Đặt ranh giới công việc phù hợp và dành một khoảng thời gian nhỏ để kết nối với người thân.",
};

export const MAX_SCORE = 40;

export type QuizResult = {
  level: string;
  headline: string;
  advice: string[];
  tone: "good" | "warn" | "alert";
  categories: { key: QuizCategory; label: string; percent: number }[];
  safetyFlag: boolean;
};

export function evaluateQuiz(answers: number[], accountType: "student" | "teacher" = "student"): QuizResult {
  const questions = accountType === "teacher" ? TEACHER_QUIZ_QUESTIONS : QUIZ_QUESTIONS;
  const labels = accountType === "teacher" ? TEACHER_CATEGORY_LABELS : CATEGORY_LABELS;
  const tips = accountType === "teacher" ? TEACHER_CATEGORY_TIPS : CATEGORY_TIPS;
  const score = answers.reduce((s, a) => s + a, 0);
  const safetyFlag = questions.some((q, i) => q.safety && (answers[i] ?? 0) > 0);

  const sums = new Map<QuizCategory, { got: number; max: number }>();
  questions.forEach((q, i) => {
    const cur = sums.get(q.category) ?? { got: 0, max: 0 };
    cur.got += answers[i] ?? 0;
    cur.max += 2;
    sums.set(q.category, cur);
  });
  const categories = Array.from(sums, ([key, v]) => ({
    key,
    label: labels[key],
    percent: Math.round((v.got / v.max) * 100),
  })).sort((a, b) => b.percent - a.percent);

  const focus = categories.filter((c) => c.percent >= 50).map((c) => tips[c.key]);

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
        accountType === "teacher" ? "Nếu tình trạng kéo dài hơn hai tuần, hãy tìm người hỗ trợ hoặc chuyên gia tâm lý." : "Nếu tình trạng kéo dài hơn hai tuần, hãy đặt lịch gặp thầy cô tư vấn.",
      ],
    };
  } else {
    base = {
      level: "Nên tìm hỗ trợ",
      tone: "alert",
      headline: "Bạn đang gặp khá nhiều khó khăn về cảm xúc.",
      advice: [
        accountType === "teacher" ? "Hãy tìm người tin cậy hoặc chuyên gia tâm lý để trao đổi sớm." : "Hãy đặt lịch gặp giáo viên tư vấn tâm lý của trường trong tuần này.",
        accountType === "teacher" ? "Chia sẻ với người thân hoặc đồng nghiệp bạn tin tưởng về cảm giác hiện tại." : "Nói với bố mẹ hoặc người lớn mà bạn tin tưởng về cảm giác hiện tại.",
      ],
    };
  }

  if (safetyFlag) {
    base.advice.unshift(
      accountType === "teacher" ? "Bạn đã chia sẻ rằng có lúc muốn làm hại bản thân. Hãy tìm người ở gần ngay, nói với người tin cậy và gọi 115 hoặc 113 nếu đang nguy hiểm. Bạn không phải một mình." : "Bạn đã chia sẻ rằng có lúc muốn làm hại bản thân. Hãy nói ngay với bố mẹ, thầy cô hoặc gọi Tổng đài 111 (miễn phí, 24/7). Bạn không phải một mình.",
    );
  }

  return { ...base, advice: [...base.advice, ...focus], categories, safetyFlag };
}
