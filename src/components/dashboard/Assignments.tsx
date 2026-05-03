import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { ADMIN_EMAILS } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Upload } from "lucide-react";
import { uploadWithProgress } from "@/lib/uploadWithProgress";
import {
  BookOpen,
  Lock,
  Loader2,
  Trophy,
  ChevronDown,
  ChevronUp,
  Clock,
  FileText,
  CheckCircle2,
  AlertTriangle,
  XCircle,
} from "lucide-react";
import { useSubmissionWindow } from "./SubmissionWindowBanner";

interface Assignment {
  id: string;
  week_number: number;
  title: string;
  description: string;
  questions: string[];
  model_answers: string[];
  key_concepts: string[];
}

interface Evaluation {
  result: string;
  score: number;
  feedback: string;
  correct_answer: string;
}

interface Submission {
  id: string;
  assignment_id: string;
  score: number;
  total: number;
  answers: any;
  evaluation: Evaluation[] | null;
  created_at: string;
}

// Fallback model data used when assignments don't have model_answers configured
const FALLBACK_MODEL_DATA = {
  modelAnswers: [] as string[],
  keyConcepts: [] as string[],
};

const getResultIcon = (result: string) => {
  const r = result.toLowerCase();
  if (r === "correct") return <CheckCircle2 className="w-5 h-5 text-green-500" />;
  if (r.includes("partial")) return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
  return <XCircle className="w-5 h-5 text-red-500" />;
};

const getResultColor = (result: string) => {
  const r = result.toLowerCase();
  if (r === "correct") return "border-green-500/30 bg-green-500/5";
  if (r.includes("partial")) return "border-yellow-500/30 bg-yellow-500/5";
  return "border-red-500/30 bg-red-500/5";
};

const getScoreColor = (score: number) => {
  if (score >= 5) return "text-green-500";
  if (score >= 3) return "text-yellow-500";
  return "text-red-500";
};

