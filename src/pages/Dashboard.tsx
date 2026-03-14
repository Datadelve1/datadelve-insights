import { useAuth } from "@/hooks/useAuth";
import { Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  LogOut,
  CalendarDays,
  Clock,
  BookOpen,
  FileText,
  Video,
  Award,
  Lock,
  CheckCircle2,
  Loader2,
} from "lucide-react";

const Dashboard = () => {
  const { user, profile, isLoading, hasCommitted, signOut } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return <Navigate to="/auth" replace />;

  // If not committed, show commitment gate
  if (!hasCommitted) {
    return <CommitmentGate profile={profile} signOut={signOut} />;
  }

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

          {/* Training Schedule */}
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
              <span className="font-display font-semibold text-primary">0%</span>
            </div>
            <Progress value={0} className="h-3" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
              {Array.from({ length: 8 }, (_, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 rounded-lg bg-secondary p-3 text-sm"
                >
                  <Lock className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    Week {i + 1} {i >= 6 ? "(Project)" : ""}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Dashboard Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <DashboardCard
            icon={<FileText className="w-6 h-6" />}
            title="Weekly Reviews"
            description="Submit your class reflection each week"
            status="Coming in Phase 2"
            locked
          />
          <DashboardCard
            icon={<Video className="w-6 h-6" />}
            title="Class Recordings"
            description="Access recorded sessions after submitting your review"
            status="Coming in Phase 2"
            locked
          />
          <DashboardCard
            icon={<BookOpen className="w-6 h-6" />}
            title="Assignments"
            description="Complete weekly assignments and track scores"
            status="Coming in Phase 3"
            locked
          />
          <DashboardCard
            icon={<Award className="w-6 h-6" />}
            title="Ambassador Program"
            description="Unlock after completing the full 8-week program"
            status="Complete all weeks to unlock"
            locked
          />
        </div>
      </main>
    </div>
  );
};

const CommitmentGate = ({
  profile,
  signOut,
}: {
  profile: { full_name: string; email: string } | null;
  signOut: () => void;
}) => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="max-w-lg text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-amber-600 flex items-center justify-center mx-auto">
          <Lock className="w-8 h-8 text-primary-foreground" />
        </div>
        <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">
          Complete Your Commitment First
        </h1>
        <p className="text-muted-foreground">
          Hi {profile?.full_name || "there"}, before accessing your dashboard, you need to confirm
          your commitment to the Delvetek Data Analysis Training Program.
        </p>
        <div className="flex flex-col gap-3">
          <Button
            variant="hero"
            size="lg"
            onClick={() => (window.location.href = "/dashboard/commitment")}
          >
            Complete Commitment Form
          </Button>
          <Button variant="ghost" size="sm" onClick={signOut}>
            <LogOut className="w-4 h-4 mr-2" /> Sign Out
          </Button>
        </div>
      </div>
    </div>
  );
};

const DashboardCard = ({
  icon,
  title,
  description,
  status,
  locked,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  status: string;
  locked?: boolean;
}) => (
  <Card className="border-border bg-card relative overflow-hidden">
    {locked && (
      <div className="absolute inset-0 bg-card/60 backdrop-blur-[2px] z-10 flex items-center justify-center">
        <div className="text-center space-y-2">
          <Lock className="w-6 h-6 text-muted-foreground mx-auto" />
          <p className="text-xs text-muted-foreground font-medium">{status}</p>
        </div>
      </div>
    )}
    <CardHeader className="pb-3">
      <div className="flex items-center gap-3">
        <div className="text-primary">{icon}</div>
        <CardTitle className="font-display text-lg text-foreground">{title}</CardTitle>
      </div>
    </CardHeader>
    <CardContent>
      <p className="text-sm text-muted-foreground">{description}</p>
    </CardContent>
  </Card>
);

export default Dashboard;
