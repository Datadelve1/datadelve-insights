
-- Ambassador Applications table
CREATE TABLE public.ambassador_applications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  linkedin_url TEXT NOT NULL,
  attended_sessions BOOLEAN NOT NULL DEFAULT false,
  completed_assignments BOOLEAN NOT NULL DEFAULT false,
  submitted_reflections BOOLEAN NOT NULL DEFAULT false,
  whatsapp_engagement TEXT NOT NULL CHECK (whatsapp_engagement IN ('High', 'Medium', 'Low')),
  why_ambassador TEXT NOT NULL,
  skills_strengths TEXT NOT NULL,
  willing_20hrs BOOLEAN NOT NULL DEFAULT false,
  cv_url TEXT NOT NULL,
  video_url TEXT NOT NULL,
  commitment_agreed BOOLEAN NOT NULL DEFAULT true
);

-- Training Commitments table
CREATE TABLE public.training_commitments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  country TEXT NOT NULL,
  current_status TEXT NOT NULL CHECK (current_status IN ('Student', 'Job Seeker', 'Working Professional', 'Career Switcher', 'Other')),
  available_fridays BOOLEAN NOT NULL DEFAULT false,
  agree_weekly_assignments BOOLEAN NOT NULL DEFAULT false,
  submit_reflections BOOLEAN NOT NULL DEFAULT false,
  engage_posts BOOLEAN NOT NULL DEFAULT false,
  ambassador_interest TEXT NOT NULL CHECK (ambassador_interest IN ('Yes', 'Maybe', 'No')),
  commitment_agreed BOOLEAN NOT NULL DEFAULT true
);

-- Weekly Reviews table
CREATE TABLE public.weekly_reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  week_number INTEGER NOT NULL,
  written_reflection TEXT,
  video_url TEXT,
  comments TEXT NOT NULL DEFAULT ''
);

-- Enable RLS
ALTER TABLE public.ambassador_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_commitments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weekly_reviews ENABLE ROW LEVEL SECURITY;

-- Insert policies (public can submit forms)
CREATE POLICY "Anyone can submit ambassador application" ON public.ambassador_applications FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Anyone can submit training commitment" ON public.training_commitments FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Anyone can submit weekly review" ON public.weekly_reviews FOR INSERT TO public WITH CHECK (true);

-- Read policies (for admin/service role)
CREATE POLICY "Anyone can read ambassador applications" ON public.ambassador_applications FOR SELECT TO public USING (true);
CREATE POLICY "Anyone can read training commitments" ON public.training_commitments FOR SELECT TO public USING (true);
CREATE POLICY "Anyone can read weekly reviews" ON public.weekly_reviews FOR SELECT TO public USING (true);

-- Storage bucket for form uploads
INSERT INTO storage.buckets (id, name, public, file_size_limit) VALUES ('form-uploads', 'form-uploads', true, 1073741824);

-- Storage policies
CREATE POLICY "Anyone can upload form files" ON storage.objects FOR INSERT TO public WITH CHECK (bucket_id = 'form-uploads');
CREATE POLICY "Anyone can read form files" ON storage.objects FOR SELECT TO public USING (bucket_id = 'form-uploads');
