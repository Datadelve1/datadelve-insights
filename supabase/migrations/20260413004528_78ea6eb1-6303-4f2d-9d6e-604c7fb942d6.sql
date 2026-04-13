
CREATE TABLE public.cohort2_enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  track TEXT NOT NULL DEFAULT 'beginner',
  cohort TEXT NOT NULL DEFAULT 'Cohort 2',
  certificate_requested BOOLEAN NOT NULL DEFAULT false,
  amount_paid INTEGER NOT NULL DEFAULT 0,
  payment_status TEXT NOT NULL DEFAULT 'pending',
  payment_reference TEXT,
  paid_at TIMESTAMPTZ,
  confirmed_by_admin BOOLEAN NOT NULL DEFAULT false,
  must_change_password BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.cohort2_enrollments ENABLE ROW LEVEL SECURITY;

-- Public can insert (enrollment form before auth)
CREATE POLICY "Anyone can enroll"
ON public.cohort2_enrollments
FOR INSERT
TO public
WITH CHECK (true);

-- Students can view own enrollment
CREATE POLICY "Students can view own enrollment"
ON public.cohort2_enrollments
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Admins can do everything
CREATE POLICY "Admins can manage enrollments"
ON public.cohort2_enrollments
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Index for quick lookups
CREATE INDEX idx_cohort2_enrollments_email ON public.cohort2_enrollments(email);
CREATE INDEX idx_cohort2_enrollments_track ON public.cohort2_enrollments(track);
CREATE INDEX idx_cohort2_enrollments_user_id ON public.cohort2_enrollments(user_id);
