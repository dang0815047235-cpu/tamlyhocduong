-- Roles
CREATE TYPE public.app_role AS ENUM ('student', 'teacher');

CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL DEFAULT 'Học sinh',
  class_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE POLICY "own profile read" ON public.profiles FOR SELECT TO authenticated
  USING (auth.uid() = id OR public.has_role(auth.uid(), 'teacher'));
CREATE POLICY "own profile insert" ON public.profiles FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = id);
CREATE POLICY "own profile update" ON public.profiles FOR UPDATE TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "read own roles" ON public.user_roles FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'teacher'));

-- Auto profile + role on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, class_name)
  VALUES (
    NEW.id,
    COALESCE(NULLIF(NEW.raw_user_meta_data ->> 'display_name', ''), split_part(NEW.email, '@', 1)),
    NULLIF(NEW.raw_user_meta_data ->> 'class_name', '')
  )
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (
    NEW.id,
    CASE WHEN NEW.raw_user_meta_data ->> 'role' = 'teacher' THEN 'teacher'::public.app_role
         ELSE 'student'::public.app_role END
  )
  ON CONFLICT DO NOTHING;

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Appointments
CREATE TABLE public.appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  counselor_name TEXT NOT NULL,
  appointment_date DATE NOT NULL,
  appointment_slot TEXT NOT NULL,
  topic TEXT NOT NULL,
  note TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (counselor_name, appointment_date, appointment_slot)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.appointments TO authenticated;
GRANT ALL ON public.appointments TO service_role;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "student reads own appointments" ON public.appointments FOR SELECT TO authenticated
  USING (auth.uid() = student_id OR public.has_role(auth.uid(), 'teacher'));
CREATE POLICY "student creates appointment" ON public.appointments FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = student_id);
CREATE POLICY "student cancels own appointment" ON public.appointments FOR UPDATE TO authenticated
  USING (auth.uid() = student_id OR public.has_role(auth.uid(), 'teacher'));

-- Incident reports
CREATE TABLE public.reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  is_anonymous BOOLEAN NOT NULL DEFAULT false,
  incident_type TEXT NOT NULL,
  occurred_at TEXT,
  location TEXT,
  description TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'medium',
  status TEXT NOT NULL DEFAULT 'new',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.reports TO authenticated;
GRANT ALL ON public.reports TO service_role;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "reporter or teacher reads reports" ON public.reports FOR SELECT TO authenticated
  USING ((reporter_id IS NOT NULL AND auth.uid() = reporter_id) OR public.has_role(auth.uid(), 'teacher'));
CREATE POLICY "authenticated creates report" ON public.reports FOR INSERT TO authenticated
  WITH CHECK (
    (is_anonymous = true AND reporter_id IS NULL)
    OR (is_anonymous = false AND reporter_id = auth.uid())
  );
CREATE POLICY "teacher updates report" ON public.reports FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'teacher'));

-- Library articles
CREATE TABLE public.articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  topic TEXT NOT NULL,
  summary TEXT NOT NULL,
  content TEXT NOT NULL,
  source TEXT,
  is_published BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.articles TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.articles TO authenticated;
GRANT ALL ON public.articles TO service_role;
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anyone reads published articles" ON public.articles FOR SELECT TO anon
  USING (is_published = true);
CREATE POLICY "authenticated reads articles" ON public.articles FOR SELECT TO authenticated
  USING (is_published = true OR public.has_role(auth.uid(), 'teacher'));
CREATE POLICY "teacher writes articles" ON public.articles FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'teacher'));
CREATE POLICY "teacher updates articles" ON public.articles FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'teacher'));
CREATE POLICY "teacher deletes articles" ON public.articles FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'teacher'));

-- Emotional check-in results
CREATE TABLE public.checkins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  score INTEGER NOT NULL,
  level TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.checkins TO authenticated;
