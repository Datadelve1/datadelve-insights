-- Create referrers table
CREATE TABLE public.referrers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  full_name text NOT NULL,
  email text,
  notes text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Normalize codes to uppercase for case-insensitive matching
CREATE UNIQUE INDEX referrers_code_upper_idx ON public.referrers (UPPER(code));

ALTER TABLE public.referrers ENABLE ROW LEVEL SECURITY;

-- Anyone (including anon) can read active referrers to validate codes during enrollment
CREATE POLICY "Anyone can read active referrers"
ON public.referrers
FOR SELECT
USING (is_active = true);

-- Admins can manage referrers
CREATE POLICY "Admins can manage referrers"
ON public.referrers
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Add referral_code column to enrollments
ALTER TABLE public.cohort2_enrollments
ADD COLUMN referral_code text;

CREATE INDEX cohort2_enrollments_referral_code_idx ON public.cohort2_enrollments (UPPER(referral_code));

-- Updated_at trigger for referrers
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_referrers_updated_at
BEFORE UPDATE ON public.referrers
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();