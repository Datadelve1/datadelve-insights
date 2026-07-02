import { Navigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Loader2, Clock, Award } from "lucide-react";
import { STUDENT_PROJECTS } from "@/lib/studentProjects";
import { useStudentEnrollment, canAccessProject } from "@/hooks/useStudentEnrollment";
import delvetekLogo from "@/assets/delvetek-logo.jpeg";

const StudentProjects = () => {
  const { user, isLoading, hasCommitted } = useAuth();
  const { enrollment, isLoading: enrollmentLoading } = useStudentEnrollment();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }
  if (!user) return <Navigate to="/auth" replace />;
  if (!hasCommitted) return <Navigate to="/dashboard" replace />;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={delvetekLogo} alt="Delvetek" className="h-10 w-auto rounded-lg" />
            <span className="font-display font-bold text-xl text-foreground">Practice Projects</span>
          </div>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/dashboard"><ArrowLeft className="w-4 h-4 mr-2" /> Dashboard</Link>
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8 space-y-6">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground mb-2">Real-World Projects</h1>
          <p className="text-muted-foreground">
            Sharpen your analytical skills with hands-on, scenario-based projects using real raw data.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {STUDENT_PROJECTS.map((p) => (
            <Card key={p.slug} className="overflow-hidden border-border bg-card hover:border-primary/40 transition-colors">
              <div className="aspect-video w-full overflow-hidden bg-secondary">
                <img src={p.image} alt={p.title} className="w-full h-full object-cover" loading="lazy" />
              </div>
              <CardHeader>
                <CardTitle className="font-display text-lg text-foreground line-clamp-2">{p.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {p.tags.map((t) => (
                    <Badge key={t} variant="secondary" className="text-xs">{t}</Badge>
                  ))}
                </div>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Award className="w-3.5 h-3.5" /> {p.points} pts</span>
                  <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {p.durationHours}h</span>
                </div>
                <Button asChild className="w-full">
                  <Link to={`/dashboard/projects/${p.slug}`}>
                    View Project <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
};

export default StudentProjects;
