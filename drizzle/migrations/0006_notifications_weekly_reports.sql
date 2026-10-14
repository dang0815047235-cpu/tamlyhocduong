ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS counselor_id uuid;
CREATE INDEX IF NOT EXISTS appointments_counselor_status_idx ON public.appointments (counselor_id, status);

CREATE TABLE public.chat_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  role text NOT NULL CHECK (role IN ('user','assistant')),
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX chat_logs_user_time_idx ON public.chat_logs (user_id, created_at);
GRANT SELECT, INSERT ON public.chat_logs TO authenticated;
GRANT ALL ON public.chat_logs TO service_role;
ALTER TABLE public.chat_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own chat logs read" ON public.chat_logs FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "own chat logs insert" ON public.chat_logs FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.weekly_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL,
  student_name text NOT NULL,
  week_start date NOT NULL,
  sentiment text NOT NULL CHECK (sentiment IN ('positive','neutral','negative')),
  summary text NOT NULL,
  guidance text NOT NULL,
  stats jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (student_id, week_start)
);
GRANT SELECT ON public.weekly_reports TO authenticated;
GRANT ALL ON public.weekly_reports TO service_role;
ALTER TABLE public.weekly_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "teachers read weekly reports" ON public.weekly_reports FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'teacher'::public.app_role) OR public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE TABLE public.job_locks (
  name text PRIMARY KEY,
  locked_until timestamptz NOT NULL DEFAULT now(),
  paused_reason text
);
GRANT ALL ON public.job_locks TO service_role;
ALTER TABLE public.job_locks ENABLE ROW LEVEL SECURITY;