ALTER TABLE public.review_questions DROP CONSTRAINT IF EXISTS review_questions_question_number_key;

CREATE UNIQUE INDEX IF NOT EXISTS review_questions_cohort_question_number_key
  ON public.review_questions (cohort, question_number);

INSERT INTO public.review_questions (question_number, question_text, is_active, cohort)
SELECT q.question_number, q.question_text, q.is_active, c.cohort
FROM public.review_questions q
CROSS JOIN (VALUES ('Cohort 2'),('Cohort 3')) AS c(cohort)
WHERE q.cohort = 'Cohort 1'
AND NOT EXISTS (
  SELECT 1 FROM public.review_questions r
  WHERE r.cohort = c.cohort AND r.question_number = q.question_number
);