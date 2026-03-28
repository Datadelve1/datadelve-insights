
-- 1. Create review_questions table for admin-controlled questions
CREATE TABLE public.review_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question_number integer NOT NULL,
  question_text text NOT NULL DEFAULT '',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid,
  UNIQUE(question_number)
);

ALTER TABLE public.review_questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read review questions" ON public.review_questions
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can manage review questions" ON public.review_questions
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Insert default 5 questions
INSERT INTO public.review_questions (question_number, question_text) VALUES
  (1, 'What key skills or concepts did you learn in this session?'),
  (2, 'How would you rate the quality of the training materials?'),
  (3, 'What part of the session did you find most valuable?'),
  (4, 'How has this training helped your professional development?'),
  (5, 'What improvements would you suggest for future sessions?');

-- 2. Add new columns to weekly_reviews for structured questionnaire
ALTER TABLE public.weekly_reviews
  ADD COLUMN IF NOT EXISTS class_name text DEFAULT '',
  ADD COLUMN IF NOT EXISTS class_date date,
  ADD COLUMN IF NOT EXISTS topic_covered text DEFAULT '',
  ADD COLUMN IF NOT EXISTS tutor_name text DEFAULT '',
  ADD COLUMN IF NOT EXISTS tutor_rating text DEFAULT '',
  ADD COLUMN IF NOT EXISTS question_answers jsonb DEFAULT '{}';

-- 3. Add student_status to profiles for withdrawal tracking
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS student_status text NOT NULL DEFAULT 'active';
