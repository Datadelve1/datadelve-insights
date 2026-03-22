
CREATE TABLE public.sql_datasets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text DEFAULT '',
  schema_sql text NOT NULL,
  seed_sql text NOT NULL,
  sample_queries jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.sql_datasets ENABLE ROW LEVEL SECURITY;

-- Everyone authenticated can read datasets
CREATE POLICY "Authenticated users can view datasets"
  ON public.sql_datasets FOR SELECT TO authenticated
  USING (true);

-- Only admins can manage datasets
CREATE POLICY "Admins can insert datasets"
  ON public.sql_datasets FOR INSERT TO authenticated
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update datasets"
  ON public.sql_datasets FOR UPDATE TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete datasets"
  ON public.sql_datasets FOR DELETE TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));
