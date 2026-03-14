-- Assignments table: admin creates weekly assignments with multiple-choice questions
CREATE TABLE public.assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  week_number integer NOT NULL UNIQUE,
  title text NOT NULL,
  description text DEFAULT '',
  questions jsonb NOT NULL DEFAULT '[]',
  created_at timestamptz DEFAULT now() NOT NULL
);

-- questions jsonb format:
-- [{ "question": "What is...?", "options": ["A", "B", "C", "D"], "correct_answer": 0 }]
-- correct_answer is the index of the correct option

ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;

-- Authenticated users can view assignments
CREATE POLICY "Authenticated users can view assignments"
  ON public.assignments FOR SELECT
  TO authenticated
  USING (true);

-- Only admins can manage assignments
CREATE POLICY "Admins can insert assignments"
  ON public.assignments FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update assignments"
  ON public.assignments FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete assignments"
  ON public.assignments FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Assignment submissions table
CREATE TABLE public.assignment_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id uuid REFERENCES public.assignments(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  answers jsonb NOT NULL DEFAULT '[]',
  score integer NOT NULL DEFAULT 0,
  total integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE (assignment_id, user_id)
);

ALTER TABLE public.assignment_submissions ENABLE ROW LEVEL SECURITY;

-- Students can view their own submissions, admins can view all
CREATE POLICY "Users can view own submissions"
  ON public.assignment_submissions FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

-- Students can insert their own submissions
CREATE POLICY "Users can insert own submissions"
  ON public.assignment_submissions FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());