ALTER TABLE public.ops_tasks
  ADD COLUMN IF NOT EXISTS task_type text,
  ADD COLUMN IF NOT EXISTS source text;

-- Also: relax "Staff read relevant tasks" to allow staff to see unassigned cohort tasks
DROP POLICY IF EXISTS "Staff read relevant tasks" ON public.ops_tasks;
CREATE POLICY "Staff read relevant tasks"
  ON public.ops_tasks FOR SELECT
  TO authenticated
  USING (
    has_role(auth.uid(), 'admin'::app_role)
    OR is_staff(auth.uid())
  );
