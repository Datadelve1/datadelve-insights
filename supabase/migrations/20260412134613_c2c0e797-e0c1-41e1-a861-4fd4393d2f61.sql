
CREATE TABLE public.certificate_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  eligible boolean NOT NULL DEFAULT false,
  payment_status text NOT NULL DEFAULT 'pending',
  payment_reference text,
  amount integer NOT NULL DEFAULT 10000,
  paid_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Unique constraint: one record per student
ALTER TABLE public.certificate_payments ADD CONSTRAINT certificate_payments_user_id_unique UNIQUE (user_id);

-- Enable RLS
ALTER TABLE public.certificate_payments ENABLE ROW LEVEL SECURITY;

-- Students can view own record
CREATE POLICY "Students can view own certificate payment"
ON public.certificate_payments
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Admins full access
CREATE POLICY "Admins can manage certificate payments"
ON public.certificate_payments
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Students can update own record (for payment reference after Paystack redirect)
CREATE POLICY "Students can update own payment"
ON public.certificate_payments
FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());
