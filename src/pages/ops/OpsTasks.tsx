import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

type Ctx = { user: any; isAdmin: boolean };

const PRIORITIES = ["low", "normal", "high", "urgent"];
const STATUSES = ["pending", "in_progress", "completed"];

export default function OpsTasks() {
  const { isAdmin, user } = useOutletContext<Ctx>();
  const [tab, setTab] = useState<"mine" | "company">("mine");
  const [tasks, setTasks] = useState<any[]>([]);
  const [staff, setStaff] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<any>({ title: "", description: "", assignee_user_id: "", due_date: "", priority: "normal", is_company_task: false });

  const load = async () => {
    let q = supabase.from("ops_tasks").select("*").order("due_date", { ascending: true, nullsFirst: false });
    if (tab === "mine") q = q.eq("assignee_user_id", user.id);
    else q = q.eq("is_company_task", true);
    const { data } = await q;
    setTasks(data || []);
  };

  const loadStaff = async () => {
    const { data } = await supabase.from("staff_profiles").select("user_id, full_name, email");
    setStaff(data || []);
  };

  useEffect(() => { if (user) load(); }, [tab, user]);
  useEffect(() => { loadStaff(); }, []);

  const create = async () => {
    if (!form.title) return toast.error("Title required");
    const { error, data } = await supabase.from("ops_tasks").insert({
      title: form.title,
      description: form.description || null,
      assignee_user_id: form.is_company_task ? null : (form.assignee_user_id || user.id),
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
    setOpen(false); setForm({ title: "", description: "", assignee_user_id: "", due_date: "", priority: "normal", is_company_task: false });
    load();
  };

  const updateStatus = async (t: any, status: string) => {
    await supabase.from("ops_tasks").update({
      status,
      completed_at: status === "completed" ? new Date().toISOString() : null,
      completed_by: status === "completed" ? user.id : null,
    }).eq("id", t.id);
    if (status === "completed") {
      await supabase.from("ops_activity_log").insert({
        actor_user_id: user.id, actor_kind: isAdmin ? "admin" : "staff",
        action: "task_completed", entity_type: "ops_tasks", entity_id: t.id, detail: { title: t.title },
      });
    }
    load();
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
          <h1 className="text-2xl font-display font-bold">Tasks</h1>
          <p className="text-sm text-muted-foreground">Your assignments and the company operations board.</p>
        </div>
        {(isAdmin || tab === "mine") && <Button onClick={() => setOpen(true)}><Plus className="w-4 h-4 mr-1"/>New task</Button>}
      </div>

      <div className="flex gap-2">
        <Button variant={tab === "mine" ? "default" : "outline"} size="sm" onClick={() => setTab("mine")}>My Tasks</Button>
        <Button variant={tab === "company" ? "default" : "outline"} size="sm" onClick={() => setTab("company")}>Company Board</Button>
      </div>

      <Card>
        <CardContent className="p-0">
          {tasks.length === 0 && <div className="p-8 text-center text-muted-foreground text-sm">No tasks.</div>}
          <div className="divide-y divide-border">
            {tasks.map(t => (
              <div key={t.id} className="p-3 flex items-center gap-3">
                <Checkbox checked={t.status === "completed"} onCheckedChange={() => updateStatus(t, t.status === "completed" ? "pending" : "completed")} />
                <div className="flex-1">
                  <div className={`text-sm font-medium ${t.status === "completed" ? "line-through text-muted-foreground" : ""}`}>{t.title}</div>
                  {t.description && <div className="text-xs text-muted-foreground">{t.description}</div>}
                </div>
                {t.due_date && <span className="text-xs text-muted-foreground">{format(new Date(t.due_date), "MMM d")}</span>}
                <Badge variant={t.priority === "urgent" ? "destructive" : "outline"}>{t.priority}</Badge>
                <Select value={t.status} onValueChange={v => updateStatus(t, v)}>
                  <SelectTrigger className="w-32 h-8 text-xs"><SelectValue/></SelectTrigger>
                  <SelectContent>{STATUSES.map(s => <SelectItem key={s} value={s}>{s.replace("_"," ")}</SelectItem>)}</SelectContent>
                </Select>
                {(isAdmin || t.assignee_user_id === user.id) && <Button variant="ghost" size="icon" onClick={() => remove(t)}><Trash2 className="w-4 h-4"/></Button>}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>New task</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Title</Label><Input value={form.title} onChange={e => setForm({...form, title: e.target.value})} /></div>
            <div><Label>Description</Label><Textarea rows={3} value={form.description} onChange={e => setForm({...form, description: e.target.value})} /></div>
            {isAdmin && (
              <div className="flex items-center gap-2">
                <Checkbox checked={form.is_company_task} onCheckedChange={(v) => setForm({...form, is_company_task: !!v})} />
                <Label>Company task (visible to all staff)</Label>
              </div>
            )}
            {isAdmin && !form.is_company_task && (
              <div>
                <Label>Assignee</Label>
                <Select value={form.assignee_user_id} onValueChange={v => setForm({...form, assignee_user_id: v})}>
                  <SelectTrigger><SelectValue placeholder="Select staff"/></SelectTrigger>
                  <SelectContent>
                    {staff.map(s => <SelectItem key={s.user_id} value={s.user_id}>{s.full_name || s.email}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div><Label>Due date</Label><Input type="date" value={form.due_date} onChange={e => setForm({...form, due_date: e.target.value})} /></div>
            <div>
              <Label>Priority</Label>
              <Select value={form.priority} onValueChange={v => setForm({...form, priority: v})}>
                <SelectTrigger><SelectValue/></SelectTrigger>
                <SelectContent>{PRIORITIES.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
              </Select>
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
