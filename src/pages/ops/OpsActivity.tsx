import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

export default function OpsActivity() {
  const [rows, setRows] = useState<any[]>([]);
  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("ops_activity_log").select("*").order("created_at", { ascending: false }).limit(200);
      setRows(data || []);
    })();
  }, []);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-display font-bold">Activity Log</h1>
        <p className="text-sm text-muted-foreground">Every action recorded in the Operations Centre.</p>
      </div>
      <Card>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead className="bg-secondary/40 text-xs text-muted-foreground">
              <tr><th className="text-left p-3">Time</th><th className="text-left p-3">Actor</th><th className="text-left p-3">Action</th><th className="text-left p-3">Entity</th><th className="text-left p-3">Detail</th></tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.length === 0 && <tr><td colSpan={5} className="p-6 text-center text-muted-foreground">No activity yet.</td></tr>}
              {rows.map(r => (
                <tr key={r.id}>
                  <td className="p-3 text-xs">{format(new Date(r.created_at), "MMM d, HH:mm:ss")}</td>
                  <td className="p-3 text-xs"><Badge variant="outline">{r.actor_kind}</Badge></td>
                  <td className="p-3 font-medium">{r.action}</td>
                  <td className="p-3 text-xs">{r.entity_type}</td>
                  <td className="p-3 text-xs text-muted-foreground">{r.detail ? JSON.stringify(r.detail) : ""}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
