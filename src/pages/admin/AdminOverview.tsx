import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Users, Video, FileText, BarChart3, Loader2 } from "lucide-react";

const AdminOverview = () => {
  const [stats, setStats] = useState({ students: 0, recordings: 0, assignments: 0, completionRate: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      const [profiles, recordings, assignments, reviews] = await Promise.all([
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("class_recordings").select("id", { count: "exact", head: true }),
        supabase.from("assignments").select("id", { count: "exact", head: true }),
        supabase.from("weekly_reviews").select("user_id, week_number"),
      ]);

      const studentCount = profiles.count ?? 0;
      const reviewData = reviews.data ?? [];
      const userWeeks = new Map<string, Set<number>>();
      reviewData.forEach((r: any) => {
        if (!userWeeks.has(r.user_id)) userWeeks.set(r.user_id, new Set());
        userWeeks.get(r.user_id)!.add(r.week_number);
      });
      let completed = 0;
      userWeeks.forEach((weeks) => { if (weeks.size === 8) completed++; });
      const rate = studentCount > 0 ? Math.round((completed / studentCount) * 100) : 0;

      setStats({
        students: studentCount,
        recordings: recordings.count ?? 0,
        assignments: assignments.count ?? 0,
        completionRate: rate,
      });
      setLoading(false);
    };
    fetchStats();
  }, []);

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
    </div>
  );
};

export default AdminOverview;
