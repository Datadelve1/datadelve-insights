-- Remove old permissive policies on weekly_reviews
DROP POLICY IF EXISTS "Anyone can read weekly reviews" ON public.weekly_reviews;
DROP POLICY IF EXISTS "Anyone can submit weekly review" ON public.weekly_reviews;