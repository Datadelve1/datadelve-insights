import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { ADMIN_EMAILS } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BookOpen,
  CheckCircle2,
  Lock,
  Loader2,
  Trophy,
  ChevronDown,
  ChevronUp,
  Clock,
  FileText,
} from "lucide-react";
import { useSubmissionWindow } from "./SubmissionWindowBanner";
import { hasReviewForWeek, canSubmitReview } from "@/lib/attendanceAccess";

const UNRESTRICTED_EMAILS = [
  "edwardolamide925@gmail.com",
  "koredesax1@gmail.com",
  "oloyedeopeyemi253@gmail.com",
];

interface Assignment {
  id: string;
  week_number: number;
  title: string;
  description: string;
  questions: string[];
}

interface Submission {
  id: string;
  assignment_id: string;
  score: number;
  total: number;
  answers: any;
  created_at: string;
}

const Assignments = ({
  attendance,
  submittedReviews,
  onScoreUpdate,
  googleReviewConfirmed,
}: {
  attendance: Record<string, string>;
  submittedReviews: Record<string, boolean>;
  onScoreUpdate: () => void;
  googleReviewConfirmed: Record<string, boolean>;
}) => {
  const { user, profile, isAdmin } = useAuth();
  const isUnrestricted =
    UNRESTRICTED_EMAILS.includes(profile?.email ?? user?.email ?? "") ||
    isAdmin ||
    ADMIN_EMAILS.includes(profile?.email ?? user?.email ?? "");
  const { toast } = useToast();
  const windowInfo = useSubmissionWindow();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [submissions, setSubmissions] = useState<Record<string, Submission>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [activeAssignment, setActiveAssignment] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    if (!user) return;
    const [{ data: assignData }, { data: subData }] = await Promise.all([
      supabase.from("assignments").select("*").order("week_number"),
      supabase.from("assignment_submissions").select("*").eq("user_id", user.id),
    ]);
    const parsedAssignments = (assignData || []).map((a: any) => ({
      ...a,
      questions: typeof a.questions === "string" ? JSON.parse(a.questions) : a.questions,
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
    const questions = assignment.questions.map((q: any) => (typeof q === "string" ? q : q.question || ""));
    const unanswered = questions.filter((_: string, i: number) => !answers[i]?.trim());
    if (unanswered.length > 0) {
      toast({
        title: "Please answer all questions",
        description: `${unanswered.length} question(s) still need an answer.`,
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const answersData = questions.map((_: string, i: number) => answers[i] || "");

      const { error } = await supabase.from("assignment_submissions").insert({
        assignment_id: assignment.id,
        user_id: user!.id,
        answers: answersData,
        score: questions.length,
        total: questions.length,
      } as any);

      if (error) throw error;

      toast({
        title: "Assignment submitted! ✅",
        description: "Your answers have been recorded.",
      });

      setActiveAssignment(null);
      setAnswers({});
      fetchData();
      onScoreUpdate();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
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

              // Access: attendance present + after 8 PM for session
              const friAttended = attendance[`${assignment.week_number}-friday`] === "present";
              const satAttended = attendance[`${assignment.week_number}-saturday`] === "present";
              const attended = friAttended || satAttended;

              const friReviewTime = isUnrestricted || canSubmitReview(assignment.week_number, "friday", attendance, isAdmin);
              const satReviewTime = isUnrestricted || canSubmitReview(assignment.week_number, "saturday", attendance, isAdmin);
              const timingOk = isAdmin || isUnrestricted || (friAttended && friReviewTime) || (satAttended && satReviewTime);

              const reviewDone = isAdmin || isUnrestricted || hasReviewForWeek(assignment.week_number, submittedReviews);

              const prevWeek = assignment.week_number - 1;
              const googleOk = isAdmin || isUnrestricted || assignment.week_number === 1 || (
                !!googleReviewConfirmed[`${prevWeek}-friday`] && !!googleReviewConfirmed[`${prevWeek}-saturday`]
              );

              const weekAccess = timingOk && reviewDone && googleOk;
              const isActive = activeAssignment === assignment.id;
              const canSubmit = windowInfo.isOpen && windowInfo.currentWeek === assignment.week_number;
              const windowClosed = !windowInfo.isOpen || windowInfo.currentWeek !== assignment.week_number;

              let lockMessage = "";
              if (!attended && !isAdmin && !isUnrestricted) lockMessage = "Attendance required";
              else if (!timingOk) lockMessage = "Available after 8 PM";
              else if (!reviewDone) lockMessage = "Submit review first";
              else if (!googleOk) lockMessage = `Confirm Google Review for Week ${prevWeek}`;

              return (
                <div key={assignment.id} className="rounded-xl border border-border overflow-hidden">
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
                          <p className="text-xs text-muted-foreground">{assignment.description}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {submission ? (
                        <span className="text-sm font-display font-semibold text-primary bg-primary/10 px-3 py-1 rounded-lg">
                          Submitted ✅
                        </span>
                      ) : !weekAccess ? (
                        <span className="text-xs text-muted-foreground bg-muted px-3 py-1.5 rounded-lg flex items-center gap-1">
                          {!attended && !isAdmin && !isUnrestricted ? (
                            <Lock className="w-3 h-3" />
                          ) : !timingOk ? (
                            <Clock className="w-3 h-3" />
                          ) : (
                            <FileText className="w-3 h-3" />
                          )}
                          {lockMessage}
                        </span>
                      ) : windowClosed ? (
                        <span className="text-xs text-muted-foreground bg-muted px-3 py-1.5 rounded-lg">
                          Submission window closed
                        </span>
                      ) : (
                        <span className="text-muted-foreground">
                          {isActive ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Question-Answer Form */}
                  {isActive && !submission && weekAccess && canSubmit && (
                    <div className="p-6 border-t border-border space-y-5 bg-card">
                      <p className="text-sm text-muted-foreground">
                        Answer all questions below and submit before Wednesday 11:59 PM WAT.
                      </p>
                      {questions.map((q: string, qi: number) => (
                        <div key={qi} className="space-y-2 rounded-lg border border-border p-4">
                          <p className="font-medium text-foreground text-sm">
                            {qi + 1}. {q}
                          </p>
                          <Textarea
                            value={answers[qi] || ""}
                            onChange={(e) =>
                              setAnswers((prev) => ({ ...prev, [qi]: e.target.value }))
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
                            <Loader2 className="w-4 h-4 animate-spin mr-2" /> Submitting...
                          </>
                        ) : (
                          "Submit Assignment"
                        )}
                      </Button>
                    </div>
                  )}

                  {/* Submitted answers display */}
                  {isActive && submission && (
                    <div className="p-6 border-t border-border bg-primary/5 space-y-4">
                      <div className="text-center">
                        <Trophy className="w-8 h-8 text-primary mx-auto mb-2" />
                        <p className="font-display font-semibold text-foreground">
                          Assignment Submitted
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Submitted {new Date(submission.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      {Array.isArray(submission.answers) && (
                        <div className="space-y-3">
                          {submission.answers.map((ans: string, i: number) => (
                            <div key={i} className="rounded-lg bg-secondary/50 p-3">
                              <p className="text-xs font-medium text-muted-foreground mb-1">
                                Q{i + 1}: {questions[i] || `Question ${i + 1}`}
                              </p>
                              <p className="text-sm text-foreground">{ans}</p>
                            </div>
                          ))}
                        </div>
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
