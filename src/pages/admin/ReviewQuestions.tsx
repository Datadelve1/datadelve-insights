import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Loader2, Save, MessageSquare, Plus, Trash2 } from "lucide-react";

interface ReviewQuestion {
  id: string;
  question_number: number;
  question_text: string;
  is_active: boolean;
}

const ReviewQuestions = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [questions, setQuestions] = useState<ReviewQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<number | null>(null);
  const [adding, setAdding] = useState(false);

  const fetchQuestions = async () => {
    const { data } = await supabase
      .from("review_questions" as any)
      .select("*")
      .order("question_number");
    setQuestions((data as any as ReviewQuestion[]) || []);
    setLoading(false);
  };

  useEffect(() => { fetchQuestions(); }, []);

  const updateQuestion = async (q: ReviewQuestion) => {
    setSaving(q.question_number);
    const { error } = await supabase
      .from("review_questions" as any)
      .update({
        question_text: q.question_text,
        is_active: q.is_active,
        updated_at: new Date().toISOString(),
      } as any)
      .eq("id", q.id);

    if (error) {
      toast({ title: "Error saving", description: error.message, variant: "destructive" });
    } else {
      toast({ title: `Question ${q.question_number} updated` });
    }
    setSaving(null);
  };

  const addNewQuestion = async () => {
    setAdding(true);
    const nextNumber = questions.length > 0 ? Math.max(...questions.map(q => q.question_number)) + 1 : 1;
    const { error } = await supabase
      .from("review_questions" as any)
      .insert({
        question_number: nextNumber,
        question_text: "",
        is_active: true,
        updated_by: user?.id || null,
      } as any);

    if (error) {
      toast({ title: "Error adding question", description: error.message, variant: "destructive" });
    } else {
      toast({ title: `Question ${nextNumber} added` });
      fetchQuestions();
    }
    setAdding(false);
  };

  const deleteQuestion = async (q: ReviewQuestion) => {
    const { error } = await supabase
      .from("review_questions" as any)
      .delete()
      .eq("id", q.id);

    if (error) {
      toast({ title: "Error deleting", description: error.message, variant: "destructive" });
    } else {
      toast({ title: `Question ${q.question_number} deleted` });
      fetchQuestions();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Review Questions</h1>
          <p className="text-muted-foreground text-sm">
            Manage the questions students see in their weekly review form. Changes reflect immediately.
          </p>
        </div>
        <Button onClick={addNewQuestion} disabled={adding} className="gap-2">
          {adding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
          Add Question
        </Button>
      </div>

      <div className="space-y-4">
        {questions.map((q) => (
          <Card key={q.id} className="border-border bg-card">
            <CardHeader className="pb-3">
              <CardTitle className="font-display text-foreground text-base flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-primary" />
                  Question {q.question_number}
                </span>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <Label className="text-xs text-muted-foreground">Active</Label>
                    <Switch
                      checked={q.is_active}
                      onCheckedChange={(checked) =>
                        setQuestions((prev) =>
                          prev.map((pq) =>
                            pq.id === q.id ? { ...pq, is_active: checked } : pq
                          )
                        )
                      }
                    />
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteQuestion(q)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Textarea
                value={q.question_text}
                onChange={(e) =>
                  setQuestions((prev) =>
                    prev.map((pq) =>
                      pq.id === q.id ? { ...pq, question_text: e.target.value } : pq
                    )
                  )
                }
                className="bg-secondary border-border min-h-[80px]"
                placeholder="Enter the question text..."
              />
              <Button
                size="sm"
                onClick={() => updateQuestion(q)}
                disabled={saving === q.question_number}
              >
                {saving === q.question_number ? (
                  <><Loader2 className="w-4 h-4 animate-spin mr-1" /> Saving...</>
                ) : (
                  <><Save className="w-4 h-4 mr-1" /> Save Changes</>
                )}
              </Button>
            </CardContent>
          </Card>
        ))}

        {questions.length === 0 && (
          <Card className="border-border">
            <CardContent className="py-12 text-center">
              <MessageSquare className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground">No review questions yet. Add your first one above.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ReviewQuestions;
