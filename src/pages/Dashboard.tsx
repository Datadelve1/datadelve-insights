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
} from "lucide-react";
import CommitmentGate from "@/components/dashboard/CommitmentGate";
import WeeklyReviews from "@/components/dashboard/WeeklyReviews";
import ClassRecordings from "@/components/dashboard/ClassRecordings";
import Assignments from "@/components/dashboard/Assignments";
const Dashboard = () => {
  const { user, profile, isLoading, hasCommitted, signOut } = useAuth();
  const [submittedWeeks, setSubmittedWeeks] = useState<Set<number>>(new Set());
  const [reviewsLoaded, setReviewsLoaded] = useState(false);

  useEffect(() => {
    const fetchSubmittedWeeks = async () => {
      if (!user) return;
      const { data } = await supabase
        .from("weekly_reviews")
        .select("week_number")
        .eq("user_id", user.id);
      setSubmittedWeeks(new Set((data || []).map((r) => r.week_number)));
      setReviewsLoaded(true);
    };
    if (user && hasCommitted) fetchSubmittedWeeks();
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
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-amber-600 flex items-center justify-center">
              <span className="font-display font-bold text-primary-foreground text-lg">D</span>
            </div>
            <span className="font-display font-bold text-xl text-foreground">
              Student Dashboard
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground hidden sm:block">
              {profile?.full_name || user.email}
            </span>
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
            <div className="flex items-center gap-3 rounded-xl bg-secondary p-4">
              <CalendarDays className="w-5 h-5 text-primary shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Class Day</p>
                <p className="font-display font-semibold text-foreground">Every Friday</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-xl bg-secondary p-4">
              <Clock className="w-5 h-5 text-primary shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Time</p>
                <p className="font-display font-semibold text-foreground">6 PM – 9 PM</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-xl bg-secondary p-4">
              <BookOpen className="w-5 h-5 text-primary shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Duration</p>
                <p className="font-display font-semibold text-foreground">
                  8 Weeks (6 + 2 Project)
                </p>
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
                const completed = submittedWeeks.has(week);
                return (
                  <div
                    key={i}
                    className={`flex items-center gap-2 rounded-lg p-3 text-sm ${
                      completed
                        ? "bg-primary/10 border border-primary/20"
                        : "bg-secondary"
                    }`}
                  >
                    {completed ? (
                      <CheckCircle2 className="w-4 h-4 text-primary" />
                    ) : (
                      <Lock className="w-4 h-4 text-muted-foreground" />
                    )}
                    <span className={completed ? "text-foreground font-medium" : "text-muted-foreground"}>
                      Week {week} {week >= 7 ? "(Project)" : ""}
                    </span>
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

        {/* Locked Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="border-border bg-card relative overflow-hidden">
            <div className="absolute inset-0 bg-card/60 backdrop-blur-[2px] z-10 flex items-center justify-center">
              <div className="text-center space-y-2">
                <Lock className="w-6 h-6 text-muted-foreground mx-auto" />
                <p className="text-xs text-muted-foreground font-medium">Coming in Phase 3</p>
              </div>
            </div>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="text-primary"><BookOpen className="w-6 h-6" /></div>
                <CardTitle className="font-display text-lg text-foreground">Assignments</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Complete weekly assignments and track scores</p>
            </CardContent>
          </Card>

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
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
