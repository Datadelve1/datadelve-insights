-- Ambassador signups table (public submissions, admin reviews + assigns code)
CREATE TABLE public.ambassador_signups (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  why_refer TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- pending | approved | rejected
  referrer_id UUID REFERENCES public.referrers(id) ON DELETE SET NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.ambassador_signups ENABLE ROW LEVEL SECURITY;

-- Anyone can submit
CREATE POLICY "Anyone can submit ambassador signup"
ON public.ambassador_signups
FOR INSERT
TO public
WITH CHECK (true);

-- Admins manage all
CREATE POLICY "Admins can manage ambassador signups"
ON public.ambassador_signups
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Auto-update timestamp
CREATE TRIGGER update_ambassador_signups_updated_at
BEFORE UPDATE ON public.ambassador_signups
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Public tracking: allow anonymous reads of cohort2_enrollments aggregated by referral_code.
-- We expose a SECURITY DEFINER function that returns referrer info + enrollment count + masked enrollment list.
CREATE OR REPLACE FUNCTION public.get_referrer_tracking(_code TEXT)
RETURNS JSONB
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _referrer RECORD;
  _enrollments JSONB;
  _count INTEGER;
BEGIN
  SELECT id, full_name, code, is_active
  INTO _referrer
  FROM public.referrers
  WHERE upper(code) = upper(_code) AND is_active = true;

  IF _referrer IS NULL THEN
    RETURN jsonb_build_object('found', false);
  END IF;

  SELECT COUNT(*) INTO _count
  FROM public.cohort2_enrollments
  WHERE upper(referral_code) = upper(_code);

  SELECT COALESCE(jsonb_agg(jsonb_build_object(
    'first_name', split_part(full_name, ' ', 1),
    'track', track,
    'payment_status', payment_status,
    'created_at', created_at
  ) ORDER BY created_at DESC), '[]'::jsonb)
  INTO _enrollments
  FROM public.cohort2_enrollments
  WHERE upper(referral_code) = upper(_code);

  RETURN jsonb_build_object(
    'found', true,
    'referrer_name', _referrer.full_name,
    'code', _referrer.code,
    'count', _count,
    'enrollments', _enrollments
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_referrer_tracking(TEXT) TO anon, authenticated;