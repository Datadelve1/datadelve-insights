import { useCallback, useEffect, useMemo, useState } from "react";
import { useOutletContext, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, CalendarClock, CheckSquare, Users, Activity, Send, Check, ListChecks, Loader2 } from "lucide-react";
import { format, isBefore, startOfDay, addDays, isAfter, isSameDay } from "date-fns";
import { toast } from "sonner";
import TaskEmailDialog from "@/components/ops/TaskEmailDialog";
import { isSendableTask } from "@/lib/opsTaskEmails";
import { completeOpsTask } from "@/lib/opsTaskComplete";

type Ctx = { user: any; isAdmin: boolean };

const TYPE_META: Record<string, { label: string; cls: string }> = {
  dashboard:      { label: "🛠 Dashboard",      cls: "bg-slate-500 text-white" },
  email:          { label: "📧 Email",          cls: "bg-blue-500 text-white" },
  class_link:     { label: "🔗 Class Link",     cls: "bg-emerald-500 text-white" },
  pre_onboarding: { label: "🎓 Pre-Onboarding", cls: "bg-purple-500 text-white" },
  break:          { label: "⏸ Break",           cls: "bg-amber-500 text-black" },
};

const day = (s: string) => new Date(s + "T00:00:00");

export default function OpsDashboard() {
  const { user, isAdmin } = useOutletContext<Ctx>();
  const [data, setData] = useState<any>({ tasks: [], cohorts: [], activity: [], staff: [] });
  const [emailTask, setEmailTask] = useState<any>(null);
  const [marking, setMarking] = useState<string | null>(null);

  const load = useCallback(async () => {
    const [tasks, cohorts, activity, staff] = await Promise.all([
      supabase.from("ops_tasks").select("*").order("due_date", { ascending: true }),
      supabase.from("ops_cohorts").select("*").order("number", { ascending: false }),
      supabase.from("ops_activity_log").select("*").order("created_at", { ascending: false }).limit(10),
      supabase.from("staff_profiles").select("user_id, full_name, email"),
    ]);
    setData({ tasks: tasks.data || [], cohorts: cohorts.data || [], activity: activity.data || [], staff: staff.data || [] });
  }, []);
  useEffect(() => { if (user) load(); }, [user, load]);

  const staffMap = useMemo(() => Object.fromEntries((data.staff || []).map((s: any) => [s.user_id, s.full_name || s.email])), [data.staff]);
  const cohortNum = useMemo(() => Object.fromEntries((data.cohorts || []).map((c: any) => [c.id, c.number])), [data.cohorts]);
  const actorName = staffMap[user?.id] || user?.email || "Staff";

  const today = startOfDay(new Date());
  const in14 = addDays(today, 14);
  const ago14 = addDays(today, -14);
  const open = data.tasks.filter((t: any) => t.status !== "completed");
  const todayTasks = open.filter((t: any) => t.due_date && isSameDay(day(t.due_date), today));
  const overdueTasks = open.filter((t: any) => t.due_date && isBefore(day(t.due_date), today));
  const upcomingTasks = open.filter((t: any) => t.due_date && isAfter(day(t.due_date), today) && !isAfter(day(t.due_date), in14));

  const myTasks = open.filter((t: any) => t.assignee_user_id === user?.id && t.due_date && !isAfter(day(t.due_date), in14));
  const statusTasks = data.tasks.filter((t: any) => t.due_date && !isBefore(day(t.due_date), ago14) && !isAfter(day(t.due_date), in14));

  const markDone = async (t: any) => {
    setMarking(t.id);
    const res = await completeOpsTask(t, { id: user.id, name: actorName, isAdmin });
    setMarking(null);
    if (!res.ok) return toast.error(res.error || "Could not mark done");
    toast.success("Task marked done");
    load();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold">Operations Dashboard</h1>
        <p className="text-sm text-muted-foreground">Today's snapshot across all cohorts.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard icon={CheckSquare} label="Today's Tasks" value={todayTasks.length} tone="primary" />
        <StatCard icon={AlertTriangle} label="Overdue Tasks" value={overdueTasks.length} tone="destructive" />
        <StatCard icon={CalendarClock} label="Upcoming (14 days)" value={upcomingTasks.length} tone="default" />
      </div>

      {myTasks.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2"><CheckSquare className="w-4 h-4 text-primary" /> My tasks</CardTitle>
            <p className="text-xs text-muted-foreground">Overdue, today and the next 14 days. Email tasks are done once you send the email.</p>
          </CardHeader>
          <CardContent className="space-y-2 max-h-[28rem] overflow-auto">
            {myTasks.map((t: any) => {
              const meta = t.task_type ? TYPE_META[t.task_type] : null;
              const late = isBefore(day(t.due_date), today);
              return (
                <div key={t.id} className="flex items-center gap-3 border-b border-border pb-2 flex-wrap">
                  <div className="flex-1 min-w-[220px]">
                    <div className="text-sm font-medium">{t.title}</div>
                    {t.description && <div className="text-xs text-muted-foreground mt-0.5">{t.description}</div>}
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      {meta && <Badge className={`${meta.cls} text-[10px] px-1.5 py-0`}>{meta.label}</Badge>}
                      <span className={`text-[11px] ${late ? "text-destructive font-medium" : "text-muted-foreground"}`}>
                        {late ? "Overdue · " : ""}{format(day(t.due_date), "EEE MMM d")}
                      </span>
                    </div>
                  </div>
                  {isSendableTask(t) ? (
                    <Button size="sm" onClick={() => setEmailTask(t)}><Send className="w-4 h-4 mr-1" /> Send email</Button>
                  ) : (
                    <Button size="sm" variant="outline" onClick={() => markDone(t)} disabled={marking === t.id}>
                      {marking === t.id ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Check className="w-4 h-4 mr-1" />} Mark done
                    </Button>
                  )}
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2"><ListChecks className="w-4 h-4" /> Task status</CardTitle>
          <p className="text-xs text-muted-foreground">Last 14 days and next 14 days.</p>
        </CardHeader>
        <CardContent className="space-y-2 max-h-[28rem] overflow-auto">
          {statusTasks.length === 0 && <p className="text-sm text-muted-foreground">No tasks in this window.</p>}
          {statusTasks.map((t: any) => {
            const done = t.status === "completed";
            return (
              <div key={t.id} className="flex items-center gap-3 text-sm border-b border-border pb-2 flex-wrap">
                <div className="flex-1 min-w-[220px]">
                  <div className={done ? "text-muted-foreground" : ""}>{t.title}</div>
                  <div className="text-[11px] text-muted-foreground mt-0.5">
                    {t.assignee_user_id ? staffMap[t.assignee_user_id] || "—" : "Unassigned"} · {format(day(t.due_date), "MMM d")}
                    {done && t.completed_at ? ` · done ${format(new Date(t.completed_at), "MMM d, h:mm a")}` : ""}
                  </div>
                </div>
                <Badge variant={done ? "default" : "outline"} className="text-[10px]">{done ? "Done" : "Pending"}</Badge>
              </div>
            );
          })}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><Users className="w-4 h-4"/> Cohorts</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {data.cohorts.slice(0, 6).map((c: any) => (
              <Link key={c.id} to={`/staff/ops/cohorts/${c.id}`} className="flex items-center justify-between text-sm border-b border-border pb-2 hover:bg-secondary/40 rounded px-2">
                <span>Cohort {c.number}{c.name && c.name !== `Cohort ${c.number}` ? ` — ${c.name}` : ""}</span>
                <span className="text-xs text-muted-foreground">{c.onboarding_date ? format(day(c.onboarding_date), "MMM d, yyyy") : "TBD"}</span>
              </Link>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><Activity className="w-4 h-4"/> Recent Activity</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {data.activity.length === 0 && <p className="text-sm text-muted-foreground">No activity yet.</p>}
            {data.activity.map((a: any) => (
              <div key={a.id} className="text-xs text-muted-foreground border-b border-border pb-2">
                <span className="text-foreground font-medium">{a.action}</span> · {a.entity_type} · {format(new Date(a.created_at), "MMM d HH:mm")}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <TaskEmailDialog
        task={emailTask}
        cohortNumber={emailTask?.cohort_id ? cohortNum[emailTask.cohort_id] ?? null : null}
        open={!!emailTask}
        onOpenChange={(o) => !o && setEmailTask(null)}
        user={user}
        actorName={actorName}
        isAdmin={isAdmin}
        onDone={load}
      />
    </div>
  );
}

function StatCard({ icon: Icon, label, value, tone }: any) {
  const toneCls = tone === "destructive" ? "text-destructive" : tone === "primary" ? "text-primary" : "text-foreground";
  return (
    <Card>
      <CardContent className="p-4 flex items-center gap-3">
        <Icon className={`w-6 h-6 ${toneCls}`} />
        <div>
          <div className={`text-2xl font-bold ${toneCls}`}>{value}</div>
          <div className="text-xs text-muted-foreground">{label}</div>
        </div>
      </CardContent>
    </Card>
  );
}
