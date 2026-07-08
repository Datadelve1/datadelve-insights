
-- === Fix: assignments_model_answers_exposed ===
-- Drop the broad SELECT policy that let any authenticated user read model_answers/key_concepts.
DROP POLICY IF EXISTS "Authenticated read assignment rows" ON public.assignments;

-- Switch the student-facing view to security_definer so students read only the safe columns
-- through the view without needing direct SELECT on the base table.
ALTER VIEW public.assignments_student SET (security_invoker = false);

-- Ensure the view owner (postgres) can read the base table so the definer view works.
GRANT SELECT ON public.assignments_student TO authenticated;

-- === Fix: form_uploads_public_bucket_exposure ===
-- Bucket was flipped to private via the storage tool. Now tighten storage.objects policies.
DROP POLICY IF EXISTS "Anyone can read form files" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can upload ambassador form files" ON storage.objects;

-- Admins can read every object in form-uploads (for the admin storage manager and application reviews).
CREATE POLICY "Admins can read form-uploads"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'form-uploads'
  AND public.has_role(auth.uid(), 'admin'::public.app_role)
);

-- Authenticated users can read files inside their own user-id folder (weekly reviews, assignment uploads).
CREATE POLICY "Users can read own form-uploads folder"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'form-uploads'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Public (anon + authenticated) may still submit into the ambassadors/ folder without auth,
-- but cannot read anything back.
CREATE POLICY "Anyone can upload to ambassadors folder"
ON storage.objects
FOR INSERT
TO anon, authenticated
WITH CHECK (
  bucket_id = 'form-uploads'
  AND (storage.foldername(name))[1] = 'ambassadors'
);

-- Authenticated users may upload into their own user-id folder.
CREATE POLICY "Users can upload to own form-uploads folder"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'form-uploads'
  AND (storage.foldername(name))[1] = auth.uid()::text
);
