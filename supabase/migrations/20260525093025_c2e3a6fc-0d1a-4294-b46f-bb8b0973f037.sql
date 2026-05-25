DO $$
DECLARE _uid uuid := '4c22f01b-f05d-443b-b12c-b218d97f849a';
BEGIN
  DELETE FROM public.cohort2_enrollments WHERE user_id = _uid OR lower(email) = 'oshinubipipeloluwa@gmail.com';
  DELETE FROM public.profiles WHERE id = _uid;
  DELETE FROM public.user_roles WHERE user_id = _uid;
  DELETE FROM public.assignment_submissions WHERE user_id = _uid;
  DELETE FROM public.weekly_reviews WHERE user_id = _uid OR lower(email) = 'oshinubipipeloluwa@gmail.com';
  DELETE FROM public.student_attendance WHERE user_id = _uid;
  DELETE FROM public.student_video_submissions WHERE user_id = _uid;
  DELETE FROM public.project_submissions WHERE user_id = _uid;
  DELETE FROM public.certificate_payments WHERE user_id = _uid;
  DELETE FROM public.google_review_confirmations WHERE user_id = _uid;
  DELETE FROM public.training_commitments WHERE user_id = _uid OR lower(email) = 'oshinubipipeloluwa@gmail.com';
  DELETE FROM auth.users WHERE id = _uid;
END $$;