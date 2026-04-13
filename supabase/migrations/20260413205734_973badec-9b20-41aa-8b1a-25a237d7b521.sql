-- Add cohort column to class_recordings
ALTER TABLE public.class_recordings
ADD COLUMN cohort text NOT NULL DEFAULT 'Cohort 1';

-- Add cohort column to assignments
ALTER TABLE public.assignments
ADD COLUMN cohort text NOT NULL DEFAULT 'Cohort 1';

-- Add cohort column to sql_datasets
ALTER TABLE public.sql_datasets
ADD COLUMN cohort text NOT NULL DEFAULT 'Cohort 1';

-- Add cohort column to review_questions
ALTER TABLE public.review_questions
ADD COLUMN cohort text NOT NULL DEFAULT 'Cohort 1';

-- Add indexes for efficient cohort filtering
CREATE INDEX idx_class_recordings_cohort ON public.class_recordings(cohort);
CREATE INDEX idx_assignments_cohort ON public.assignments(cohort);
CREATE INDEX idx_sql_datasets_cohort ON public.sql_datasets(cohort);
CREATE INDEX idx_review_questions_cohort ON public.review_questions(cohort);