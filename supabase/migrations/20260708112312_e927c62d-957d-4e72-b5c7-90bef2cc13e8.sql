
DROP POLICY IF EXISTS "Anyone can upload to ambassadors folder" ON storage.objects;

CREATE POLICY "Anyone can upload public form files"
ON storage.objects
FOR INSERT
TO anon, authenticated
WITH CHECK (
  bucket_id = 'form-uploads'
  AND (storage.foldername(name))[1] IN ('ambassadors', 'weekly-videos', 'brand')
);
