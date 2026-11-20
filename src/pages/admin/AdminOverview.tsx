import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Users, Video, FileText, Wallet, Loader2, Trophy, ArrowRight, CheckCircle2, Clock, AlertTriangle } from "lucide-react";
import { addDays, format, startOfDay } from "date-fns";
import { useAdminCohort } from "@/contexts/AdminCohortContext";
import { useAuth } from "@/hooks/useAuth";
import { ADMIN_NAV } from "@/lib/adminNav";

interface ReferralRow {
  code: string;
  full_name: string | null;
  count: number;
}

const SHORTCUT_URLS = ["/admin/enrollments", "/admin/students", "/admin/videos", "/admin/assignments", "/admin/certificates", "/staff/ops"];
const SHORTCUTS = ADMIN_NAV.flatMap((g) => g.items).filter((i) => SHORTCUT_URLS.includes(i.url))
  .sort((a, b) => SHORTCUT_URLS.indexOf(a.url) - SHORTCUT_URLS.indexOf(b.url));

function greeting() {
  const h = new Date().getHours();
  return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
}

const AdminOverview = () => {
  const { cohort } = useAdminCohort();
  const { profile } = useAuth();
  const [stats, setStats] = useState({ students: 0, recordings: 0, assignments: 0, unpaid: 0 });
  const [ops, setOps] = useState({ done: 0, pending: 0, overdue: 0 });
  const [referrals, setReferrals] = useState<ReferralRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      const today = startOfDay(new Date());
      const weekStart = format(addDays(today, -7), "yyyy-MM-dd");
      const weekEnd = format(addDays(today, 7), "yyyy-MM-dd");
      const todayStr = format(today, "yyyy-MM-dd");

      const [enrollments, recordings, assignments, referrers, opsTasks] = await Promise.all([
        supabase.from("cohort2_enrollments").select("payment_status, referral_code").eq("cohort", cohort),
        supabase.from("class_recordings").select("id", { count: "exact", head: true }).eq("cohort", cohort),
        supabase.from("assignments").select("id", { count: "exact", head: true }).eq("cohort", cohort),
        supabase.from("referrers").select("code, full_name"),
        supabase.from("ops_tasks").select("status, due_date").gte("due_date", weekStart).lte("due_date", weekEnd),
      ]);

      const rows = enrollments.data ?? [];
      const counts = new Map<string, number>();
      rows.forEach((e: any) => {
        if (!e.referral_code) return;
        const code = String(e.referral_code).toUpperCase();
        counts.set(code, (counts.get(code) ?? 0) + 1);
      });
      const nameByCode = new Map<string, string>();
      (referrers.data ?? []).forEach((r: any) => nameByCode.set(String(r.code).toUpperCase(), r.full_name));
      setReferrals(
        Array.from(counts.entries())
          .map(([code, count]) => ({ code, full_name: nameByCode.get(code) ?? null, count }))
          .sort((a, b) => b.count - a.count),
      );

      const tasks = opsTasks.data ?? [];
      setOps({
        done: tasks.filter((t: any) => t.status === "completed").length,
        pending: tasks.filter((t: any) => t.status !== "completed" && t.due_date >= todayStr).length,
        overdue: tasks.filter((t: any) => t.status !== "completed" && t.due_date < todayStr).length,
      });

      setStats({
        students: rows.filter((e: any) => e.payment_status === "paid").length,
        unpaid: rows.filter((e: any) => e.payment_status !== "paid").length,
        recordings: recordings.count ?? 0,
        assignments: assignments.count ?? 0,
      });
      setLoading(false);
    };
    fetchStats();
  }, [cohort]);

  const firstName = (profile?.full_name || "").split(" ")[0];
  const statCards = [
    { label: "Paid students", value: stats.students, icon: Users, to: "/admin/students" },
    { label: "Waiting for payment", value: stats.unpaid, icon: Wallet, to: "/admin/enrollments" },
    { label: "Class recordings", value: stats.recordings, icon: Video, to: "/admin/videos" },
    { label: "Assignments", value: stats.assignments, icon: FileText, to: "/admin/assignments" },
  ];
  const totalReferred = referrals.reduce((sum, r) => sum + r.count, 0);

  return (
    <div className="p-4 md:p-8 space-y-8 max-w-6xl">
      <div>
        <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">
          {greeting()}{firstName ? `, ${firstName}` : ""}
        </h1>
        <p className="text-muted-foreground mt-1">
          You're looking at <span className="text-foreground font-medium">{cohort}</span>. Change it at the top right.
        </p>
      </div>

      {/* What would you like to do? */}
      <section className="space-y-3">
        <h2 className="font-display text-lg font-semibold">What would you like to do?</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {SHORTCUTS.map((s) => (
            <Link
              key={s.url}
              to={s.url}
              className="group flex items-center gap-4 rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <div className="w-11 h-11 rounded-lg bg-primary/15 flex items-center justify-center shrink-0">
                <s.icon className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-foreground">{s.title}</div>
                <div className="text-sm text-muted-foreground">{s.description}</div>
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
            </Link>
          ))}
        </div>
      </section>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : (
        <>
          <section className="space-y-3">
            <h2 className="font-display text-lg font-semibold">{cohort} at a glance</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {statCards.map((s) => (
                <Link
                  key={s.label}
                  to={s.to}
                  className="rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/60"
                >
                  <s.icon className="w-5 h-5 text-primary" />
                  <div className="font-display text-3xl font-bold mt-2 text-foreground">{s.value}</div>
                  <div className="text-sm text-muted-foreground">{s.label}</div>
                </Link>
              ))}
            </div>
          </section>

          <Link
            to="/staff/ops"
            className="block rounded-xl border border-border bg-card p-5 transition-colors hover:border-primary/60"
          >
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div>
                <h2 className="font-display text-lg font-semibold">Operations tasks</h2>
                <p className="text-sm text-muted-foreground">Last 7 days and next 7 days, all cohorts</p>
              </div>
              <span className="flex items-center gap-1 text-sm text-primary font-medium">
                See all tasks <ArrowRight className="w-4 h-4" />
              </span>
            </div>
            <div className="grid grid-cols-3 gap-3 mt-4">
              <OpsCount icon={CheckCircle2} label="Done" value={ops.done} cls="text-primary" />
              <OpsCount icon={Clock} label="Pending" value={ops.pending} cls="text-foreground" />
              <OpsCount icon={AlertTriangle} label="Overdue" value={ops.overdue} cls={ops.overdue > 0 ? "text-destructive" : "text-foreground"} />
            </div>
          </Link>

          <section className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/15 flex items-center justify-center">
                  <Trophy className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h2 className="font-display text-lg font-semibold text-foreground">Top referrers</h2>
                  <p className="text-sm text-muted-foreground">Sign-ups per referral code · {cohort}</p>
                </div>
              </div>
              <span className="text-sm text-muted-foreground">
                {totalReferred} referred sign-up{totalReferred === 1 ? "" : "s"}
              </span>
            </div>

            {referrals.length === 0 ? (
              <p className="text-sm text-muted-foreground py-6 text-center">No referral codes used in {cohort} yet.</p>
            ) : (
              <div className="space-y-1">
                {referrals.slice(0, 10).map((r, idx) => (
                  <div key={r.code} className="flex items-center gap-3 rounded-lg px-3 py-2.5 odd:bg-secondary/40">
                    <span className="w-6 text-sm text-muted-foreground">{idx + 1}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-foreground truncate">{r.full_name ?? "Unknown"}</div>
                      <div className="text-xs text-muted-foreground font-mono">{r.code}</div>
                    </div>
                    <span className="font-display font-semibold text-foreground">{r.count}</span>
                  </div>
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
};

function OpsCount({ icon: Icon, label, value, cls }: { icon: any; label: string; value: number; cls: string }) {
  return (
    <div className="rounded-lg bg-secondary/50 p-3">
      <div className={`flex items-center gap-2 ${cls}`}>
        <Icon className="w-4 h-4" />
        <span className="font-display text-2xl font-bold">{value}</span>
      </div>
      <div className="text-sm text-muted-foreground">{label}</div>
    </div>
  );
}

export default AdminOverview;
