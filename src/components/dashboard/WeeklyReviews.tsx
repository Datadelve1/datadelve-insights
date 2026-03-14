import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
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
import { FileText, CheckCircle2, Loader2, Video, PenLine, Upload } from "lucide-react";

interface WeeklyReview {
  id: string;
  week_number: number;
  video_url: string | null;
  written_reflection: string | null;
  comments: string;
  created_at: string;
}

const WeeklyReviews = () => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [reviews, setReviews] = useState<WeeklyReview[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedWeek, setSelectedWeek] = useState("");
  const [reflectionType, setReflectionType] = useState<"video" | "written">("written");
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [writtenReflection, setWrittenReflection] = useState("");
  const [comments, setComments] = useState("");

  useEffect(() => {
    fetchReviews();
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

  const submittedWeeks = new Set(reviews.map((r) => r.week_number));

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
    if (reflectionType === "video" && !videoFile) {
      toast({ title: "Please select a video file", variant: "destructive" });
      return;
    }
    if (reflectionType === "written" && !writtenReflection.trim()) {
      toast({ title: "Please write your reflection", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    try {
      let uploadedVideoUrl: string | null = null;
      if (reflectionType === "video" && videoFile) {
        const ext = videoFile.name.split(".").pop();
        const path = `weekly-videos/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
        const { error: uploadError } = await supabase.storage.from("form-uploads").upload(path, videoFile);
        if (uploadError) throw new Error(`Upload failed: ${uploadError.message}`);
        const { data: urlData } = supabase.storage.from("form-uploads").getPublicUrl(path);
        uploadedVideoUrl = urlData.publicUrl;
      }

      const { error } = await supabase.from("weekly_reviews").insert({
        user_id: user!.id,
        full_name: profile?.full_name ?? "",
        email: profile?.email ?? user!.email ?? "",
        week_number: weekNum,
        video_url: uploadedVideoUrl,
        written_reflection: reflectionType === "written" ? writtenReflection.trim() : null,
        comments: comments.trim(),
      });
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
      setSelectedWeek("");
      setVideoFile(null);
      setWrittenReflection("");
      setComments("");
      fetchReviews();
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
        {submittedWeeks.size < 8 && (
          <form onSubmit={handleSubmit} className="space-y-4 rounded-xl bg-secondary/50 p-6">
            <h3 className="font-display font-semibold text-foreground">Submit a Review</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Select Week *</Label>
                <Select value={selectedWeek} onValueChange={setSelectedWeek}>
                  <SelectTrigger className="bg-card border-border">
                    <SelectValue placeholder="Choose week..." />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 8 }, (_, i) => i + 1)
                      .filter((w) => !submittedWeeks.has(w))
                      .map((w) => (
                        <SelectItem key={w} value={String(w)}>
                          Week {w} {w >= 7 ? "(Project)" : ""}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Reflection Type *</Label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant={reflectionType === "written" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setReflectionType("written")}
                    className="flex-1"
                  >
                    <PenLine className="w-4 h-4 mr-1" /> Written
                  </Button>
                  <Button
                    type="button"
                    variant={reflectionType === "video" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setReflectionType("video")}
                    className="flex-1"
                  >
                    <Video className="w-4 h-4 mr-1" /> Video
                  </Button>
                </div>
              </div>
            </div>

            {reflectionType === "video" ? (
              <div className="space-y-2">
                <Label>Video URL *</Label>
                <Input
                  type="url"
                  placeholder="Paste your video link (YouTube, Loom, etc.)"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  className="bg-card border-border"
                />
              </div>
            ) : (
              <div className="space-y-2">
                <Label>Written Reflection *</Label>
                <Textarea
                  placeholder="What did you learn this week? What stood out?"
                  value={writtenReflection}
                  onChange={(e) => setWrittenReflection(e.target.value)}
                  className="bg-card border-border min-h-[120px]"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label>Additional Comments (optional)</Label>
              <Textarea
                placeholder="Any questions, feedback, or notes..."
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                className="bg-card border-border"
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
        )}

        {submittedWeeks.size === 8 && (
          <div className="text-center py-6 rounded-xl bg-primary/10">
            <CheckCircle2 className="w-8 h-8 text-primary mx-auto mb-2" />
            <p className="font-display font-semibold text-foreground">All reviews submitted! 🎉</p>
            <p className="text-sm text-muted-foreground">You've completed all 8 weekly reviews.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default WeeklyReviews;
