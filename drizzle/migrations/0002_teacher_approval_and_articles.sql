CREATE TABLE public.teacher_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  email TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  reviewed_at TIMESTAMPTZ
);
GRANT SELECT, UPDATE ON public.teacher_requests TO authenticated;
GRANT ALL ON public.teacher_requests TO service_role;
ALTER TABLE public.teacher_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own or admin reads request" ON public.teacher_requests FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admin updates request" ON public.teacher_requests FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Admin manages teacher role grants
GRANT INSERT, DELETE ON public.user_roles TO authenticated;
CREATE POLICY "admin grants roles" ON public.user_roles FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin') AND role = 'teacher');
CREATE POLICY "admin revokes teacher role" ON public.user_roles FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin') AND role = 'teacher');
CREATE POLICY "admin reads roles" ON public.user_roles FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Signup: everyone starts as student; teacher signups create a pending request
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_name TEXT := COALESCE(NULLIF(NEW.raw_user_meta_data ->> 'display_name', ''), split_part(NEW.email, '@', 1));
BEGIN
  INSERT INTO public.profiles (id, display_name, class_name)
  VALUES (NEW.id, v_name, NULLIF(NEW.raw_user_meta_data ->> 'class_name', ''))
  ON CONFLICT (id) DO NOTHING;

  IF NEW.raw_user_meta_data ->> 'role' = 'teacher' THEN
    INSERT INTO public.teacher_requests (user_id, display_name, email)
    VALUES (NEW.id, v_name, NEW.email)
    ON CONFLICT (user_id) DO NOTHING;
  ELSE
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'student')
    ON CONFLICT DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$;

