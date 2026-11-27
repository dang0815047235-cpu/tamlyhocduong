# Sửa chatbot và báo cáo tuần theo hướng dẫn

## Việc sẽ làm
- Sửa lỗi cú pháp đang làm chatbot không khởi động; giữ mô hình chính hiện tại, đặt mô hình dự phòng theo tài liệu, tắt tự thử lại và dừng ngay khi gặp giới hạn 429.
- Sửa báo cáo tuần: giảm mỗi lượt còn 10 học sinh, dùng mô hình tương thích với `thinkingLevel: "minimal"`, không tự thử lại, nhận diện mã lỗi lồng bên trong và lưu bản ghi dự phòng cho lỗi từng học sinh không phải 429. Bản tổng hợp toàn trường chỉ dùng một mô hình.
- Khi AI không phản hồi, dùng câu trả lời từ nhóm chủ đề đã khớp cùng các liên kết; câu hỏi chưa khớp vẫn hiện thông báo lỗi.
- Thay khóa Gemini qua biểu mẫu bảo mật; bạn sẽ nhập lại khóa trong biểu mẫu, không đưa khóa vào mã nguồn hoặc tin nhắn.
- Kiểm tra bản dựng và các bài kiểm tra; sau đó cập nhật bản công khai. Không chạy tạo hàng loạt báo cáo trên dữ liệu tư vấn thật trong quá trình kiểm tra.

## Chi tiết kỹ thuật
- Chỉ sửa `src/lib/ai-chat.functions.ts`, `src/lib/weekly-reports.server.ts` và `src/routes/_authenticated/tro-chuyen.tsx` cho thay đổi ứng dụng.
- Giữ nguyên các cấu hình mô hình ở nơi khác; chỉ đổi đúng những lời gọi được nêu trong tài liệu.
- Xác nhận chatbot hoạt động trên bản xem trước; việc tạo báo cáo với dữ liệu học sinh thật sẽ cần giáo viên chạy trong ứng dụng sau khi cập nhật.