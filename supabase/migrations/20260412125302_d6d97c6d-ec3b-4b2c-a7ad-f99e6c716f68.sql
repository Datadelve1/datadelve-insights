ALTER TABLE public.assignments 
ADD COLUMN model_answers jsonb NOT NULL DEFAULT '[]'::jsonb,
ADD COLUMN key_concepts jsonb NOT NULL DEFAULT '[]'::jsonb;