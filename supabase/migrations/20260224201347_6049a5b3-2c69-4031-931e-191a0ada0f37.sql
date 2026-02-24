
CREATE TABLE public.webinar_registrations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.webinar_registrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can register for webinar"
ON public.webinar_registrations
FOR INSERT
WITH CHECK (true);
