import { useCallback, useEffect, useMemo, useState } from "react";
import { useOutletContext, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  AlertTriangle, CalendarClock, CheckCircle2, Users, Activity, Send, Check, ListChecks, Loader2, Clock, ChevronRight,
} from "lucide-react";
import { format, isBefore, startOfDay, addDays, isAfter, isSameDay, isToday, isTomorrow, isYesterday } from "date-fns";
import { toast } from "sonner";
import TaskEmailDialog from "@/components/ops/TaskEmailDialog";
import { isSendableTask } from "@/lib/opsTaskEmails";
import { completeOpsTask } from "@/lib/opsTaskComplete";
import { sortOpsTasks } from "@/lib/opsTaskOrder";

type Ctx = { user: any; isAdmin: boolean; scope?: { cohorts: number[] } | null };
type StatusFilter = "all" | "pending" | "done" | "overdue";

const TYPE_LABEL: Record<string, string> = {
  dashboard: "Dashboard setup",
  email: "Email",
  class_link: "Class link",
  pre_onboarding: "Pre-onboarding",
  break: "Break",
};

const ACTION_LABEL: Record<string, string> = {
  task_completed: "Task completed",
  task_created: "Task created",
  email_sent: "Email sent",
  email_approved: "Email approved",
  email_created: "Email drafted",
  email_prepared: "Email prepared",
  email_test_sent: "Test email sent",
};

const day = (s: string) => new Date(s + "T00:00:00");

function dayHeading(d: Date) {
  const label = format(d, "EEEE, MMM d");
  if (isToday(d)) return `Today · ${label}`;
  if (isTomorrow(d)) return `Tomorrow · ${label}`;
  if (isYesterday(d)) return `Yesterday · ${label}`;
  return label;
}

function groupByDay<T extends { due_date: string }>(tasks: T[]) {
  const groups: { date: string; items: T[] }[] = [];
  for (const t of tasks) {
    const last = groups[groups.length - 1];
    if (last && last.date === t.due_date) last.items.push(t);
    else groups.push({ date: t.due_date, items: [t] });
  }
  return groups;
}

