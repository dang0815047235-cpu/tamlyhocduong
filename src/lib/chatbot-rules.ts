export type ChatRule = {
  id: string;
  group: string;
  keywords: string[];
  reply: string;
  links?: { label: string; to: string }[];
  /** Chỉ áp dụng rule này khi tin nhắn ngắn (ví dụ lời chào). */
  maxWords?: number;
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
      "đặt hẹn",
      "hẹn gặp",
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
    maxWords: 4,
    keywords: ["xin chào", "chào bạn", "hello", "hi", "alo", "chào"],
    reply: `Chào bạn! Mình là trợ lý ảo hỗ trợ tư vấn tâm lý học đường của Trường THCS & THPT Phạm Văn Đồng.
Bạn có thể hỏi mình về: áp lực học tập, mâu thuẫn bạn bè, bắt nạt học đường, hoặc cách đặt lịch gặp thầy cô.`,
  },
];

export type BotAnswer = {
  reply: string;
  group: string;
  isEmergency: boolean;
  /** true khi có câu trả lời viết sẵn (khẩn cấp hoặc khớp đúng 1 nhóm). false → nhường cho AI. */
  matched: boolean;
  links?: { label: string; to: string }[];
};

const DEFAULT_LINKS = [
  { label: "Thư viện bài viết", to: "/thu-vien" },
  { label: "Đặt lịch gặp thầy cô", to: "/dat-lich" },
];

// Từ khóa ngắn (≤ 3 ký tự) phải đứng riêng thành một từ, tránh "hi" khớp nhầm vào "nghĩ", "chị", "thi"...
function matches(text: string, keyword: string): boolean {
  if (keyword.length > 3) return text.includes(keyword);
  return new RegExp(`(^|[^\\p{L}])${keyword}($|[^\\p{L}])`, "u").test(text);
}

export function answerMessage(input: string): BotAnswer {
  const text = input.toLowerCase().trim();

  if (EMERGENCY_KEYWORDS.some((k) => text.includes(k))) {
    return { reply: EMERGENCY_REPLY, group: "Khẩn cấp", isEmergency: true, matched: true };
  }

  const wordCount = text.split(/\s+/).filter(Boolean).length;
  let topScore = 0;
  let top: ChatRule[] = [];

  for (const rule of CHAT_RULES) {
    if (rule.maxWords !== undefined && wordCount > rule.maxWords) continue;
    const score = rule.keywords.filter((k) => matches(text, k)).length;
    if (score === 0 || score < topScore) continue;
    if (score > topScore) {
      topScore = score;
      top = [rule];
    } else {
      top.push(rule);
    }
  }

  // Chỉ trả câu viết sẵn khi khớp đúng MỘT nhóm. Khớp nhiều nhóm hòa điểm
  // (tin nhắn nhiều chủ đề) thì để AI trả lời cho đầy đủ.
  const [rule] = top;
  if (rule && top.length === 1) {
    return {
      reply: rule.reply,
      group: rule.group,
      isEmergency: false,
      matched: true,
      ...(rule.links ? { links: rule.links } : {}),
    };
  }

  return {
    reply: FALLBACK_REPLY,
    group: "Không khớp",
    isEmergency: false,
    matched: false,
    links: DEFAULT_LINKS,
  };
}

// Gợi ý khi AI khuyên học sinh tìm người hỗ trợ → thêm nút đặt lịch.
const COUNSELOR_HINTS = ["giáo viên tư vấn", "thầy cô", "giáo viên chủ nhiệm", "chuyên gia", "tư vấn viên"];

/**
 * Link đi kèm câu trả lời của AI, dùng chung hệ link với các rule.
 * - Lấy link của MỌI nhóm chủ đề khớp trong tin nhắn học sinh (kể cả khi nhiều nhóm hòa điểm).
 * - Nếu AI khuyên gặp thầy cô / chuyên gia thì thêm link đặt lịch.
 * - Không có chủ đề nào thì dùng link mặc định (Thư viện, Đặt lịch).
 */
export function linksFor(userText: string, aiText = ""): { label: string; to: string }[] {
  const text = userText.toLowerCase().trim();
  const reply = aiText.toLowerCase();
  const picked: { label: string; to: string }[] = [];
  const add = (list: { label: string; to: string }[] | undefined) => {
    for (const link of list ?? []) {
      if (!picked.some((p) => p.to === link.to)) picked.push(link);
    }
  };

  for (const rule of CHAT_RULES) {
    if (rule.maxWords !== undefined) continue; // bỏ qua rule chào hỏi
    if (rule.keywords.some((k) => matches(text, k))) add(rule.links);
  }
  if (picked.length === 0) add(DEFAULT_LINKS);
  if (COUNSELOR_HINTS.some((h) => reply.includes(h))) add(DEFAULT_LINKS.slice(1));

  return picked.slice(0, 4);
}
