export type ChatRule = {
  id: string;
  group: string;
  keywords: string[];
  reply: string;
  links?: { label: string; to: string }[];
};

export const EMERGENCY_KEYWORDS = [
  "tự tử",
  "tu tu",
  "tự sát",
  "muốn chết",
  "muon chet",
  "chết đi",
  "tự làm hại",
  "tự hại",
  "cắt tay",
  "rạch tay",
  "không muốn sống",
  "khong muon song",
  "bỏ nhà đi",
  "bị đánh",
  "bị đe dọa",
  "đe dọa giết",
  "xâm hại",
  "quấy rối",
];

export const EMERGENCY_REPLY = `Mình rất lo cho bạn. Những điều bạn vừa nói cần được người lớn hỗ trợ NGAY LÚC NÀY, không nên chờ đợi.

Bạn hãy làm ngay một trong các việc sau:
• Nói với bố mẹ, người thân hoặc thầy cô đang ở gần bạn nhất.
• Gặp giáo viên tư vấn tâm lý của trường, hoặc giáo viên chủ nhiệm.
• Gọi Tổng đài quốc gia bảo vệ trẻ em 111 (miễn phí, hoạt động 24/7).
• Nếu có nguy hiểm tức thời, gọi 113 hoặc nhờ người lớn gọi giúp.

Mình chỉ là trợ lý ảo, không thể thay thế sự hỗ trợ trực tiếp. Bạn không phải đối mặt với chuyện này một mình.`;

export const FALLBACK_REPLY =
  "Mình chưa có thông tin chắc chắn cho câu hỏi này. Bạn có thể xem thư viện bài viết hoặc liên hệ giáo viên tư vấn của trường nhé.";

