import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FileText,
  Plus,
  Loader2,
  Pencil,
  Trash2,
  ChevronDown,
  ChevronUp,
  Users,
  Eye,
} from "lucide-react";

interface Assignment {
  id: string;
  week_number: number;
  title: string;
  description: string | null;
  questions: string[];
  model_answers: string[];
  key_concepts: string[];
  created_at: string;
}

interface Submission {
  id: string;
  user_id: string;
  assignment_id: string;
  answers: any[];
  score: number;
  total: number;
  created_at: string;
  studentName?: string;
  studentEmail?: string;
}

const AssignmentManagement = () => {
  const { toast } = useToast();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [weekNumber, setWeekNumber] = useState(1);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [questions, setQuestions] = useState<string[]>(["", "", "", "", ""]);
  const [modelAnswers, setModelAnswers] = useState<string[]>(["", "", "", "", ""]);
  const [keyConcepts, setKeyConcepts] = useState<string[]>(["", "", "", "", ""]);

  // Submissions state
  const [submissionsDialogOpen, setSubmissionsDialogOpen] = useState(false);
  const [submissionsLoading, setSubmissionsLoading] = useState(false);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [viewingAssignment, setViewingAssignment] = useState<Assignment | null>(null);
  const [expandedSubmissionId, setExpandedSubmissionId] = useState<string | null>(null);
  const [submissionCounts, setSubmissionCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    const { data } = await supabase
      .from("assignments")
      .select("*")
      .order("week_number");
    const parsed = (data || []).map((a: any) => ({
      ...a,
      questions:
        typeof a.questions === "string"
          ? JSON.parse(a.questions)
          : a.questions,
      model_answers: Array.isArray(a.model_answers) ? a.model_answers : [],
      key_concepts: Array.isArray(a.key_concepts) ? a.key_concepts : [],
    }));
    setAssignments(parsed);
    setLoading(false);

    // Fetch submission counts per assignment
    if (parsed.length > 0) {
      const { data: subData } = await supabase
        .from("assignment_submissions")
        .select("assignment_id");
      if (subData) {
        const counts: Record<string, number> = {};
        subData.forEach((s: any) => {
          counts[s.assignment_id] = (counts[s.assignment_id] || 0) + 1;
        });
        setSubmissionCounts(counts);
      }
    }
  };

  const fetchSubmissions = async (assignment: Assignment) => {
    setViewingAssignment(assignment);
    setSubmissionsDialogOpen(true);
    setSubmissionsLoading(true);
    setExpandedSubmissionId(null);

    const { data: subData, error } = await supabase
      .from("assignment_submissions")
      .select("*")
      .eq("assignment_id", assignment.id)
      .order("created_at", { ascending: false });

    if (error) {
      toast({ title: "Error loading submissions", description: error.message, variant: "destructive" });
      setSubmissionsLoading(false);
      return;
    }

    const subs = (subData || []) as any[];

    // Fetch student profiles for these submissions
    const userIds = [...new Set(subs.map((s) => s.user_id))];
    let profileMap: Record<string, { full_name: string; email: string }> = {};
    if (userIds.length > 0) {
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name, email")
        .in("id", userIds);
      if (profiles) {
        profiles.forEach((p: any) => {
          profileMap[p.id] = { full_name: p.full_name, email: p.email };
        });
      }
    }

    setSubmissions(
      subs.map((s) => ({
        ...s,
        answers: typeof s.answers === "string" ? JSON.parse(s.answers) : s.answers,
        studentName: profileMap[s.user_id]?.full_name || "Unknown",
        studentEmail: profileMap[s.user_id]?.email || "",
      }))
    );
    setSubmissionsLoading(false);
  };

  const resetForm = () => {
    setWeekNumber(1);
    setTitle("");
    setDescription("");
    setQuestions(["", "", "", "", ""]);
    setModelAnswers(["", "", "", "", ""]);
    setKeyConcepts(["", "", "", "", ""]);
    setEditingId(null);
  };

  const openEdit = (a: Assignment) => {
    setEditingId(a.id);
    setWeekNumber(a.week_number);
    setTitle(a.title);
    setDescription(a.description || "");
    const qList = a.questions.length > 0
      ? a.questions.map((q: any) => (typeof q === "string" ? q : q.question || ""))
      : ["", "", "", "", ""];
    setQuestions(qList);
    // Pad model answers/key concepts to match question count
    const padded = (arr: string[], len: number) => {
      const result = [...arr];
      while (result.length < len) result.push("");
      return result.slice(0, len);
    };
    setModelAnswers(padded(a.model_answers, qList.length));
    setKeyConcepts(padded(a.key_concepts, qList.length));
    setDialogOpen(true);
  };

  const addQuestion = () => {
    setQuestions([...questions, ""]);
    setModelAnswers([...modelAnswers, ""]);
    setKeyConcepts([...keyConcepts, ""]);
  };

  const removeQuestion = (idx: number) => {
    if (questions.length <= 1) return;
    setQuestions(questions.filter((_, i) => i !== idx));
    setModelAnswers(modelAnswers.filter((_, i) => i !== idx));
    setKeyConcepts(keyConcepts.filter((_, i) => i !== idx));
  };

  const updateQuestion = (idx: number, value: string) => {
    const updated = [...questions];
    updated[idx] = value;
    setQuestions(updated);
  };

  const updateModelAnswer = (idx: number, value: string) => {
    const updated = [...modelAnswers];
    updated[idx] = value;
    setModelAnswers(updated);
  };

  const updateKeyConcept = (idx: number, value: string) => {
    const updated = [...keyConcepts];
    updated[idx] = value;
    setKeyConcepts(updated);
  };

  const handleSave = async () => {
    if (!title.trim()) {
      toast({ title: "Title is required", variant: "destructive" });
      return;
    }
    const valid = questions.every((q) => q.trim());
    if (!valid) {
      toast({ title: "All question slots must be filled", variant: "destructive" });
      return;
    }

    setSaving(true);
    try {
      const payload = {
        week_number: weekNumber,
        title: title.trim(),
        description: description.trim() || null,
        questions: questions as any,
        model_answers: modelAnswers as any,
        key_concepts: keyConcepts as any,
      };

      if (editingId) {
        const { error } = await supabase.from("assignments").update(payload).eq("id", editingId);
        if (error) throw error;
        toast({ title: "Assignment updated" });
      } else {
        const { error } = await supabase.from("assignments").insert(payload as any);
        if (error) throw error;
        toast({ title: "Assignment created" });
      }

      setDialogOpen(false);
      resetForm();
      fetchAssignments();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("assignments").delete().eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Assignment deleted" });
      fetchAssignments();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">
            Assignment Management
          </h1>
          <p className="text-sm text-muted-foreground">
            Create question-based assignments for each week. Students answer in text.
          </p>
        </div>
        <Dialog
          open={dialogOpen}
          onOpenChange={(o) => {
            setDialogOpen(o);
            if (!o) resetForm();
          }}
        >
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" /> New Assignment
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-display">
                {editingId ? "Edit Assignment" : "Create Assignment"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Week Number</Label>
                  <Select
                    value={String(weekNumber)}
                    onValueChange={(v) => setWeekNumber(Number(v))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 8 }, (_, i) => (
                        <SelectItem key={i + 1} value={String(i + 1)}>
                          Week {i + 1}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Title</Label>
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Week 1 Assignment"
                  />
                </div>
              </div>
              <div>
                <Label>Description (optional)</Label>
                <Input
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief description of the assignment"
                />
              </div>

              <div className="border-t border-border pt-4">
                <div className="flex items-center justify-between mb-3">
                  <Label className="text-base font-display">Questions</Label>
                  <Button variant="outline" size="sm" onClick={addQuestion} className="gap-1">
                    <Plus className="w-3 h-3" /> Add Question
                  </Button>
                </div>
                <div className="space-y-4">
                  {questions.map((q, idx) => (
                    <div key={idx} className="rounded-lg border border-border p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-display font-semibold text-foreground">
                          Question {idx + 1}
                        </span>
                        {questions.length > 1 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeQuestion(idx)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        )}
                      </div>
                      <Textarea
                        value={q}
                        onChange={(e) => updateQuestion(idx, e.target.value)}
                        placeholder={`Enter question ${idx + 1}`}
                        rows={2}
                      />
                      <div>
                        <Label className="text-xs text-muted-foreground">Model Answer</Label>
                        <Textarea
                          value={modelAnswers[idx] || ""}
                          onChange={(e) => updateModelAnswer(idx, e.target.value)}
                          placeholder="The correct/expected answer for AI evaluation"
                          rows={2}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Key Concepts (semicolon-separated)</Label>
                        <Input
                          value={keyConcepts[idx] || ""}
                          onChange={(e) => updateKeyConcept(idx, e.target.value)}
                          placeholder="e.g. JOIN combines columns; UNION combines rows"
                          className="mt-1"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <Button onClick={handleSave} disabled={saving} className="w-full">
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Saving...
                  </>
                ) : editingId ? (
                  "Update Assignment"
                ) : (
                  "Create Assignment"
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {assignments.length === 0 ? (
        <Card className="border-border">
          <CardContent className="py-12 text-center">
            <FileText className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-muted-foreground">No assignments created yet</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {assignments.map((a) => {
            const expanded = expandedId === a.id;
            const subCount = submissionCounts[a.id] || 0;
            return (
              <Card key={a.id} className="border-border">
                <div
                  className="flex items-center justify-between p-4 cursor-pointer"
                  onClick={() => setExpandedId(expanded ? null : a.id)}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/20 text-primary flex items-center justify-center font-display font-bold text-sm">
                      W{a.week_number}
                    </div>
                    <div>
                      <p className="font-display font-semibold text-foreground text-sm">
                        {a.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {a.questions.length} question{a.questions.length !== 1 ? "s" : ""} · {subCount} submission{subCount !== 1 ? "s" : ""}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        fetchSubmissions(a);
                      }}
                    >
                      <Eye className="w-4 h-4" /> Submissions
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        openEdit(a);
                      }}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete assignment?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will permanently delete this assignment and cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(a.id)}>
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                    {expanded ? (
                      <ChevronUp className="w-4 h-4 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-muted-foreground" />
                    )}
                  </div>
                </div>
                {expanded && (
                  <CardContent className="border-t border-border pt-4 space-y-3">
                    {a.description && (
                      <p className="text-sm text-muted-foreground">{a.description}</p>
                    )}
                    {a.questions.map((q: any, qi: number) => {
                      const questionText = typeof q === "string" ? q : q.question || "";
                      return (
                        <div
                          key={qi}
                          className="rounded-lg bg-secondary/50 p-3 space-y-1"
                        >
                          <p className="text-sm text-foreground">
                            <span className="font-medium">Q{qi + 1}:</span> {questionText}
                          </p>
                          {a.model_answers[qi] && (
                            <p className="text-xs text-green-500">
                              <span className="font-medium">Model:</span> {a.model_answers[qi]}
                            </p>
                          )}
                          {a.key_concepts[qi] && (
                            <p className="text-xs text-muted-foreground">
                              <span className="font-medium">Concepts:</span> {a.key_concepts[qi]}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {/* Submissions Dialog */}
      <Dialog open={submissionsDialogOpen} onOpenChange={setSubmissionsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              Submissions — {viewingAssignment?.title}
            </DialogTitle>
          </DialogHeader>

          {submissionsLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : submissions.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground text-sm">No submissions yet for this assignment.</p>
            </div>
          ) : (
            <div className="space-y-3 mt-2">
              <p className="text-sm text-muted-foreground">{submissions.length} student{submissions.length !== 1 ? "s" : ""} submitted</p>
              {submissions.map((sub) => {
                const isExpanded = expandedSubmissionId === sub.id;
                return (
                  <Card key={sub.id} className="border-border">
                    <div
                      className="flex items-center justify-between p-4 cursor-pointer"
                      onClick={() => setExpandedSubmissionId(isExpanded ? null : sub.id)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-primary/20 text-primary flex items-center justify-center font-display font-bold text-xs">
                          {sub.studentName?.charAt(0) || "?"}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">{sub.studentName}</p>
                          <p className="text-xs text-muted-foreground">
                            {sub.studentEmail} · {new Date(sub.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-foreground">
                          {sub.score}/{sub.total}
                        </span>
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-muted-foreground" />
                        )}
                      </div>
                    </div>
                    {isExpanded && viewingAssignment && (
                      <CardContent className="border-t border-border pt-4 space-y-3">
                        {viewingAssignment.questions.map((q: any, qi: number) => {
                          const questionText = typeof q === "string" ? q : q.question || "";
                          const answer = Array.isArray(sub.answers) ? sub.answers[qi] : null;
                          const answerText = typeof answer === "string" ? answer : (answer as any)?.answer || "No answer";
                          return (
                            <div key={qi} className="rounded-lg bg-secondary/50 p-3 space-y-1">
                              <p className="text-xs font-medium text-muted-foreground">
                                Q{qi + 1}: {questionText}
                              </p>
                              <p className="text-sm text-foreground whitespace-pre-wrap">
                                {answerText}
                              </p>
                            </div>
                          );
                        })}
                      </CardContent>
                    )}
                  </Card>
                );
              })}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AssignmentManagement;