export default function OpsDashboard() {
  const { user, isAdmin, scope } = useOutletContext<Ctx>();
  const [data, setData] = useState<any>({ tasks: [], cohorts: [], activity: [], staff: [] });
  const [loading, setLoading] = useState(true);
  const [emailTask, setEmailTask] = useState<any>(null);
  const [marking, setMarking] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [cohortFilter, setCohortFilter] = useState<string>("all");

  const load = useCallback(async () => {
    const [tasks, cohorts, activity, staff] = await Promise.all([
      supabase.from("ops_tasks").select("*").order("due_date", { ascending: true }),
      supabase.from("ops_cohorts").select("*").order("number", { ascending: false }),
      supabase.from("ops_activity_log").select("*").order("created_at", { ascending: false }).limit(8),
      supabase.from("staff_profiles").select("user_id, full_name, email"),
    ]);
    // Ops-only people see just their cohorts.
    let cs = cohorts.data || [];
    let ts = tasks.data || [];
    if (scope) {
      cs = cs.filter((c: any) => scope.cohorts.includes(c.number));
      const ids = new Set(cs.map((c: any) => c.id));
      ts = ts.filter((t: any) => t.cohort_id && ids.has(t.cohort_id));
    }
    setData({ tasks: sortOpsTasks(ts), cohorts: cs, activity: scope ? [] : activity.data || [], staff: staff.data || [] });
    setLoading(false);
  }, [scope?.cohorts.join(",")]);
  useEffect(() => { if (user) load(); }, [user, load]);

  const staffMap = useMemo(() => Object.fromEntries((data.staff || []).map((s: any) => [s.user_id, s.full_name || s.email])), [data.staff]);
  const cohortNum = useMemo(() => Object.fromEntries((data.cohorts || []).map((c: any) => [c.id, c.number])), [data.cohorts]);
  const actorName = staffMap[user?.id] || user?.email || "Staff";
  const firstName = String(staffMap[user?.id] || "").split(" ")[0];

  const today = startOfDay(new Date());
  const in14 = addDays(today, 14);
  const ago14 = addDays(today, -14);
  const isDone = (t: any) => t.status === "completed";
  const isLate = (t: any) => !isDone(t) && t.due_date && isBefore(day(t.due_date), today);

  const open = data.tasks.filter((t: any) => !isDone(t));
  const todayTasks = open.filter((t: any) => t.due_date && isSameDay(day(t.due_date), today));
  const overdueTasks = open.filter(isLate);
  const upcomingTasks = open.filter((t: any) => t.due_date && isAfter(day(t.due_date), today) && !isAfter(day(t.due_date), in14));

  const myTasks = open.filter((t: any) => t.assignee_user_id === user?.id && t.due_date && !isAfter(day(t.due_date), in14));
  const windowTasks = data.tasks.filter((t: any) =>
    t.due_date && !isAfter(day(t.due_date), in14) && !isBefore(day(t.due_date), ago14),
  );
  const doneInWindow = windowTasks.filter(isDone).length;
  // "Overdue" shows every late task, however old; the other filters stay in the 14-day window.
  const statusTasks = (statusFilter === "overdue" ? overdueTasks : windowTasks).filter((t: any) => {
    if (cohortFilter !== "all" && t.cohort_id !== cohortFilter) return false;
    if (statusFilter === "pending") return !isDone(t);
    if (statusFilter === "done") return isDone(t);
    return true;
  });

  // Running and upcoming cohorts first, soonest at the top.
  const currentCohorts = [...data.cohorts]
    .filter((c: any) => !c.graduation_date || !isBefore(day(c.graduation_date), today))
    .sort((a: any, b: any) => a.number - b.number)
    .slice(0, 6);

  const markDone = async (t: any) => {
    setMarking(t.id);
    const res = await completeOpsTask(t, { id: user.id, name: actorName, isAdmin });
    setMarking(null);
    if (!res.ok) return toast.error(res.error || "Could not mark done");
    toast.success("Task marked done");
    load();
  };

  const showStatus = (f: StatusFilter) => {
    setStatusFilter(f);
    document.getElementById("task-progress")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl md:text-3xl font-display font-bold">
          {firstName ? `Hi ${firstName}` : "Operations"}
        </h1>
        <p className="text-muted-foreground mt-1">
          {scope
            ? `Your tasks for Cohort ${scope.cohorts.join(", ")}. Send each email when it's due.`
            : "See what's done and what's still waiting, for every cohort."}
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatTile icon={AlertTriangle} label="Overdue" value={overdueTasks.length} tone="destructive" onClick={() => showStatus("overdue")} />
        <StatTile icon={Clock} label="Due today" value={todayTasks.length} tone="primary" onClick={() => showStatus("pending")} />
        <StatTile icon={CalendarClock} label="Next 14 days" value={upcomingTasks.length} onClick={() => showStatus("pending")} />
        <StatTile icon={CheckCircle2} label="Done (last 14 days)" value={doneInWindow} onClick={() => showStatus("done")} />
      </div>

      {myTasks.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-display flex items-center gap-2">
              <ListChecks className="w-5 h-5 text-primary" /> Your to-do list
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Work from the top down. Email tasks tick off on their own once you send the email.
            </p>
          </CardHeader>
          <CardContent className="space-y-5">
            {groupByDay(myTasks).map((g) => (
              <DayGroup key={g.date} date={g.date} late={isBefore(day(g.date), today)}>
                {g.items.map((t: any) => (
                  <div key={t.id} className="flex items-center gap-3 rounded-lg border border-border bg-background/40 p-3 flex-wrap">
                    <div className="flex-1 min-w-[220px]">
                      <div className="font-medium">{t.title}</div>
                      {t.description && <div className="text-sm text-muted-foreground mt-0.5">{t.description}</div>}
                      {t.task_type && (
                        <Badge variant="secondary" className="mt-2 text-xs font-normal">{TYPE_LABEL[t.task_type] || t.task_type}</Badge>
                      )}
                    </div>
                    {isSendableTask(t) ? (
                      <Button onClick={() => setEmailTask(t)}><Send className="w-4 h-4 mr-2" /> Send email</Button>
                    ) : (
                      <Button variant="outline" onClick={() => markDone(t)} disabled={marking === t.id}>
                        {marking === t.id ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Check className="w-4 h-4 mr-2" />} Mark done
                      </Button>
                    )}
                  </div>
                ))}
              </DayGroup>
            ))}
          </CardContent>
        </Card>
      )}

      <Card id="task-progress" className="scroll-mt-4">
        <CardHeader className="pb-3 space-y-3">
          <div>
            <CardTitle className="text-lg font-display flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-primary" /> Task progress
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              {statusFilter === "overdue" ? "Every task that's past its date and not done yet." : "Last 14 days and next 14 days."}
            </p>
          </div>
          {windowTasks.length > 0 && (
            <div className="space-y-1.5">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{doneInWindow} of {windowTasks.length} done</span>
                <span className="font-medium">{Math.round((doneInWindow / windowTasks.length) * 100)}%</span>
              </div>
              <Progress value={(doneInWindow / windowTasks.length) * 100} className="h-2" />
            </div>
          )}
          <div className="flex flex-wrap items-center gap-2">
            {(["all", "pending", "overdue", "done"] as StatusFilter[]).map((f) => (
              <Button
                key={f}
                size="sm"
                variant={statusFilter === f ? "default" : "outline"}
                className="rounded-full"
                onClick={() => setStatusFilter(f)}
              >
                {f === "all" ? "All" : f === "pending" ? "Pending" : f === "overdue" ? "Overdue" : "Done"}
              </Button>
            ))}
            {!scope && data.cohorts.length > 1 && (
              <Select value={cohortFilter} onValueChange={setCohortFilter}>
                <SelectTrigger className="w-40 h-9 rounded-full" aria-label="Cohort"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All cohorts</SelectItem>
                  {[...data.cohorts].sort((a: any, b: any) => a.number - b.number).map((c: any) => (
                    <SelectItem key={c.id} value={c.id}>Cohort {c.number}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          {statusTasks.length === 0 && (
            <p className="text-sm text-muted-foreground py-6 text-center">
              {statusFilter === "done" ? "Nothing marked done in the last 14 days yet." : statusFilter === "overdue" ? "Nothing overdue. All caught up." : "No tasks in these four weeks."}
            </p>
          )}
          {groupByDay(statusTasks).map((g) => (
            <DayGroup key={g.date} date={g.date}>
              {g.items.map((t: any) => {
                const done = isDone(t);
                const late = isLate(t);
                return (
                  <div key={t.id} className="flex items-center gap-3 rounded-lg border border-border bg-background/40 p-3">
                    {done ? (
                      <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
                    ) : (
                      <Clock className={`w-5 h-5 shrink-0 ${late ? "text-destructive" : "text-muted-foreground"}`} />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className={`text-sm ${done ? "text-muted-foreground" : "font-medium"}`}>{t.title}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {t.assignee_user_id ? staffMap[t.assignee_user_id] || "—" : "Not assigned"}
                        {done && t.completed_at ? ` · done ${format(new Date(t.completed_at), "MMM d, h:mm a")}` : ""}
                      </div>
                    </div>
                    <StatusPill done={done} late={late} />
                  </div>
                );
              })}
            </DayGroup>
          ))}
        </CardContent>
      </Card>

      {!scope && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-display flex items-center gap-2"><Users className="w-5 h-5" /> Cohorts</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              {currentCohorts.map((c: any) => (
                <Link
                  key={c.id}
                  to={`/staff/ops/cohorts/${c.id}`}
                  className="flex items-center justify-between rounded-lg px-3 py-2.5 hover:bg-secondary transition-colors"
                >
                  <span className="font-medium">Cohort {c.number}{c.name && c.name !== `Cohort ${c.number}` ? ` — ${c.name}` : ""}</span>
                  <span className="flex items-center gap-2 text-sm text-muted-foreground">
                    {c.onboarding_date ? format(day(c.onboarding_date), "MMM d, yyyy") : "Date not set"}
                    <ChevronRight className="w-4 h-4" />
                  </span>
                </Link>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-display flex items-center gap-2"><Activity className="w-5 h-5" /> Latest updates</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              {data.activity.length === 0 && <p className="text-sm text-muted-foreground">Nothing yet.</p>}
              {data.activity.map((a: any) => (
                <div key={a.id} className="flex items-start justify-between gap-3 rounded-lg px-3 py-2.5">
                  <div className="min-w-0">
                    <div className="text-sm font-medium">{ACTION_LABEL[a.action] || a.action.replace(/_/g, " ")}</div>
                    {(a.detail?.title || a.detail?.subject) && (
                      <div className="text-xs text-muted-foreground truncate">{a.detail.title || a.detail.subject}</div>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">{format(new Date(a.created_at), "MMM d, h:mm a")}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}

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

function DayGroup({ date, late, children }: { date: string; late?: boolean; children: React.ReactNode }) {
  const d = day(date);
  return (
    <section className="space-y-2">
      <h3 className={`text-xs font-semibold uppercase tracking-wide ${late ? "text-destructive" : isToday(d) ? "text-primary" : "text-muted-foreground"}`}>
        {dayHeading(d)}{late ? " · overdue" : ""}
      </h3>
      <div className="space-y-2">{children}</div>
    </section>
  );
}

function StatusPill({ done, late }: { done: boolean; late: boolean }) {
  if (done) return <Badge className="shrink-0">Done</Badge>;
  if (late) return <Badge variant="destructive" className="shrink-0">Overdue</Badge>;
  return <Badge variant="outline" className="shrink-0">Pending</Badge>;
}

function StatTile({ icon: Icon, label, value, tone, onClick }: any) {
  const toneCls = tone === "destructive" && value > 0 ? "text-destructive" : tone === "primary" ? "text-primary" : "text-foreground";
  return (
    <button
      type="button"
      onClick={onClick}
      className="text-left rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <Icon className={`w-5 h-5 ${toneCls}`} />
      <div className={`text-3xl font-display font-bold mt-2 ${toneCls}`}>{value}</div>
      <div className="text-sm text-muted-foreground">{label}</div>
    </button>
  );
}