INSERT INTO public.articles (title, topic, summary, content, source, is_published) VALUES
('Ngủ đủ giấc để học tốt hơn', 'Sức khỏe', 'Giấc ngủ ảnh hưởng trực tiếp tới trí nhớ và tâm trạng.', E'Tuổi THPT cần ngủ khoảng 8-10 tiếng mỗi đêm.\n\n- Đi ngủ và thức dậy vào giờ cố định, kể cả cuối tuần.\n- Tắt điện thoại ít nhất 30 phút trước khi ngủ, ánh sáng xanh làm não khó nghỉ.\n- Tránh trà, cà phê, nước tăng lực sau 3 giờ chiều.\n- Nếu nằm 20 phút chưa ngủ được, hãy dậy đọc sách nhẹ rồi quay lại giường.', 'Tổ chức Y tế Thế giới (WHO) - khuyến nghị về giấc ngủ vị thành niên', true),
('Hít thở 4-7-8 giúp bình tĩnh', 'Cảm xúc', 'Bài tập thở đơn giản làm dịu lo âu chỉ trong 1 phút.', E'1. Thở ra hết bằng miệng.\n2. Hít vào bằng mũi trong 4 giây.\n3. Giữ hơi trong 7 giây.\n4. Thở ra chậm bằng miệng trong 8 giây.\n\nLặp lại 4 lần. Em có thể dùng trước giờ kiểm tra, trước khi thuyết trình hoặc khi thấy tim đập nhanh vì lo lắng.', 'Tài liệu kỹ năng sống - nhóm đề tài tổng hợp', true),
('An toàn khi dùng mạng xã hội', 'An toàn', 'Bảo vệ thông tin cá nhân và cảm xúc của mình trên mạng.', E'- Không chia sẻ địa chỉ nhà, số điện thoại, lịch trình cá nhân công khai.\n- Để tài khoản ở chế độ riêng tư, chỉ kết bạn với người em biết ngoài đời.\n- Khi bị bình luận xúc phạm: không đáp trả, chụp màn hình, chặn và báo cáo.\n- Giới hạn thời gian lướt mạng; so sánh bản thân với "cuộc sống hoàn hảo" trên mạng dễ khiến em buồn.\n- Nếu ai đó đe dọa hoặc đòi hình ảnh riêng tư, hãy báo ngay cho người lớn.', 'Cục An toàn thông tin - Bộ Thông tin và Truyền thông', true),
('Khi em cảm thấy cô đơn', 'Cảm xúc', 'Cô đơn là cảm xúc bình thường và có thể vượt qua.', E'- Thử tham gia một câu lạc bộ hoặc hoạt động của trường theo sở thích.\n- Chủ động bắt chuyện với một bạn ngồi gần, bắt đầu bằng một câu hỏi nhỏ.\n- Dành thời gian cho gia đình, kể cho bố mẹ nghe một chuyện ở trường mỗi ngày.\n- Viết nhật ký để hiểu rõ cảm xúc của mình.\n- Nếu cảm giác cô đơn kéo dài và khiến em buồn nhiều, hãy gặp thầy cô tư vấn.', 'Tài liệu tham khảo nội bộ của nhóm đề tài', true),
('Đối diện với điểm kém', 'Học tập', 'Một bài kiểm tra không quyết định con người em.', E'- Cho phép bản thân buồn một chút, đó là cảm xúc bình thường.\n- Xem lại bài: sai vì chưa hiểu, vì ẩu hay vì thiếu thời gian?\n- Hỏi thầy cô hoặc bạn học giỏi phần chưa hiểu.\n- Đặt mục tiêu nhỏ cho bài tiếp theo, ví dụ tăng thêm 1 điểm.\n- Nói chuyện thẳng thắn với bố mẹ về kế hoạch cải thiện thay vì giấu điểm.', 'Tài liệu tham khảo nội bộ của nhóm đề tài', true),
('Vận động giúp tinh thần khỏe mạnh', 'Sức khỏe', '30 phút vận động mỗi ngày giúp giảm căng thẳng rõ rệt.', E'Khi vận động, cơ thể tiết ra endorphin giúp em thấy vui và thư giãn hơn.\n\n- Đi bộ, đạp xe đến trường nếu có thể.\n- Chơi một môn thể thao cùng bạn bè vào giờ ra chơi hoặc buổi chiều.\n- Giãn cơ 5 phút sau mỗi 45 phút ngồi học.\n- Không cần tập nặng, quan trọng là đều đặn.', 'Tổ chức Y tế Thế giới (WHO) - hoạt động thể chất cho trẻ vị thành niên', true),
('Nói "không" khi bị rủ làm điều sai', 'Bạn bè', 'Từ chối áp lực từ bạn bè mà vẫn giữ được tình bạn.', E'- Nói rõ ràng, ngắn gọn: "Mình không làm đâu."\n- Đưa ra lý do nếu muốn, nhưng không cần xin lỗi.\n- Đề xuất việc khác: "Hay mình đi đá bóng đi."\n- Rời đi nếu bị ép quá mức.\n- Bạn bè thật sự sẽ tôn trọng quyết định của em.', 'Tài liệu kỹ năng sống - nhóm đề tài tổng hợp', true),
('Chuẩn bị tâm lý cho kỳ thi tốt nghiệp', 'Học tập', 'Lộ trình ôn tập và giữ tinh thần vững vàng.', E'- 3 tháng trước: lập kế hoạch ôn theo tuần, ưu tiên phần còn yếu.\n- 1 tháng trước: luyện đề có bấm giờ, làm quen áp lực phòng thi.\n- 1 tuần trước: ôn nhẹ, ngủ sớm, không học dồn.\n- Đêm trước thi: chuẩn bị giấy tờ, dụng cụ; ngủ đủ.\n- Trong phòng thi: làm câu dễ trước, hít thở sâu khi gặp câu khó.', 'Tài liệu tham khảo nội bộ của nhóm đề tài', true),
('Hiểu về lo âu ở tuổi học trò', 'Cảm xúc', 'Nhận biết dấu hiệu lo âu và cách tự chăm sóc.', E'Dấu hiệu thường gặp: tim đập nhanh, khó thở, đau bụng, khó ngủ, suy nghĩ lặp đi lặp lại về điều xấu.\n\nEm có thể:\n- Gọi tên nỗi lo và viết ra giấy.\n- Hỏi bản thân: "Điều mình lo có chắc chắn xảy ra không?"\n- Tập thở chậm, vận động nhẹ.\n- Chia sẻ với người tin cậy.\n\nNếu lo âu khiến em không thể học hay sinh hoạt bình thường, hãy tìm gặp thầy cô tư vấn hoặc chuyên gia.', 'UNICEF Việt Nam - sức khỏe tâm thần vị thành niên', true),
('Làm việc nhóm hiệu quả', 'Bạn bè', 'Cách chia việc và giải quyết bất đồng khi làm bài nhóm.', E'- Họp nhanh đầu tiên để thống nhất mục tiêu và hạn chót.\n- Chia việc theo thế mạnh của từng người, ghi lại rõ ràng.\n- Khi bất đồng, cho mỗi người trình bày ý kiến rồi biểu quyết.\n- Nếu có thành viên không làm, trao đổi riêng trước, sau đó mới báo thầy cô.', 'Tài liệu kỹ năng sống - nhóm đề tài tổng hợp', true);