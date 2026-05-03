import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { ALL_SESSIONS as PROGRAM_SESSIONS, getSessionISODate } from "@/lib/programDates";
import { ADMIN_EMAILS } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  FileText,
  CheckCircle2,
  Loader2,
  Star,
  ExternalLink,
  Lock,
  Clock,
  Video,
  Upload,
  FileVideo,
  PenLine,
} from "lucide-react";
import { canSubmitReview } from "@/lib/attendanceAccess";

interface ReviewQuestion {
  id: string;
  question_number: number;
  question_text: string;
  is_active: boolean;
}

interface WeeklyReviewsProps {
  attendance: Record<string, string>;
  submittedReviews: Record<string, boolean>;
  onReviewSubmitted: () => void;
}


const TUTOR_RATINGS = ["Excellent", "Good", "Fair"] as const;

const SESSIONS = PROGRAM_SESSIONS;

const GOOGLE_REVIEW_URL = "https://g.page/r/delvetek/review";

const WEEK_6_VIDEO_QUESTIONS = [
  "What were you doing before Delvetek?",
  "What did you achieve during/after the program?",
  "What measurable change happened? (job, income, skills, project)",
];

const WEEK_6_VIDEO_SCRIPT = `Hi, my name is [Full Name], and I'm a participant of Delvetek's [Cohort Name/Number].

Before joining Delvetek, I was [your situation before — e.g. struggling to learn on my own / unemployed / switching careers / lacking structure].

One of the biggest challenges I faced was [specific problem — e.g. expensive courses, no clear roadmap, inconsistency].

During the program, I was able to:
• [Skill or tool learned]
• [Project built or milestone achieved]
• [Any measurable progress]

After completing (or during) the program:
I have [clear outcome — e.g. built X project / started freelancing / got a job / improved my income / gained confidence to apply for roles].

What made Delvetek different was [structure / affordability / mentorship / community — be specific].

If you're someone who is [target audience], I would recommend Delvetek because [reason based on real experience].

Thank you.`;

