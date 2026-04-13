import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export interface SqlDatasetRow {
  id: string;
  name: string;
  description: string;
  schema_sql: string;
  seed_sql: string;
  sample_queries: { label: string; query: string }[];
}

export function useDatasets() {
  const { user } = useAuth();
  const [datasets, setDatasets] = useState<SqlDatasetRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      // Determine student's cohort
      let studentCohort = "Cohort 1";
      if (user) {
        const { data: enrollment } = await supabase
          .from("cohort2_enrollments")
          .select("cohort")
          .eq("user_id", user.id)
          .eq("payment_status", "paid")
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();
        studentCohort = enrollment?.cohort ?? "Cohort 1";
      }

      const { data } = await supabase
        .from("sql_datasets")
        .select("*")
        .eq("cohort", studentCohort)
        .order("created_at");
      setDatasets(
        (data || []).map((d: any) => ({
          id: d.id,
          name: d.name,
          description: d.description || "",
          schema_sql: d.schema_sql,
          seed_sql: d.seed_sql,
          sample_queries:
            typeof d.sample_queries === "string"
              ? JSON.parse(d.sample_queries)
              : d.sample_queries || [],
        }))
      );
      setLoading(false);
    };
    fetch();
  }, [user]);

  return { datasets, loading };
}
