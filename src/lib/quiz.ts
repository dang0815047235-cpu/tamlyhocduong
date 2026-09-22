export const QUIZ_OPTIONS = [
  { label: "Không bao giờ", value: 0 },
  { label: "Đôi khi", value: 1 },
  { label: "Thường xuyên", value: 2 },
];

export const QUIZ_QUESTIONS = [
  "Trong hai tuần qua, em cảm thấy lo lắng hoặc bồn chồn khó tả.",
  "Em khó tập trung khi học bài hoặc khi nghe giảng.",
  "Em khó ngủ, ngủ không sâu hoặc thức dậy vẫn thấy mệt.",
  "Em thấy mình cô đơn, ngại trò chuyện với bạn bè.",
  "Em thấy áp lực về điểm số và kỳ vọng của người khác.",
  "Em mất hứng thú với những việc trước đây em thích.",
  "Em thấy khó chia sẻ cảm xúc của mình với người lớn.",
];

export const MAX_SCORE = QUIZ_QUESTIONS.length * 2;

export type QuizResult = {
  level: string;
  headline: string;
  advice: string[];
  tone: "good" | "warn" | "alert";
};

export function evaluateQuiz(score: number): QuizResult {
  if (score <= 4) {
    return {
      level: "Ổn định",
      tone: "good",
      headline: "Cảm xúc của em đang khá ổn định.",
      advice: [
        "Tiếp tục duy trì thói quen ngủ đủ giấc và vận động nhẹ mỗi ngày.",
        "Giữ liên lạc thường xuyên với bạn bè và gia đình.",
        "Ghé thư viện bài viết để học thêm kỹ năng quản lý thời gian.",
      ],
    };
  }
  if (score <= 9) {
    return {
      level: "Cần chú ý",
      tone: "warn",
      headline: "Em đang có một vài dấu hiệu căng thẳng nhẹ.",
      advice: [
        "Thử chia nhỏ việc học và nghỉ ngơi xen kẽ trong ngày.",
        "Tập hít thở sâu 5 phút mỗi tối trước khi ngủ.",
        "Chia sẻ với một người bạn hoặc người thân mà em tin tưởng.",
        "Nếu tình trạng kéo dài hơn hai tuần, hãy đặt lịch gặp thầy cô tư vấn.",
      ],
    };
  }
  return {
    level: "Nên tìm hỗ trợ",
    tone: "alert",
    headline: "Em đang gặp khá nhiều khó khăn về cảm xúc.",
    advice: [
      "Hãy đặt lịch gặp giáo viên tư vấn tâm lý của trường trong tuần này.",
      "Nói với bố mẹ hoặc người lớn mà em tin tưởng về cảm giác hiện tại.",
      "Nếu em thấy không an toàn hoặc có ý nghĩ làm hại bản thân, hãy tìm người lớn ngay lập tức, hoặc gọi Tổng đài 111.",
    ],
  };
}
