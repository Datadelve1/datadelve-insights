import { useState, useEffect } from "react";
import { getWeekSessions } from "@/lib/programDates";
import { useAuth } from "@/hooks/useAuth";
import { getCurrentWeek } from "@/lib/programDates";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAdminCohort } from "@/contexts/AdminCohortContext";
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
  CheckCircle2,
  XCircle,
  Shield,
} from "lucide-react";

const WEEKS = [1, 2, 3, 4, 5, 6, 7, 8];

interface Review {
  id: string;
  full_name: string;
  email: string;
  week_number: number;
  session_day: string;
  written_reflection: string | null;
  video_url: string | null;
  comments: string;
  created_at: string;
  is_approved: boolean;
  topic_covered: string | null;
  tutor_name: string | null;
  tutor_rating: string | null;
  question_answers: any;
}

const WeeklyReports = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { cohort } = useAdminCohort();
  const [selectedWeek, setSelectedWeek] = useState(String(getCurrentWeek() || 1));
  const [loading, setLoading] = useState(true);
  const [totalStudents, setTotalStudents] = useState(0);
  const [report, setReport] = useState({
    attended: 0,
    assignmentsSubmitted: 0,
    reflectionsSubmitted: 0,
  });

  const isPrimaryAdmin = user?.email === "datadelve1@gmail.com";
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);

  useEffect(() => {
    fetchReport(parseInt(selectedWeek));
    fetchReviews(parseInt(selectedWeek));
  }, [selectedWeek, cohort]);

  // Helper to get cohort user ids
  const getCohortUserIds = async () => {
    const { data } = await supabase
      .from("cohort2_enrollments")
      .select("user_id")
      .eq("cohort", cohort)
      .eq("payment_status", "paid");
    return new Set((data || []).map((e: any) => e.user_id).filter(Boolean) as string[]);
  };

  const fetchReport = async (week: number) => {
    setLoading(true);
    const cohortIds = await getCohortUserIds();
    const cohortIdArr = [...cohortIds];

    const { data: weekAssignments } = await supabase
      .from("assignments")
      .select("id")
      .eq("week_number", week);
    const assignmentIds = (weekAssignments ?? []).map((a: any) => a.id);

    const [attendanceRes, reviewsRes, submissionsRes] = await Promise.all([
      cohortIdArr.length > 0
        ? supabase
            .from("student_attendance")
            .select("id", { count: "exact", head: true })
            .eq("week_number", week)
            .eq("status", "present")
            .in("user_id", cohortIdArr)
        : Promise.resolve({ count: 0 }),
      cohortIdArr.length > 0
        ? supabase.from("weekly_reviews").select("id", { count: "exact", head: true }).eq("week_number", week).in("user_id", cohortIdArr)
        : Promise.resolve({ count: 0 }),
      assignmentIds.length > 0 && cohortIdArr.length > 0
        ? supabase
            .from("assignment_submissions")
            .select("id", { count: "exact", head: true })
            .in("assignment_id", assignmentIds)
            .in("user_id", cohortIdArr)
        : Promise.resolve({ count: 0 }),
    ]);

    setTotalStudents(cohortIdArr.length);
    setReport({
      attended: (attendanceRes as any).count ?? 0,
      assignmentsSubmitted: (submissionsRes as any).count ?? 0,
      reflectionsSubmitted: (reviewsRes as any).count ?? 0,
    });
    setLoading(false);
  };

  const fetchReviews = async (week: number) => {
    setReviewsLoading(true);
    const cohortIds = await getCohortUserIds();
    const cohortIdArr = [...cohortIds];
    
    let query = supabase
      .from("weekly_reviews")
      .select("*")
      .eq("week_number", week)
      .order("session_day" as any)
      .order("created_at", { ascending: false });
    
    if (cohortIdArr.length > 0) {
      query = query.in("user_id", cohortIdArr);
    } else {
      // No students in cohort, return empty
      setReviews([]);
      setReviewsLoading(false);
      return;
    }
    
    const { data } = await query;
    setReviews((data as any as Review[]) || []);
    setReviewsLoading(false);
  };

  const handleApproveVideo = async (reviewId: string, approve: boolean) => {
    const { error } = await supabase
      .from("weekly_reviews")
      .update({ is_approved: approve, approved_by: user?.id } as any)
      .eq("id", reviewId);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }

    toast({
      title: approve ? "Video approved for homepage ✅" : "Video approval removed",
      description: approve
        ? "This video review will now appear on the homepage."
        : "This video has been removed from the homepage.",
    });

    fetchReviews(parseInt(selectedWeek));
    if (selectedReview?.id === reviewId) {
      setSelectedReview((prev) => (prev ? { ...prev, is_approved: approve } : null));
    }
  };

  const downloadReviewsCSV = () => {
    if (reviews.length === 0) return;
    const headers = [
      "Name",
      "Email",
      "Week",
      "Session",
      "Written Reflection",
      "Video URL",
      "Topic",
      "Tutor",
      "Rating",
      "Approved",
      "Submitted At",
    ];
    const rows = reviews.map((r) => [
      r.full_name,
      r.email,
      r.week_number,
      r.session_day === "friday" ? "Friday" : "Saturday",
      (r.written_reflection || "").replace(/"/g, '""'),
      r.video_url || "",
      r.topic_covered || "",
      r.tutor_name || "",
      r.tutor_rating || "",
      r.is_approved ? "Yes" : "No",
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
  const fridayReviews = reviews.filter((r) => r.session_day === "friday");
  const saturdayReviews = reviews.filter((r) => r.session_day === "saturday");
  const pendingApproval = saturdayReviews.filter((r) => r.video_url && !r.is_approved);

  const metrics = [
    { label: "Students Registered", value: totalStudents, icon: Users, color: "text-primary" },
    {
      label: "Attended Class",
      value: report.attended,
      icon: UserCheck,
      pct: Math.round((report.attended / total) * 100),
    },
    {
      label: "Assignments Submitted",
      value: report.assignmentsSubmitted,
      icon: FileText,
      pct: Math.round((report.assignmentsSubmitted / total) * 100),
    },
    {
      label: "Reviews Submitted",
      value: report.reflectionsSubmitted,
      icon: Video,
      pct: Math.round((report.reflectionsSubmitted / total) * 100),
    },
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
            {WEEKS.map((w) => {
              const sessions = getWeekSessions(w);
              const friDate = sessions.find(s => s.day === "friday")?.dateLabel || "";
              const satDate = sessions.find(s => s.day === "saturday")?.dateLabel || "";
              return (
                <SelectItem key={w} value={String(w)}>
                  Week {w} {w >= 7 ? "(Project)" : ""} — {friDate} &amp; {satDate}
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : (
        <>
          {/* Metrics */}
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="font-display text-foreground">Week {selectedWeek} Report</CardTitle>
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

          {/* Video Approval Queue (Super Admin only) */}
          {isPrimaryAdmin && pendingApproval.length > 0 && (
            <Card className="border-amber-500/30 bg-amber-500/5">
              <CardHeader>
                <CardTitle className="font-display text-foreground flex items-center gap-2">
                  <Shield className="w-5 h-5 text-amber-500" />
                  Pending Video Approvals — {pendingApproval.length} video
                  {pendingApproval.length !== 1 ? "s" : ""}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {pendingApproval.map((review) => (
                  <div
                    key={review.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-card border border-border"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-display font-bold">
                        {review.full_name.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{review.full_name}</p>
                        <p className="text-xs text-muted-foreground">
                          Week {review.week_number} Saturday · {review.tutor_name || "N/A"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Button variant="ghost" size="sm" onClick={() => setSelectedReview(review)}>
                        <Play className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-primary border-primary/30 hover:bg-primary/10"
                        onClick={() => handleApproveVideo(review.id, true)}
                      >
                        <CheckCircle2 className="w-4 h-4 mr-1" /> Approve
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Friday Written Reviews */}
          <Card className="border-border bg-card">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="font-display text-foreground flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                Friday Written Reviews — Week {selectedWeek}
                <span className="text-sm font-normal text-muted-foreground ml-2">
                  {fridayReviews.length} submission{fridayReviews.length !== 1 ? "s" : ""}
                </span>
              </CardTitle>
              {fridayReviews.length > 0 && isPrimaryAdmin && (
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
              ) : fridayReviews.length === 0 ? (
                <p className="text-center text-muted-foreground py-8 text-sm">
                  No Friday reviews for this week yet.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Student</TableHead>
                        <TableHead>Topic</TableHead>
                        <TableHead>Tutor</TableHead>
                        <TableHead>Rating</TableHead>
                        <TableHead>Submitted</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {fridayReviews.map((review) => (
                        <TableRow key={review.id}>
                          <TableCell className="font-medium text-foreground">{review.full_name}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {review.topic_covered || "—"}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {review.tutor_name || "—"}
                          </TableCell>
                          <TableCell>
                            <span className="text-xs font-medium bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                              {review.tutor_rating || "—"}
                            </span>
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {new Date(review.created_at).toLocaleDateString("en-GB", {
                              day: "numeric",
                              month: "short",
                            })}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm" onClick={() => setSelectedReview(review)}>
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

          {/* Saturday Video Reviews */}
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="font-display text-foreground flex items-center gap-2">
                <Video className="w-5 h-5 text-primary" />
                Saturday Video Reviews — Week {selectedWeek}
                <span className="text-sm font-normal text-muted-foreground ml-2">
                  {saturdayReviews.length} submission{saturdayReviews.length !== 1 ? "s" : ""}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {reviewsLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
              ) : saturdayReviews.length === 0 ? (
                <p className="text-center text-muted-foreground py-8 text-sm">
                  No Saturday video reviews for this week yet.
                </p>
              ) : (
                <div className="space-y-3">
                  {saturdayReviews.map((review) => (
                    <div
                      key={review.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-secondary gap-3"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-display font-bold">
                          {review.full_name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">{review.full_name}</p>
                          <p className="text-xs text-muted-foreground">
                            {review.topic_covered || "N/A"} · {review.tutor_name || "N/A"} ·{" "}
                            {review.tutor_rating || "N/A"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {review.is_approved ? (
                          <span className="text-xs font-medium bg-primary/10 text-primary px-2 py-1 rounded-full flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Approved
                          </span>
                        ) : (
                          <span className="text-xs font-medium bg-amber-500/10 text-amber-600 px-2 py-1 rounded-full">
                            Pending
                          </span>
                        )}
                        <Button variant="ghost" size="sm" onClick={() => setSelectedReview(review)}>
                          <Play className="w-4 h-4" />
                        </Button>
                        {isPrimaryAdmin && (
                          <>
                            {!review.is_approved ? (
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-primary border-primary/30"
                                onClick={() => handleApproveVideo(review.id, true)}
                              >
                                <CheckCircle2 className="w-4 h-4" />
                              </Button>
                            ) : (
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-destructive border-destructive/30"
                                onClick={() => handleApproveVideo(review.id, false)}
                              >
                                <XCircle className="w-4 h-4" />
                              </Button>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {/* Review Detail Dialog */}
      <Dialog open={!!selectedReview} onOpenChange={() => setSelectedReview(null)}>
        <DialogContent className="bg-card border-border max-w-2xl max-h-[85vh] overflow-auto">
          <DialogHeader>
            <DialogTitle className="font-display text-foreground">
              {selectedReview?.full_name}'s{" "}
              {selectedReview?.session_day === "friday" ? "Written" : "Video"} Review
            </DialogTitle>
          </DialogHeader>
          {selectedReview && (
            <div className="space-y-5">
              {/* Header */}
              <div className="flex items-center gap-4 p-4 rounded-xl bg-secondary">
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary font-display font-bold text-lg">
                  {selectedReview.full_name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-display font-semibold text-foreground">{selectedReview.full_name}</p>
                  <p className="text-sm text-muted-foreground">{selectedReview.email}</p>
                </div>
                <div className="ml-auto text-right space-y-1">
                  <span className="text-xs font-medium bg-primary/10 text-primary px-2 py-1 rounded-full">
                    Week {selectedReview.week_number}{" "}
                    {selectedReview.session_day === "friday" ? "Friday" : "Saturday"}
                  </span>
                  <p className="text-xs text-muted-foreground">
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

              {/* Session Details */}
              <div className="grid grid-cols-3 gap-3 text-sm">
                <div className="p-3 rounded-lg bg-secondary">
                  <p className="text-xs text-muted-foreground">Topic</p>
                  <p className="font-medium text-foreground">{selectedReview.topic_covered || "—"}</p>
                </div>
                <div className="p-3 rounded-lg bg-secondary">
                  <p className="text-xs text-muted-foreground">Tutor</p>
                  <p className="font-medium text-foreground">{selectedReview.tutor_name || "—"}</p>
                </div>
                <div className="p-3 rounded-lg bg-secondary">
                  <p className="text-xs text-muted-foreground">Rating</p>
                  <p className="font-medium text-foreground">{selectedReview.tutor_rating || "—"}</p>
                </div>
              </div>

              {/* Question Answers (Friday) */}
              {selectedReview.session_day === "friday" &&
                selectedReview.question_answers &&
                typeof selectedReview.question_answers === "object" &&
                Object.keys(selectedReview.question_answers).length > 0 && (
                  <div className="space-y-3">
                    <h3 className="font-display font-semibold text-foreground text-sm">
                      Session Question Answers
                    </h3>
                    {Object.entries(selectedReview.question_answers).map(([num, answer]) => (
                      <div key={num} className="p-3 rounded-lg bg-secondary border border-border">
                        <p className="text-xs text-muted-foreground mb-1">Question {num}</p>
                        <p className="text-sm text-foreground whitespace-pre-wrap">{String(answer)}</p>
                      </div>
                    ))}
                  </div>
                )}

              {/* Written Reflection */}
              {selectedReview.written_reflection && (
                <div className="space-y-2">
                  <h3 className="font-display font-semibold text-foreground text-sm flex items-center gap-2">
                    <FileText className="w-4 h-4 text-primary" /> Written Review
                  </h3>
                  <div className="p-4 rounded-lg bg-secondary border border-border">
                    <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                      {selectedReview.written_reflection}
                    </p>
                  </div>
                </div>
              )}

              {/* Video Review */}
              {selectedReview.video_url && (
                <div className="space-y-2">
                  <h3 className="font-display font-semibold text-foreground text-sm flex items-center gap-2">
                    <Video className="w-4 h-4 text-primary" /> Video Review
                    {selectedReview.is_approved && (
                      <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full ml-2">
                        ✓ Approved for homepage
                      </span>
                    )}
                  </h3>
                  <div className="rounded-lg overflow-hidden bg-black">
                    <video src={selectedReview.video_url} controls className="w-full" />
                  </div>

                  {/* Approval Prompt (Super Admin) */}
                  {isPrimaryAdmin && (
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                      <p className="text-sm text-foreground flex-1">
                        Approve this video for homepage display?
                      </p>
                      {!selectedReview.is_approved ? (
                        <Button
                          size="sm"
                          className="bg-primary text-primary-foreground"
                          onClick={() => handleApproveVideo(selectedReview.id, true)}
                        >
                          <CheckCircle2 className="w-4 h-4 mr-1" /> Approve
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-destructive border-destructive/30"
                          onClick={() => handleApproveVideo(selectedReview.id, false)}
                        >
                          <XCircle className="w-4 h-4 mr-1" /> Remove
                        </Button>
                      )}
                    </div>
                  )}
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
