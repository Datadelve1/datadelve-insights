import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Loader2,
  HardDrive,
  Trash2,
  RefreshCw,
  Search,
  FileVideo,
  ArrowUpDown,
  Play,
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

type Bucket = "student-videos" | "class-videos" | "form-uploads";

interface StorageFile {
  path: string;
  name: string;
  size: number;
  created_at: string | null;
  updated_at: string | null;
  user_id: string;
  student_name: string | null;
  student_email: string | null;
}

const BUCKETS: { id: Bucket; label: string }[] = [
  { id: "student-videos", label: "Student Videos" },
  { id: "class-videos", label: "Class Recordings" },
  { id: "form-uploads", label: "Form Uploads" },
];

const formatSize = (bytes: number) => {
  if (!bytes) return "0 B";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
};

const StorageManager = () => {
  const { toast } = useToast();
  const [bucket, setBucket] = useState<Bucket>("student-videos");
  const [files, setFiles] = useState<StorageFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"size" | "date" | "name">("size");
  const [deleting, setDeleting] = useState<string | null>(null);
  const [confirmFile, setConfirmFile] = useState<StorageFile | null>(null);
  const [previewFile, setPreviewFile] = useState<StorageFile | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  const isVideoFile = (name: string) => /\.(mp4|webm|mov|m4v|ogg)$/i.test(name);

  const openPreview = async (file: StorageFile) => {
    setPreviewFile(file);
    setPreviewUrl(null);
    setPreviewLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("admin-storage-manager", {
        body: { action: "signed_url", bucket, path: file.path },
      });
      if (error) throw error;
      if (!data?.ok) throw new Error(data?.error || "Failed to load preview");
      setPreviewUrl(data.url);
    } catch (e: any) {
      toast({ title: "Preview failed", description: e.message, variant: "destructive" });
      setPreviewFile(null);
    } finally {
      setPreviewLoading(false);
    }
  };

  const fetchFiles = async (b: Bucket) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("admin-storage-manager", {
        body: { action: "list", bucket: b },
      });
      if (error) throw error;
      if (!data?.ok) throw new Error(data?.error || "Failed to load files");
      setFiles(data.files || []);
    } catch (e: any) {
      toast({ title: "Error loading files", description: e.message, variant: "destructive" });
      setFiles([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles(bucket);
  }, [bucket]);

  const handleDelete = async (file: StorageFile) => {
    setDeleting(file.path);
    try {
      const { data, error } = await supabase.functions.invoke("admin-storage-manager", {
        body: { action: "delete", bucket, path: file.path },
      });
      if (error) throw error;
      if (!data?.ok) throw new Error(data?.error || "Delete failed");

      // If student-videos, also remove DB row
      if (bucket === "student-videos") {
        await supabase
          .from("student_video_submissions")
          .delete()
          .eq("storage_path", file.path);
      }

      setFiles((prev) => prev.filter((f) => f.path !== file.path));
      toast({ title: "File deleted", description: file.name });
    } catch (e: any) {
      toast({ title: "Delete failed", description: e.message, variant: "destructive" });
    } finally {
      setDeleting(null);
      setConfirmFile(null);
    }
  };

  const filteredSorted = useMemo(() => {
    const q = search.toLowerCase().trim();
    const filtered = files.filter((f) => {
      if (!q) return true;
      return (
        f.name.toLowerCase().includes(q) ||
        f.student_name?.toLowerCase().includes(q) ||
        f.student_email?.toLowerCase().includes(q) ||
        f.path.toLowerCase().includes(q)
      );
    });
    return [...filtered].sort((a, b) => {
      if (sortBy === "size") return b.size - a.size;
      if (sortBy === "date") {
        const da = new Date(a.created_at || 0).getTime();
        const db = new Date(b.created_at || 0).getTime();
        return db - da;
      }
      return a.name.localeCompare(b.name);
    });
  }, [files, search, sortBy]);

  const totalSize = files.reduce((sum, f) => sum + f.size, 0);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground flex items-center gap-2">
            <HardDrive className="w-6 h-6 text-primary" /> Storage Manager
          </h1>
          <p className="text-muted-foreground text-sm">
            Browse and delete files from cloud storage to free up space.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => fetchFiles(bucket)} disabled={loading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} /> Refresh
        </Button>
      </div>

      <Tabs value={bucket} onValueChange={(v) => setBucket(v as Bucket)}>
        <TabsList className="bg-secondary">
          {BUCKETS.map((b) => (
            <TabsTrigger key={b.id} value={b.id}>
              {b.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {BUCKETS.map((b) => (
          <TabsContent key={b.id} value={b.id} className="space-y-4">
            <Card className="border-border bg-card">
              <CardHeader className="pb-3">
                <CardTitle className="font-display text-lg text-foreground flex items-center justify-between">
                  <span>{b.label}</span>
                  <span className="text-sm font-normal text-muted-foreground">
                    {files.length} file{files.length !== 1 ? "s" : ""} · {formatSize(totalSize)}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex gap-2 flex-wrap">
                  <div className="relative flex-1 min-w-[200px]">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Search by name, student, email…"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="pl-9 bg-secondary border-border"
                    />
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setSortBy((s) => (s === "size" ? "date" : s === "date" ? "name" : "size"))
                    }
                  >
                    <ArrowUpDown className="w-3 h-3 mr-1" /> Sort: {sortBy}
                  </Button>
                </div>

                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  </div>
                ) : filteredSorted.length === 0 ? (
                  <div className="text-center py-12 space-y-2">
                    <FileVideo className="w-10 h-10 text-muted-foreground mx-auto" />
                    <p className="text-sm text-muted-foreground">No files found.</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {filteredSorted.map((f) => (
                      <div
                        key={f.path}
                        className="flex items-center justify-between gap-3 p-3 rounded-lg bg-secondary"
                      >
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <FileVideo className="w-5 h-5 text-primary shrink-0" />
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-foreground truncate">
                              {f.student_name || f.name}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">
                              {f.path}
                            </p>
                            <div className="flex gap-3 text-xs text-muted-foreground mt-0.5 flex-wrap">
                              <span className="font-medium text-primary">{formatSize(f.size)}</span>
                              {f.student_email && <span>{f.student_email}</span>}
                              {f.created_at && (
                                <span>
                                  {new Date(f.created_at).toLocaleDateString("en-GB", {
                                    day: "numeric",
                                    month: "short",
                                    year: "numeric",
                                  })}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-1 shrink-0">
                          {isVideoFile(f.name) && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openPreview(f)}
                              className="text-primary hover:text-primary hover:bg-primary/10"
                              title="Preview video"
                            >
                              <Play className="w-4 h-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setConfirmFile(f)}
                            disabled={deleting === f.path}
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          >
                            {deleting === f.path ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      <AlertDialog open={!!confirmFile} onOpenChange={(o) => !o && setConfirmFile(null)}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display text-foreground">Delete file?</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              This will permanently delete <span className="text-foreground font-medium">{confirmFile?.name}</span>
              {confirmFile?.student_name && <> from <span className="text-foreground font-medium">{confirmFile.student_name}</span></>}
              {" "}({formatSize(confirmFile?.size || 0)}).
              {bucket === "student-videos" && " The matching submission record will also be removed."}
              {" "}This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => confirmFile && handleDelete(confirmFile)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog
        open={!!previewFile}
        onOpenChange={(o) => {
          if (!o) {
            setPreviewFile(null);
            setPreviewUrl(null);
          }
        }}
      >
        <DialogContent className="bg-card border-border max-w-3xl">
          <DialogHeader>
            <DialogTitle className="font-display text-foreground truncate pr-6">
              {previewFile?.student_name || previewFile?.name}
            </DialogTitle>
            <p className="text-xs text-muted-foreground truncate">{previewFile?.path}</p>
          </DialogHeader>
          <div className="aspect-video bg-black rounded-lg overflow-hidden flex items-center justify-center">
            {previewLoading ? (
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            ) : previewUrl ? (
              <video
                src={previewUrl}
                controls
                autoPlay
                controlsList="nodownload"
                className="w-full h-full"
              />
            ) : (
              <p className="text-muted-foreground text-sm">No preview available</p>
            )}
          </div>
          {previewFile && (
            <div className="flex items-center justify-between gap-3">
              <div className="text-xs text-muted-foreground">
                {formatSize(previewFile.size)}
                {previewFile.student_email && ` · ${previewFile.student_email}`}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setConfirmFile(previewFile);
                  setPreviewFile(null);
                  setPreviewUrl(null);
                }}
                className="text-destructive hover:text-destructive border-destructive/30 hover:bg-destructive/10"
              >
                <Trash2 className="w-3 h-3 mr-1" /> Delete this file
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StorageManager;
