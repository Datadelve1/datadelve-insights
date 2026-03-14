import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import {
  BookOpen,
  CheckCircle2,
  Lock,
  Loader2,
  Trophy,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

interface Question {
  question: string;
  options: string[];
  correct_answer: number;
}

interface Assignment {
  id: string;
  week_number: number;
  title: string;
  description: string;
  questions: Question[];
}

interface Submission {
  id: string;
  assignment_id: string;
  score: number;
  total: number;
  answers: number[];
  created_at: string;
}

const Assignments = ({
  submittedWeeks,
  onScoreUpdate,
}: {
  submittedWeeks: Set<number>;
  onScoreUpdate: () => void;
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [submissions, setSubmissions] = useState<Record<string, Submission>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [activeAssignment, setActiveAssignment] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    if (!user) return;

    const [{ data: assignData }, { data: subData }] = await Promise.all([
      supabase
        .from("assignments")
        .select("*")
        .order("week_number"),
      supabase
        .from("assignment_submissions")
        .select("*")
        .eq("user_id", user.id),
    ]);

    const parsedAssignments = (assignData || []).map((a: any) => ({
      ...a,
      questions: typeof a.questions === "string" ? JSON.parse(a.questions) : a.questions,
    }));
    setAssignments(parsedAssignments);

    const subMap: Record<string, Submission> = {};
    (subData || []).forEach((s: any) => {
      subMap[s.assignment_id] = {
        ...s,
        answers: typeof s.answers === "string" ? JSON.parse(s.answers) : s.answers,
      };
    });
    setSubmissions(subMap);
    setIsLoading(false);
  };

  const handleSubmit = async (assignment: Assignment) => {
    const questions = assignment.questions;
    if (Object.keys(answers).length < questions.length) {
      toast({ title: "Please answer all questions", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    try {
      let score = 0;
      const answerArray: number[] = [];
      questions.forEach((q, i) => {
        const selected = answers[i] ?? -1;
        answerArray.push(selected);
        if (selected === q.correct_answer) score++;
      });

      const { error } = await supabase.from("assignment_submissions").insert({
        assignment_id: assignment.id,
        user_id: user!.id,
        answers: answerArray,
        score,
        total: questions.length,
      } as any);

      if (error) throw error;

      toast({
        title: `Assignment graded! ${score}/${questions.length}`,
        description:
          score === questions.length
            ? "Perfect score! 🎉"
            : `You got ${score} out of ${questions.length} correct.`,
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
              const reviewSubmitted = submittedWeeks.has(assignment.week_number);
              const isActive = activeAssignment === assignment.id;

              return (
                <div key={assignment.id} className="rounded-xl border border-border overflow-hidden">
                  {/* Assignment header */}
                  <div
                    className={`flex items-center justify-between p-4 cursor-pointer transition-colors ${
                      submission
                        ? "bg-primary/5"
                        : reviewSubmitted
                        ? "bg-card hover:bg-secondary/50"
                        : "bg-secondary/50"
                    }`}
                    onClick={() => {
                      if (submission || !reviewSubmitted) return;
                      setActiveAssignment(isActive ? null : assignment.id);
                      setAnswers({});
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          submission
                            ? "bg-primary/20 text-primary"
                            : reviewSubmitted
                            ? "bg-secondary text-foreground"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {submission ? (
                          <Trophy className="w-5 h-5" />
                        ) : reviewSubmitted ? (
                          <BookOpen className="w-5 h-5" />
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
                          {submission.score}/{submission.total}
                        </span>
                      ) : !reviewSubmitted ? (
                        <span className="text-xs text-muted-foreground bg-muted px-3 py-1.5 rounded-lg">
                          Submit Week {assignment.week_number} review first
                        </span>
                      ) : (
                        <span className="text-muted-foreground">
                          {isActive ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Assignment questions (expanded) */}
                  {isActive && !submission && reviewSubmitted && (
                    <div className="p-6 border-t border-border space-y-6 bg-card">
                      {assignment.questions.map((q, qi) => (
                        <div key={qi} className="space-y-3">
                          <p className="font-medium text-foreground text-sm">
                            {qi + 1}. {q.question}
                          </p>
                          <RadioGroup
                            value={answers[qi] !== undefined ? String(answers[qi]) : ""}
                            onValueChange={(v) =>
                              setAnswers((prev) => ({ ...prev, [qi]: parseInt(v) }))
                            }
                            className="space-y-2 pl-4"
                          >
                            {q.options.map((opt, oi) => (
                              <div key={oi} className="flex items-center gap-2">
                                <RadioGroupItem value={String(oi)} id={`q${qi}-o${oi}`} />
                                <Label
                                  htmlFor={`q${qi}-o${oi}`}
                                  className="text-sm text-foreground cursor-pointer"
                                >
                                  {opt}
                                </Label>
                              </div>
                            ))}
                          </RadioGroup>
                        </div>
                      ))}

                      <Button
                        onClick={() => handleSubmit(assignment)}
                        disabled={isSubmitting}
                        variant="hero"
                        className="w-full h-11"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" /> Grading...
                          </>
                        ) : (
                          "Submit Assignment"
                        )}
                      </Button>
                    </div>
                  )}

                  {/* Show results for completed assignments */}
                  {submission && isActive && (
                    <div className="p-6 border-t border-border space-y-4 bg-card">
                      {assignment.questions.map((q, qi) => {
                        const userAnswer = submission.answers[qi];
                        const isCorrect = userAnswer === q.correct_answer;
                        return (
                          <div key={qi} className="space-y-2">
                            <p className="font-medium text-foreground text-sm">
                              {qi + 1}. {q.question}
                            </p>
                            <div className="pl-4 space-y-1">
                              {q.options.map((opt, oi) => (
                                <p
                                  key={oi}
                                  className={`text-sm px-3 py-1.5 rounded ${
                                    oi === q.correct_answer
                                      ? "bg-green-100 text-green-800 font-medium"
                                      : oi === userAnswer && !isCorrect
                                      ? "bg-red-100 text-red-700"
                                      : "text-muted-foreground"
                                  }`}
                                >
                                  {opt}
                                  {oi === q.correct_answer && " ✓"}
                                  {oi === userAnswer && !isCorrect && " ✗"}
                                </p>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Toggle review for completed */}
                  {submission && (
                    <button
                      onClick={() => setActiveAssignment(isActive ? null : assignment.id)}
                      className="w-full py-2 text-xs text-primary hover:underline border-t border-border bg-secondary/30"
                    >
                      {isActive ? "Hide answers" : "Review answers"}
                    </button>
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
