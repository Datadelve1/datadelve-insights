
ALTER TABLE public.google_review_confirmations ADD COLUMN session_day text NOT NULL DEFAULT 'friday';
ALTER TABLE public.google_review_confirmations DROP CONSTRAINT google_review_confirmations_user_id_week_number_key;
ALTER TABLE public.google_review_confirmations ADD CONSTRAINT google_review_confirmations_user_week_session_key UNIQUE (user_id, week_number, session_day);
