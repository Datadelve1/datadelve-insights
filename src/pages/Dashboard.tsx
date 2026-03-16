import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  LogOut,
  CalendarDays,
  Clock,
  BookOpen,
  Award,
  Lock,
  CheckCircle2,
  Loader2,
  ArrowLeft,
} from "lucide-react";
import delvetekLogo from "@/assets/delvetek-logo.jpeg";
import CommitmentGate from "@/components/dashboard/CommitmentGate";
import WeeklyReviews from "@/components/dashboard/WeeklyReviews";
import ClassRecordings from "@/components/dashboard/ClassRecordings";
import Assignments from "@/components/dashboard/Assignments";
import StudentVideoUpload from "@/components/dashboard/StudentVideoUpload";

const Dashboard = () => {
  const { user, profile, isLoading, hasCommitted, signOut } = useAuth();
  const [submittedWeeks, setSubmittedWeeks] = useState<Set<number>>(new Set());
  const [assignmentScores, setAssignmentScores] = useState<Record<number, { score: number; total: number }>>({});
  const [reviewsLoaded, setReviewsLoaded] = useState(false);

  const fetchDashboardData = async () => {
    if (!user) return;
    const [{ data: reviewData }, { data: subData }] = await Promise.all([
      supabase.from("weekly_reviews").select("week_number").eq("user_id", user.id),
      supabase
        .from("assignment_submissions")
        .select("assignment_id, score, total, assignments!inner(week_number)")
        .eq("user_id", user.id),
    ]);
    setSubmittedWeeks(new Set((reviewData || []).map((r) => r.week_number)));
    const scores: Record<number, { score: number; total: number }> = {};
    (subData || []).forEach((s: any) => {
      const wn = s.assignments?.week_number;
      if (wn) scores[wn] = { score: s.score, total: s.total };
    });
    setAssignmentScores(scores);
    setReviewsLoaded(true);
  };

  useEffect(() => {
    if (user && hasCommitted) fetchDashboardData();
  }, [user, hasCommitted]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return <Navigate to="/auth" replace />;
  if (!hasCommitted) return <CommitmentGate profile={profile} signOut={signOut} />;

  const progressPercent = Math.round((submittedWeeks.size / 8) * 100);

  return (
    <div className="min-h-screen bg-background">
      {/* Top Bar */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={delvetekLogo} alt="Delvetek" className="h-10 w-auto rounded-lg" />
            <span className="font-display font-bold text-xl text-foreground">
              Student Dashboard
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground hidden sm:block">
              {profile?.full_name || user.email}
            </span>
            <Button variant="ghost" size="sm" asChild>
              <a href="/">
                <ArrowLeft className="w-4 h-4 mr-2" /> Home
              </a>
            </Button>
            <Button variant="ghost" size="sm" onClick={signOut}>
              <LogOut className="w-4 h-4 mr-2" /> Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8 space-y-8">
        {/* Welcome Section */}
        <div className="rounded-2xl border border-border bg-card p-8">
          <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-2">
            Welcome, {profile?.full_name || "Student"}! 👋
          </h1>
          <p className="text-muted-foreground mb-6">
            Welcome to the Delvetek Data Analysis Training Program. Stay consistent, complete your
            weekly tasks, and unlock your full potential.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 rounded-xl bg-primary text-primary-foreground p-4">
              <CalendarDays className="w-5 h-5 shrink-0" />
              <div>
                <p className="text-xs opacity-80">Class Day</p>
                <p className="font-display font-semibold">Every Friday</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-xl bg-primary text-primary-foreground p-4">
              <Clock className="w-5 h-5 shrink-0" />
              <div>
                <p className="text-xs opacity-80">Time</p>
                <p className="font-display font-semibold">6 PM – 9 PM</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-xl bg-primary text-primary-foreground p-4">
              <BookOpen className="w-5 h-5 shrink-0" />
              <div>
                <p className="text-xs opacity-80">Duration</p>
                <p className="font-display font-semibold">8 Weeks (6 + 2 Project)</p>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Overview */}
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="font-display flex items-center gap-2 text-foreground">
              <CheckCircle2 className="w-5 h-5 text-primary" /> Course Progress
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Overall Completion</span>
              <span className="font-display font-semibold text-primary">{progressPercent}%</span>
            </div>
            <Progress value={progressPercent} className="h-3" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
              {Array.from({ length: 8 }, (_, i) => {
                const week = i + 1;
                const reviewDone = submittedWeeks.has(week);
                const score = assignmentScores[week];
                return (
                  <div
                    key={i}
                    className={`flex flex-col gap-1 rounded-lg p-3 text-sm ${
                      reviewDone
                        ? "bg-primary/20 border border-primary/30"
                        : "bg-secondary"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {reviewDone ? (
                        <CheckCircle2 className="w-4 h-4 text-primary" />
                      ) : (
                        <Lock className="w-4 h-4 text-muted-foreground" />
                      )}
                      <span className={reviewDone ? "text-foreground font-medium" : "text-muted-foreground"}>
                        Week {week} {week >= 7 ? "(Project)" : ""}
                      </span>
                    </div>
                    {score && (
                      <span className="text-xs text-primary font-medium pl-6">
                        Score: {score.score}/{score.total}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Weekly Reviews */}
        <WeeklyReviews />

        {/* Class Recordings */}
        <ClassRecordings submittedWeeks={submittedWeeks} />

        {/* Assignments */}
        <Assignments submittedWeeks={submittedWeeks} onScoreUpdate={fetchDashboardData} />

        {/* Student Video Upload */}
        <StudentVideoUpload />

        {/* Locked Features */}
        <Card className="border-border bg-card relative overflow-hidden">
          <div className="absolute inset-0 bg-card/60 backdrop-blur-[2px] z-10 flex items-center justify-center">
            <div className="text-center space-y-2">
              <Lock className="w-6 h-6 text-muted-foreground mx-auto" />
              <p className="text-xs text-muted-foreground font-medium">Complete all weeks to unlock</p>
            </div>
          </div>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <div className="text-primary"><Award className="w-6 h-6" /></div>
              <CardTitle className="font-display text-lg text-foreground">Ambassador Program</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Unlock after completing the full 8-week program</p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Dashboard;
