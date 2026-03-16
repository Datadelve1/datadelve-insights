
-- Create a security definer function to check if user is primary admin
CREATE OR REPLACE FUNCTION public.is_primary_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM auth.users
    WHERE id = _user_id AND email = 'datadelve1@gmail.com'
  )
$$;

-- Drop old policies that reference auth.users directly
DROP POLICY IF EXISTS "Primary admin can view all student videos" ON public.student_video_submissions;
DROP POLICY IF EXISTS "Primary admin can delete student videos" ON public.student_video_submissions;
DROP POLICY IF EXISTS "Primary admin can manage access logs" ON public.video_access_logs;
DROP POLICY IF EXISTS "Primary admin can read all student videos" ON storage.objects;

-- Recreate with security definer function
CREATE POLICY "Primary admin can view all student videos"
ON public.student_video_submissions
FOR SELECT TO authenticated
USING (public.is_primary_admin(auth.uid()));

CREATE POLICY "Primary admin can delete student videos"
ON public.student_video_submissions
FOR DELETE TO authenticated
USING (public.is_primary_admin(auth.uid()));

CREATE POLICY "Primary admin can manage access logs"
ON public.video_access_logs
FOR ALL TO authenticated
USING (public.is_primary_admin(auth.uid()))
WITH CHECK (public.is_primary_admin(auth.uid()));

CREATE POLICY "Primary admin can read all student videos"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'student-videos' AND
  public.is_primary_admin(auth.uid())
);
