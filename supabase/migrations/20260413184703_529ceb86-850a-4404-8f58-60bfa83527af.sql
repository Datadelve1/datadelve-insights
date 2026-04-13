
ALTER TABLE public.cohort2_enrollments
ADD COLUMN class_schedule text NOT NULL DEFAULT 'weekend',
ADD COLUMN commitment_accepted boolean NOT NULL DEFAULT false;