export const CHAT_RULES: ChatRule[] = [
  {
    id: "hoc-tap",
    group: "Học tập",
    keywords: [
      "căng thẳng",
      "cang thang",
      "áp lực",
      "ap luc",
      "thi cử",
      "thi cu",
      "điểm số",
      "diem so",
      "học bài",
      "ôn thi",
      "on thi",
      "mệt mỏi",
      "quá tải",
      "stress",
    ],
    reply: `Mình hiểu áp lực học tập và thi cử rất mệt. Bạn thử vài cách này nhé:
• Chia nhỏ bài học: học 25-30 phút rồi nghỉ 5 phút.
• Viết ra 3 việc quan trọng nhất cần làm hôm nay, làm xong thì gạch đi.
• Ngủ đủ giấc, tránh thức khuya sát ngày thi.
• Hít thở sâu: hít vào 4 nhịp, giữ 4 nhịp, thở ra 6 nhịp.

Nếu căng thẳng kéo dài nhiều ngày, bạn nên đặt lịch gặp thầy cô tư vấn.`,
    links: [
      { label: "Xem bài viết về giảm căng thẳng", to: "/thu-vien" },
      { label: "Làm bài kiểm tra cảm xúc", to: "/kiem-tra-cam-xuc" },
    ],
  },
  {
    id: "ban-be",
    group: "Bạn bè",
    keywords: [
      "mâu thuẫn",
      "mau thuan",
      "cãi nhau",
      "cai nhau",
      "giận bạn",
      "bạn bè",
      "ban be",
      "hiểu lầm",
      "bị cô lập",
      "co lap",
      "không ai chơi",
      "tẩy chay",
    ],
    reply: `Mâu thuẫn với bạn bè có thể khiến mình thấy tổn thương. Bạn thử nhé:
• Chờ đến khi cả hai bình tĩnh rồi mới nói chuyện.
• Dùng câu bắt đầu bằng "Mình cảm thấy..." thay vì "Bạn lúc nào cũng...".
• Lắng nghe hết câu của bạn trước khi trả lời.
• Nếu không tự giải quyết được, nhờ giáo viên chủ nhiệm làm người trung gian.`,
    links: [
      { label: "Bài viết kỹ năng giao tiếp", to: "/thu-vien" },
      { label: "Đặt lịch gặp thầy cô", to: "/dat-lich" },
    ],
  },
  {
    id: "an-toan",
    group: "An toàn",
    keywords: [
      "bắt nạt",
      "bat nat",
      "bạo lực",
      "bao luc",
      "dọa",
      "doa",
      "trấn lột",
      "đánh nhau",
      "danh nhau",
      "nói xấu trên mạng",
      "bắt nạt mạng",
      "sợ đi học",
    ],
    reply: `Không ai đáng bị bắt nạt cả, và đây không phải lỗi của bạn.
• Hãy lưu lại bằng chứng: tin nhắn, ảnh chụp màn hình, ngày giờ sự việc.
• Nói với một người lớn đáng tin cậy càng sớm càng tốt.
• Gửi báo cáo sự việc trên trang này — bạn có thể chọn gửi ẩn danh.
• Không trả đũa bằng bạo lực, vì điều đó khiến mọi chuyện phức tạp hơn.`,
    links: [
      { label: "Gửi báo cáo sự việc", to: "/bao-cao" },
      { label: "Bài viết phòng chống bắt nạt", to: "/thu-vien" },
    ],
  },
  {
    id: "dich-vu",
    group: "Dịch vụ",
    keywords: [
      "đặt lịch",
      "dat lich",
      "tư vấn",
      "tu van",
      "gặp thầy",
      "gặp cô",
      "hẹn",
      "lịch hẹn",
      "gặp chuyên viên",
    ],
    reply: `Bạn có thể đặt lịch gặp trực tiếp thầy cô tư vấn của trường. Bạn chọn ngày, khung giờ và chủ đề khái quát, thầy cô sẽ xác nhận lại.`,
    links: [{ label: "Mở trang đặt lịch", to: "/dat-lich" }],
  },
  {
    id: "gia-dinh",
    group: "Gia đình",
    keywords: [
      "bố mẹ",
      "bo me",
      "gia đình",
      "gia dinh",
      "cha mẹ",
      "bị mắng",
      "so sánh",
      "kỳ vọng",
    ],
    reply: `Chuyện với gia đình đôi khi rất khó nói. Bạn thử:
• Chọn lúc cả nhà bình tĩnh để nói chuyện, tránh lúc đang căng thẳng.
• Nói cụ thể điều mình cần: "Con muốn bố mẹ nghe con nói hết trước đã".
• Viết ra giấy nếu nói trực tiếp khó quá.
• Nếu chuyện kéo dài, thầy cô tư vấn có thể giúp bạn trao đổi với gia đình.`,
    links: [{ label: "Đặt lịch gặp thầy cô", to: "/dat-lich" }],
  },
  {
    id: "chao-hoi",
    group: "Chào hỏi",
    keywords: ["xin chào", "chào bạn", "hello", "hi", "alo", "chào"],
    reply: `Chào bạn! Mình là trợ lý ảo hỗ trợ tư vấn tâm lý học đường của Trường THPT Phạm Văn Đồng.
Bạn có thể hỏi mình về: áp lực học tập, mâu thuẫn bạn bè, bắt nạt học đường, hoặc cách đặt lịch gặp thầy cô.`,
  },
];

export type BotAnswer = {
  reply: string;
  group: string;
  isEmergency: boolean;
  links?: { label: string; to: string }[];
};

export function answerMessage(input: string): BotAnswer {
  const text = input.toLowerCase().trim();

  if (EMERGENCY_KEYWORDS.some((k) => text.includes(k))) {
    return { reply: EMERGENCY_REPLY, group: "Khẩn cấp", isEmergency: true };
  }

  for (const rule of CHAT_RULES) {
    if (rule.keywords.some((k) => text.includes(k))) {
      return {
        reply: rule.reply,
        group: rule.group,
        isEmergency: false,
        ...(rule.links ? { links: rule.links } : {}),
      };
    }
  }

  return {
    reply: FALLBACK_REPLY,
    group: "Không khớp",
    isEmergency: false,
    links: [
      { label: "Thư viện bài viết", to: "/thu-vien" },
      { label: "Đặt lịch gặp thầy cô", to: "/dat-lich" },
    ],
  };
}
