
-- 1. ambassador_applications: drop public read, add admin read
DROP POLICY IF EXISTS "Anyone can read ambassador applications" ON public.ambassador_applications;
CREATE POLICY "Admins can read ambassador applications"
  ON public.ambassador_applications FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- 2. referrers: drop public read; keep admin manage; service role can read for edge function lookups
DROP POLICY IF EXISTS "Anyone can read active referrers" ON public.referrers;
CREATE POLICY "Service role can read referrers"
  ON public.referrers FOR SELECT
  USING (auth.role() = 'service_role');

-- 3. training_commitments: drop public read, add user own + admin
DROP POLICY IF EXISTS "Anyone can read training commitments" ON public.training_commitments;
CREATE POLICY "Users can read own training commitment"
  ON public.training_commitments FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR email = (SELECT email FROM auth.users WHERE id = auth.uid()));
CREATE POLICY "Admins can read all training commitments"
  ON public.training_commitments FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- 4. webinar_registrations: drop public read, restrict to admins (service role bypasses RLS)
DROP POLICY IF EXISTS "Service role can read registrations" ON public.webinar_registrations;
CREATE POLICY "Admins can read webinar registrations"
  ON public.webinar_registrations FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- 5. weekly_reviews: revoke email/user_id column access from anon (testimonial page only needs name/reflection/video/session_day)
REVOKE SELECT ON public.weekly_reviews FROM anon;
GRANT SELECT (id, full_name, written_reflection, video_url, session_day, week_number, created_at, is_approved, class_name, topic_covered, tutor_name, tutor_rating, class_date, comments)
  ON public.weekly_reviews TO anon;

-- 6. staff_profiles: prevent staff from updating their own salary
DROP POLICY IF EXISTS "Staff can update own profile" ON public.staff_profiles;
CREATE POLICY "Staff can update own profile"
  ON public.staff_profiles FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (
    auth.uid() = user_id
    AND salary = (SELECT salary FROM public.staff_profiles WHERE user_id = auth.uid())
  );

-- 7. Set search_path on remaining functions that lack it
ALTER FUNCTION public.move_to_dlq(text, text, bigint, jsonb) SET search_path = public;
ALTER FUNCTION public.enqueue_email(text, jsonb) SET search_path = public;
ALTER FUNCTION public.delete_email(text, bigint) SET search_path = public;
ALTER FUNCTION public.read_email_batch(text, integer, integer) SET search_path = public;
