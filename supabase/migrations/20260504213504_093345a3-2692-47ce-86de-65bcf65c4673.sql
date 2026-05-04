
CREATE TABLE public.project_submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  project_slug TEXT NOT NULL,
  file_url TEXT,
  file_path TEXT,
  link_url TEXT,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'submitted',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.project_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students insert own project submissions"
  ON public.project_submissions FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Students view own project submissions"
  ON public.project_submissions FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Students update own project submissions"
  ON public.project_submissions FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins manage project submissions"
  ON public.project_submissions FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_project_submissions_updated_at
  BEFORE UPDATE ON public.project_submissions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('project-submissions', 'project-submissions', false, 524288000)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Students upload own project submission files"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'project-submissions' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Students read own project submission files"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'project-submissions' AND ((storage.foldername(name))[1] = auth.uid()::text OR has_role(auth.uid(), 'admin'::app_role)));

CREATE POLICY "Students update own project submission files"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'project-submissions' AND (storage.foldername(name))[1] = auth.uid()::text);
