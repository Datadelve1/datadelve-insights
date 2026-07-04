
ALTER VIEW public.public_testimonials SET (security_invoker = true);

DROP POLICY IF EXISTS "Anyone can upload form files" ON storage.objects;
CREATE POLICY "Anyone can upload ambassador form files"
ON storage.objects FOR INSERT TO public
WITH CHECK (
  bucket_id = 'form-uploads'
  AND (storage.foldername(name))[1] = 'ambassadors'
);

CREATE OR REPLACE FUNCTION public.prevent_staff_salary_self_update()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.salary IS DISTINCT FROM OLD.salary
     AND NOT public.has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Only admins can modify salary';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_prevent_staff_salary_self_update ON public.staff_profiles;
CREATE TRIGGER trg_prevent_staff_salary_self_update
BEFORE UPDATE ON public.staff_profiles
FOR EACH ROW EXECUTE FUNCTION public.prevent_staff_salary_self_update();

DROP POLICY IF EXISTS "Staff can update own profile" ON public.staff_profiles;
CREATE POLICY "Staff can update own profile"
ON public.staff_profiles FOR UPDATE TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can insert own video access logs"
ON public.video_access_logs FOR INSERT TO authenticated
WITH CHECK (accessed_by = auth.uid());
