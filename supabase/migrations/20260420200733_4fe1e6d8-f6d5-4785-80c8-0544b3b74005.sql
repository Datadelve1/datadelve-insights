ALTER TABLE public.ambassador_signups
  ADD COLUMN IF NOT EXISTS ig_handle text,
  ADD COLUMN IF NOT EXISTS allow_ig_tag boolean NOT NULL DEFAULT false;