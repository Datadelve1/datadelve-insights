
-- Fix SECURITY DEFINER views by making them security_invoker
ALTER VIEW public.public_testimonials SET (security_invoker = true);
ALTER VIEW public.assignments_student SET (security_invoker = true);

-- Helper: check if a user is enrolled in a given cohort
CREATE OR REPLACE FUNCTION public.user_in_cohort(_user_id uuid, _cohort text)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.cohort2_enrollments
    WHERE user_id = _user_id
      AND cohort = _cohort
      AND payment_status = 'paid'
      AND confirmed_by_admin = true
  )
$$;

-- Restrict class_recordings SELECT to user's own cohort (admins keep full access)
DROP POLICY IF EXISTS "Authenticated users can view recordings" ON public.class_recordings;
CREATE POLICY "Users view recordings for their cohort"
ON public.class_recordings
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin'::app_role)
  OR public.user_in_cohort(auth.uid(), cohort)
);

-- Restrict sql_datasets SELECT to user's own cohort (admins keep full access)
DROP POLICY IF EXISTS "Authenticated users can view datasets" ON public.sql_datasets;
CREATE POLICY "Users view datasets for their cohort"
ON public.sql_datasets
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin'::app_role)
  OR public.user_in_cohort(auth.uid(), cohort)
);
