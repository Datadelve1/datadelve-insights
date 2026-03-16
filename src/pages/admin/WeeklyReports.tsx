import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import {
  Loader2,
  Users,
  UserCheck,
  FileText,
  Video,
  Eye,
  Download,
  Play,
  ExternalLink,
} from "lucide-react";

const WEEKS = [1, 2, 3, 4, 5, 6, 7, 8];

interface Review {
  id: string;
  full_name: string;
  email: string;
  week_number: number;
  written_reflection: string | null;
  video_url: string | null;
  comments: string;
  created_at: string;
}

const WeeklyReports = () => {
  const { user } = useAuth();
  const [selectedWeek, setSelectedWeek] = useState("1");
  const [loading, setLoading] = useState(true);
  const [totalStudents, setTotalStudents] = useState(0);
  const [report, setReport] = useState({
    attended: 0,
    assignmentsSubmitted: 0,
    reflectionsSubmitted: 0,
  });

  // Reviews state (only for primary admin)
  const isPrimaryAdmin = user?.email === "datadelve1@gmail.com";
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [viewAll, setViewAll] = useState(false);

  useEffect(() => {
    fetchReport(parseInt(selectedWeek));
    if (isPrimaryAdmin) fetchReviews(parseInt(selectedWeek));
  }, [selectedWeek]);

  const fetchReport = async (week: number) => {
    setLoading(true);
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

  const fetchReviews = async (week: number) => {
    setReviewsLoading(true);
    const { data } = await supabase
      .from("weekly_reviews")
      .select("*")
      .eq("week_number", week)
      .order("created_at", { ascending: false });
    setReviews((data as Review[]) || []);
    setReviewsLoading(false);
  };

  const downloadReviewsCSV = () => {
    if (reviews.length === 0) return;
    const headers = ["Name", "Email", "Week", "Written Reflection", "Video URL", "Comments", "Submitted At"];
    const rows = reviews.map((r) => [
      r.full_name,
      r.email,
      r.week_number,
      (r.written_reflection || "").replace(/"/g, '""'),
      r.video_url || "",
      r.comments.replace(/"/g, '""'),
      new Date(r.created_at).toLocaleString(),
    ]);

    const csv = [headers.join(","), ...rows.map((row) => row.map((c) => `"${c}"`).join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `weekly-reviews-week-${selectedWeek}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
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

          {/* Student Reviews Section - Primary Admin Only */}
          {isPrimaryAdmin && (
            <Card className="border-border bg-card">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="font-display text-foreground flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" />
                  Student Reviews — Week {selectedWeek}
                  <span className="text-sm font-normal text-muted-foreground ml-2">
                    {reviews.length} submission{reviews.length !== 1 ? "s" : ""}
                  </span>
                </CardTitle>
                {reviews.length > 0 && (
                  <Button variant="outline" size="sm" onClick={downloadReviewsCSV}>
                    <Download className="w-4 h-4 mr-2" /> Export CSV
                  </Button>
                )}
              </CardHeader>
              <CardContent>
                {reviewsLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  </div>
                ) : reviews.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8 text-sm">
                    No reviews submitted for this week yet.
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Student</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Reflection</TableHead>
                          <TableHead>Video</TableHead>
                          <TableHead>Submitted</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {reviews.map((review) => (
                          <TableRow key={review.id}>
                            <TableCell className="font-medium text-foreground">
                              {review.full_name}
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {review.email}
                            </TableCell>
                            <TableCell>
                              {review.written_reflection ? (
                                <span className="text-xs text-primary font-medium bg-primary/10 px-2 py-0.5 rounded-full">
                                  Written
                                </span>
                              ) : (
                                <span className="text-xs text-muted-foreground">—</span>
                              )}
                            </TableCell>
                            <TableCell>
                              {review.video_url ? (
                                <a
                                  href={review.video_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-xs text-primary font-medium bg-primary/10 px-2 py-0.5 rounded-full hover:bg-primary/20 transition-colors"
                                >
                                  <Play className="w-3 h-3" /> Video
                                </a>
                              ) : (
                                <span className="text-xs text-muted-foreground">—</span>
                              )}
                            </TableCell>
                            <TableCell className="text-xs text-muted-foreground">
                              {new Date(review.created_at).toLocaleDateString("en-GB", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })}
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setSelectedReview(review)}
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Review Detail Dialog */}
      <Dialog open={!!selectedReview} onOpenChange={() => setSelectedReview(null)}>
        <DialogContent className="bg-card border-border max-w-2xl max-h-[85vh] overflow-auto">
          <DialogHeader>
            <DialogTitle className="font-display text-foreground">
              Review: {selectedReview?.full_name}
            </DialogTitle>
          </DialogHeader>
          {selectedReview && (
            <div className="space-y-5">
              {/* Student info header */}
              <div className="flex items-center gap-4 p-4 rounded-xl bg-secondary">
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary font-display font-bold text-lg">
                  {selectedReview.full_name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-display font-semibold text-foreground">{selectedReview.full_name}</p>
                  <p className="text-sm text-muted-foreground">{selectedReview.email}</p>
                </div>
                <div className="ml-auto text-right">
                  <span className="text-xs font-medium bg-primary/10 text-primary px-2 py-1 rounded-full">
                    Week {selectedReview.week_number}
                  </span>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(selectedReview.created_at).toLocaleString("en-GB", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>

              {/* Written Reflection */}
              {selectedReview.written_reflection && (
                <div className="space-y-2">
                  <h3 className="font-display font-semibold text-foreground text-sm flex items-center gap-2">
                    <FileText className="w-4 h-4 text-primary" /> Written Reflection
                  </h3>
                  <div className="p-4 rounded-lg bg-secondary border border-border">
                    <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                      {selectedReview.written_reflection}
                    </p>
                  </div>
                </div>
              )}

              {/* Video Reflection */}
              {selectedReview.video_url && (
                <div className="space-y-2">
                  <h3 className="font-display font-semibold text-foreground text-sm flex items-center gap-2">
                    <Video className="w-4 h-4 text-primary" /> Video Reflection
                  </h3>
                  <div className="rounded-lg overflow-hidden bg-black">
                    <video
                      src={selectedReview.video_url}
                      controls
                      className="w-full"
                    />
                  </div>
                  <a
                    href={selectedReview.video_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                  >
                    <ExternalLink className="w-3 h-3" /> Open in new tab
                  </a>
                </div>
              )}

              {/* Comments */}
              {selectedReview.comments && (
                <div className="space-y-2">
                  <h3 className="font-display font-semibold text-foreground text-sm">
                    Additional Comments
                  </h3>
                  <div className="p-4 rounded-lg bg-secondary border border-border">
                    <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                      {selectedReview.comments}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WeeklyReports;