const Assignments = ({
  attendance,
  submittedReviews,
  onScoreUpdate,
}: {
  attendance: Record<string, string>;
  submittedReviews: Record<string, boolean>;
  onScoreUpdate: () => void;
}) => {
  const { user, profile, isAdmin } = useAuth();
  const isUnrestricted =
    isAdmin || ADMIN_EMAILS.includes(profile?.email ?? user?.email ?? "");
  const { toast } = useToast();
  const windowInfo = useSubmissionWindow();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [submissions, setSubmissions] = useState<Record<string, Submission>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [activeAssignment, setActiveAssignment] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [latestEvaluation, setLatestEvaluation] = useState<Evaluation[] | null>(null);
  const [showEvaluation, setShowEvaluation] = useState<string | null>(null);
  const [studentName, setStudentName] = useState("");
  const [excelFile, setExcelFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    if (!user) return;
    // Determine student's cohort
    const { data: enrollment } = await supabase
      .from("cohort2_enrollments")
      .select("cohort")
      .eq("user_id", user.id)
      .eq("payment_status", "paid")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    const studentCohort = enrollment?.cohort ?? "Cohort 1";

    const [{ data: assignData }, { data: subData }] = await Promise.all([
      supabase.from("assignments").select("*").eq("cohort", studentCohort).order("week_number"),
      supabase.from("assignment_submissions").select("*").eq("user_id", user.id),
    ]);
    const parsedAssignments = (assignData || []).map((a: any) => ({
      ...a,
      questions:
        typeof a.questions === "string" ? JSON.parse(a.questions) : a.questions,
      model_answers: Array.isArray(a.model_answers) ? a.model_answers : [],
      key_concepts: Array.isArray(a.key_concepts) ? a.key_concepts : [],
    }));
    setAssignments(parsedAssignments);
    const subMap: Record<string, Submission> = {};
    (subData || []).forEach((s: any) => {
      subMap[s.assignment_id] = s;
    });
    setSubmissions(subMap);
    setIsLoading(false);
  };

  const handleSubmitAssignment = async (assignment: Assignment) => {
    const questions = assignment.questions.map((q: any) =>
      typeof q === "string" ? q : q.question || ""
    );
    const requireExcel = assignment.week_number === 5;
    if (requireExcel) {
      if (!studentName.trim()) {
        toast({ title: "Please enter your full name", variant: "destructive" });
        return;
      }
      if (!excelFile) {
        toast({ title: "Please upload your Excel sheet", variant: "destructive" });
        return;
      }
    }
    const unanswered = questions.filter(
      (_: string, i: number) => !answers[i]?.trim()
    );
    if (unanswered.length > 0) {
      toast({
        title: "Please answer all questions",
        description: `${unanswered.length} question(s) still need an answer.`,
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    setIsEvaluating(true);
    setLatestEvaluation(null);

    try {
      const answersData = questions.map((_: string, i: number) => answers[i] || "");

      // Week 5: upload Excel sheet
      let excelUrl: string | null = null;
      if (requireExcel && excelFile) {
        const ext = excelFile.name.split(".").pop();
        const path = `${user!.id}/assignments/week-${assignment.week_number}-${Date.now()}.${ext}`;
        await uploadWithProgress({
          bucket: "form-uploads",
          path,
          file: excelFile,
          onProgress: (p) => setUploadProgress(p),
        });
        const { data: pub } = supabase.storage.from("form-uploads").getPublicUrl(path);
        excelUrl = pub.publicUrl;
      }

      const modelData = {
        modelAnswers: assignment.model_answers.length > 0 ? assignment.model_answers : FALLBACK_MODEL_DATA.modelAnswers,
        keyConcepts: assignment.key_concepts.length > 0 ? assignment.key_concepts : FALLBACK_MODEL_DATA.keyConcepts,
      };

      const hasModelAnswers = modelData.modelAnswers.length > 0 && modelData.modelAnswers.some(a => a.trim());

      let evaluations: Evaluation[] | null = null;
      if (hasModelAnswers) {
        try {
          const { data: evalData, error: evalError } = await supabase.functions.invoke(
            "evaluate-assignment",
            {
              body: {
                questions,
                studentAnswers: answersData,
                modelAnswers: modelData.modelAnswers,
                keyConcepts: modelData.keyConcepts,
              },
            }
          );
          if (!evalError && evalData?.evaluations) {
            evaluations = evalData.evaluations;
          }
        } catch (e) {
          console.error("Evaluation error:", e);
        }
      }

      const totalScore = evaluations
        ? evaluations.reduce((sum, ev) => sum + (ev.score || 0), 0)
        : questions.length;
      const totalPossible = questions.length * 5;

      const payloadAnswers = requireExcel
        ? { student_name: studentName.trim(), excel_url: excelUrl, answers: answersData }
        : answersData;

      const { error } = await supabase.from("assignment_submissions").insert({
        assignment_id: assignment.id,
        user_id: user!.id,
        answers: payloadAnswers,
        score: totalScore,
        total: totalPossible,
        evaluation: evaluations,
      } as any);

      if (error) throw error;

      setLatestEvaluation(evaluations);
      setShowEvaluation(assignment.id);

      toast({
        title: "Assignment submitted & evaluated! ✅",
        description: evaluations
          ? `You scored ${totalScore}/${totalPossible} points.`
          : "Your answers have been recorded.",
      });

      setActiveAssignment(null);
      setAnswers({});
      setStudentName("");
      setExcelFile(null);
      setUploadProgress(0);
      fetchData();
      onScoreUpdate();
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
      setIsEvaluating(false);
    }
  };

  if (isLoading) {
    return (
      <Card className="border-border bg-card">
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle className="font-display flex items-center gap-2 text-foreground">
          <BookOpen className="w-5 h-5 text-primary" /> Weekly Assignments
        </CardTitle>
        <p className="text-xs text-muted-foreground mt-1">
          ⏰ Assignment submissions close every{" "}
          <span className="font-semibold text-foreground">
            Wednesday at 11:59 PM WAT
          </span>
        </p>
      </CardHeader>
      <CardContent>
        {assignments.length === 0 ? (
          <div className="text-center py-8">
            <BookOpen className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-muted-foreground font-medium">No assignments yet</p>
            <p className="text-sm text-muted-foreground">
              Assignments will appear here as they are released each week.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {assignments.map((assignment) => {
              const submission = submissions[assignment.id];
              const questions = assignment.questions.map((q: any) =>
                typeof q === "string" ? q : q.question || ""
              );

              const friAttended =
                attendance[`${assignment.week_number}-friday`] === "present";
              const satAttended =
                attendance[`${assignment.week_number}-saturday`] === "present";
              const attended = friAttended || satAttended;

              const weekAccess = isAdmin || isUnrestricted || attended;
              const isActive = activeAssignment === assignment.id;
              const canSubmit =
                windowInfo.isOpen &&
                windowInfo.currentWeek === assignment.week_number;
              const windowClosed =
                !windowInfo.isOpen ||
                windowInfo.currentWeek !== assignment.week_number;

              const evalResults =
                showEvaluation === assignment.id && latestEvaluation
                  ? latestEvaluation
                  : submission?.evaluation || null;

              let lockMessage = "";
              if (!attended && !isAdmin && !isUnrestricted)
                lockMessage = "Attendance required";

              return (
                <div
                  key={assignment.id}
                  className="rounded-xl border border-border overflow-hidden"
                >
                  {/* Header row */}
                  <div
                    className={`flex items-center justify-between p-4 cursor-pointer transition-colors ${
                      submission
                        ? "bg-primary/5"
                        : weekAccess && canSubmit
                        ? "bg-card hover:bg-secondary/50"
                        : "bg-secondary/50"
                    }`}
                    onClick={() => {
                      if (submission) {
                        setActiveAssignment(isActive ? null : assignment.id);
                        return;
                      }
                      if (!weekAccess || !canSubmit) return;
                      setActiveAssignment(isActive ? null : assignment.id);
                      setAnswers({});
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          submission
                            ? "bg-primary/20 text-primary"
                            : weekAccess && canSubmit
                            ? "bg-secondary text-foreground"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {submission ? (
                          <Trophy className="w-5 h-5" />
                        ) : weekAccess && canSubmit ? (
                          <FileText className="w-5 h-5" />
                        ) : (
                          <Lock className="w-5 h-5" />
                        )}
                      </div>
                      <div>
                        <p className="font-display font-semibold text-foreground text-sm">
                          Week {assignment.week_number}: {assignment.title}
                        </p>
                        {assignment.description && (
                          <p className="text-xs text-muted-foreground">
                            {assignment.description}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {submission ? (
                        <span className="text-sm font-display font-semibold text-primary bg-primary/10 px-3 py-1 rounded-lg">
                          {submission.total > 0
                            ? `${submission.score}/${submission.total} pts`
                            : "Submitted ✅"}
                        </span>
                      ) : !weekAccess ? (
                        <span className="text-xs text-muted-foreground bg-muted px-3 py-1.5 rounded-lg flex items-center gap-1">
                          <Lock className="w-3 h-3" />
                          {lockMessage}
                        </span>
                      ) : windowClosed ? (
                        <span className="text-xs text-muted-foreground bg-muted px-3 py-1.5 rounded-lg">
                          Submission window closed
                        </span>
                      ) : (
                        <span className="text-muted-foreground">
                          {isActive ? (
                            <ChevronUp className="w-5 h-5" />
                          ) : (
                            <ChevronDown className="w-5 h-5" />
                          )}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Question-Answer Form */}
                  {isActive && !submission && weekAccess && canSubmit && (
                    <div className="p-6 border-t border-border space-y-5 bg-card">
                      <p className="text-sm text-muted-foreground">
                        {assignment.week_number === 5
                          ? "Submit your full name and the Excel sheet you worked on before Wednesday 11:59 PM WAT."
                          : "Answer all questions below and submit before Wednesday 11:59 PM WAT. Your answers will be evaluated by AI."}
                      </p>

                      {assignment.week_number === 5 && (
                        <div className="space-y-4 rounded-lg border border-primary/40 bg-primary/5 p-4">
                          <div className="space-y-2">
                            <Label className="text-foreground">Full Name *</Label>
                            <Input
                              value={studentName}
                              onChange={(e) => setStudentName(e.target.value)}
                              placeholder="Enter your full name"
                              className="bg-secondary border-border"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-foreground">Upload Excel Sheet *</Label>
                            <label className="flex items-center gap-3 p-4 rounded-xl border-2 border-dashed border-border bg-secondary cursor-pointer hover:border-primary transition-colors">
                              <Upload className="w-5 h-5 text-primary" />
                              <span className="text-sm text-muted-foreground truncate">
                                {excelFile ? excelFile.name : "Click to upload your .xlsx / .xls / .csv file"}
                              </span>
                              <input
                                type="file"
                                accept=".xlsx,.xls,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,text/csv"
                                className="hidden"
                                onChange={(e) => setExcelFile(e.target.files?.[0] || null)}
                              />
                            </label>
                            {uploadProgress > 0 && uploadProgress < 100 && (
                              <div className="space-y-1">
                                <Progress value={uploadProgress} className="h-2" />
                                <p className="text-xs text-muted-foreground">Uploading... {uploadProgress}%</p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                      {questions.map((q: string, qi: number) => (
                        <div
                          key={qi}
                          className="space-y-2 rounded-lg border border-border p-4"
                        >
                          <p className="font-medium text-foreground text-sm">
                            {qi + 1}. {q}
                          </p>
                          <Textarea
                            value={answers[qi] || ""}
                            onChange={(e) =>
                              setAnswers((prev) => ({
                                ...prev,
                                [qi]: e.target.value,
                              }))
                            }
                            placeholder="Your answer..."
                            className="bg-secondary border-border min-h-[100px]"
                          />
                        </div>
                      ))}

                      <Button
                        onClick={() => handleSubmitAssignment(assignment)}
                        disabled={isSubmitting}
                        className="w-full"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                            {isEvaluating
                              ? "Evaluating your answers..."
                              : "Submitting..."}
                          </>
                        ) : (
                          "Submit Assignment"
                        )}
                      </Button>
                    </div>
                  )}

                  {/* Evaluation / submitted answers display */}
                  {isActive && submission && (
                    <div className="p-6 border-t border-border bg-primary/5 space-y-4">
                      {/* Score summary */}
                      <div className="text-center space-y-2">
                        <Trophy className="w-8 h-8 text-primary mx-auto" />
                        <p className="font-display font-semibold text-foreground">
                          Assignment Evaluated
                        </p>
                        {submission.total > 0 && (
                          <div className="space-y-1">
                            <p className="text-lg font-bold text-foreground">
                              {submission.score}/{submission.total} points
                            </p>
                            <Progress
                              value={
                                (submission.score / submission.total) * 100
                              }
                              className="h-3 mx-auto max-w-xs"
                            />
                          </div>
                        )}
                        <p className="text-xs text-muted-foreground">
                          Submitted{" "}
                          {new Date(submission.created_at).toLocaleDateString()}
                        </p>
                      </div>

                      {/* Per-question evaluation */}
                      {evalResults && Array.isArray(evalResults) ? (
                        <div className="space-y-3">
                          {evalResults.map((ev: Evaluation, i: number) => (
                            <div
                              key={i}
                              className={`rounded-lg border p-4 space-y-2 ${getResultColor(
                                ev.result
                              )}`}
                            >
                              <div className="flex items-center justify-between">
                                <p className="text-xs font-medium text-muted-foreground">
                                  Q{i + 1}:{" "}
                                  {questions[i] || `Question ${i + 1}`}
                                </p>
                                <div className="flex items-center gap-2">
                                  {getResultIcon(ev.result)}
                                  <span
                                    className={`text-sm font-bold ${getScoreColor(
                                      ev.score
                                    )}`}
                                  >
                                    {ev.score}/5
                                  </span>
                                </div>
                              </div>

                              <div className="rounded-md bg-secondary/50 p-3">
                                <p className="text-xs font-medium text-muted-foreground mb-1">
                                  Your Answer:
                                </p>
                                <p className="text-sm text-foreground">
                                  {Array.isArray(submission.answers)
                                    ? submission.answers[i]
                                    : "—"}
                                </p>
                              </div>

                              <div className="flex items-start gap-2">
                                {getResultIcon(ev.result)}
                                <div>
                                  <span
                                    className={`text-sm font-semibold ${
                                      ev.result.toLowerCase() === "correct"
                                        ? "text-green-500"
                                        : ev.result
                                            .toLowerCase()
                                            .includes("partial")
                                        ? "text-yellow-500"
                                        : "text-red-500"
                                    }`}
                                  >
                                    {ev.result}
                                  </span>
                                  {ev.feedback && (
                                    <p className="text-xs text-muted-foreground mt-1">
                                      {ev.feedback}
                                    </p>
                                  )}
                                </div>
                              </div>

                              {(ev.result.toLowerCase() !== "correct" ||
                                ev.correct_answer) && (
                                <div className="rounded-md bg-primary/10 p-3">
                                  <p className="text-xs font-medium text-primary mb-1">
                                    ✅ Correct Answer:
                                  </p>
                                  <p className="text-sm text-foreground">
                                    {ev.correct_answer}
                                  </p>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        // Fallback: show raw answers if no evaluation
                        Array.isArray(submission.answers) && (
                          <div className="space-y-3">
                            {submission.answers.map(
                              (ans: string, i: number) => (
                                <div
                                  key={i}
                                  className="rounded-lg bg-secondary/50 p-3"
                                >
                                  <p className="text-xs font-medium text-muted-foreground mb-1">
                                    Q{i + 1}:{" "}
                                    {questions[i] || `Question ${i + 1}`}
                                  </p>
                                  <p className="text-sm text-foreground">
                                    {ans}
                                  </p>
                                </div>
                              )
                            )}
                          </div>
                        )
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default Assignments;
