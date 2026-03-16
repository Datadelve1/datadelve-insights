
-- Student video submissions table
CREATE TABLE public.student_video_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  student_name text NOT NULL,
  week_number integer NOT NULL,
  session_date date NOT NULL,
  title text DEFAULT '',
  description text DEFAULT '',
  video_url text NOT NULL,
  storage_path text NOT NULL,
  consent_given boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.student_video_submissions ENABLE ROW LEVEL SECURITY;

-- Students can insert their own videos
CREATE POLICY "Students can insert own videos"
ON public.student_video_submissions
FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid() AND consent_given = true);

-- Students can view their own submissions
CREATE POLICY "Students can view own videos"
ON public.student_video_submissions
FOR SELECT TO authenticated
USING (user_id = auth.uid());

-- Only datadelve1 admin can view all student videos
CREATE POLICY "Primary admin can view all student videos"
ON public.student_video_submissions
FOR SELECT TO authenticated
USING (
  (SELECT email FROM auth.users WHERE id = auth.uid()) = 'datadelve1@gmail.com'
);

-- Primary admin can delete student videos
CREATE POLICY "Primary admin can delete student videos"
ON public.student_video_submissions
FOR DELETE TO authenticated
USING (
  (SELECT email FROM auth.users WHERE id = auth.uid()) = 'datadelve1@gmail.com'
);

-- Video access audit log
CREATE TABLE public.video_access_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id uuid NOT NULL REFERENCES public.student_video_submissions(id) ON DELETE CASCADE,
  accessed_by uuid NOT NULL,
  action_type text NOT NULL DEFAULT 'view',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.video_access_logs ENABLE ROW LEVEL SECURITY;

-- Primary admin can insert and read access logs
CREATE POLICY "Primary admin can manage access logs"
ON public.video_access_logs
FOR ALL TO authenticated
USING (
  (SELECT email FROM auth.users WHERE id = auth.uid()) = 'datadelve1@gmail.com'
)
WITH CHECK (
  (SELECT email FROM auth.users WHERE id = auth.uid()) = 'datadelve1@gmail.com'
);

-- Create student-videos storage bucket (private)
INSERT INTO storage.buckets (id, name, public) VALUES ('student-videos', 'student-videos', false);

-- Students can upload to their own folder
CREATE POLICY "Students can upload own videos"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'student-videos' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Students can read their own videos
CREATE POLICY "Students can read own videos"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'student-videos' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Primary admin can read all student videos
CREATE POLICY "Primary admin can read all student videos"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'student-videos' AND
  (SELECT email FROM auth.users WHERE id = auth.uid()) = 'datadelve1@gmail.com'
);
