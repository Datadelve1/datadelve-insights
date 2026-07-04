import { useEffect, useState } from "react";
import { Link, useOutletContext } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Plus, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

type Ctx = { user: any; isAdmin: boolean };

export default function OpsCohorts() {
  const { isAdmin, user } = useOutletContext<Ctx>();
  const [cohorts, setCohorts] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ number: "", name: "", onboarding_date: "", graduation_date: "" });

  const load = async () => {
    const { data } = await supabase.from("ops_cohorts").select("*").order("number", { ascending: false });
    setCohorts(data || []);
  };
  useEffect(() => { load(); }, []);

  const create = async () => {
    const num = parseInt(form.number, 10);
    if (!num) return toast.error("Cohort number required");
    const { error, data } = await supabase.from("ops_cohorts").insert({
      number: num,
      name: form.name || `Cohort ${num}`,
      onboarding_date: form.onboarding_date || null,
      graduation_date: form.graduation_date || null,
      created_by: user?.id,
    }).select().single();
    if (error) return toast.error(error.message);
    await supabase.from("ops_activity_log").insert({
      actor_user_id: user.id, actor_kind: "admin", action: "cohort_created", entity_type: "ops_cohorts", entity_id: data.id, detail: { number: num },
    });
    toast.success("Cohort created");
    setOpen(false); setForm({ number: "", name: "", onboarding_date: "", graduation_date: "" });
    load();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold">Cohorts</h1>
          <p className="text-sm text-muted-foreground">Manage cohort schedules, students and staff.</p>
        </div>
        {isAdmin && (
          <Button onClick={() => setOpen(true)}><Plus className="w-4 h-4 mr-2"/>New Cohort</Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {cohorts.map(c => (
          <Link key={c.id} to={`/staff/ops/cohorts/${c.id}`}>
            <Card className="hover:border-primary/60 transition-colors">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <div className="font-display font-bold text-lg">Cohort {c.number}</div>
                  <div className="text-xs text-muted-foreground">
                    Onboard: {c.onboarding_date ? format(new Date(c.onboarding_date), "MMM d, yyyy") : "TBD"}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Graduate: {c.graduation_date ? format(new Date(c.graduation_date), "MMM d, yyyy") : "TBD"}
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>New Cohort</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Cohort number</Label><Input type="number" value={form.number} onChange={e => setForm({ ...form, number: e.target.value })} /></div>
            <div><Label>Name (optional)</Label><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
            <div><Label>Onboarding date</Label><Input type="date" value={form.onboarding_date} onChange={e => setForm({ ...form, onboarding_date: e.target.value })} /></div>
            <div><Label>Graduation date</Label><Input type="date" value={form.graduation_date} onChange={e => setForm({ ...form, graduation_date: e.target.value })} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={create}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
