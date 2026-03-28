
CREATE TABLE public.google_review_confirmations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  week_number integer NOT NULL,
  confirmed_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, week_number)
);

ALTER TABLE public.google_review_confirmations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert own google review confirmations"
ON public.google_review_confirmations
FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can view own google review confirmations"
ON public.google_review_confirmations
FOR SELECT TO authenticated
USING (user_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role));
