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

// DASS-21 (Lovibond & Lovibond, 1995) — thang đo chuẩn, miễn phí sử dụng,
// giữ nguyên nội dung 21 câu gốc theo đúng thứ tự trên bản chính thức.
export type DassSubscale = "depression" | "anxiety" | "stress";

export const DASS_OPTIONS = [
  { label: "Không đúng với mình chút nào", value: 0 },
  { label: "Đúng một phần, hoặc thỉnh thoảng", value: 1 },
  { label: "Đúng khá nhiều, hoặc trong khoảng thời gian đáng kể", value: 2 },
  { label: "Hoàn toàn đúng, hoặc phần lớn thời gian", value: 3 },
];

export const DASS_QUESTIONS: { text: string; subscale: DassSubscale }[] = [
  { text: "Tôi thấy khó để vứt bỏ những căng thẳng, khó thả lỏng để nghỉ ngơi.", subscale: "stress" },
  { text: "Tôi nhận thấy miệng mình bị khô.", subscale: "anxiety" },
  { text: "Tôi dường như không thể cảm nhận được bất kỳ cảm xúc tích cực nào.", subscale: "depression" },
  { text: "Tôi gặp khó khăn trong việc thở (ví dụ: thở nhanh quá mức, hụt hơi dù không gắng sức).", subscale: "anxiety" },
  { text: "Tôi thấy khó tạo động lực để bắt tay vào làm những việc cần làm.", subscale: "depression" },
  { text: "Tôi hay phản ứng thái quá với các tình huống.", subscale: "stress" },
  { text: "Tôi thấy cơ thể run rẩy (ví dụ: run tay).", subscale: "anxiety" },
  { text: "Tôi cảm thấy như mình dùng rất nhiều năng lượng thần kinh.", subscale: "stress" },
  { text: "Tôi lo lắng về những tình huống có thể khiến mình hoảng loạn và lúng túng trước mặt người khác.", subscale: "anxiety" },
  { text: "Tôi cảm thấy chẳng còn điều gì để mong chờ.", subscale: "depression" },
  { text: "Tôi thấy mình dễ bực bội, khó chịu.", subscale: "stress" },
  { text: "Tôi thấy khó thư giãn.", subscale: "stress" },
  { text: "Tôi thấy rầu rĩ, uể oải.", subscale: "depression" },
  { text: "Tôi dễ mất kiên nhẫn với bất cứ điều gì cản trở việc mình đang làm.", subscale: "stress" },
  { text: "Tôi cảm thấy như sắp hoảng loạn.", subscale: "anxiety" },
  { text: "Tôi không thể cảm thấy hứng thú với bất cứ điều gì.", subscale: "depression" },
  { text: "Tôi cảm thấy bản thân không có mấy giá trị.", subscale: "depression" },
  { text: "Tôi thấy mình dễ cáu kỉnh.", subscale: "stress" },
  { text: "Tôi nhận thấy nhịp tim của mình dù không gắng sức (ví dụ: tim đập nhanh, tim đập hụt một nhịp).", subscale: "anxiety" },
  { text: "Tôi thấy sợ hãi mà không có lý do rõ ràng.", subscale: "anxiety" },
  { text: "Tôi cảm thấy cuộc sống thật vô nghĩa.", subscale: "depression" },
];

export const DASS_SUBSCALE_LABELS: Record<DassSubscale, string> = {
  depression: "Trầm cảm",
  anxiety: "Lo âu",
  stress: "Căng thẳng",
};

// Ngưỡng điểm chuẩn DASS-21 (điểm mỗi thang = tổng 7 câu × 2).
// [nhẹ, trung bình, nặng, rất nặng]
const DASS_CUTOFFS: Record<DassSubscale, [number, number, number, number]> = {
  depression: [10, 14, 21, 28],
  anxiety: [8, 10, 15, 20],
  stress: [15, 19, 26, 34],
};

export const DASS_SEVERITY_LABELS = ["Bình thường", "Nhẹ", "Trung bình", "Nặng", "Rất nặng"];

export const DASS_MAX_SCORE = 63;

export type DassResult = {
  level: string;
  headline: string;
  advice: string[];
  tone: "good" | "warn" | "alert";
  subscales: { key: DassSubscale; label: string; score: number; percent: number; level: string }[];
  crisis: boolean;
};

