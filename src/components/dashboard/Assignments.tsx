import { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BookOpen,
  CheckCircle2,
  Lock,
  Loader2,
  Trophy,
  ChevronDown,
  ChevronUp,
  Database,
  Play,
  Info,
  RotateCcw,
  Table2,
} from "lucide-react";
import SubmissionWindowBanner, { useSubmissionWindow } from "./SubmissionWindowBanner";
import { useDatasets, type SqlDatasetRow } from "@/hooks/useDatasets";
import type initSqlJs from "sql.js";

type SqlJsStatic = Awaited<ReturnType<typeof initSqlJs>>;
type SqlJsDatabase = InstanceType<SqlJsStatic["Database"]>;

interface SqlQuestion {
  question: string;
  dataset: string;
  expected_query: string;
}

interface Assignment {
  id: string;
  week_number: number;
  title: string;
  description: string;
  questions: SqlQuestion[];
}

interface Submission {
  id: string;
  assignment_id: string;
  score: number;
  total: number;
  answers: any;
  created_at: string;
}

interface QueryResult {
  columns: string[];
  values: (string | number | null | Uint8Array)[][];
}

// Compare two result sets (order-insensitive)
function resultsMatch(a: QueryResult | null, b: QueryResult | null): boolean {
  if (!a || !b) return false;
  if (a.columns.length !== b.columns.length) return false;
  // Column names must match (case-insensitive)
  const colsA = a.columns.map((c) => c.toLowerCase());
  const colsB = b.columns.map((c) => c.toLowerCase());
  if (JSON.stringify(colsA.sort()) !== JSON.stringify(colsB.sort())) return false;
  if (a.values.length !== b.values.length) return false;
  // Sort rows for comparison
  const sortRows = (rows: any[][]) =>
    rows.map((r) => JSON.stringify(r)).sort();
  const sortedA = sortRows(a.values);
  const sortedB = sortRows(b.values);
  return JSON.stringify(sortedA) === JSON.stringify(sortedB);
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
  const windowInfo = useSubmissionWindow();
  const { datasets, loading: datasetsLoading } = useDatasets();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [submissions, setSubmissions] = useState<Record<string, Submission>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [activeAssignment, setActiveAssignment] = useState<string | null>(null);

  // SQL engine
  const [sqlJs, setSqlJs] = useState<SqlJsStatic | null>(null);
  const [sqlReady, setSqlReady] = useState(false);

  // Per-question state
  const [questionStates, setQuestionStates] = useState<
    Record<number, {
      query: string;
      result: QueryResult | null;
      error: string | null;
      correct: boolean | null;
      running: boolean;
    }>
  >({});

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Init sql.js
  useEffect(() => {
    const init = async () => {
      try {
        const initSqlJsFn = (await import("sql.js")).default;
        const SQL = await initSqlJsFn({
          locateFile: (file: string) => `https://sql.js.org/dist/${file}`,
        });
        setSqlJs(SQL);
        setSqlReady(true);
      } catch {
        // silent
      }
    };
    init();
  }, []);

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

  const runQueryOnDataset = useCallback(
    (datasetId: string, queryStr: string): { result: QueryResult | null; error: string | null } => {
      if (!sqlJs) return { result: null, error: "SQL engine not ready" };
      const ds = datasets.find((d) => d.id === datasetId);
      if (!ds) return { result: null, error: "Unknown dataset" };
      let db: SqlJsDatabase | null = null;
      try {
        db = new sqlJs.Database();
        db.run(ds.schema_sql);
        db.run(ds.seed_sql);
        const res = db.exec(queryStr);
        if (res.length > 0) {
          return { result: { columns: res[0].columns, values: res[0].values }, error: null };
        }
        return { result: { columns: ["Result"], values: [["Query executed. No rows returned."]] }, error: null };
      } catch (err: any) {
        return { result: null, error: err.message };
      } finally {
        db?.close();
      }
    },
    [sqlJs, datasets]
  );

  const handleRunQuestion = (assignmentQuestions: SqlQuestion[], qIdx: number) => {
    const q = assignmentQuestions[qIdx];
    const state = questionStates[qIdx];
    if (!state?.query?.trim()) return;

    setQuestionStates((prev) => ({
      ...prev,
      [qIdx]: { ...prev[qIdx], running: true, error: null, correct: null },
    }));

    // Run student query
    const studentResult = runQueryOnDataset(q.dataset, state.query);
    if (studentResult.error) {
      setQuestionStates((prev) => ({
        ...prev,
        [qIdx]: { ...prev[qIdx], running: false, error: studentResult.error, result: null, correct: null },
      }));
      return;
    }

    // Run expected query
    const expectedResult = runQueryOnDataset(q.dataset, q.expected_query);
    const isCorrect = resultsMatch(studentResult.result, expectedResult.result);

    setQuestionStates((prev) => ({
      ...prev,
      [qIdx]: {
        ...prev[qIdx],
        running: false,
        result: studentResult.result,
        error: null,
        correct: isCorrect,
      },
    }));
  };

  const handleSubmitAssignment = async (assignment: Assignment) => {
    const allAnswered = assignment.questions.every((_, i) => questionStates[i]?.correct === true);
    if (!allAnswered) {
      toast({
        title: "Not all questions are correct",
        description: "Run and get all questions correct before submitting.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const score = assignment.questions.length;
      const answersData = assignment.questions.map((_, i) => questionStates[i]?.query || "");

      const { error } = await supabase.from("assignment_submissions").insert({
        assignment_id: assignment.id,
        user_id: user!.id,
        answers: answersData,
        score,
        total: assignment.questions.length,
      } as any);

      if (error) throw error;

      toast({
        title: `Assignment submitted! ${score}/${assignment.questions.length} ✅`,
        description: "All queries correct — great work! 🎉",
      });

      setActiveAssignment(null);
      setQuestionStates({});
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
          <BookOpen className="w-5 h-5 text-primary" /> Weekly SQL Assignments
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
              const canSubmit = windowInfo.isOpen && windowInfo.currentWeek === assignment.week_number;
              const windowClosed = !windowInfo.isOpen || windowInfo.currentWeek !== assignment.week_number;

              return (
                <div key={assignment.id} className="rounded-xl border border-border overflow-hidden">
                  {/* Header */}
                  <div
                    className={`flex items-center justify-between p-4 cursor-pointer transition-colors ${
                      submission
                        ? "bg-primary/5"
                        : reviewSubmitted && canSubmit
                        ? "bg-card hover:bg-secondary/50"
                        : "bg-secondary/50"
                    }`}
                    onClick={() => {
                      if (submission) {
                        setActiveAssignment(isActive ? null : assignment.id);
                        return;
                      }
                      if (!reviewSubmitted || !canSubmit) return;
                      setActiveAssignment(isActive ? null : assignment.id);
                      setQuestionStates({});
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          submission
                            ? "bg-primary/20 text-primary"
                            : reviewSubmitted && canSubmit
                            ? "bg-secondary text-foreground"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {submission ? (
                          <Trophy className="w-5 h-5" />
                        ) : reviewSubmitted && canSubmit ? (
                          <Database className="w-5 h-5" />
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
                          {submission.score}/{submission.total} ✅
                        </span>
                      ) : !reviewSubmitted ? (
                        <span className="text-xs text-muted-foreground bg-muted px-3 py-1.5 rounded-lg">
                          Submit Week {assignment.week_number} review first
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

                  {/* SQL Questions (expanded, not yet submitted) */}
                  {isActive && !submission && reviewSubmitted && canSubmit && (
                    <div className="p-6 border-t border-border space-y-6 bg-card">
                      {!sqlReady && (
                        <div className="flex items-center gap-2 text-muted-foreground text-sm">
                          <Loader2 className="w-4 h-4 animate-spin" /> Loading SQL engine...
                        </div>
                      )}
                      {sqlReady &&
                        assignment.questions.map((q, qi) => {
                          const qs = questionStates[qi] || { query: "", result: null, error: null, correct: null, running: false };
                          const dsLabel =
                            q.dataset === "employees"
                              ? "Employees & Departments"
                              : q.dataset === "sales"
                              ? "Sales & Products"
                              : "School & Grades";

                          return (
                            <div key={qi} className="space-y-3 rounded-lg border border-border p-4">
                              <div className="flex items-start justify-between">
                                <p className="font-medium text-foreground text-sm">
                                  {qi + 1}. {q.question}
                                </p>
                                {qs.correct !== null && (
                                  <span
                                    className={`text-xs px-2 py-1 rounded-lg font-medium ${
                                      qs.correct
                                        ? "bg-green-100 text-green-800"
                                        : "bg-red-100 text-red-700"
                                    }`}
                                  >
                                    {qs.correct ? "✅ Correct" : "❌ Incorrect"}
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground flex items-center gap-1">
                                <Database className="w-3 h-3" /> Dataset: {dsLabel}
                              </p>

                              {/* SQL editor */}
                              <div className="relative">
                                <textarea
                                  value={qs.query}
                                  onChange={(e) =>
                                    setQuestionStates((prev) => ({
                                      ...prev,
                                      [qi]: { ...prev[qi] || { result: null, error: null, correct: null, running: false }, query: e.target.value },
                                    }))
                                  }
                                  onKeyDown={(e) => {
                                    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
                                      e.preventDefault();
                                      handleRunQuestion(assignment.questions, qi);
                                    }
                                  }}
                                  rows={4}
                                  spellCheck={false}
                                  className="w-full bg-secondary border border-border rounded-lg p-3 font-mono text-sm text-foreground resize-y focus:outline-none focus:ring-2 focus:ring-primary/50 placeholder:text-muted-foreground"
                                  placeholder="Write your SQL query here..."
                                />
                                <span className="absolute bottom-2 right-3 text-[10px] text-muted-foreground">
                                  Ctrl+Enter to run
                                </span>
                              </div>

                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleRunQuestion(assignment.questions, qi)}
                                disabled={qs.running || !qs.query?.trim()}
                                className="gap-2"
                              >
                                {qs.running ? (
                                  <><Loader2 className="w-3 h-3 animate-spin" /> Running...</>
                                ) : (
                                  <><Play className="w-3 h-3" /> Run Query</>
                                )}
                              </Button>

                              {/* Error */}
                              {qs.error && (
                                <div className="rounded-lg bg-destructive/10 border border-destructive/30 p-3">
                                  <p className="text-xs text-destructive font-mono">{qs.error}</p>
                                </div>
                              )}

                              {/* Results */}
                              {qs.result && (
                                <div className="rounded-lg border border-border overflow-hidden">
                                  <div className="bg-secondary px-3 py-1.5 flex items-center gap-2 border-b border-border">
                                    <Table2 className="w-3 h-3 text-primary" />
                                    <span className="text-xs font-medium text-foreground">
                                      {qs.result.values.length} row{qs.result.values.length !== 1 ? "s" : ""}
                                    </span>
                                  </div>
                                  <div className="overflow-x-auto max-h-48">
                                    <table className="w-full text-xs">
                                      <thead>
                                        <tr className="bg-secondary/50">
                                          {qs.result.columns.map((col, ci) => (
                                            <th key={ci} className="px-3 py-1.5 text-left font-semibold text-foreground border-b border-border whitespace-nowrap">
                                              {col}
                                            </th>
                                          ))}
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {qs.result.values.map((row, ri) => (
                                          <tr key={ri} className="border-b border-border last:border-0 hover:bg-secondary/30">
                                            {row.map((cell, ci) => (
                                              <td key={ci} className="px-3 py-1.5 text-foreground whitespace-nowrap">
                                                {cell === null ? <span className="text-muted-foreground italic">NULL</span> : String(cell)}
                                              </td>
                                            ))}
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}

                      {/* Submit button */}
                      {sqlReady && (
                        <Button
                          onClick={() => handleSubmitAssignment(assignment)}
                          disabled={
                            isSubmitting ||
                            !assignment.questions.every((_, i) => questionStates[i]?.correct === true)
                          }
                          variant="hero"
                          className="w-full h-11"
                        >
                          {isSubmitting ? (
                            <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</>
                          ) : assignment.questions.every((_, i) => questionStates[i]?.correct === true) ? (
                            "Submit Assignment ✅"
                          ) : (
                            "Answer all questions correctly to submit"
                          )}
                        </Button>
                      )}
                    </div>
                  )}

                  {/* Completed review */}
                  {submission && isActive && (
                    <div className="p-6 border-t border-border space-y-4 bg-card">
                      <div className="flex items-center gap-2 text-primary">
                        <CheckCircle2 className="w-5 h-5" />
                        <span className="font-display font-semibold text-sm">
                          Completed — {submission.score}/{submission.total} correct
                        </span>
                      </div>
                      {assignment.questions.map((q, qi) => (
                        <div key={qi} className="rounded-lg bg-secondary/50 p-4 space-y-2">
                          <p className="font-medium text-foreground text-sm">
                            {qi + 1}. {q.question}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Dataset: {q.dataset === "employees" ? "Employees & Departments" : q.dataset === "sales" ? "Sales & Products" : "School & Grades"}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Toggle for completed */}
                  {submission && (
                    <button
                      onClick={() => setActiveAssignment(isActive ? null : assignment.id)}
                      className="w-full py-2 text-xs text-primary hover:underline border-t border-border bg-secondary/30"
                    >
                      {isActive ? "Hide details" : "View details"}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {assignments.length > 0 && !windowInfo.isOpen && (
          <div className="mt-4">
            <SubmissionWindowBanner><span /></SubmissionWindowBanner>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default Assignments;
