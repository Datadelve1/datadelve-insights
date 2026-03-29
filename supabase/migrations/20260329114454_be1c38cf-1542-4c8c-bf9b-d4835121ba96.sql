-- Allow all admins to read files in student-videos bucket
CREATE POLICY "Admins can read all student videos"
ON storage.objects
FOR SELECT TO authenticated
USING ((bucket_id = 'student-videos'::text) AND has_role(auth.uid(), 'admin'::app_role));