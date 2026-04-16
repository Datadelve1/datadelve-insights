
-- Staff profiles table
CREATE TABLE public.staff_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  email text NOT NULL,
  salary integer NOT NULL DEFAULT 0,
  has_onboarded boolean NOT NULL DEFAULT false,
  must_change_password boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.staff_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can view own profile" ON public.staff_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Staff can update own profile" ON public.staff_profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all staff profiles" ON public.staff_profiles
  FOR ALL USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Time sessions table
CREATE TABLE public.time_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  started_at timestamptz NOT NULL DEFAULT now(),
  ended_at timestamptz,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'offline', 'idle')),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.time_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can view own sessions" ON public.time_sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Staff can insert own sessions" ON public.time_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Staff can update own sessions" ON public.time_sessions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all sessions" ON public.time_sessions
  FOR ALL USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Activity logs table
CREATE TABLE public.activity_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  session_id uuid NOT NULL REFERENCES public.time_sessions(id) ON DELETE CASCADE,
  description text NOT NULL,
  logged_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can view own activities" ON public.activity_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Staff can insert own activities" ON public.activity_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage all activities" ON public.activity_logs
  FOR ALL USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Idle periods table
CREATE TABLE public.idle_periods (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  session_id uuid NOT NULL REFERENCES public.time_sessions(id) ON DELETE CASCADE,
  started_at timestamptz NOT NULL DEFAULT now(),
  ended_at timestamptz,
  reason text NOT NULL DEFAULT '',
  idle_type text NOT NULL DEFAULT 'unapproved' CHECK (idle_type IN ('unapproved', 'management_delay')),
  description text,
  admin_approved boolean,
  approved_by uuid,
  flagged boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.idle_periods ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can view own idle periods" ON public.idle_periods
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Staff can insert own idle periods" ON public.idle_periods
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Staff can update own idle periods" ON public.idle_periods
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all idle periods" ON public.idle_periods
  FOR ALL USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Enable realtime for sessions (admin monitoring)
ALTER PUBLICATION supabase_realtime ADD TABLE public.time_sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.activity_logs;
ALTER PUBLICATION supabase_realtime ADD TABLE public.idle_periods;
