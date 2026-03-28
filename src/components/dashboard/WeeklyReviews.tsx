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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FileText, CheckCircle2, Loader2, Star, ExternalLink } from "lucide-react";
import SubmissionWindowBanner, { useSubmissionWindow } from "./SubmissionWindowBanner";

interface WeeklyReview {
  id: string;
  week_number: number;
  video_url: string | null;
  written_reflection: string | null;
  comments: string;
  created_at: string;
}

interface ReviewQuestion {
  id: string;
  question_number: number;
  question_text: string;
  is_active: boolean;
}

const UNRESTRICTED_EMAILS = [
  "edwardolamide925@gmail.com",
  "koredesax1@gmail.com",
  "oloyedeopeyemi253@gmail.com",
];

const TUTOR_RATINGS = ["Excellent", "Good", "Fair"] as const;

const WeeklyReviews = () => {
  const { user, profile, isAdmin } = useAuth();
  const windowInfo = useSubmissionWindow();
  const isUnrestricted = UNRESTRICTED_EMAILS.includes(profile?.email ?? user?.email ?? "")
    || isAdmin
    || ADMIN_EMAILS.includes(profile?.email ?? user?.email ?? "");
  const { toast } = useToast();
  const [reviews, setReviews] = useState<WeeklyReview[]>([]);
  const [questions, setQuestions] = useState<ReviewQuestion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showTrustpilot, setShowTrustpilot] = useState(false);

  // Form state
  const [selectedWeek, setSelectedWeek] = useState("");
  const [className, setClassName] = useState("Data Analysis");
  const [classDate, setClassDate] = useState("");
  const [topicCovered, setTopicCovered] = useState("");
  const [tutorName, setTutorName] = useState("");
  const [tutorRating, setTutorRating] = useState("");
  const [questionAnswers, setQuestionAnswers] = useState<Record<number, string>>({});
  const [mainReview, setMainReview] = useState("");

  useEffect(() => {
    fetchReviews();
    fetchQuestions();
  }, [user]);

  const fetchReviews = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("weekly_reviews")
      .select("*")
      .eq("user_id", user.id)
      .order("week_number");
    setReviews(data || []);
    setIsLoading(false);
  };

  const fetchQuestions = async () => {
    const { data } = await supabase
      .from("review_questions" as any)
      .select("*")
      .eq("is_active", true)
      .order("question_number");
    setQuestions((data as any as ReviewQuestion[]) || []);
  };

  const submittedWeeks = new Set(reviews.map((r) => r.week_number));

  const resetForm = () => {
    setSelectedWeek("");
    setClassName("Data Analysis");
    setClassDate("");
    setTopicCovered("");
    setTutorName("");
    setTutorRating("");
    setQuestionAnswers({});
    setMainReview("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWeek) {
      toast({ title: "Please select a week", variant: "destructive" });
      return;
    }
    const weekNum = parseInt(selectedWeek);
    if (submittedWeeks.has(weekNum)) {
      toast({ title: "You already submitted a review for this week", variant: "destructive" });
      return;
    }
    if (!topicCovered.trim()) {
      toast({ title: "Please enter the topic covered", variant: "destructive" });
      return;
    }
    if (!tutorName.trim()) {
      toast({ title: "Please enter the tutor name", variant: "destructive" });
      return;
    }
    if (!tutorRating) {
      toast({ title: "Please rate the tutor", variant: "destructive" });
      return;
    }
    if (!mainReview.trim()) {
      toast({ title: "Please write your overall review", variant: "destructive" });
      return;
    }
    // Check all active questions are answered
    const unanswered = questions.filter(q => !questionAnswers[q.question_number]?.trim());
    if (unanswered.length > 0) {
      toast({ title: `Please answer all ${questions.length} questions`, variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from("weekly_reviews").insert({
        user_id: user!.id,
        full_name: profile?.full_name ?? "",
        email: profile?.email ?? user!.email ?? "",
        week_number: weekNum,
        written_reflection: mainReview.trim(),
        comments: "",
        video_url: null,
        class_name: className,
        class_date: classDate || null,
        topic_covered: topicCovered.trim(),
        tutor_name: tutorName.trim(),
        tutor_rating: tutorRating,
        question_answers: questionAnswers,
      } as any);
      if (error) throw error;

      // Send confirmation email
      supabase.functions.invoke("send-weekly-review-confirmation", {
        body: {
          email: profile?.email ?? user!.email,
          full_name: profile?.full_name,
          week_number: weekNum,
        },
      });

      toast({ title: "Review submitted! 🎉", description: `Week ${weekNum} review recorded.` });
      resetForm();
      fetchReviews();
      // Show Trustpilot prompt
      setShowTrustpilot(true);
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
    <>
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="font-display flex items-center gap-2 text-foreground">
            <FileText className="w-5 h-5 text-primary" /> Weekly Reviews
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Submitted reviews summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {Array.from({ length: 8 }, (_, i) => {
              const week = i + 1;
              const submitted = submittedWeeks.has(week);
              return (
                <div
                  key={week}
                  className={`flex items-center gap-2 rounded-lg p-3 text-sm ${
                    submitted
                      ? "bg-primary/10 border border-primary/20"
                      : "bg-secondary"
                  }`}
                >
                  {submitted ? (
                    <CheckCircle2 className="w-4 h-4 text-primary" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border-2 border-muted-foreground/30" />
                  )}
                  <span className={submitted ? "text-foreground font-medium" : "text-muted-foreground"}>
                    Week {week}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Submit new review form */}
          {submittedWeeks.size < 8 && (() => {
            const weekSelector = isUnrestricted ? (
              <SelectContent>
                {Array.from({ length: 8 }, (_, i) => i + 1)
                  .filter((w) => !submittedWeeks.has(w))
                  .map((w) => (
                    <SelectItem key={w} value={String(w)}>
                      Week {w} {w >= 7 ? "(Project)" : ""}
                    </SelectItem>
                  ))}
              </SelectContent>
            ) : (
              <SelectContent>
                {windowInfo.currentWeek && !submittedWeeks.has(windowInfo.currentWeek) ? (
                  <SelectItem value={String(windowInfo.currentWeek)}>
                    Week {windowInfo.currentWeek} {windowInfo.currentWeek >= 7 ? "(Project)" : ""}
                  </SelectItem>
                ) : (
                  <SelectItem value="none" disabled>
                    No weeks available for submission
                  </SelectItem>
                )}
              </SelectContent>
            );

            const reviewForm = (
              <form onSubmit={handleSubmit} className="space-y-5 rounded-xl bg-secondary/50 p-6">
                <h3 className="font-display font-semibold text-foreground text-lg">Submit a Review</h3>

                {/* Row 1: Name, Email, Week */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Student Name</Label>
                    <Input
                      value={profile?.full_name ?? ""}
                      disabled
                      className="bg-card border-border"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input
                      value={profile?.email ?? user?.email ?? ""}
                      disabled
                      className="bg-card border-border"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Select Week *</Label>
                    <Select value={selectedWeek} onValueChange={setSelectedWeek}>
                      <SelectTrigger className="bg-card border-border">
                        <SelectValue placeholder="Choose week..." />
                      </SelectTrigger>
                      {weekSelector}
                    </Select>
                  </div>
                </div>

                {/* Row 2: Class, Date, Topic */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Class *</Label>
                    <Select value={className} onValueChange={setClassName}>
                      <SelectTrigger className="bg-card border-border">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Data Analysis">Data Analysis</SelectItem>
                        <SelectItem value="Project Management">Project Management</SelectItem>
                        <SelectItem value="Business Analysis">Business Analysis</SelectItem>
                        <SelectItem value="Cybersecurity">Cybersecurity</SelectItem>
                        <SelectItem value="Software Engineering">Software Engineering</SelectItem>
                        <SelectItem value="Data Engineering">Data Engineering</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Date of Class</Label>
                    <Input
                      type="date"
                      value={classDate}
                      onChange={(e) => setClassDate(e.target.value)}
                      className="bg-card border-border"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Topic Covered *</Label>
                    <Input
                      value={topicCovered}
                      onChange={(e) => setTopicCovered(e.target.value)}
                      placeholder="e.g. Introduction to SQL"
                      className="bg-card border-border"
                    />
                  </div>
                </div>

                {/* Row 3: Tutor Name + Rating */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Tutor Name *</Label>
                    <Input
                      value={tutorName}
                      onChange={(e) => setTutorName(e.target.value)}
                      placeholder="Name of the tutor"
                      className="bg-card border-border"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      Tutor Rating *
                      <Star className="w-4 h-4 text-amber-500" />
                    </Label>
                    <Select value={tutorRating} onValueChange={setTutorRating}>
                      <SelectTrigger className="bg-card border-border">
                        <SelectValue placeholder="Rate the tutor..." />
                      </SelectTrigger>
                      <SelectContent>
                        {TUTOR_RATINGS.map((r) => (
                          <SelectItem key={r} value={r}>{r}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Dynamic Questions from Admin */}
                {questions.length > 0 && (
                  <div className="space-y-4 rounded-lg bg-card border border-border p-4">
                    <h4 className="font-display font-semibold text-foreground text-sm">Session Questions</h4>
                    {questions.map((q) => (
                      <div key={q.id} className="space-y-2">
                        <Label className="text-sm">
                          {q.question_number}. {q.question_text} *
                        </Label>
                        <Textarea
                          value={questionAnswers[q.question_number] || ""}
                          onChange={(e) =>
                            setQuestionAnswers((prev) => ({
                              ...prev,
                              [q.question_number]: e.target.value,
                            }))
                          }
                          placeholder="Your answer..."
                          className="bg-secondary border-border min-h-[80px]"
                        />
                      </div>
                    ))}
                  </div>
                )}

                {/* Main Review - About Delvetek */}
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">
                    Overall Delvetek Experience Review *
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    This review is about your experience with Delvetek as a whole — not a specific tutor.
                  </p>
                  <Textarea
                    value={mainReview}
                    onChange={(e) => setMainReview(e.target.value)}
                    placeholder="Please share your overall experience with Delvetek training, including what you learned, the structure of the program, and how it has helped you. Avoid focusing only on the tutor."
                    className="bg-card border-border min-h-[140px]"
                  />
                </div>

                <Button type="submit" disabled={isSubmitting} variant="hero" className="w-full h-11">
                  {isSubmitting ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</>
                  ) : (
                    "Submit Review"
                  )}
                </Button>
              </form>
            );

            return isUnrestricted ? reviewForm : (
              <SubmissionWindowBanner>{reviewForm}</SubmissionWindowBanner>
            );
          })()}

          {submittedWeeks.size === 8 && (
            <div className="text-center py-6 rounded-xl bg-primary/10">
              <CheckCircle2 className="w-8 h-8 text-primary mx-auto mb-2" />
              <p className="font-display font-semibold text-foreground">All reviews submitted! 🎉</p>
              <p className="text-sm text-muted-foreground">You've completed all 8 weekly reviews.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Trustpilot Prompt Dialog */}
      <Dialog open={showTrustpilot} onOpenChange={setShowTrustpilot}>
        <DialogContent className="bg-card border-border max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display text-foreground text-center">
              Thank you for your review! 🎉
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 text-center">
            <p className="text-sm text-muted-foreground">
              We'd love it if you could also share your experience on Trustpilot. 
              Your feedback helps other students discover Delvetek!
            </p>
            <div className="flex items-center justify-center gap-1">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star key={i} className="w-6 h-6 text-amber-500 fill-amber-500" />
              ))}
            </div>
            <Button
              variant="hero"
              className="w-full"
              onClick={() => {
                window.open("https://www.trustpilot.com/review/delvetek.com", "_blank");
                setShowTrustpilot(false);
              }}
            >
              <ExternalLink className="w-4 h-4 mr-2" /> Leave a Trustpilot Review
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="w-full"
              onClick={() => setShowTrustpilot(false)}
            >
              Maybe later
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default WeeklyReviews;
