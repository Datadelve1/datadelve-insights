
-- Create a storage bucket for class recording videos
INSERT INTO storage.buckets (id, name, public)
VALUES ('class-videos', 'class-videos', false)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to read videos (needed for playback)
CREATE POLICY "Authenticated users can read class videos"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'class-videos');

-- Allow admins to upload videos
CREATE POLICY "Admins can upload class videos"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'class-videos'
  AND public.has_role(auth.uid(), 'admin'::public.app_role)
);

-- Allow admins to update videos
CREATE POLICY "Admins can update class videos"
ON storage.objects FOR UPDATE TO authenticated
USING (
  bucket_id = 'class-videos'
  AND public.has_role(auth.uid(), 'admin'::public.app_role)
);

-- Allow admins to delete videos
CREATE POLICY "Admins can delete class videos"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'class-videos'
  AND public.has_role(auth.uid(), 'admin'::public.app_role)
);
