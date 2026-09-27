export const SLOTS = [
  "Tiết 1 (07:15 - 08:00)",
  "Tiết 2 (08:05 - 08:50)",
  "Giờ ra chơi (09:35 - 09:55)",
  "Tiết 4 (10:00 - 10:45)",
  "Chiều 14:00 - 14:45",
  "Chiều 15:00 - 15:45",
];

export const APPOINTMENT_TOPICS = [
  "Áp lực học tập, thi cử",
  "Mâu thuẫn bạn bè",
  "Chuyện gia đình",
  "Cảm xúc, tâm trạng",
  "An toàn học đường",
  "Chủ đề khác",
];

export const APPOINTMENT_STATUS: Record<string, { label: string; className: string }> = {
  pending: { label: "Chờ duyệt", className: "bg-amber-100 text-amber-900" },
  confirmed: { label: "Đã xác nhận", className: "bg-emerald-100 text-emerald-900" },
  completed: { label: "Đã hoàn thành", className: "bg-sky-100 text-sky-900" },
  cancelled: { label: "Đã hủy", className: "bg-rose-100 text-rose-900" },
};

export const INCIDENT_TYPES = [
  "Bắt nạt học đường",
  "Bạo lực, xô xát",
  "Bắt nạt trên mạng",
  "Mâu thuẫn bạn bè",
  "Khó khăn tâm lý cá nhân",
  "Sự việc khác",
];

export const SEVERITIES: Record<string, { label: string; className: string }> = {
  low: { label: "Cần được lắng nghe", className: "bg-sky-100 text-sky-900" },
  medium: { label: "Cần hỗ trợ sớm", className: "bg-amber-100 text-amber-900" },
  high: { label: "Khẩn cấp", className: "bg-rose-100 text-rose-900" },
};

export const REPORT_STATUS: Record<string, { label: string; className: string }> = {
  new: { label: "Mới gửi", className: "bg-amber-100 text-amber-900" },
  reviewing: { label: "Đang xử lý", className: "bg-sky-100 text-sky-900" },
  resolved: { label: "Đã xử lý xong", className: "bg-emerald-100 text-emerald-900" },
};