GRANT ALL ON public.checkins TO service_role;
ALTER TABLE public.checkins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own checkins" ON public.checkins FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'teacher'));
CREATE POLICY "insert own checkin" ON public.checkins FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Seed library articles
INSERT INTO public.articles (title, topic, summary, content, source, is_published) VALUES
('Giảm căng thẳng trước kỳ thi', 'Học tập', 'Bốn bước đơn giản giúp em bình tĩnh hơn trong mùa thi.', E'1. Chia nhỏ nội dung ôn tập theo từng buổi, mỗi buổi 25-30 phút rồi nghỉ 5 phút.\n2. Ngủ đủ 7-8 tiếng, tránh thức khuya sát ngày thi.\n3. Tập hít thở sâu: hít vào 4 nhịp, giữ 4 nhịp, thở ra 6 nhịp, lặp lại 5 lần.\n4. Nói với bố mẹ hoặc thầy cô khi em thấy quá tải. Nhờ giúp đỡ là một kỹ năng, không phải điểm yếu.', 'Tài liệu tham khảo nội bộ của nhóm đề tài', true),
('Quản lý thời gian học tập', 'Học tập', 'Cách lập thời gian biểu vừa sức và giữ được thói quen.', E'- Viết ra tất cả việc cần làm trong tuần, sau đó đánh dấu 3 việc quan trọng nhất mỗi ngày.\n- Dùng quy tắc 2 phút: việc nào làm xong dưới 2 phút thì làm ngay.\n- Đặt giờ cố định cho việc học và giờ cố định cho việc nghỉ ngơi.\n- Cuối tuần xem lại: việc gì đã xong, việc gì cần điều chỉnh.', 'Tài liệu tham khảo nội bộ của nhóm đề tài', true),
('Kiểm soát cảm xúc khi tức giận', 'Cảm xúc', 'Ba việc nên làm trước khi phản ứng lúc nóng giận.', E'- Dừng lại và đếm chậm từ 1 đến 10 trước khi nói.\n- Gọi tên cảm xúc của mình: "Mình đang thấy tức giận vì...". Việc gọi tên giúp cảm xúc dịu lại.\n- Rời khỏi tình huống vài phút, uống nước, đi bộ ngắn.\n- Khi đã bình tĩnh, trao đổi lại bằng câu nói "Mình cảm thấy... khi bạn...".', 'Tài liệu tham khảo nội bộ của nhóm đề tài', true),
('Kỹ năng giao tiếp với bạn bè', 'Bạn bè', 'Lắng nghe và nói thẳng thắn mà vẫn tôn trọng nhau.', E'- Lắng nghe hết câu trước khi trả lời, không cắt lời.\n- Dùng câu "Mình" thay vì câu "Bạn luôn luôn..." để tránh làm đối phương phòng thủ.\n- Khi có hiểu lầm, hỏi lại cho rõ thay vì đoán.\n- Biết xin lỗi và biết tha thứ là cách giữ tình bạn lâu dài.', 'Tài liệu tham khảo nội bộ của nhóm đề tài', true),
('Phòng chống bắt nạt học đường', 'An toàn', 'Nhận diện hành vi bắt nạt và cách tự bảo vệ.', E'Bắt nạt gồm cả lời nói, hành động, cô lập và bắt nạt trên mạng.\n\nEm nên:\n- Lưu lại bằng chứng (tin nhắn, hình ảnh).\n- Nói ngay với giáo viên chủ nhiệm, giáo viên tư vấn hoặc người lớn đáng tin cậy.\n- Gửi báo cáo sự việc trên trang này, có thể chọn gửi ẩn danh.\n- Không trả đũa bằng bạo lực.\n\nNếu em thấy bạn khác bị bắt nạt, đừng im lặng - hãy báo cho thầy cô.', 'Tài liệu tham khảo nội bộ của nhóm đề tài', true),
('Cách tìm kiếm sự giúp đỡ', 'An toàn', 'Khi nào và tìm ai để được hỗ trợ kịp thời.', E'Hãy tìm người lớn ngay khi em thấy:\n- Buồn kéo dài nhiều ngày, mất ngủ, không muốn đến trường.\n- Bị đe dọa hoặc thấy không an toàn.\n- Có suy nghĩ làm hại bản thân.\n\nNgười em có thể tìm: bố mẹ, giáo viên chủ nhiệm, giáo viên tư vấn tâm lý của trường, hoặc Tổng đài quốc gia bảo vệ trẻ em 111 (miễn phí, 24/7).', 'Tổng đài quốc gia bảo vệ trẻ em 111', true);