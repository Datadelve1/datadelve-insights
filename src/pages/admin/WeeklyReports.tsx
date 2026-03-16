import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Loader2, Users, UserCheck, FileText, Video } from "lucide-react";

const WEEKS = [1, 2, 3, 4, 5, 6, 7, 8];

const WeeklyReports = () => {
  const [selectedWeek, setSelectedWeek] = useState("1");
  const [loading, setLoading] = useState(true);
  const [totalStudents, setTotalStudents] = useState(0);
  const [report, setReport] = useState({
    attended: 0,
    assignmentsSubmitted: 0,
    reflectionsSubmitted: 0,
  });

  useEffect(() => {
    fetchReport(parseInt(selectedWeek));
  }, [selectedWeek]);

  const fetchReport = async (week: number) => {
    setLoading(true);
    // Get assignments for this week first
    const { data: weekAssignments } = await supabase
      .from("assignments")
      .select("id")
      .eq("week_number", week);
    const assignmentIds = (weekAssignments ?? []).map((a: any) => a.id);

    const [profilesRes, attendanceRes, reviewsRes, submissionsRes] = await Promise.all([
      supabase.from("profiles").select("id", { count: "exact", head: true }),
      supabase.from("student_attendance").select("id", { count: "exact", head: true }).eq("week_number", week).eq("status", "present"),
      supabase.from("weekly_reviews").select("id", { count: "exact", head: true }).eq("week_number", week),
      assignmentIds.length > 0
        ? supabase.from("assignment_submissions").select("id", { count: "exact", head: true }).in("assignment_id", assignmentIds)
        : Promise.resolve({ count: 0 }),
    ]);

    setTotalStudents(profilesRes.count ?? 0);
    setReport({
      attended: attendanceRes.count ?? 0,
      assignmentsSubmitted: submissionsRes.count ?? 0,
      reflectionsSubmitted: reviewsRes.count ?? 0,
    });
    setLoading(false);
  };

  const total = totalStudents || 1;

  const metrics = [
    { label: "Students Registered", value: totalStudents, icon: Users, color: "text-primary" },
    { label: "Attended Class", value: report.attended, icon: UserCheck, pct: Math.round((report.attended / total) * 100) },
    { label: "Assignments Submitted", value: report.assignmentsSubmitted, icon: FileText, pct: Math.round((report.assignmentsSubmitted / total) * 100) },
    { label: "Reflections Submitted", value: report.reflectionsSubmitted, icon: Video, pct: Math.round((report.reflectionsSubmitted / total) * 100) },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Weekly Reports</h1>
          <p className="text-muted-foreground text-sm">Engagement summary per week</p>
        </div>
        <Select value={selectedWeek} onValueChange={setSelectedWeek}>
          <SelectTrigger className="w-40 bg-card border-border">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {WEEKS.map((w) => (
              <SelectItem key={w} value={String(w)}>
                Week {w} {w >= 7 ? "(Project)" : ""}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : (
        <>
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="font-display text-foreground">
                Week {selectedWeek} Report
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {metrics.map((m) => (
                  <div key={m.label} className="space-y-3">
                    <div className="flex items-center gap-2">
                      <m.icon className="w-5 h-5 text-primary" />
                      <span className="text-sm text-muted-foreground">{m.label}</span>
                    </div>
                    <p className="font-display text-3xl font-bold text-foreground">{m.value}</p>
                    {m.pct !== undefined && (
                      <div className="space-y-1">
                        <Progress value={m.pct} className="h-2" />
                        <p className="text-xs text-muted-foreground">{m.pct}% of registered students</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default WeeklyReports;
