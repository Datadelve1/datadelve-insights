import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Upload, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";

import { Progress } from "@/components/ui/progress";

const WeeklyReviewForm = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [videoFile, setVideoFile] = useState<File | null>(null);

  const [form, setForm] = useState({
    full_name: "",
    email: "",
    week_number: "",
    written_reflection: "",
    comments: "",
  });

  const theme = {
    bg: "#FAF8F5", bgAlt: "#F2EDE6", text: "#1A1A1A", textMuted: "#5A5A5A",
    gold: "#D4A017", goldLight: "#F5E6B8", border: "#E8E0D4", card: "#FFFFFF",
  };

  const updateField = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const uploadFile = async (file: File) => {
    const ext = file.name.split(".").pop();
    const path = `weekly-videos/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const { uploadWithProgress } = await import("@/lib/uploadWithProgress");
    await uploadWithProgress({
      bucket: "form-uploads",
      path,
      file,
      onProgress: (p) => setUploadProgress(p),
    });
    // form-uploads is now a private bucket — issue a long-lived signed URL for the stored reference.
    const { data, error } = await supabase.storage.from("form-uploads").createSignedUrl(path, 60 * 60 * 24 * 365);
    if (error) throw error;
    return data.signedUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.full_name || !form.email || !form.week_number) {
      toast({ title: "Please fill in all personal details", variant: "destructive" }); return;
    }
    if (!form.written_reflection && !videoFile) {
      toast({ title: "Please submit either a written reflection or video", variant: "destructive" }); return;
    }

    setIsLoading(true);
    try {
      let vidUrl: string | null = null;
      if (videoFile) {
        vidUrl = await uploadFile(videoFile);
      }

      const { error } = await supabase.from("weekly_reviews" as any).insert({
        full_name: form.full_name.trim(),
        email: form.email.trim(),
        week_number: parseInt(form.week_number),
        written_reflection: form.written_reflection.trim() || null,
        video_url: vidUrl,
        comments: form.comments.trim(),
      });
      if (error) throw error;

      await supabase.functions.invoke("send-weekly-review-confirmation", {
        body: { email: form.email.trim(), full_name: form.full_name.trim(), week_number: form.week_number },
      });

      toast({ title: "Review submitted! 🎉", description: "Check your email for confirmation." });
      setForm({ full_name: "", email: "", week_number: "", written_reflection: "", comments: "" });
      setVideoFile(null);
      setUploadProgress(0);
    } catch (err: any) {
      toast({ title: "Something went wrong", description: err.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
      setUploadProgress(0);
    }
  };

  const weeks = Array.from({ length: 24 }, (_, i) => i + 1);

  return (
    <div className="min-h-screen font-body" style={{ background: theme.bg, color: theme.text }}>
      <div className="container mx-auto px-6 py-12 max-w-3xl">
        <Link to="/" className="inline-flex items-center gap-2 mb-8 text-sm font-medium hover:underline" style={{ color: theme.gold }}>
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>

        <div className="rounded-3xl p-8 md:p-12 border" style={{ background: theme.card, borderColor: theme.border }}>
          <h1 className="font-display text-3xl md:text-4xl font-bold mb-3" style={{ color: theme.text }}>
            Delvetek Weekly Class Review – Data Analysis Training
          </h1>
          <p className="mb-4 leading-relaxed" style={{ color: theme.textMuted }}>
            Welcome to the Delvetek Weekly Review Form! After each live session, submit your reflection on what you learned. All fields are required. You may submit a written reflection or a video.
          </p>
          <p className="mb-2 font-semibold text-sm" style={{ color: theme.text }}>Why this matters:</p>
          <ul className="mb-10 space-y-1 text-sm" style={{ color: theme.textMuted }}>
            <li>• Ensures participation is recorded</li>
            <li>• Gives access to next class recordings</li>
            <li>• Tracks eligibility for certificates, references, and future programs</li>
          </ul>

          <form onSubmit={handleSubmit} className="space-y-10">
            {/* Section 1 */}
            <div>
              <h2 className="font-display text-xl font-semibold mb-6 pb-2 border-b" style={{ color: theme.gold, borderColor: theme.border }}>
                Section 1 – Personal Details
              </h2>
              <div className="space-y-4">
                <div className="space-y-1">
                  <Label style={{ color: theme.text }}>Full Name *</Label>
                  <Input required value={form.full_name} onChange={(e) => updateField("full_name", e.target.value)} style={{ borderColor: theme.border, background: theme.bg }} />
                </div>
                <div className="space-y-1">
                  <Label style={{ color: theme.text }}>Email Address *</Label>
                  <Input type="email" required value={form.email} onChange={(e) => updateField("email", e.target.value)} style={{ borderColor: theme.border, background: theme.bg }} />
                </div>
                <div className="space-y-1">
                  <Label style={{ color: theme.text }}>Week / Class Number *</Label>
                  <select
                    required
                    value={form.week_number}
                    onChange={(e) => updateField("week_number", e.target.value)}
                    className="flex h-10 w-full rounded-md border px-3 py-2 text-sm"
                    style={{ borderColor: theme.border, background: theme.bg, color: theme.text }}
                  >
                    <option value="">Select week</option>
                    {weeks.map((w) => (
                      <option key={w} value={w}>Week {w}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Section 2 */}
            <div>
              <h2 className="font-display text-xl font-semibold mb-6 pb-2 border-b" style={{ color: theme.gold, borderColor: theme.border }}>
                Section 2 – Learning Reflection
              </h2>
              <p className="text-sm mb-4 p-3 rounded-lg" style={{ background: theme.goldLight, color: theme.text }}>
                ⚠️ At least one option (written or video) must be submitted
              </p>
              <div className="space-y-4">
                <div className="space-y-1">
                  <Label style={{ color: theme.text }}>Written Reflection (required if no video uploaded)</Label>
                  <Textarea
                    value={form.written_reflection}
                    onChange={(e) => updateField("written_reflection", e.target.value)}
                    style={{ borderColor: theme.border, background: theme.bg }}
                    rows={5}
                    placeholder="Share what you learned in this week's class..."
                  />
                </div>
                <div className="space-y-1">
                  <Label style={{ color: theme.text }}>Video Reflection (mp4/mov, max 1GB, face must be visible)</Label>

                  <div
                    className="rounded-xl p-5 mb-3 border"
                    style={{ background: theme.goldLight, borderColor: theme.gold, color: theme.text }}
                  >
                    <p className="font-display font-semibold mb-2">📌 Please follow this script for your video</p>
                    <p className="text-xs mb-3" style={{ color: theme.textMuted }}>
                      Answer these 3 simple questions in your video — just use whatever applies to you:
                    </p>
                    <ol className="text-sm mb-4 space-y-1 list-decimal pl-5">
                      <li>What were you doing before Delvetek?</li>
                      <li>What did you achieve during/after the program?</li>
                      <li>What measurable change happened? (job, income, skills, project)</li>
                    </ol>

                    <p className="font-semibold text-sm mb-2">Use this script (fill in the brackets — use whatever applies to you):</p>
                    <div
                      className="text-sm leading-relaxed whitespace-pre-line p-4 rounded-lg border"
                      style={{ background: theme.card, borderColor: theme.border, color: theme.text }}
                    >
{`Hi, my name is [Full Name], and I'm a participant of Delvetek's [Cohort Name/Number].

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

Thank you.`}
                    </div>
                  </div>

                  <label
                    className="flex items-center gap-3 p-4 rounded-xl border-2 border-dashed cursor-pointer transition-colors hover:border-solid"
                    style={{ borderColor: theme.border, background: theme.bg }}
                  >
                    <Upload className="w-5 h-5" style={{ color: theme.gold }} />
                    <span className="text-sm" style={{ color: theme.textMuted }}>
                      {videoFile ? videoFile.name : "Click to upload video"}
                    </span>
                    <input
                      type="file"
                      accept="video/mp4,video/quicktime"
                      className="hidden"
                      onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
                    />
                  </label>
                </div>
              </div>
            </div>

            {/* Section 3 */}
            <div>
              <h2 className="font-display text-xl font-semibold mb-6 pb-2 border-b" style={{ color: theme.gold, borderColor: theme.border }}>
                Section 3 – Feedback / Engagement
              </h2>
              <div className="space-y-1">
                <Label style={{ color: theme.text }}>Comments / Suggestions *</Label>
                <Textarea
                  required
                  value={form.comments}
                  onChange={(e) => updateField("comments", e.target.value)}
                  style={{ borderColor: theme.border, background: theme.bg }}
                  rows={3}
                  placeholder="Any feedback or suggestions..."
                />
              </div>
            </div>

            {uploadProgress > 0 && uploadProgress < 100 && (
              <div className="space-y-1">
                <Progress value={uploadProgress} className="h-2" />
                <p className="text-xs" style={{ color: theme.textMuted }}>Uploading video... {uploadProgress}%</p>
              </div>
            )}

            <Button
              type="submit" disabled={isLoading}
              className="w-full h-12 font-display font-semibold text-base"
              style={{ background: theme.gold, color: "#FFFFFF" }}
            >
              {isLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> {uploadProgress > 0 ? `Uploading... ${uploadProgress}%` : "Submitting..."}</> : "Submit Review"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default WeeklyReviewForm;
