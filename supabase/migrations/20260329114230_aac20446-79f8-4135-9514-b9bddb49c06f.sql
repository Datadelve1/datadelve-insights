ALTER TABLE public.class_recordings ADD COLUMN session_day text NOT NULL DEFAULT 'friday';

-- Update the existing "Foundation" record to friday (it already defaults)
