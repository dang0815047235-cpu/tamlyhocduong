# Nâng cấp trợ lý tư vấn và danh sách giáo viên

## Mục tiêu
- Làm câu trả lời AI nhẹ nhàng, thấu cảm, có tính nâng đỡ và biết liên hệ câu hỏi lạ với khía cạnh tâm lý phù hợp.
- Chuyển cuộc gọi AI sang Xkiro bằng khóa bí mật đã được lưu an toàn trên máy chủ.
- Trang đặt lịch luôn lấy tên giáo viên đang có quyền giáo viên sau khi quản trị viên phê duyệt.
- Dùng cách xưng hô trung tính “mình – bạn” trên các màn hình hỗ trợ, phù hợp cả học sinh lẫn giáo viên.

## Thực hiện
1. Cập nhật hướng dẫn của trợ lý để phản hồi theo nhịp: lắng nghe, phản chiếu cảm xúc, gợi mở liên hệ tâm lý, đưa một vài bước nhỏ dễ làm; vẫn giữ cảnh báo khẩn cấp và không chẩn đoán.
2. Thay cấu hình máy chủ sang API tương thích của Xkiro, giữ khóa ngoài mã nguồn, truyền đầy đủ lịch sử trò chuyện và hiển thị lỗi an toàn.
3. Thêm một hàm đọc chỉ trả về tên giáo viên đã được duyệt; trang đặt lịch tải lại danh sách định kỳ và xử lý trạng thái chưa có giáo viên.
4. Đổi các câu chữ “em” thành “bạn” trên trang chủ, đăng nhập, trò chuyện, kiểm tra cảm xúc, đặt lịch và báo cáo.
5. Kiểm tra đăng nhập, danh sách giáo viên, gửi tin nhắn AI, đặt lịch và giao diện điện thoại/máy tính.

## Chi tiết kỹ thuật
- Không lưu hoặc đưa khóa Xkiro xuống trình duyệt.
- Quyền giáo viên vẫn lấy từ bảng vai trò riêng; không suy luận từ hồ sơ hay dữ liệu phía trình duyệt.
- Chỉ công khai tên hiển thị của giáo viên đã duyệt cho người đã đăng nhập.
- Lịch hẹn cũ tiếp tục giữ nguyên tên giáo viên đã được lưu tại thời điểm đặt.
