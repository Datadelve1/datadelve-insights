import { useEffect, useMemo, useState } from "react";
import { useOutletContext, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CalendarClock, CheckSquare, Users, Activity } from "lucide-react";
import { format, isToday, isBefore, startOfDay, addDays, isAfter, isSameDay } from "date-fns";

type Ctx = { user: any; isAdmin: boolean };

const TYPE_META: Record<string, { label: string; cls: string }> = {
  dashboard:      { label: "🛠 Dashboard",      cls: "bg-slate-500 text-white" },
  email:          { label: "📧 Email",          cls: "bg-blue-500 text-white" },
  class_link:     { label: "🔗 Class Link",     cls: "bg-emerald-500 text-white" },
  pre_onboarding: { label: "🎓 Pre-Onboarding", cls: "bg-purple-500 text-white" },
  break:          { label: "⏸ Break",           cls: "bg-amber-500 text-black" },
};

export default function OpsDashboard() {
  const { user } = useOutletContext<Ctx>();
  const [data, setData] = useState<any>({
    tasks: [], cohorts: [], activity: [], staff: [],
  });

  useEffect(() => {
    (async () => {
      const [tasks, cohorts, activity, staff] = await Promise.all([
        supabase.from("ops_tasks").select("*").neq("status", "completed").order("due_date", { ascending: true }),
        supabase.from("ops_cohorts").select("*").order("number", { ascending: false }).limit(6),
        supabase.from("ops_activity_log").select("*").order("created_at", { ascending: false }).limit(10),
        supabase.from("staff_profiles").select("user_id, full_name, email"),
      ]);

      setData({
        tasks: tasks.data || [],
        cohorts: cohorts.data || [],
        activity: activity.data || [],
        staff: staff.data || [],
      });
    })();
  }, [user]);

  const staffMap = useMemo(() => Object.fromEntries((data.staff||[]).map((s:any)=>[s.user_id, s.full_name || s.email])), [data.staff]);

  const today = startOfDay(new Date());
  const in14 = addDays(today, 14);
  const todayTasks = data.tasks.filter((t: any) => t.due_date && isSameDay(new Date(t.due_date), today));
  const overdueTasks = data.tasks.filter((t: any) => t.due_date && isBefore(new Date(t.due_date), today));
  const upcomingTasks = data.tasks.filter((t: any) => t.due_date && isAfter(new Date(t.due_date), today) && !isAfter(new Date(t.due_date), in14));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold">Operations Dashboard</h1>
        <p className="text-sm text-muted-foreground">Today's snapshot across all cohorts. Assign staff, tick off tasks, and stay ahead.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard icon={CheckSquare} label="Today's Tasks" value={todayTasks.length} tone="primary" />
        <StatCard icon={AlertTriangle} label="Overdue Tasks" value={overdueTasks.length} tone="destructive" />
        <StatCard icon={CalendarClock} label="Upcoming (14 days)" value={upcomingTasks.length} tone="default" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <TaskList title="Today's Tasks" icon={CheckSquare} tasks={todayTasks} staffMap={staffMap} empty="Nothing due today." />
        <TaskList title="Overdue" icon={AlertTriangle} iconCls="text-destructive" tasks={overdueTasks} staffMap={staffMap} empty="No overdue tasks." showDate />
        <TaskList title="Upcoming (next 14 days)" icon={CalendarClock} tasks={upcomingTasks} staffMap={staffMap} empty="Nothing coming up." showDate />

        <Card>
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><Users className="w-4 h-4"/> Cohorts</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {data.cohorts.map((c: any) => (
              <Link key={c.id} to={`/staff/ops/cohorts/${c.id}`} className="flex items-center justify-between text-sm border-b border-border pb-2 hover:bg-secondary/40 rounded px-2">
                <span>Cohort {c.number}{c.name && c.name !== `Cohort ${c.number}` ? ` — ${c.name}` : ""}</span>
                <span className="text-xs text-muted-foreground">{c.onboarding_date ? format(new Date(c.onboarding_date), "MMM d, yyyy") : "TBD"}</span>
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
    </div>
  );
}

function TaskList({ title, icon: Icon, iconCls, tasks, staffMap, empty, showDate }: any) {
  return (
    <Card>
      <CardHeader><CardTitle className="text-base flex items-center gap-2"><Icon className={`w-4 h-4 ${iconCls || ""}`}/> {title}</CardTitle></CardHeader>
      <CardContent className="space-y-2 max-h-80 overflow-auto">
        {tasks.length === 0 && <p className="text-sm text-muted-foreground">{empty}</p>}
        {tasks.map((t: any) => {
          const meta = t.task_type ? TYPE_META[t.task_type] : null;
          return (
            <Link key={t.id} to="/staff/ops/tasks" className="flex items-start justify-between gap-2 text-sm border-b border-border pb-2 hover:bg-secondary/40 rounded px-1">
              <div className="flex-1">
                <div className="text-sm">{t.title}</div>
                <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                  {meta && <Badge className={`${meta.cls} text-[10px] px-1.5 py-0`}>{meta.label}</Badge>}
                  <span className="text-[11px] text-muted-foreground">
                    {t.assignee_user_id ? staffMap[t.assignee_user_id] || "—" : "Unassigned"}
                  </span>
                </div>
              </div>
              {showDate && t.due_date && <span className="text-xs text-muted-foreground whitespace-nowrap">{format(new Date(t.due_date), "MMM d")}</span>}
              {!showDate && <Badge variant="outline" className="text-[10px]">{t.priority}</Badge>}
            </Link>
          );
        })}
      </CardContent>
    </Card>
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
