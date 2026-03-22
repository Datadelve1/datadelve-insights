import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface SqlDatasetRow {
  id: string;
  name: string;
  description: string;
  schema_sql: string;
  seed_sql: string;
  sample_queries: { label: string; query: string }[];
}

export function useDatasets() {
  const [datasets, setDatasets] = useState<SqlDatasetRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from("sql_datasets")
        .select("*")
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
  }, []);

  return { datasets, loading };
}
