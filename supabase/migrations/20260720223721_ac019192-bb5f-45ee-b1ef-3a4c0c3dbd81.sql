
DROP POLICY IF EXISTS "Authenticated users can read class videos" ON storage.objects;
CREATE POLICY "Admins can read class videos"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'class-videos' AND public.has_role(auth.uid(), 'admin'::public.app_role));

DROP POLICY IF EXISTS "Public read project-datasets" ON storage.objects;

CREATE POLICY "Paid students and admins can read project datasets"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'project-datasets'
  AND (
    public.has_role(auth.uid(), 'admin'::public.app_role)
    OR EXISTS (
      SELECT 1 FROM public.cohort2_enrollments e
      WHERE e.user_id = auth.uid()
        AND e.payment_status = 'paid'
        AND e.confirmed_by_admin = true
    )
  )
);

CREATE POLICY "Admins can manage project datasets"
ON storage.objects FOR ALL
TO authenticated
USING (bucket_id = 'project-datasets' AND public.has_role(auth.uid(), 'admin'::public.app_role))
WITH CHECK (bucket_id = 'project-datasets' AND public.has_role(auth.uid(), 'admin'::public.app_role));
