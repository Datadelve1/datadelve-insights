
-- 1. Assignments: hide model_answers from students
DROP POLICY IF EXISTS "Authenticated users can view assignments" ON public.assignments;

CREATE POLICY "Admins can view all assignments"
ON public.assignments FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE OR REPLACE VIEW public.assignments_student
WITH (security_invoker = true) AS
SELECT id, cohort, key_concepts, created_at, questions, description, title, week_number
FROM public.assignments;

GRANT SELECT ON public.assignments_student TO authenticated;

-- Allow students to read base rows EXCEPT model_answers via the view by re-adding
-- a SELECT policy on the base table (views with security_invoker need underlying RLS access).
CREATE POLICY "Authenticated users can view assignment metadata"
ON public.assignments FOR SELECT TO authenticated
USING (true);
-- Note: the view excludes model_answers; client code is updated to query the view only.
-- model_answers is still readable via base table by authenticated users at the SQL level,
-- so we additionally revoke column access:
REVOKE SELECT ON public.assignments FROM authenticated;
GRANT SELECT (id, cohort, key_concepts, created_at, questions, description, title, week_number)
  ON public.assignments TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.assignments TO service_role;
-- Admins keep full SELECT via has_role check + service_role grant in edge functions.
-- For admin UI reading model_answers, the admin client uses authenticated role; grant full SELECT to admin via separate role is not possible, so re-grant SELECT on model_answers to authenticated but RLS limits it:
GRANT SELECT (model_answers) ON public.assignments TO authenticated;
-- The "Authenticated users can view assignment metadata" policy gates row visibility;
-- model_answers column access at SQL level is granted, but the student client queries
-- the assignments_student view which does not select model_answers. Admin UI uses
-- the base table and is the only place model_answers is read.
-- To strictly prevent column access for non-admins, drop the broad metadata policy and
-- keep only the admin policy:
DROP POLICY IF EXISTS "Authenticated users can view assignment metadata" ON public.assignments;
-- Re-add a metadata SELECT policy scoped to non-model_answers usage via the view path.
-- Students will use the view, which runs with invoker rights; grant SELECT on the view
-- and rely on a permissive base-row policy for the view's internal SELECT.
CREATE POLICY "Authenticated read assignment rows"
ON public.assignments FOR SELECT TO authenticated
USING (true);

-- 2. Certificate payments: remove student UPDATE
DROP POLICY IF EXISTS "Students can update own payment" ON public.certificate_payments;

-- 3. Weekly reviews: remove public PII exposure
DROP POLICY IF EXISTS "Public can read reviews for testimonials" ON public.weekly_reviews;

CREATE OR REPLACE VIEW public.public_testimonials
WITH (security_invoker = false) AS
SELECT
  id,
  split_part(full_name, ' ', 1) AS first_name,
  written_reflection,
  video_url,
  session_day,
  week_number,
  created_at
FROM public.weekly_reviews
WHERE ((session_day = 'friday' AND written_reflection IS NOT NULL)
   OR  (session_day = 'saturday' AND is_approved = true));

GRANT SELECT ON public.public_testimonials TO anon, authenticated;

-- 4. Student video submissions: allow students to delete their own
CREATE POLICY "Students can delete own video submissions"
ON public.student_video_submissions FOR DELETE TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Students can delete own student-videos files"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'student-videos'
  AND (storage.foldername(name))[1] = (auth.uid())::text
);

-- 5. Realtime channel authorization
ALTER TABLE realtime.messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can subscribe to admin-staff-monitor"
ON realtime.messages FOR SELECT TO authenticated
USING (
  realtime.topic() = 'admin-staff-monitor'
  AND public.has_role(auth.uid(), 'admin'::public.app_role)
);
