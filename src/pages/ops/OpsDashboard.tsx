import { useEffect, useState } from "react";
import { useOutletContext, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CalendarClock, Mail, CheckSquare, Users, Activity } from "lucide-react";
import { format, isToday, isBefore, startOfDay } from "date-fns";

type Ctx = { user: any; isAdmin: boolean };

export default function OpsDashboard() {
  const { user } = useOutletContext<Ctx>();
  const [data, setData] = useState<any>({
    todayTasks: [], overdueTasks: [], events: [], cohorts: [], emails: [], activity: [],
  });

  useEffect(() => {
    (async () => {
      const today = startOfDay(new Date()).toISOString();
      const in14 = new Date(Date.now() + 14 * 24 * 3600 * 1000).toISOString();
      const [tasks, events, cohorts, emails, activity] = await Promise.all([
        supabase.from("ops_tasks").select("*").neq("status", "completed").order("due_date", { ascending: true }),
        supabase.from("ops_events").select("*").gte("starts_at", today).lte("starts_at", in14).order("starts_at"),
        supabase.from("ops_cohorts").select("*").order("number", { ascending: false }).limit(5),
        supabase.from("ops_emails").select("*").in("status", ["waiting_approval", "scheduled", "draft"]).order("scheduled_at", { ascending: true }).limit(10),
        supabase.from("ops_activity_log").select("*").order("created_at", { ascending: false }).limit(10),
      ]);

      const allTasks = tasks.data || [];
      const todayTasks = allTasks.filter(t => t.due_date && isToday(new Date(t.due_date)));
      const overdueTasks = allTasks.filter(t => t.due_date && isBefore(new Date(t.due_date), startOfDay(new Date())));

      setData({
        todayTasks, overdueTasks,
        events: events.data || [],
        cohorts: cohorts.data || [],
        emails: emails.data || [],
        activity: activity.data || [],
      });
    })();
  }, [user]);

  const pendingEmails = data.emails.filter((e: any) => e.status === "waiting_approval").length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold">Operations Dashboard</h1>
        <p className="text-sm text-muted-foreground">Today's snapshot of company operations. Nothing sends without your approval.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard icon={CheckSquare} label="Today's Tasks" value={data.todayTasks.length} tone="primary" />
        <StatCard icon={AlertTriangle} label="Overdue Tasks" value={data.overdueTasks.length} tone="destructive" />
        <StatCard icon={CalendarClock} label="Upcoming Events (14d)" value={data.events.length} tone="default" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><CheckSquare className="w-4 h-4"/> Today's Tasks</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {data.todayTasks.length === 0 && <p className="text-sm text-muted-foreground">Nothing due today.</p>}
            {data.todayTasks.map((t: any) => (
              <div key={t.id} className="flex items-center justify-between text-sm border-b border-border pb-2">
                <span>{t.title}</span>
                <Badge variant="outline">{t.priority}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-destructive"/> Overdue</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {data.overdueTasks.length === 0 && <p className="text-sm text-muted-foreground">No overdue tasks.</p>}
            {data.overdueTasks.map((t: any) => (
              <div key={t.id} className="flex items-center justify-between text-sm border-b border-border pb-2">
                <span>{t.title}</span>
                <span className="text-xs text-destructive">{format(new Date(t.due_date), "MMM d")}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><Mail className="w-4 h-4"/> Emails Pending Approval</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {data.emails.length === 0 && <p className="text-sm text-muted-foreground">No emails prepared.</p>}
            {data.emails.map((e: any) => (
              <Link key={e.id} to="/staff/ops/emails" className="flex items-center justify-between text-sm border-b border-border pb-2 hover:bg-secondary/40 rounded px-2">
                <span className="truncate">{e.subject || "(no subject)"}</span>
                <Badge variant={e.status === "waiting_approval" ? "default" : "outline"}>{e.status.replace("_"," ")}</Badge>
              </Link>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><CalendarClock className="w-4 h-4"/> Upcoming Events</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {data.events.length === 0 && <p className="text-sm text-muted-foreground">No upcoming events.</p>}
            {data.events.map((e: any) => (
              <div key={e.id} className="flex items-center justify-between text-sm border-b border-border pb-2">
                <span>{e.title}</span>
                <span className="text-xs text-muted-foreground">{format(new Date(e.starts_at), "MMM d, HH:mm")}</span>
              </div>
            ))}
          </CardContent>
        </Card>

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
