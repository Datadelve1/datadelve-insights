-- Class recordings table for admin-uploaded videos
CREATE TABLE public.class_recordings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  week_number integer NOT NULL UNIQUE,
  title text NOT NULL,
  description text DEFAULT '',
  video_url text NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE public.class_recordings ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can view recordings
CREATE POLICY "Authenticated users can view recordings"
  ON public.class_recordings FOR SELECT
  TO authenticated
  USING (true);

-- Only admins can manage recordings
CREATE POLICY "Admins can insert recordings"
  ON public.class_recordings FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update recordings"
  ON public.class_recordings FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete recordings"
  ON public.class_recordings FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Update weekly_reviews RLS: students can only read their own reviews
DROP POLICY IF EXISTS "Users can view own weekly reviews" ON public.weekly_reviews;
CREATE POLICY "Users can view own weekly reviews"
  ON public.weekly_reviews FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

-- Students can insert their own reviews
DROP POLICY IF EXISTS "Users can insert own weekly reviews" ON public.weekly_reviews;
CREATE POLICY "Users can insert own weekly reviews"
  ON public.weekly_reviews FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());