import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Users, Video, FileText, BarChart3, Loader2, Trophy } from "lucide-react";
import { useAdminCohort } from "@/contexts/AdminCohortContext";

interface ReferralRow {
  code: string;
  full_name: string | null;
  count: number;
}

const AdminOverview = () => {
  const { cohort } = useAdminCohort();
  const [stats, setStats] = useState({ students: 0, recordings: 0, assignments: 0, completionRate: 0 });
  const [referrals, setReferrals] = useState<ReferralRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);

      // Get enrolled student user_ids for this cohort
      const { data: enrollments } = await supabase
        .from("cohort2_enrollments")
        .select("user_id")
        .eq("cohort", cohort)
        .eq("payment_status", "paid");

      const enrolledUserIds = (enrollments || [])
        .map((e: any) => e.user_id)
        .filter(Boolean) as string[];

      const studentCount = enrolledUserIds.length;

      const [recordings, assignments, reviews, allEnrollments, referrers] = await Promise.all([
        supabase.from("class_recordings").select("id", { count: "exact", head: true }).eq("cohort", cohort),
        supabase.from("assignments").select("id", { count: "exact", head: true }).eq("cohort", cohort),
        enrolledUserIds.length > 0
          ? supabase.from("weekly_reviews").select("user_id, week_number").in("user_id", enrolledUserIds)
          : Promise.resolve({ data: [] }),
        supabase.from("cohort2_enrollments").select("referral_code").eq("cohort", cohort).not("referral_code", "is", null),
        supabase.from("referrers").select("code, full_name"),
      ]);

      const reviewData = (reviews as any).data ?? [];
      const userWeeks = new Map<string, Set<number>>();
      reviewData.forEach((r: any) => {
        if (!userWeeks.has(r.user_id)) userWeeks.set(r.user_id, new Set());
        userWeeks.get(r.user_id)!.add(r.week_number);
      });
      let completed = 0;
      userWeeks.forEach((weeks) => { if (weeks.size === 8) completed++; });
      const rate = studentCount > 0 ? Math.round((completed / studentCount) * 100) : 0;

      // Tally referrals
      const counts = new Map<string, number>();
      ((allEnrollments as any).data ?? []).forEach((e: any) => {
        if (!e.referral_code) return;
        const code = String(e.referral_code).toUpperCase();
        counts.set(code, (counts.get(code) ?? 0) + 1);
      });
      const nameByCode = new Map<string, string>();
      ((referrers as any).data ?? []).forEach((r: any) => {
        nameByCode.set(String(r.code).toUpperCase(), r.full_name);
      });
      const refRows: ReferralRow[] = Array.from(counts.entries())
        .map(([code, count]) => ({ code, full_name: nameByCode.get(code) ?? null, count }))
        .sort((a, b) => b.count - a.count);

      setStats({
        students: studentCount,
        recordings: recordings.count ?? 0,
        assignments: assignments.count ?? 0,
        completionRate: rate,
      });
      setReferrals(refRows);
      setLoading(false);
    };
    fetchStats();
  }, [cohort]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const statCards = [
    { label: "Total Students", value: stats.students, icon: Users },
    { label: "Recordings", value: stats.recordings, icon: Video },
    { label: "Assignments", value: stats.assignments, icon: FileText },
    { label: "Completion Rate", value: `${stats.completionRate}%`, icon: BarChart3 },
  ];

  const totalReferred = referrals.reduce((sum, r) => sum + r.count, 0);

  return (
    <div className="p-6 space-y-8">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">Dashboard Overview</h1>
        <p className="text-muted-foreground text-sm">Real-time platform statistics</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((s) => (
          <div
            key={s.label}
            className="rounded-xl bg-primary text-primary-foreground p-5 flex items-center gap-4"
          >
            <s.icon className="w-8 h-8 opacity-80" />
            <div>
              <p className="text-sm opacity-80">{s.label}</p>
              <p className="font-display text-2xl font-bold">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Referrals leaderboard */}
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
              <Trophy className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="font-display text-lg font-bold text-foreground">Referrals Leaderboard</h2>
              <p className="text-xs text-muted-foreground">Enrollments per referrer code · {cohort}</p>
            </div>
          </div>
          <span className="text-sm text-muted-foreground">
            {totalReferred} referred enrollment{totalReferred === 1 ? "" : "s"}
          </span>
        </div>

        {referrals.length === 0 ? (
          <p className="text-sm text-muted-foreground py-6 text-center">
            No referral codes have been used yet.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-muted-foreground">
                  <th className="py-2 pr-4 font-medium">#</th>
                  <th className="py-2 pr-4 font-medium">Referrer</th>
                  <th className="py-2 pr-4 font-medium">Code</th>
                  <th className="py-2 pr-4 font-medium text-right">Enrollments</th>
                </tr>
              </thead>
              <tbody>
                {referrals.map((r, idx) => (
                  <tr key={r.code} className="border-b border-border/60 last:border-0">
                    <td className="py-2 pr-4 text-muted-foreground">{idx + 1}</td>
                    <td className="py-2 pr-4 text-foreground">
                      {r.full_name ?? <span className="text-muted-foreground italic">Unknown</span>}
                    </td>
                    <td className="py-2 pr-4 font-mono text-xs">{r.code}</td>
                    <td className="py-2 pr-4 text-right font-semibold text-foreground">{r.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminOverview;
