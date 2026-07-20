
DROP POLICY IF EXISTS "Anyone can upload public form files" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can upload to ambassadors folder" ON storage.objects;

CREATE POLICY "Anon can upload ambassador applications"
ON storage.objects
FOR INSERT
TO anon, authenticated
WITH CHECK (
  bucket_id = 'form-uploads'
  AND (storage.foldername(name))[1] = 'ambassadors'
);

CREATE POLICY "Authenticated can upload weekly-videos and brand"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'form-uploads'
  AND (storage.foldername(name))[1] IN ('weekly-videos', 'brand')
);
