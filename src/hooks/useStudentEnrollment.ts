import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export type StudentEnrollment = {
  track: string | null;
  cohort: string | null;
} | null;

export function useStudentEnrollment() {
  const { user } = useAuth();
  const [enrollment, setEnrollment] = useState<StudentEnrollment>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      if (!user) {
        setEnrollment(null);
        setIsLoading(false);
        return;
      }
      const { data } = await supabase
        .from("cohort2_enrollments")
        .select("track, cohort")
        .eq("user_id", user.id)
        .maybeSingle();
      if (cancelled) return;
      setEnrollment(data ? { track: data.track, cohort: data.cohort } : null);
      setIsLoading(false);
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [user]);

  return { enrollment, isLoading };
}

export function canAccessProject(
  access: { tracks?: string[]; cohorts?: string[] } | undefined,
  enrollment: StudentEnrollment,
): boolean {
  if (!access) return true;
  if (!enrollment) return false;
  if (access.tracks && (!enrollment.track || !access.tracks.includes(enrollment.track))) return false;
  if (access.cohorts && (!enrollment.cohort || !access.cohorts.includes(enrollment.cohort))) return false;
  return true;
}
