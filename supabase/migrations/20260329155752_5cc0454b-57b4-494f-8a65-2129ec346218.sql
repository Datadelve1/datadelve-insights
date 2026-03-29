CREATE OR REPLACE FUNCTION public.is_primary_admin(_user_id uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM auth.users
    WHERE id = _user_id AND email IN ('datadelve1@gmail.com', 'goodydavis82@gmail.com')
  )
$function$;