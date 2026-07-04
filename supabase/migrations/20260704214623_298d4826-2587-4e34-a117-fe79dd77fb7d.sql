
-- Helper: is the current user a staff member?
CREATE OR REPLACE FUNCTION public.is_staff(_user_id uuid)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.staff_profiles WHERE user_id = _user_id)
$$;

-- =========== ops_cohorts ===========
CREATE TABLE public.ops_cohorts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  number integer NOT NULL UNIQUE,
  name text,
  onboarding_date date,
  graduation_date date,
  beginner_dates date[] NOT NULL DEFAULT '{}',
  professional_dates date[] NOT NULL DEFAULT '{}',
  notes text,
  status text NOT NULL DEFAULT 'active',
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ops_cohorts TO authenticated;
GRANT ALL ON public.ops_cohorts TO service_role;
ALTER TABLE public.ops_cohorts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff can read cohorts" ON public.ops_cohorts FOR SELECT TO authenticated USING (public.is_staff(auth.uid()) OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage cohorts" ON public.ops_cohorts FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- =========== ops_cohort_staff ===========
CREATE TABLE public.ops_cohort_staff (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cohort_id uuid NOT NULL REFERENCES public.ops_cohorts(id) ON DELETE CASCADE,
  staff_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(cohort_id, staff_user_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ops_cohort_staff TO authenticated;
GRANT ALL ON public.ops_cohort_staff TO service_role;
ALTER TABLE public.ops_cohort_staff ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff read cohort staff" ON public.ops_cohort_staff FOR SELECT TO authenticated USING (public.is_staff(auth.uid()) OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage cohort staff" ON public.ops_cohort_staff FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- =========== ops_cohort_students ===========
CREATE TABLE public.ops_cohort_students (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cohort_id uuid NOT NULL REFERENCES public.ops_cohorts(id) ON DELETE CASCADE,
  full_name text,
  email text NOT NULL,
  status text NOT NULL DEFAULT 'registered',
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(cohort_id, email)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ops_cohort_students TO authenticated;
GRANT ALL ON public.ops_cohort_students TO service_role;
ALTER TABLE public.ops_cohort_students ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff read cohort students" ON public.ops_cohort_students FOR SELECT TO authenticated USING (public.is_staff(auth.uid()) OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage cohort students" ON public.ops_cohort_students FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- =========== ops_emails ===========
CREATE TABLE public.ops_emails (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cohort_id uuid REFERENCES public.ops_cohorts(id) ON DELETE SET NULL,
  email_type text NOT NULL DEFAULT 'custom',
  subject text NOT NULL DEFAULT '',
  body text NOT NULL DEFAULT '',
  recipients jsonb NOT NULL DEFAULT '[]'::jsonb,
  scheduled_at timestamptz,
  status text NOT NULL DEFAULT 'draft', -- draft | waiting_approval | scheduled | sent | failed
  approved_by uuid REFERENCES auth.users(id),
  approved_at timestamptz,
  sent_at timestamptz,
  sent_count integer NOT NULL DEFAULT 0,
  failed_count integer NOT NULL DEFAULT 0,
  error text,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ops_emails TO authenticated;
GRANT ALL ON public.ops_emails TO service_role;
ALTER TABLE public.ops_emails ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff read emails" ON public.ops_emails FOR SELECT TO authenticated USING (public.is_staff(auth.uid()) OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage emails" ON public.ops_emails FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- =========== ops_events ===========
CREATE TABLE public.ops_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  kind text NOT NULL DEFAULT 'custom', -- meeting | beginner_class | professional_class | graduation | onboarding | deadline | custom
  starts_at timestamptz NOT NULL,
  ends_at timestamptz,
  cohort_id uuid REFERENCES public.ops_cohorts(id) ON DELETE SET NULL,
  location text,
  notes text,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ops_events TO authenticated;
GRANT ALL ON public.ops_events TO service_role;
ALTER TABLE public.ops_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff read events" ON public.ops_events FOR SELECT TO authenticated USING (public.is_staff(auth.uid()) OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage events" ON public.ops_events FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- =========== ops_tasks ===========
CREATE TABLE public.ops_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  assignee_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  cohort_id uuid REFERENCES public.ops_cohorts(id) ON DELETE SET NULL,
  due_date date,
  priority text NOT NULL DEFAULT 'normal', -- low | normal | high | urgent
  status text NOT NULL DEFAULT 'pending', -- pending | in_progress | completed
  is_company_task boolean NOT NULL DEFAULT false,
  recurrence jsonb,
  notes text,
  created_by uuid REFERENCES auth.users(id),
  completed_at timestamptz,
  completed_by uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ops_tasks TO authenticated;
GRANT ALL ON public.ops_tasks TO service_role;
ALTER TABLE public.ops_tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff read relevant tasks" ON public.ops_tasks FOR SELECT TO authenticated USING (
  public.has_role(auth.uid(), 'admin')
  OR is_company_task = true AND public.is_staff(auth.uid())
  OR assignee_user_id = auth.uid()
);
CREATE POLICY "Staff update own tasks" ON public.ops_tasks FOR UPDATE TO authenticated
  USING (assignee_user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'))
  WITH CHECK (assignee_user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins insert tasks" ON public.ops_tasks FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete tasks" ON public.ops_tasks FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- =========== ops_checklist_items ===========
CREATE TABLE public.ops_checklist_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cohort_id uuid NOT NULL REFERENCES public.ops_cohorts(id) ON DELETE CASCADE,
  label text NOT NULL,
  done boolean NOT NULL DEFAULT false,
  done_at timestamptz,
  done_by uuid REFERENCES auth.users(id),
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ops_checklist_items TO authenticated;
GRANT ALL ON public.ops_checklist_items TO service_role;
ALTER TABLE public.ops_checklist_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff read checklist" ON public.ops_checklist_items FOR SELECT TO authenticated USING (public.is_staff(auth.uid()) OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Staff update checklist" ON public.ops_checklist_items FOR UPDATE TO authenticated USING (public.is_staff(auth.uid()) OR public.has_role(auth.uid(), 'admin')) WITH CHECK (public.is_staff(auth.uid()) OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins insert checklist" ON public.ops_checklist_items FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete checklist" ON public.ops_checklist_items FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- =========== ops_activity_log ===========
CREATE TABLE public.ops_activity_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_user_id uuid REFERENCES auth.users(id),
  actor_kind text NOT NULL DEFAULT 'staff',
  action text NOT NULL,
  entity_type text,
  entity_id uuid,
  detail jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.ops_activity_log TO authenticated;
GRANT ALL ON public.ops_activity_log TO service_role;
ALTER TABLE public.ops_activity_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff read activity" ON public.ops_activity_log FOR SELECT TO authenticated USING (public.is_staff(auth.uid()) OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Staff insert activity" ON public.ops_activity_log FOR INSERT TO authenticated WITH CHECK (public.is_staff(auth.uid()) OR public.has_role(auth.uid(), 'admin'));

-- =========== ops_notifications ===========
CREATE TABLE public.ops_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  kind text NOT NULL DEFAULT 'info',
  title text NOT NULL,
  body text,
  link text,
  read_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ops_notifications TO authenticated;
GRANT ALL ON public.ops_notifications TO service_role;
ALTER TABLE public.ops_notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own notifications" ON public.ops_notifications FOR SELECT TO authenticated USING (user_id = auth.uid() OR user_id IS NULL AND public.is_staff(auth.uid()));
CREATE POLICY "Users update own notifications" ON public.ops_notifications FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "Admins insert notifications" ON public.ops_notifications FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete notifications" ON public.ops_notifications FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- updated_at triggers
CREATE TRIGGER ops_cohorts_updated BEFORE UPDATE ON public.ops_cohorts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER ops_cohort_students_updated BEFORE UPDATE ON public.ops_cohort_students FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER ops_emails_updated BEFORE UPDATE ON public.ops_emails FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER ops_events_updated BEFORE UPDATE ON public.ops_events FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER ops_tasks_updated BEFORE UPDATE ON public.ops_tasks FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Seed Cohort 3
INSERT INTO public.ops_cohorts (number, name, onboarding_date, status)
VALUES (3, 'Cohort 3', DATE '2026-07-31', 'active')
ON CONFLICT (number) DO NOTHING;
