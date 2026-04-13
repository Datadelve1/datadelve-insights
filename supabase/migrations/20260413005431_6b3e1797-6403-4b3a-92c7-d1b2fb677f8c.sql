
-- Allow service role to insert profiles (already handled by service role bypassing RLS)
-- Add policy for admin to update profiles student_status
CREATE POLICY "Admins can update profiles"
ON public.profiles
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
