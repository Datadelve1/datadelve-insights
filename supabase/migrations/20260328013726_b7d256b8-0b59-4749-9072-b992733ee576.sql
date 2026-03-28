
ALTER TABLE weekly_reviews ADD COLUMN IF NOT EXISTS session_day text NOT NULL DEFAULT 'friday';
ALTER TABLE weekly_reviews ADD COLUMN IF NOT EXISTS is_approved boolean NOT NULL DEFAULT false;
ALTER TABLE weekly_reviews ADD COLUMN IF NOT EXISTS approved_by uuid;

-- Update RLS for anon access: auto-show Friday written reviews, only approved Saturday video reviews
DROP POLICY IF EXISTS "Public can read reviews for testimonials" ON weekly_reviews;
CREATE POLICY "Public can read reviews for testimonials" ON weekly_reviews FOR SELECT TO anon USING (
  (session_day = 'friday' AND written_reflection IS NOT NULL) OR
  (session_day = 'saturday' AND is_approved = true)
);

-- Allow admins to update reviews (for approval workflow)
CREATE POLICY "Admins can update reviews" ON weekly_reviews FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
