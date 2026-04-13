import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export function useStudentCohort() {
  const { user } = useAuth();
  const [cohort, setCohort] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    const fetch = async () => {
      const { data } = await supabase
        .from("cohort2_enrollments")
        .select("cohort")
        .eq("user_id", user.id)
        .eq("payment_status", "paid")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      setCohort(data?.cohort ?? "Cohort 1");
      setLoading(false);
    };
    fetch();
  }, [user]);

  return { cohort, loading };
}
