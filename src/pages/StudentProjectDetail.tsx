import { Navigate, Link, useParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Loader2, Clock, Award, CheckCircle2, CalendarDays, Download } from "lucide-react";
import { getProjectBySlug } from "@/lib/studentProjects";
import delvetekLogo from "@/assets/delvetek-logo.jpeg";
import ProjectSubmission from "@/components/dashboard/ProjectSubmission";

const StudentProjectDetail = () => {
  const { slug } = useParams();
  const { user, isLoading, hasCommitted } = useAuth();
  const project = slug ? getProjectBySlug(slug) : undefined;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }
  if (!user) return <Navigate to="/auth" replace />;
  if (!hasCommitted) return <Navigate to="/dashboard" replace />;
  if (!project) return <Navigate to="/dashboard/projects" replace />;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={delvetekLogo} alt="Delvetek" className="h-10 w-auto rounded-lg" />
            <span className="font-display font-bold text-xl text-foreground">Project</span>
          </div>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/dashboard/projects"><ArrowLeft className="w-4 h-4 mr-2" /> All Projects</Link>
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8 space-y-6 max-w-5xl">
        <div className="space-y-3">
          <h1 className="font-display text-2xl md:text-4xl font-bold text-foreground">{project.title}</h1>
          <p className="text-muted-foreground leading-relaxed">{project.scenario}</p>
        </div>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-3 max-w-xl">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="submit">Submit</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6 space-y-6">
            <div className="rounded-xl overflow-hidden border border-border bg-card">
              <img src={project.image} alt={project.title} className="w-full h-auto object-cover" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="border-border bg-card">
                <CardContent className="p-5 flex items-center gap-3">
                  <Award className="w-6 h-6 text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground">Points</p>
                    <p className="font-display font-semibold text-foreground">{project.points}</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-border bg-card">
                <CardContent className="p-5 flex items-center gap-3">
                  <Clock className="w-6 h-6 text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground">Duration</p>
                    <p className="font-display font-semibold text-foreground">{project.durationHours} Hours</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-border bg-card">
                <CardContent className="p-5 flex items-center gap-3">
                  <CalendarDays className="w-6 h-6 text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground">Published</p>
                    <p className="font-display font-semibold text-foreground">
                      {new Date(project.publishedAt).toLocaleDateString(undefined, { day: "2-digit", month: "long", year: "numeric" })}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="border-border bg-card">
              <CardContent className="p-6 space-y-3">
                <h3 className="font-display font-semibold text-foreground">Skills you learn</h3>
                <ul className="space-y-2">
                  {project.skills.map((s) => (
                    <li key={s} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="border-border bg-card">
              <CardContent className="p-6 space-y-3">
                <h3 className="font-display font-semibold text-foreground">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {project.tags.map((t) => (
                    <Badge key={t} variant="secondary">{t}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {project.datasets && project.datasets.length > 0 && (
              <Card className="border-border bg-card">
                <CardContent className="p-6 space-y-3">
                  <h3 className="font-display font-semibold text-foreground">Dataset Downloads</h3>
                  <div className="space-y-2">
                    {project.datasets.map((d) => (
                      <a
                        key={d.url}
                        href={d.url}
                        target="_blank"
                        rel="noreferrer"
                        download
                        className="flex items-center justify-between gap-3 rounded-lg border border-border bg-background p-3 hover:border-primary/50 transition-colors"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <Download className="w-4 h-4 text-primary shrink-0" />
                          <span className="text-sm text-foreground truncate">{d.label}</span>
                        </div>
                        {d.sizeLabel && (
                          <Badge variant="secondary" className="text-xs shrink-0">{d.sizeLabel}</Badge>
                        )}
                      </a>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="details" className="mt-6 space-y-6">
            <Card className="border-border bg-card">
              <CardContent className="p-6">
                <p className="text-muted-foreground leading-relaxed">{project.details.intro}</p>
              </CardContent>
            </Card>

            <Card className="border-border bg-card">
              <CardContent className="p-6 space-y-3">
                <h3 className="font-display font-semibold text-foreground">Questions to Answer</h3>
                <ul className="space-y-2">
                  {project.details.questions.map((q) => (
                    <li key={q} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <span className="text-primary">•</span>
                      <span>{q}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="border-border bg-card">
              <CardContent className="p-6 space-y-3">
                <h3 className="font-display font-semibold text-foreground">Recommended Tech Stack</h3>
                <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                  {project.details.techStack.map((t) => (
                    <li key={t}>{t}</li>
                  ))}
                </ol>
              </CardContent>
            </Card>

            {project.details.notes.length > 0 && (
              <Card className="border-amber-500/30 bg-amber-500/5">
                <CardContent className="p-6 space-y-2">
                  {project.details.notes.map((n, i) => (
                    <p key={i} className="text-sm text-foreground/90 italic">{n}</p>
                  ))}
                </CardContent>
              </Card>
            )}

            <div className="space-y-4">
              <h3 className="font-display text-xl font-semibold text-foreground">Here's what you should do</h3>
              {project.details.steps.map((step, idx) => (
                <Card key={step.title} className="border-border bg-card">
                  <CardContent className="p-6 space-y-3">
                    <h4 className="font-display font-semibold text-foreground">
                      {idx + 1}. {step.title}
                    </h4>
                    <ul className="space-y-2 pl-2">
                      {step.items.map((item) => (
                        <li key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default StudentProjectDetail;
