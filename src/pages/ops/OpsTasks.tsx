import { useEffect, useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Plus, Trash2, Mail, Link2, Wrench, GraduationCap, Coffee } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

type Ctx = { user: any; isAdmin: boolean };

const PRIORITIES = ["low", "normal", "high", "urgent"];
const STATUSES = ["pending", "in_progress", "completed"];

const TYPE_META: Record<string, { label: string; icon: any; cls: string }> = {
  dashboard:      { label: "🛠 Dashboard",       icon: Wrench,         cls: "bg-slate-500 text-white" },
  email:          { label: "📧 Email",           icon: Mail,           cls: "bg-blue-500 text-white" },
  class_link:     { label: "🔗 Class Link",      icon: Link2,          cls: "bg-emerald-500 text-white" },
  pre_onboarding: { label: "🎓 Pre-Onboarding",  icon: GraduationCap,  cls: "bg-purple-500 text-white" },
  break:          { label: "⏸ Break",            icon: Coffee,         cls: "bg-amber-500 text-black" },
};

export default function OpsTasks() {
  const { isAdmin, user } = useOutletContext<Ctx>();
  const [tab, setTab] = useState<"all" | "mine" | "unassigned">("all");
  const [tasks, setTasks] = useState<any[]>([]);
  const [staff, setStaff] = useState<any[]>([]);
  const [cohorts, setCohorts] = useState<any[]>([]);
  const [cohortFilter, setCohortFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("open");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<any>({ title: "", description: "", assignee_user_id: "", cohort_id: "", task_type: "", due_date: "", priority: "normal", is_company_task: true });

  const load = async () => {
    const { data } = await supabase.from("ops_tasks").select("*").order("due_date", { ascending: true, nullsFirst: false });
    setTasks(data || []);
  };
  const loadStaff = async () => {
    const { data } = await supabase.from("staff_profiles").select("user_id, full_name, email");
    setStaff(data || []);
  };
  const loadCohorts = async () => {
    const { data } = await supabase.from("ops_cohorts").select("id, number, name").order("number");
    setCohorts(data || []);
  };
  useEffect(() => { if (user) load(); }, [user]);
  useEffect(() => { loadStaff(); loadCohorts(); }, []);

  const staffMap = useMemo(() => Object.fromEntries(staff.map(s => [s.user_id, s.full_name || s.email])), [staff]);
  const cohortMap = useMemo(() => Object.fromEntries(cohorts.map(c => [c.id, `Cohort ${c.number}`])), [cohorts]);

  const filtered = useMemo(() => {
    return tasks.filter(t => {
      if (tab === "mine" && t.assignee_user_id !== user?.id) return false;
      if (tab === "unassigned" && t.assignee_user_id) return false;
      if (cohortFilter !== "all" && t.cohort_id !== cohortFilter) return false;
      if (typeFilter !== "all" && t.task_type !== typeFilter) return false;
      if (statusFilter === "open" && t.status === "completed") return false;
      if (statusFilter === "done" && t.status !== "completed") return false;
      return true;
    });
  }, [tasks, tab, cohortFilter, typeFilter, statusFilter, user]);

  const create = async () => {
    if (!form.title) return toast.error("Title required");
    const { error, data } = await supabase.from("ops_tasks").insert({
      title: form.title,
      description: form.description || null,
      assignee_user_id: form.assignee_user_id || null,
      cohort_id: form.cohort_id || null,
      task_type: form.task_type || null,
      due_date: form.due_date || null,
      priority: form.priority,
      is_company_task: form.is_company_task,
      created_by: user.id,
    }).select().single();
    if (error) return toast.error(error.message);
    await supabase.from("ops_activity_log").insert({
      actor_user_id: user.id, actor_kind: isAdmin ? "admin" : "staff",
      action: "task_created", entity_type: "ops_tasks", entity_id: data.id, detail: { title: form.title },
    });
    toast.success("Task created");
    setOpen(false); setForm({ title: "", description: "", assignee_user_id: "", cohort_id: "", task_type: "", due_date: "", priority: "normal", is_company_task: true });
    load();
  };

  const updateField = async (t: any, patch: any) => {
    const { error } = await supabase.from("ops_tasks").update(patch).eq("id", t.id);
    if (error) return toast.error(error.message);
    load();
  };

  const updateStatus = async (t: any, status: string) => {
    await updateField(t, {
      status,
      completed_at: status === "completed" ? new Date().toISOString() : null,
      completed_by: status === "completed" ? user.id : null,
    });
    if (status === "completed") {
      await supabase.from("ops_activity_log").insert({
        actor_user_id: user.id, actor_kind: isAdmin ? "admin" : "staff",
        action: "task_completed", entity_type: "ops_tasks", entity_id: t.id, detail: { title: t.title },
      });
    }
  };

  const remove = async (t: any) => {
    if (!confirm("Delete this task?")) return;
    await supabase.from("ops_tasks").delete().eq("id", t.id);
    load();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold">Training Ops Tasks</h1>
          <p className="text-sm text-muted-foreground">
            Every scheduled email, class link, dashboard setup & pre-onboarding milestone across cohorts 3–10.
          </p>
        </div>
        <Button onClick={() => setOpen(true)}><Plus className="w-4 h-4 mr-1"/>New task</Button>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button variant={tab === "all" ? "default" : "outline"} size="sm" onClick={() => setTab("all")}>All ({tasks.length})</Button>
        <Button variant={tab === "mine" ? "default" : "outline"} size="sm" onClick={() => setTab("mine")}>Assigned to me</Button>
        <Button variant={tab === "unassigned" ? "default" : "outline"} size="sm" onClick={() => setTab("unassigned")}>Unassigned</Button>

        <div className="ml-auto flex flex-wrap gap-2">
          <Select value={cohortFilter} onValueChange={setCohortFilter}>
            <SelectTrigger className="w-40 h-9"><SelectValue/></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All cohorts</SelectItem>
              {cohorts.map(c => <SelectItem key={c.id} value={c.id}>Cohort {c.number}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-40 h-9"><SelectValue/></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All types</SelectItem>
              {Object.entries(TYPE_META).map(([k,m]) => <SelectItem key={k} value={k}>{m.label}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-32 h-9"><SelectValue/></SelectTrigger>
            <SelectContent>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="done">Completed</SelectItem>
              <SelectItem value="all">All statuses</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          {filtered.length === 0 && <div className="p-8 text-center text-muted-foreground text-sm">No tasks match these filters.</div>}
          <div className="divide-y divide-border">
            {filtered.map(t => {
              const meta = t.task_type ? TYPE_META[t.task_type] : null;
              return (
                <div key={t.id} className="p-3 flex items-center gap-3 flex-wrap">
                  <Checkbox checked={t.status === "completed"} onCheckedChange={() => updateStatus(t, t.status === "completed" ? "pending" : "completed")} />
                  <div className="flex-1 min-w-[240px]">
                    <div className={`text-sm font-medium ${t.status === "completed" ? "line-through text-muted-foreground" : ""}`}>{t.title}</div>
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                      {t.cohort_id && <span className="text-[11px] text-muted-foreground">{cohortMap[t.cohort_id]}</span>}
                      {meta && <Badge className={`${meta.cls} text-[10px] px-1.5 py-0`}>{meta.label}</Badge>}
                    </div>
                  </div>
                  {t.due_date && <span className="text-xs text-muted-foreground w-16">{format(new Date(t.due_date), "MMM d")}</span>}
                  <Badge variant={t.priority === "urgent" ? "destructive" : "outline"} className="text-[10px]">{t.priority}</Badge>

                  <Select value={t.assignee_user_id || "__none"} onValueChange={v => updateField(t, { assignee_user_id: v === "__none" ? null : v })}>
                    <SelectTrigger className="w-40 h-8 text-xs"><SelectValue placeholder="Unassigned"/></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none">Unassigned</SelectItem>
                      {staff.map(s => <SelectItem key={s.user_id} value={s.user_id}>{s.full_name || s.email}</SelectItem>)}
                    </SelectContent>
                  </Select>

                  <Select value={t.status} onValueChange={v => updateStatus(t, v)}>
                    <SelectTrigger className="w-32 h-8 text-xs"><SelectValue/></SelectTrigger>
                    <SelectContent>{STATUSES.map(s => <SelectItem key={s} value={s}>{s.replace("_"," ")}</SelectItem>)}</SelectContent>
                  </Select>

                  {(isAdmin || t.created_by === user.id) && (
                    <Button variant="ghost" size="icon" onClick={() => remove(t)}><Trash2 className="w-4 h-4"/></Button>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>New task</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Title</Label><Input value={form.title} onChange={e => setForm({...form, title: e.target.value})} /></div>
            <div><Label>Description</Label><Textarea rows={3} value={form.description} onChange={e => setForm({...form, description: e.target.value})} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Cohort</Label>
                <Select value={form.cohort_id} onValueChange={v => setForm({...form, cohort_id: v})}>
                  <SelectTrigger><SelectValue placeholder="None"/></SelectTrigger>
                  <SelectContent>
                    {cohorts.map(c => <SelectItem key={c.id} value={c.id}>Cohort {c.number}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Type</Label>
                <Select value={form.task_type} onValueChange={v => setForm({...form, task_type: v})}>
                  <SelectTrigger><SelectValue placeholder="None"/></SelectTrigger>
                  <SelectContent>
                    {Object.entries(TYPE_META).map(([k,m]) => <SelectItem key={k} value={k}>{m.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Assignee</Label>
              <Select value={form.assignee_user_id} onValueChange={v => setForm({...form, assignee_user_id: v})}>
                <SelectTrigger><SelectValue placeholder="Unassigned"/></SelectTrigger>
                <SelectContent>
                  {staff.map(s => <SelectItem key={s.user_id} value={s.user_id}>{s.full_name || s.email}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Due date</Label><Input type="date" value={form.due_date} onChange={e => setForm({...form, due_date: e.target.value})} /></div>
              <div>
                <Label>Priority</Label>
                <Select value={form.priority} onValueChange={v => setForm({...form, priority: v})}>
                  <SelectTrigger><SelectValue/></SelectTrigger>
                  <SelectContent>{PRIORITIES.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
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
