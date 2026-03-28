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

const UNRESTRICTED_EMAILS = [
  "edwardolamide925@gmail.com",
  "koredesax1@gmail.com",
  "oloyedeopeyemi253@gmail.com",
];

const TUTOR_RATINGS = ["Excellent", "Good", "Fair"] as const;

const SESSIONS = Array.from({ length: 8 }, (_, w) => [
  { week: w + 1, day: "friday" as const, label: `Week ${w + 1} Friday` },
  { week: w + 1, day: "saturday" as const, label: `Week ${w + 1} Saturday` },
]).flat();

const GOOGLE_REVIEW_URL = "https://g.page/r/delvetek/review";

const WeeklyReviews = ({ attendance, submittedReviews, onReviewSubmitted }: WeeklyReviewsProps) => {
  const { user, profile, isAdmin } = useAuth();
  const isUnrestricted =
    UNRESTRICTED_EMAILS.includes(profile?.email ?? user?.email ?? "") ||
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
      const { data } = await supabase
        .from("review_questions" as any)
        .select("*")
        .eq("is_active", true)
        .order("question_number");
      setQuestions((data as any as ReviewQuestion[]) || []);
    };
    fetchQuestions();
  }, []);

  const triggerGoogleReview = (weekNum: number) => {
    setPendingWeek(weekNum);
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
    if (!user || !pendingWeek) return;
    await supabase.from("google_review_confirmations" as any).insert({
      user_id: user.id,
      week_number: pendingWeek,
    });
    setShowGoogleReview(false);
    setPendingWeek(null);
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
      triggerGoogleReview(weekNum);
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
      // Upload video
      const ext = videoFile.name.split(".").pop();
      const storagePath = `reviews/${user.id}/week-${weekNum}-saturday/${Date.now()}.${ext}`;
      setUploadProgress(10);

      const { error: uploadError } = await supabase.storage
        .from("student-videos")
        .upload(storagePath, videoFile, { upsert: false });
      if (uploadError) throw new Error(`Upload failed: ${uploadError.message}`);
      setUploadProgress(70);

      const { data: signedData, error: signedError } = await supabase.storage
        .from("student-videos")
        .createSignedUrl(storagePath, 365 * 24 * 60 * 60);
      if (signedError) throw signedError;
      setUploadProgress(90);

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
      triggerGoogleReview(weekNum);
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
                      {submitted
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
            const sessionLabel = `Week ${weekNum} ${isFriday ? "Friday" : "Saturday"}`;

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
            return (
              <form onSubmit={handleSaturdaySubmit} className="space-y-5 rounded-xl bg-secondary/50 p-6">
                {commonFields}

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
                    purposes. I understand this video will be reviewed by the Super Admin before being
                    published.
                  </label>
                </div>

                {uploadProgress > 0 && uploadProgress < 100 && (
                  <div className="space-y-1">
                    <Progress value={uploadProgress} className="h-2" />
                    <p className="text-xs text-muted-foreground">Uploading video...</p>
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

      {/* Mandatory Google Review Dialog */}
      <Dialog open={showGoogleReview} onOpenChange={() => {}}>
        <DialogContent className="bg-card border-border max-w-md [&>button]:hidden">
          <DialogHeader>
            <DialogTitle className="font-display text-foreground text-center">
              📢 Google Review Required
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 text-center">
            <p className="text-sm text-muted-foreground">
              To complete your submission, you must post a Google Review for Delvetek.
              Click the button below — a suggested review text will be copied to your clipboard.
            </p>
            <div className="rounded-lg bg-secondary p-3 text-xs text-muted-foreground text-left">
              <p className="font-semibold text-foreground mb-1">Suggested Review (will be copied):</p>
              <p className="italic">
                "I'm currently enrolled in Delvetek's Data Analysis training program and it has been an incredible experience. The sessions are practical, well-structured, and the tutors are knowledgeable. I highly recommend Delvetek for anyone looking to build a career in data and tech."
              </p>
              <p className="mt-2 text-primary font-medium">Feel free to personalize it!</p>
            </div>
            <div className="flex items-center justify-center gap-1">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star key={i} className="w-6 h-6 text-amber-500 fill-amber-500" />
              ))}
            </div>

            {!googleReviewOpened ? (
              <Button
                variant="hero"
                className="w-full"
                onClick={handleGoogleReviewOpen}
              >
                <ExternalLink className="w-4 h-4 mr-2" /> Open Google Reviews & Copy Text
              </Button>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center gap-2 justify-center text-sm text-primary">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Google Review page opened</span>
                </div>
                <Button
                  variant="hero"
                  className="w-full"
                  onClick={handleGoogleReviewConfirm}
                >
                  <CheckCircle2 className="w-4 h-4 mr-2" /> I've Posted My Google Review
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleGoogleReviewOpen}
                >
                  <ExternalLink className="w-4 h-4 mr-2" /> Open Google Again
                </Button>
              </div>
            )}

            <p className="text-[10px] text-muted-foreground">
              You cannot close this dialog until you confirm your Google Review.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default WeeklyReviews;
