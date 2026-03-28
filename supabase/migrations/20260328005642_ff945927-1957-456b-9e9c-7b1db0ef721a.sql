
-- Add session_day column to student_attendance for Friday/Saturday tracking
ALTER TABLE public.student_attendance ADD COLUMN IF NOT EXISTS session_day text NOT NULL DEFAULT 'friday';

-- Drop old unique constraint (try common names)
DO $$
BEGIN
  BEGIN
    ALTER TABLE public.student_attendance DROP CONSTRAINT student_attendance_user_id_week_number_key;
  EXCEPTION WHEN undefined_object THEN NULL;
  END;
END $$;

-- Create new unique constraint including session_day
CREATE UNIQUE INDEX IF NOT EXISTS student_attendance_user_week_session_key 
ON public.student_attendance (user_id, week_number, session_day);

-- Allow public/anon read access to weekly_reviews for testimonials on landing page
CREATE POLICY "Public can read reviews for testimonials"
ON public.weekly_reviews
FOR SELECT
TO anon
USING (written_reflection IS NOT NULL);
