import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Upload, FileVideo, Loader2, CheckCircle2, Video } from "lucide-react";

const WEEK_1_START = new Date("2025-03-27");

function getWeekNumber(sessionDate: Date): number {
  const diffMs = sessionDate.getTime() - WEEK_1_START.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  return Math.max(1, Math.floor(diffDays / 7) + 1);
}

function getSessionDates(): { label: string; value: string; week: number }[] {
  const dates: { label: string; value: string; week: number }[] = [];
  const today = new Date();
  for (let week = 1; week <= 8; week++) {
    // Friday
    const friday = new Date(WEEK_1_START);
    friday.setDate(friday.getDate() + (week - 1) * 7);
    // Saturday
    const saturday = new Date(friday);
    saturday.setDate(saturday.getDate() + 1);

    if (friday <= today) {
      dates.push({
        label: `Week ${week} - Friday ${friday.toLocaleDateString("en-GB", { day: "numeric", month: "short" })}`,
        value: friday.toISOString().split("T")[0],
        week,
      });
    }
    if (saturday <= today) {
      dates.push({
        label: `Week ${week} - Saturday ${saturday.toLocaleDateString("en-GB", { day: "numeric", month: "short" })}`,
        value: saturday.toISOString().split("T")[0],
        week,
      });
    }
  }
  return dates;
}

interface Submission {
  id: string;
  week_number: number;
  session_date: string;
  title: string;
  created_at: string;
}

const StudentVideoUpload = () => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [sessionDate, setSessionDate] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [consent, setConsent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loaded, setLoaded] = useState(false);

  const sessionDates = getSessionDates();

  const fetchSubmissions = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("student_video_submissions")
      .select("id, week_number, session_date, title, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    setSubmissions((data as Submission[]) || []);
    setLoaded(true);
  };

  useState(() => {
    fetchSubmissions();
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !videoFile || !sessionDate || !consent) {
      toast({ title: "Please fill all required fields and provide consent", variant: "destructive" });
      return;
    }

    const selectedSession = sessionDates.find((d) => d.value === sessionDate);
    if (!selectedSession) return;

    setSubmitting(true);
    try {
      const ext = videoFile.name.split(".").pop();
      const storagePath = `${user.id}/week-${selectedSession.week}/${Date.now()}.${ext}`;

      setUploadProgress(10);
      const { error: uploadError } = await supabase.storage
        .from("student-videos")
        .upload(storagePath, videoFile, { upsert: false });

      if (uploadError) throw new Error(`Upload failed: ${uploadError.message}`);
      setUploadProgress(70);

      // Generate signed URL
      const { data: signedData, error: signedError } = await supabase.storage
        .from("student-videos")
        .createSignedUrl(storagePath, 365 * 24 * 60 * 60);

      if (signedError) throw signedError;
      setUploadProgress(90);

      const { error: insertError } = await supabase
        .from("student_video_submissions")
        .insert({
          user_id: user.id,
          student_name: profile?.full_name || user.email || "Unknown",
          week_number: selectedSession.week,
          session_date: sessionDate,
          title: title.trim() || `Session ${sessionDate}`,
          description: description.trim(),
          video_url: signedData.signedUrl,
          storage_path: storagePath,
          consent_given: true,
        });

      if (insertError) throw insertError;
      setUploadProgress(100);

      toast({ title: "Video submitted successfully! 🎬" });
      setTitle("");
      setDescription("");
      setVideoFile(null);
      setConsent(false);
      setSessionDate("");
      setUploadProgress(0);
      fetchSubmissions();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setSubmitting(false);
      setUploadProgress(0);
    }
  };

  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle className="font-display flex items-center gap-2 text-foreground">
          <Video className="w-5 h-5 text-primary" /> Submit Session Video
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <p className="text-sm text-muted-foreground">
          Upload a video after each session (Friday/Saturday). Videos are securely stored and only accessible by authorized reviewers.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Session Date *</Label>
              <Select value={sessionDate} onValueChange={setSessionDate}>
                <SelectTrigger className="bg-secondary border-border">
                  <SelectValue placeholder="Select session" />
                </SelectTrigger>
                <SelectContent>
                  {sessionDates.length === 0 ? (
                    <SelectItem value="none" disabled>No sessions available yet</SelectItem>
                  ) : (
                    sessionDates.map((d) => (
                      <SelectItem key={d.value} value={d.value}>
                        {d.label}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Title (optional)</Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. My Week 1 Reflection"
                className="bg-secondary border-border"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Description (optional)</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of your video..."
              className="bg-secondary border-border"
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label>Video File *</Label>
            <label className="flex items-center gap-3 p-4 rounded-xl border-2 border-dashed border-border cursor-pointer transition-colors hover:border-primary/50 bg-secondary">
              <FileVideo className="w-5 h-5 text-primary shrink-0" />
              <span className="text-sm text-muted-foreground truncate">
                {videoFile ? videoFile.name : "Click to select a video file (MP4, WebM, MOV — max 500MB)"}
              </span>
              <input
                type="file"
                accept="video/mp4,video/webm,video/quicktime"
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

          {/* Consent checkbox */}
          <div className="flex items-start gap-3 p-4 rounded-lg bg-secondary border border-border">
            <Checkbox
              id="consent"
              checked={consent}
              onCheckedChange={(checked) => setConsent(!!checked)}
              className="mt-0.5"
            />
            <label htmlFor="consent" className="text-sm text-muted-foreground cursor-pointer leading-relaxed">
              I consent to DelveTek using my submitted video/testimonial for training proof and promotional purposes, 
              in accordance with data protection policies. I understand this video will only be accessible by authorized 
              administrators and reviewers.
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
            disabled={submitting || !consent || !videoFile || !sessionDate}
            className="w-full h-11"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                {uploadProgress > 0 ? "Uploading..." : "Submitting..."}
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" /> Submit Video
              </>
            )}
          </Button>
        </form>

        {/* Previous submissions */}
        {loaded && submissions.length > 0 && (
          <div className="space-y-3 pt-4 border-t border-border">
            <h3 className="font-display font-semibold text-foreground text-sm">Your Submissions</h3>
            {submissions.map((s) => (
              <div key={s.id} className="flex items-center gap-3 p-3 rounded-lg bg-secondary">
                <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {s.title || `Week ${s.week_number} Video`}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Week {s.week_number} · {new Date(s.session_date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })} · Submitted {new Date(s.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default StudentVideoUpload;
