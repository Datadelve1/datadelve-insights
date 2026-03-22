import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useDatasets } from "@/hooks/useDatasets";
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
  Database,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

interface SqlQuestion {
  question: string;
  dataset: string;
  expected_query: string;
}

interface Assignment {
  id: string;
  week_number: number;
  title: string;
  description: string | null;
  questions: SqlQuestion[];
  created_at: string;
}

const AssignmentManagement = () => {
  const { toast } = useToast();
  const { datasets: datasetOptions, loading: datasetsLoading } = useDatasets();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Form state
  const [weekNumber, setWeekNumber] = useState(1);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [questions, setQuestions] = useState<SqlQuestion[]>([
    { question: "", dataset: "", expected_query: "" },
  ]);

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
    }));
    setAssignments(parsed);
    setLoading(false);
  };

  const resetForm = () => {
    setWeekNumber(1);
    setTitle("");
    setDescription("");
    setQuestions([{ question: "", dataset: "employees", expected_query: "" }]);
    setEditingId(null);
  };

  const openEdit = (a: Assignment) => {
    setEditingId(a.id);
    setWeekNumber(a.week_number);
    setTitle(a.title);
    setDescription(a.description || "");
    setQuestions(
      a.questions.length > 0
        ? a.questions
        : [{ question: "", dataset: "employees", expected_query: "" }]
    );
    setDialogOpen(true);
  };

  const addQuestion = () => {
    setQuestions([...questions, { question: "", dataset: "employees", expected_query: "" }]);
  };

  const removeQuestion = (idx: number) => {
    if (questions.length <= 1) return;
    setQuestions(questions.filter((_, i) => i !== idx));
  };

  const updateQuestion = (idx: number, field: keyof SqlQuestion, value: string) => {
    const updated = [...questions];
    updated[idx] = { ...updated[idx], [field]: value };
    setQuestions(updated);
  };

  const handleSave = async () => {
    if (!title.trim()) {
      toast({ title: "Title is required", variant: "destructive" });
      return;
    }
    const valid = questions.every((q) => q.question.trim() && q.expected_query.trim());
    if (!valid) {
      toast({ title: "All questions need a question text and expected query", variant: "destructive" });
      return;
    }

    setSaving(true);
    try {
      const payload = {
        week_number: weekNumber,
        title: title.trim(),
        description: description.trim() || null,
        questions: questions as any,
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
            Create SQL-based assignments for each week
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
                    placeholder="e.g. SQL Basics"
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
                  <Label className="text-base font-display">SQL Questions</Label>
                  <Button variant="outline" size="sm" onClick={addQuestion} className="gap-1">
                    <Plus className="w-3 h-3" /> Add Question
                  </Button>
                </div>
                <div className="space-y-4">
                  {questions.map((q, idx) => (
                    <Card key={idx} className="border-border">
                      <CardContent className="pt-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-foreground">
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
                        <div>
                          <Label>Question</Label>
                          <Textarea
                            value={q.question}
                            onChange={(e) => updateQuestion(idx, "question", e.target.value)}
                            placeholder="e.g. Write a query to find all employees earning more than 80,000"
                            rows={2}
                          />
                        </div>
                        <div>
                          <Label>Dataset</Label>
                          <Select
                            value={q.dataset}
                            onValueChange={(v) => updateQuestion(idx, "dataset", v)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {DATASET_OPTIONS.map((ds) => (
                                <SelectItem key={ds.id} value={ds.id}>
                                  <span className="flex items-center gap-2">
                                    <Database className="w-3 h-3" /> {ds.label}
                                  </span>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Expected SQL Query (correct answer)</Label>
                          <Textarea
                            value={q.expected_query}
                            onChange={(e) =>
                              updateQuestion(idx, "expected_query", e.target.value)
                            }
                            placeholder="SELECT first_name, last_name, salary FROM employees WHERE salary > 80000;"
                            rows={3}
                            className="font-mono text-sm"
                          />
                        </div>
                      </CardContent>
                    </Card>
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
                        {a.questions.length} question{a.questions.length !== 1 ? "s" : ""}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
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
                    {a.questions.map((q, qi) => (
                      <div
                        key={qi}
                        className="rounded-lg bg-secondary/50 p-4 space-y-2"
                      >
                        <p className="text-sm font-medium text-foreground">
                          Q{qi + 1}: {q.question}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Dataset:{" "}
                          {DATASET_OPTIONS.find((d) => d.id === q.dataset)?.label || q.dataset}
                        </p>
                        <pre className="text-xs font-mono bg-secondary p-3 rounded border border-border text-foreground overflow-x-auto">
                          {q.expected_query}
                        </pre>
                      </div>
                    ))}
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AssignmentManagement;
