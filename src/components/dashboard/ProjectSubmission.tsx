import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Loader2, Upload, CheckCircle2, FileText, LinkIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { uploadWithProgress } from "@/lib/uploadWithProgress";

const MAX_FILE_MB = 50;

type Submission = {
  id: string;
  file_url: string | null;
  link_url: string | null;
  notes: string | null;
  status: string;
  created_at: string;
};

export const ProjectSubmission = ({ projectSlug }: { projectSlug: string }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [file, setFile] = useState<File | null>(null);
  const [linkUrl, setLinkUrl] = useState("");
  const [notes, setNotes] = useState("");
  const [previous, setPrevious] = useState<Submission[]>([]);

  const loadSubmissions = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("project_submissions")
      .select("id, file_url, link_url, notes, status, created_at")
      .eq("user_id", user.id)
      .eq("project_slug", projectSlug)
      .order("created_at", { ascending: false });
    setPrevious((data as Submission[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    loadSubmissions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, projectSlug]);

  const handleSubmit = async () => {
    if (!user) return;
    if (!file && !linkUrl.trim() && !notes.trim()) {
      toast({ title: "Add something to submit", description: "Attach a file, paste a link, or write notes.", variant: "destructive" });
      return;
    }
    if (linkUrl.trim() && !/^https?:\/\//i.test(linkUrl.trim())) {
      toast({ title: "Invalid link", description: "Link must start with http:// or https://", variant: "destructive" });
      return;
    }
    if (file && file.size > MAX_FILE_MB * 1024 * 1024) {
      toast({ title: "File too large", description: `Max ${MAX_FILE_MB}MB`, variant: "destructive" });
      return;
    }

    setSubmitting(true);
    setProgress(0);
    try {
      let filePath: string | null = null;
      let fileUrl: string | null = null;

      if (file) {
        const ext = file.name.split(".").pop() || "bin";
        const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
        filePath = `${user.id}/${projectSlug}/${Date.now()}_${safeName}`;
        await uploadWithProgress({
          bucket: "project-submissions",
          path: filePath,
          file,
          onProgress: setProgress,
        });
        const { data: signed } = await supabase.storage
          .from("project-submissions")
          .createSignedUrl(filePath, 60 * 60 * 24 * 365);
        fileUrl = signed?.signedUrl || null;
      }

      const { error } = await supabase.from("project_submissions").insert({
        user_id: user.id,
        project_slug: projectSlug,
        file_url: fileUrl,
        file_path: filePath,
        link_url: linkUrl.trim() || null,
        notes: notes.trim() || null,
        status: "submitted",
      });
      if (error) throw error;

      setProgress(100);
      toast({ title: "Submission received", description: "Your work has been sent to the team for review." });
      setFile(null);
      setLinkUrl("");
      setNotes("");
      await loadSubmissions();
    } catch (e: any) {
      toast({ title: "Submission failed", description: e?.message || "Try again.", variant: "destructive" });
    } finally {
      setSubmitting(false);
      setTimeout(() => setProgress(0), 1500);
    }
  };

  return (
    <Card className="border-border bg-card">
      <CardContent className="p-6 space-y-5">
        <div className="space-y-1">
          <h3 className="font-display font-semibold text-foreground">Submit your project</h3>
          <p className="text-xs text-muted-foreground">
            Share your final report, dashboard, or analysis. You can attach a file, paste a link, and add a short summary.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="proj-file">File (PDF, Excel, .pbix, ZIP — max {MAX_FILE_MB}MB)</Label>
          <Input
            id="proj-file"
            type="file"
            accept=".pdf,.xlsx,.xls,.csv,.pbix,.zip,.pptx,.docx,.png,.jpg,.jpeg"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            disabled={submitting}
          />
          {file && <p className="text-xs text-muted-foreground truncate">{file.name} · {(file.size / 1024 / 1024).toFixed(2)} MB</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="proj-link">Link (Google Drive, GitHub, Power BI, etc.)</Label>
          <Input
            id="proj-link"
            type="url"
            placeholder="https://..."
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            disabled={submitting}
            maxLength={500}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="proj-notes">Notes / summary (optional)</Label>
          <Textarea
            id="proj-notes"
            placeholder="Briefly explain your approach, key findings, or anything reviewers should know."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            disabled={submitting}
            maxLength={2000}
            rows={4}
          />
        </div>

        {submitting && progress > 0 && (
          <div className="space-y-1">
            <Progress value={progress} />
            <p className="text-xs text-muted-foreground">{progress}%</p>
          </div>
        )}

        <Button onClick={handleSubmit} disabled={submitting} className="w-full">
          {submitting ? (
            <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Submitting...</>
          ) : (
            <><Upload className="w-4 h-4 mr-2" /> Submit Project</>
          )}
        </Button>

        {!loading && previous.length > 0 && (
          <div className="space-y-2 pt-4 border-t border-border">
            <h4 className="text-sm font-semibold text-foreground">Your previous submissions</h4>
            <div className="space-y-2">
              {previous.map((s) => (
                <div key={s.id} className="rounded-lg border border-border bg-background p-3 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs text-muted-foreground">
                      {new Date(s.created_at).toLocaleString()}
                    </span>
                    <Badge variant="secondary" className="text-xs flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> {s.status}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap gap-3 text-xs">
                    {s.file_url && (
                      <a href={s.file_url} target="_blank" rel="noreferrer" className="text-primary hover:underline flex items-center gap-1">
                        <FileText className="w-3 h-3" /> View file
                      </a>
                    )}
                    {s.link_url && (
                      <a href={s.link_url} target="_blank" rel="noreferrer" className="text-primary hover:underline flex items-center gap-1">
                        <LinkIcon className="w-3 h-3" /> Open link
                      </a>
                    )}
                  </div>
                  {s.notes && <p className="text-xs text-muted-foreground whitespace-pre-wrap">{s.notes}</p>}
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProjectSubmission;