export function evaluateDASS(
  answers: number[],
  accountType: "student" | "teacher" = "student",
): DassResult {
  const sums: Record<DassSubscale, number> = { depression: 0, anxiety: 0, stress: 0 };
  DASS_QUESTIONS.forEach((q, i) => {
    sums[q.subscale] += answers[i] ?? 0;
  });

  const severity = (key: DassSubscale): number => {
    const [m1, m2, m3, m4] = DASS_CUTOFFS[key];
    const s = sums[key] * 2;
    return s >= m4 ? 4 : s >= m3 ? 3 : s >= m2 ? 2 : s >= m1 ? 1 : 0;
  };

  const subscales = (Object.keys(sums) as DassSubscale[]).map((key) => ({
    key,
    label: DASS_SUBSCALE_LABELS[key],
    score: sums[key] * 2,
    percent: Math.min(100, Math.round(((sums[key] * 2) / 42) * 100)),
    level: DASS_SEVERITY_LABELS[severity(key)],
  }));

  const top = Math.max(...subscales.map((s) => severity(s.key)));
  const crisis = severity("depression") >= 3 || top === 4;

  let base: { level: string; headline: string; tone: DassResult["tone"]; advice: string[] };
  if (top === 0) {
    base = {
      level: "Ổn định",
      tone: "good",
      headline: "Kết quả cho thấy bạn đang trong trạng thái khá ổn định.",
      advice: [
        "Giữ nhịp sống đều đặn: ngủ đủ, vận động nhẹ và dành thời gian cho điều bạn thích.",
        "Đọc thêm vài bài viết trong thư viện của trường để nạp thêm năng lượng tích cực.",
      ],
    };
  } else if (top === 1 || top === 2) {
    base = {
      level: "Cần chú ý",
      tone: "warn",
      headline:
        top === 1
          ? "Có một vài dấu hiệu nhẹ — đây là lúc tốt để tự chăm sóc mình hơn."
          : "Có những dấu hiệu rõ rệt hơn; bạn nên dành thêm sự quan tâm cho cảm xúc của mình.",
      advice: [
        "Chia sẻ với một người bạn hoặc người lớn tin cậy về những gì bạn đang cảm thấy.",
        "Mỗi ngày thử một việc nhỏ: đi bộ 10 phút, viết ra điều khiến bạn nặng lòng.",
        accountType === "teacher"
          ? "Nếu cảm giác kéo dài hơn hai tuần, hãy trao đổi với người hỗ trợ hoặc chuyên gia tâm lý."
          : "Nếu tình trạng kéo dài hơn hai tuần, hãy đặt lịch gặp giáo viên tư vấn của trường.",
      ],
    };
  } else {
    base = {
      level: "Nên tìm hỗ trợ",
      tone: "alert",
      headline: "Kết quả cho thấy bạn đang gặp nhiều khó khăn và cần được hỗ trợ.",
      advice: [
        accountType === "teacher"
          ? "Hãy tìm người tin cậy hoặc chuyên gia tâm lý để trao đổi sớm."
          : "Hãy đặt lịch gặp giáo viên tư vấn tâm lý của trường trong tuần này.",
        "Chia sẻ với người thân hoặc người bạn tin tưởng về kết quả này.",
      ],
    };
  }

  const focusTips: Record<DassSubscale, string> = {
    depression:
      "Hãy bắt đầu từ việc nhỏ nhất: một cuộc đi bộ ngắn, một bài hát bạn thích — cảm xúc có thể nhẹ đi từng chút.",
    anxiety: "Tập thở 4-7-8, viết nỗi lo ra giấy và tự hỏi điều đó có chắc chắn xảy ra không.",
    stress:
      "Chia nhỏ việc cần làm, cho mình vài phút nghỉ thật sự và trao đổi phần nặng với người tin cậy.",
  };
  for (const s of subscales) {
    if (severity(s.key) >= 2) base.advice.push(focusTips[s.key]);
  }

  if (crisis) {
    base.advice.unshift(
      "Kết quả có những dấu hiệu nặng. Hãy nói ngay với người ở gần bạn hoặc người lớn tin cậy, gọi Tổng đài 111 (miễn phí, 24/7); nếu đang trong tình huống nguy hiểm hãy gọi 113. Bạn không phải một mình.",
    );
  }

  return { ...base, subscales, crisis };
}
