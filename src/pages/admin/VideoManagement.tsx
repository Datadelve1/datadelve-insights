import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
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
  Video,
  Plus,
  Upload,
  Loader2,
  Pencil,
  Trash2,
  Play,
  FileVideo,
  Link as LinkIcon,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface Recording {
  id: string;
  week_number: number;
  title: string;
  description: string | null;
  video_url: string;
  created_at: string;
}

const WEEKS = [1, 2, 3, 4, 5, 6, 7, 8];
const SESSIONS = WEEKS.flatMap(w => [
  { week: w, day: "Fri", label: `W${w} Fri` },
  { week: w, day: "Sat", label: `W${w} Sat` },
]);

const VideoManagement = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [weekNumber, setWeekNumber] = useState("");
  const [videoSource, setVideoSource] = useState<"upload" | "url">("upload");
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState("");

  const fetchRecordings = async () => {
    const { data } = await supabase
      .from("class_recordings")
      .select("*")
      .order("week_number");
    setRecordings(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchRecordings();
  }, []);

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setWeekNumber("");
    setVideoSource("upload");
    setVideoFile(null);
    setVideoUrl("");
    setEditingId(null);
    setUploadProgress(0);
  };

  const openEditDialog = (rec: Recording) => {
    setEditingId(rec.id);
    setTitle(rec.title);
    setDescription(rec.description || "");
    setWeekNumber(`${rec.week_number}-Fri`);
    setVideoSource("url");
    setVideoUrl(rec.video_url);
    setVideoFile(null);
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!weekNumber || !title.trim()) {
      toast({ title: "Please fill in all required fields", variant: "destructive" });
      return;
    }

    const isEditing = !!editingId;
    const needsUpload = videoSource === "upload" && videoFile;
    const hasUrl = videoSource === "url" && videoUrl.trim();

    if (!isEditing && !needsUpload && !hasUrl) {
      toast({ title: "Please provide a video file or URL", variant: "destructive" });
      return;
    }

    setSubmitting(true);
    const parts = weekNumber.split("-");
    const parsedWeek = parseInt(parts[0]);
    const sessionDay = parts[1]?.toLowerCase() === "sat" ? "saturday" : "friday";
    try {
      let finalUrl = videoUrl.trim();

      // Upload video file if provided
      if (needsUpload && videoFile) {
        const ext = videoFile.name.split(".").pop();
        const path = `week-${parsedWeek}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

        setUploadProgress(10);
        const { error: uploadError } = await supabase.storage
          .from("class-videos")
          .upload(path, videoFile, { upsert: true });

        if (uploadError) throw new Error(`Upload failed: ${uploadError.message}`);
        setUploadProgress(80);

        // Generate a signed URL (valid for 1 year) since bucket is private
        const { data: signedData, error: signedError } = await supabase.storage
          .from("class-videos")
          .createSignedUrl(path, 365 * 24 * 60 * 60); // 1 year

        if (signedError) throw new Error(`URL generation failed: ${signedError.message}`);
        finalUrl = signedData.signedUrl;
        setUploadProgress(100);
      }

      if (isEditing) {
        const updateData: any = {
          title: title.trim(),
          description: description.trim() || null,
          week_number: parsedWeek,
        };
        // Only update URL if a new video was provided
        if (finalUrl && (needsUpload || hasUrl)) {
          updateData.video_url = finalUrl;
        }

        const { error } = await supabase
          .from("class_recordings")
          .update(updateData)
          .eq("id", editingId);
        if (error) throw error;
        toast({ title: "Recording updated! ✅" });
      } else {
        const { error } = await supabase.from("class_recordings").insert({
          title: title.trim(),
          description: description.trim() || null,
          week_number: parsedWeek,
          video_url: finalUrl,
        });
        if (error) throw error;
        toast({ title: "Recording added! 🎬" });
      }

      resetForm();
      setDialogOpen(false);
      fetchRecordings();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setSubmitting(false);
      setUploadProgress(0);
    }
  };

  const handleDelete = async (rec: Recording) => {
    setDeleting(rec.id);
    try {
      // Try to delete from storage if it's a storage URL
      if (rec.video_url.includes("class-videos")) {
        try {
          const urlObj = new URL(rec.video_url);
          const pathMatch = urlObj.pathname.match(/class-videos\/(.+?)(\?|$)/);
          if (pathMatch) {
            await supabase.storage.from("class-videos").remove([decodeURIComponent(pathMatch[1])]);
          }
        } catch {
          // Non-storage URL, skip
        }
      }

      const { error } = await supabase.from("class_recordings").delete().eq("id", rec.id);
      if (error) throw error;
      toast({ title: "Recording deleted" });
      fetchRecordings();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setDeleting(null);
    }
  };

  const usedWeeks = new Set(recordings.map((r) => r.week_number));
  const usedSessionKeys = new Set(recordings.map((r) => `${r.week_number}`));

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Video Management</h1>
          <p className="text-muted-foreground text-sm">
            {recordings.length} recording{recordings.length !== 1 ? "s" : ""} uploaded
          </p>
        </div>

        <Dialog
          open={dialogOpen}
          onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) resetForm();
          }}
        >
          <DialogTrigger asChild>
            <Button variant="default">
              <Plus className="w-4 h-4 mr-2" /> Add Recording
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border max-w-lg">
            <DialogHeader>
              <DialogTitle className="font-display text-foreground">
                {editingId ? "Edit Recording" : "Add New Recording"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Session *</Label>
                  <Select value={weekNumber} onValueChange={setWeekNumber}>
                    <SelectTrigger className="bg-secondary border-border">
                      <SelectValue placeholder="Select session" />
                    </SelectTrigger>
                    <SelectContent>
                      {SESSIONS.map((s) => {
                        const val = `${s.week}-${s.day}`;
                        const taken = usedWeeks.has(s.week) && weekNumber !== val;
                        return (
                          <SelectItem key={val} value={val}>
                            Week {s.week} {s.day} {s.week >= 7 ? "(Project)" : ""}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Title *</Label>
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Introduction to SQL"
                    className="bg-secondary border-border"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Description (optional)</Label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief description of this session..."
                  className="bg-secondary border-border"
                />
              </div>

              {/* Video source toggle */}
              <div className="space-y-2">
                <Label>Video Source *</Label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant={videoSource === "upload" ? "default" : "outline"}
                    size="sm"
                    className="flex-1"
                    onClick={() => setVideoSource("upload")}
                  >
                    <Upload className="w-4 h-4 mr-1" /> Upload File
                  </Button>
                  <Button
                    type="button"
                    variant={videoSource === "url" ? "default" : "outline"}
                    size="sm"
                    className="flex-1"
                    onClick={() => setVideoSource("url")}
                  >
                    <LinkIcon className="w-4 h-4 mr-1" /> Paste URL
                  </Button>
                </div>
              </div>

              {videoSource === "upload" ? (
                <div className="space-y-2">
                  <label className="flex items-center gap-3 p-4 rounded-xl border-2 border-dashed border-border cursor-pointer transition-colors hover:border-primary/50 bg-secondary">
                    <FileVideo className="w-5 h-5 text-primary shrink-0" />
                    <span className="text-sm text-muted-foreground truncate">
                      {videoFile ? videoFile.name : "Click to select a video file (MP4, WebM, MOV)"}
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
              ) : (
                <div className="space-y-2">
                  <Input
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    placeholder="https://..."
                    className="bg-secondary border-border"
                  />
                  <p className="text-xs text-muted-foreground">
                    Paste a direct video URL (YouTube links won't work with the protected player)
                  </p>
                </div>
              )}

              {uploadProgress > 0 && uploadProgress < 100 && (
                <div className="space-y-1">
                  <Progress value={uploadProgress} className="h-2" />
                  <p className="text-xs text-muted-foreground">Uploading video...</p>
                </div>
              )}

              <Button type="submit" disabled={submitting} className="w-full h-11">
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    {uploadProgress > 0 ? "Uploading..." : "Saving..."}
                  </>
                ) : editingId ? (
                  "Update Recording"
                ) : (
                  "Add Recording"
                )}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Recordings list */}
      {recordings.length === 0 ? (
        <Card className="border-border bg-card">
          <CardContent className="text-center py-16 space-y-3">
            <Video className="w-12 h-12 text-muted-foreground mx-auto" />
            <p className="font-display font-semibold text-foreground">No recordings yet</p>
            <p className="text-sm text-muted-foreground">
              Click "Add Recording" to upload your first class video.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {recordings.map((rec) => (
            <Card key={rec.id} className="border-border bg-card">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center shrink-0">
                      <Play className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                          Week {rec.week_number}
                        </span>
                        <h3 className="font-display font-semibold text-foreground">
                          {rec.title}
                        </h3>
                      </div>
                      {rec.description && (
                        <p className="text-sm text-muted-foreground mt-0.5">{rec.description}</p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">
                        Added {new Date(rec.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openEditDialog(rec)}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                          {deleting === rec.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="bg-card border-border">
                        <AlertDialogHeader>
                          <AlertDialogTitle className="text-foreground">Delete Recording</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will permanently delete "{rec.title}" and its video file. Students will no longer be able to watch it.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel className="border-border">Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(rec)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Session coverage overview */}
      <Card className="border-border bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="font-display text-sm text-foreground">Session Coverage</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 md:grid-cols-8 gap-2">
            {SESSIONS.map((s) => (
              <div
                key={s.label}
                className={`text-center rounded-lg p-2 text-xs ${
                  usedWeeks.has(s.week)
                    ? "bg-primary/10 border border-primary/20 text-primary font-medium"
                    : "bg-secondary text-muted-foreground"
                }`}
              >
                {s.label}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VideoManagement;