const WeeklyReviews = ({ attendance, submittedReviews, onReviewSubmitted }: WeeklyReviewsProps) => {
  const { user, profile, isAdmin } = useAuth();
  const isUnrestricted =
    isAdmin ||
    ADMIN_EMAILS.includes(profile?.email ?? user?.email ?? "");
  const { toast } = useToast();
  const [questions, setQuestions] = useState<ReviewQuestion[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showGoogleReview, setShowGoogleReview] = useState(false);
  const [pendingWeek, setPendingWeek] = useState<number | null>(null);
  const [pendingDay, setPendingDay] = useState<string | null>(null);
  const [googleReviewOpened, setGoogleReviewOpened] = useState(false);
  const [activeSession, setActiveSession] = useState<string | null>(null); // "1-friday"

  // Common form state
  const [className, setClassName] = useState("Data Analysis");
  const [classDate, setClassDate] = useState("");
  const [topicCovered, setTopicCovered] = useState("");
  const [tutorName, setTutorName] = useState("");
  const [tutorRating, setTutorRating] = useState("");

  // Friday-specific
  const [questionAnswers, setQuestionAnswers] = useState<Record<number, string>>({});
  const [mainReview, setMainReview] = useState("");

  // Saturday-specific
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [consent, setConsent] = useState(false);
  const [optionalWrittenReview, setOptionalWrittenReview] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    const fetchQuestions = async () => {
      // Determine student's cohort
      let studentCohort = "Cohort 1";
      if (user) {
        const { data: enrollment } = await supabase
          .from("cohort2_enrollments")
          .select("cohort")
          .eq("user_id", user.id)
          .eq("payment_status", "paid")
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();
        studentCohort = enrollment?.cohort ?? "Cohort 1";
      }

      const { data } = await supabase
        .from("review_questions" as any)
        .select("*")
        .eq("is_active", true)
        .eq("cohort", studentCohort)
        .order("question_number");
      setQuestions((data as any as ReviewQuestion[]) || []);
    };
    fetchQuestions();
  }, [user]);

  const triggerGoogleReview = (weekNum: number, day: string) => {
    setPendingWeek(weekNum);
    setPendingDay(day);
    setGoogleReviewOpened(false);
    setShowGoogleReview(true);
  };

  const handleGoogleReviewOpen = () => {
    const suggestedText = `I'm currently enrolled in Delvetek's Data Analysis training program and it has been an incredible experience. The sessions are practical, well-structured, and the tutors are knowledgeable. I highly recommend Delvetek for anyone looking to build a career in data and tech.`;
    navigator.clipboard.writeText(suggestedText).then(() => {
      toast({ title: "Review text copied! 📋", description: "Paste it in the Google Review box and customize it." });
    }).catch(() => {});
    window.open(GOOGLE_REVIEW_URL, "_blank");
    setGoogleReviewOpened(true);
  };

  const handleGoogleReviewConfirm = async () => {
    if (!user || !pendingWeek || !pendingDay) return;
    await supabase.from("google_review_confirmations" as any).insert({
      user_id: user.id,
      week_number: pendingWeek,
      session_day: pendingDay,
    });
    setShowGoogleReview(false);
    setPendingWeek(null);
    setPendingDay(null);
    setGoogleReviewOpened(false);
    toast({ title: "Google Review confirmed! ✅", description: "Thank you for supporting Delvetek." });
    onReviewSubmitted();
  };

  const resetForm = () => {
    setClassName("Data Analysis");
    setClassDate("");
    setTopicCovered("");
    setTutorName("");
    setTutorRating("");
    setQuestionAnswers({});
    setMainReview("");
    setVideoFile(null);
    setConsent(false);
    setOptionalWrittenReview("");
    setUploadProgress(0);
    setActiveSession(null);
  };

  const validateCommonFields = (): boolean => {
    if (!classDate) {
      toast({ title: "Please select the class date", variant: "destructive" });
      return false;
    }
    if (!topicCovered.trim()) {
      toast({ title: "Please enter the topic covered", variant: "destructive" });
      return false;
    }
    if (!tutorName.trim()) {
      toast({ title: "Please enter the tutor name", variant: "destructive" });
      return false;
    }
    if (!tutorRating) {
      toast({ title: "Please rate the tutor", variant: "destructive" });
      return false;
    }
    return true;
  };

  const handleFridaySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSession || !user) return;
    if (!validateCommonFields()) return;

    if (!mainReview.trim()) {
      toast({ title: "Please write your overall review", variant: "destructive" });
      return;
    }
    const unanswered = questions.filter((q) => !questionAnswers[q.question_number]?.trim());
    if (unanswered.length > 0) {
      toast({ title: `Please answer all ${questions.length} questions`, variant: "destructive" });
      return;
    }

    const [weekStr] = activeSession.split("-");
    const weekNum = parseInt(weekStr);

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from("weekly_reviews").insert({
        user_id: user.id,
        full_name: profile?.full_name ?? "",
        email: profile?.email ?? user.email ?? "",
        week_number: weekNum,
        session_day: "friday",
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

      supabase.functions.invoke("send-weekly-review-confirmation", {
        body: {
          email: profile?.email ?? user.email,
          full_name: profile?.full_name,
          week_number: weekNum,
        },
      });

      toast({ title: "Friday review submitted! 🎉", description: `Week ${weekNum} Friday review recorded.` });
      resetForm();
      onReviewSubmitted();
      // Google Review on hold — will re-enable once link is ready
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaturdaySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSession || !user) return;
    if (!validateCommonFields()) return;

    if (!videoFile) {
      toast({ title: "Please upload your face video review", variant: "destructive" });
      return;
    }
    if (!consent) {
      toast({ title: "Please provide consent to proceed", variant: "destructive" });
      return;
    }

    const [weekStr] = activeSession.split("-");
    const weekNum = parseInt(weekStr);

    setIsSubmitting(true);
    try {
      // Upload video with real-time progress
      const ext = videoFile.name.split(".").pop();
      const storagePath = `${user.id}/reviews/week-${weekNum}-saturday/${Date.now()}.${ext}`;

      const { uploadWithProgress } = await import("@/lib/uploadWithProgress");
      await uploadWithProgress({
        bucket: "student-videos",
        path: storagePath,
        file: videoFile,
        onProgress: (p) => setUploadProgress(p),
      });
      setUploadProgress(92);

      const { data: signedData, error: signedError } = await supabase.storage
        .from("student-videos")
        .createSignedUrl(storagePath, 365 * 24 * 60 * 60);
      if (signedError) throw signedError;
      setUploadProgress(95);

      const { error } = await supabase.from("weekly_reviews").insert({
        user_id: user.id,
        full_name: profile?.full_name ?? "",
        email: profile?.email ?? user.email ?? "",
        week_number: weekNum,
        session_day: "saturday",
        written_reflection: optionalWrittenReview.trim() || null,
        comments: "",
        video_url: signedData.signedUrl,
        class_name: className,
        class_date: classDate || null,
        topic_covered: topicCovered.trim(),
        tutor_name: tutorName.trim(),
        tutor_rating: tutorRating,
        question_answers: {},
      } as any);
      if (error) throw error;
      setUploadProgress(100);

      supabase.functions.invoke("send-weekly-review-confirmation", {
        body: {
          email: profile?.email ?? user.email,
          full_name: profile?.full_name,
          week_number: weekNum,
        },
      });

      toast({ title: "Saturday video review submitted! 🎬", description: `Week ${weekNum} Saturday review recorded.` });
      resetForm();
      onReviewSubmitted();
      // Google Review on hold — will re-enable once link is ready
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
      setUploadProgress(0);
    }
  };

  const totalSubmitted = Object.values(submittedReviews).filter(Boolean).length;

  return (
    <>
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="font-display flex items-center gap-2 text-foreground">
            <FileText className="w-5 h-5 text-primary" /> Session Reviews
            <span className="ml-auto text-xs font-normal text-muted-foreground">
              {totalSubmitted} / 16 submitted
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Session Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {SESSIONS.map((s) => {
              const key = `${s.week}-${s.day}`;
              const submitted = !!submittedReviews[key];
              const attended = attendance[key] === "present";
              const timeReady = isUnrestricted || canSubmitReview(s.week, s.day, attendance, isAdmin);
              const available = !submitted && (isUnrestricted || (attended && timeReady));
              const isActive = activeSession === key;
              const isFriday = s.day === "friday";

              return (
                <button
                  key={key}
                  onClick={() => {
                    if (submitted) return;
                    if (!available && !isAdmin) return;
                    setActiveSession(isActive ? null : key);
                    // Auto-fill class date when selecting a session
                    setClassDate(s.fullDate);
                  }}
                  disabled={submitted || (!available && !isAdmin)}
                  className={`flex items-center gap-2 rounded-lg p-3 text-sm text-left transition-all ${
                    submitted
                      ? "bg-primary/10 border border-primary/20"
                      : isActive
                      ? "bg-primary/20 border-2 border-primary ring-2 ring-primary/20"
                      : available || isAdmin
                      ? "bg-secondary hover:bg-secondary/80 border border-border cursor-pointer"
                      : "bg-muted/50 border border-border/50"
                  }`}
                >
                  {submitted ? (
                    <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                  ) : available || isAdmin ? (
                    isFriday ? (
                      <PenLine className="w-4 h-4 text-foreground shrink-0" />
                    ) : (
                      <Video className="w-4 h-4 text-foreground shrink-0" />
                    )
                  ) : !attended ? (
                    <Lock className="w-4 h-4 text-muted-foreground shrink-0" />
                  ) : (
                    <Clock className="w-4 h-4 text-muted-foreground shrink-0" />
                  )}
                  <div className="min-w-0">
                    <span
                      className={`block truncate ${
                        submitted
                          ? "text-foreground font-medium"
                          : available || isAdmin
                          ? "text-foreground"
                          : "text-muted-foreground"
                      }`}
                    >
                      W{s.week} {isFriday ? "Fri" : "Sat"}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      {s.dateLabel} · {submitted
                        ? isFriday
                          ? "Written ✓"
                          : "Video ✓"
                        : isFriday
                        ? "Written"
                        : "Video"}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Active Session Form */}
          {activeSession && (() => {
            const [weekStr, day] = activeSession.split("-");
            const weekNum = parseInt(weekStr);
            const isFriday = day === "friday";
            const sessionInfo = SESSIONS.find(s => s.week === weekNum && s.day === (isFriday ? "friday" : "saturday"));
            const sessionLabel = `Week ${weekNum} ${isFriday ? "Friday" : "Saturday"} (${sessionInfo?.dateLabel || ""})`;

            const commonFields = (
              <>
                <h3 className="font-display font-semibold text-foreground text-lg">
                  {isFriday ? "📝 Written Review" : "🎬 Video Review"} — {sessionLabel}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {isFriday
                    ? "Complete the written review for this Friday session."
                    : "Upload a face video explaining your Delvetek experience for this Saturday session."}
                </p>

                {/* Row 1: Name, Email */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Student Name</Label>
                    <Input value={profile?.full_name ?? ""} disabled className="bg-card border-border" />
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input value={profile?.email ?? user?.email ?? ""} disabled className="bg-card border-border" />
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
                          <SelectItem key={r} value={r}>
                            {r}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </>
            );

            if (isFriday) {
              return (
                <form onSubmit={handleFridaySubmit} className="space-y-5 rounded-xl bg-secondary/50 p-6">
                  {commonFields}

                  {/* Dynamic Questions */}
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

                  {/* Main Written Review */}
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold">Overall Delvetek Experience Review *</Label>
                    <p className="text-xs text-muted-foreground">
                      Share your overall experience with Delvetek — not just the tutor.
                    </p>
                    <Textarea
                      value={mainReview}
                      onChange={(e) => setMainReview(e.target.value)}
                      placeholder="Share your overall experience with Delvetek training, what you learned, and how it has helped you."
                      className="bg-card border-border min-h-[140px]"
                    />
                  </div>

                  <Button type="submit" disabled={isSubmitting} variant="hero" className="w-full h-11">
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" /> Submitting...
                      </>
                    ) : (
                      "Submit Friday Review"
                    )}
                  </Button>
                </form>
              );
            }

            // Saturday - Video Review
            const showWeek6VideoGuidance = weekNum === 6;

            return (
              <form onSubmit={handleSaturdaySubmit} className="space-y-5 rounded-xl bg-secondary/50 p-6">
                {!showWeek6VideoGuidance && commonFields}

                {showWeek6VideoGuidance && (
                  <div className="space-y-4 rounded-xl border border-primary/20 bg-primary/5 p-4">
                    <div className="space-y-1">
                      <h4 className="font-display font-semibold text-foreground text-sm">
                        Week 6 video review instructions
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        Answer these prompts in your video and use the script below as your guide.
                      </p>
                    </div>

                    <div className="space-y-2 rounded-lg border border-border bg-card p-4">
                      <p className="text-sm font-semibold text-foreground">Questions to cover</p>
                      <ol className="list-decimal space-y-1 pl-5 text-sm text-muted-foreground">
                        {WEEK_6_VIDEO_QUESTIONS.map((question) => (
                          <li key={question}>{question}</li>
                        ))}
                      </ol>
                    </div>

                    <div className="space-y-2 rounded-lg border border-border bg-card p-4">
                      <p className="text-sm font-semibold text-foreground">Suggested script</p>
                      <pre className="whitespace-pre-wrap font-body text-sm leading-relaxed text-muted-foreground">
                        {WEEK_6_VIDEO_SCRIPT}
                      </pre>
                    </div>
                  </div>
                )}

                {/* Video Upload */}
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Face Video Review * 🎬</Label>
                  <p className="text-xs text-muted-foreground">
                    Record a video explaining how the Delvetek training has helped you, your learning
                    outcomes, and overall experience. Your face must be visible.
                  </p>
                  <label className="flex items-center gap-3 p-4 rounded-xl border-2 border-dashed border-border cursor-pointer transition-colors hover:border-primary/50 bg-card">
                    <FileVideo className="w-5 h-5 text-primary shrink-0" />
                    <span className="text-sm text-muted-foreground truncate">
                      {videoFile ? videoFile.name : "Click to select a video file (any format/size)"}
                    </span>
                    <input
                      type="file"
                      accept="video/*"
                      className="hidden"
                      onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
                    />
                  </label>
                  {videoFile && (
                    <p className="text-xs text-muted-foreground">
                      Size: {(videoFile.size / (1024 * 1024)).toFixed(1)} MB
                    </p>
                  )}
                </div>

                {/* Optional Written Review */}
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">
                    Overall Delvetek Experience Review (Optional)
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Optionally add a written review alongside your video.
                  </p>
                  <Textarea
                    value={optionalWrittenReview}
                    onChange={(e) => setOptionalWrittenReview(e.target.value)}
                    placeholder="Share your written thoughts (optional on Saturdays)..."
                    className="bg-card border-border min-h-[100px]"
                  />
                </div>

                {/* Consent */}
                <div className="flex items-start gap-3 p-4 rounded-lg bg-card border border-border">
                  <Checkbox
                    id="review-consent"
                    checked={consent}
                    onCheckedChange={(checked) => setConsent(!!checked)}
                    className="mt-0.5"
                  />
                  <label htmlFor="review-consent" className="text-sm text-muted-foreground cursor-pointer leading-relaxed">
                    I consent to Delvetek using my submitted video for training proof and promotional
                    purposes.
                  </label>
                </div>

                {uploadProgress > 0 && uploadProgress < 100 && (
                  <div className="space-y-1">
                    <Progress value={uploadProgress} className="h-2" />
                    <p className="text-xs text-muted-foreground">Uploading video... {uploadProgress}%</p>
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={isSubmitting || !consent || !videoFile}
                  variant="hero"
                  className="w-full h-11"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />{" "}
                      {uploadProgress > 0 ? "Uploading..." : "Submitting..."}
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" /> Submit Saturday Video Review
                    </>
                  )}
                </Button>
              </form>
            );
          })()}

          {totalSubmitted >= 16 && (
            <div className="text-center py-6 rounded-xl bg-primary/10">
              <CheckCircle2 className="w-8 h-8 text-primary mx-auto mb-2" />
              <p className="font-display font-semibold text-foreground">All reviews submitted! 🎉</p>
              <p className="text-sm text-muted-foreground">You've completed all 16 session reviews.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Google Review Dialog — on hold until link is ready */}
    </>
  );
};

export default WeeklyReviews;
