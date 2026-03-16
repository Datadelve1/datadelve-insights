import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Video,
  Play,
  Download,
  Loader2,
  Eye,
  Filter,
  FileVideo,
  Shield,
  Calendar,
  User,
} from "lucide-react";

interface VideoSubmission {
  id: string;
  user_id: string;
  student_name: string;
  week_number: number;
  session_date: string;
  title: string;
  description: string;
  video_url: string;
  storage_path: string;
  consent_given: boolean;
  created_at: string;
}

interface AccessLog {
  id: string;
  video_id: string;
  accessed_by: string;
  action_type: string;
  created_at: string;
}

const WEEKS = [1, 2, 3, 4, 5, 6, 7, 8];

const StudentVideos = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [videos, setVideos] = useState<VideoSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterWeek, setFilterWeek] = useState<string>("all");
  const [filterStudent, setFilterStudent] = useState<string>("all");
  const [playingVideo, setPlayingVideo] = useState<VideoSubmission | null>(null);
  const [accessLogs, setAccessLogs] = useState<AccessLog[]>([]);
  const [showLogs, setShowLogs] = useState(false);
  const [logsLoading, setLogsLoading] = useState(false);

  const fetchVideos = async () => {
    const { data, error } = await supabase
      .from("student_video_submissions")
      .select("*")
      .order("week_number")
      .order("session_date")
      .order("student_name");

    if (error) {
      toast({ title: "Error loading videos", description: error.message, variant: "destructive" });
    }
    setVideos((data as VideoSubmission[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  const logAccess = async (videoId: string, actionType: string) => {
    if (!user) return;
    await supabase.from("video_access_logs").insert({
      video_id: videoId,
      accessed_by: user.id,
      action_type: actionType,
    });
  };

  const handlePlay = async (video: VideoSubmission) => {
    await logAccess(video.id, "view");
    setPlayingVideo(video);
  };

  const handleDownload = async (video: VideoSubmission) => {
    await logAccess(video.id, "download");
    // Download from storage
    const { data, error } = await supabase.storage
      .from("student-videos")
      .download(video.storage_path);

    if (error) {
      toast({ title: "Download failed", description: error.message, variant: "destructive" });
      return;
    }

    const url = URL.createObjectURL(data);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${video.student_name}-week${video.week_number}-${video.session_date}.mp4`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({ title: "Download started" });
  };

  const fetchAccessLogs = async () => {
    setLogsLoading(true);
    const { data } = await supabase
      .from("video_access_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);

    setAccessLogs((data as AccessLog[]) || []);
    setLogsLoading(false);
    setShowLogs(true);
  };

  // Unique students for filter
  const uniqueStudents = [...new Set(videos.map((v) => v.student_name))].sort();

  // Filtered videos
  const filtered = videos.filter((v) => {
    if (filterWeek !== "all" && v.week_number !== parseInt(filterWeek)) return false;
    if (filterStudent !== "all" && v.student_name !== filterStudent) return false;
    return true;
  });

  // Group by week
  const groupedByWeek = filtered.reduce<Record<number, VideoSubmission[]>>((acc, v) => {
    if (!acc[v.week_number]) acc[v.week_number] = [];
    acc[v.week_number].push(v);
    return acc;
  }, {});

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
          <h1 className="font-display text-2xl font-bold text-foreground">Student Videos</h1>
          <p className="text-muted-foreground text-sm">
            {videos.length} video{videos.length !== 1 ? "s" : ""} submitted by students
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchAccessLogs}>
          <Shield className="w-4 h-4 mr-2" /> Audit Log
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <Select value={filterWeek} onValueChange={setFilterWeek}>
            <SelectTrigger className="w-[140px] bg-secondary border-border">
              <SelectValue placeholder="All Weeks" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Weeks</SelectItem>
              {WEEKS.map((w) => (
                <SelectItem key={w} value={String(w)}>
                  Week {w}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Select value={filterStudent} onValueChange={setFilterStudent}>
          <SelectTrigger className="w-[200px] bg-secondary border-border">
            <SelectValue placeholder="All Students" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Students</SelectItem>
            {uniqueStudents.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Videos grouped by week */}
      {Object.keys(groupedByWeek).length === 0 ? (
        <Card className="border-border bg-card">
          <CardContent className="text-center py-16 space-y-3">
            <FileVideo className="w-12 h-12 text-muted-foreground mx-auto" />
            <p className="font-display font-semibold text-foreground">No student videos yet</p>
            <p className="text-sm text-muted-foreground">
              Videos submitted by students will appear here.
            </p>
          </CardContent>
        </Card>
      ) : (
        Object.entries(groupedByWeek)
          .sort(([a], [b]) => Number(a) - Number(b))
          .map(([week, weekVideos]) => (
            <Card key={week} className="border-border bg-card">
              <CardHeader className="pb-3">
                <CardTitle className="font-display text-lg text-foreground flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-primary" />
                  Week {week} {Number(week) >= 7 ? "(Project)" : ""}
                  <span className="text-sm font-normal text-muted-foreground ml-2">
                    {weekVideos.length} video{weekVideos.length !== 1 ? "s" : ""}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {weekVideos.map((video) => (
                    <div
                      key={video.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-secondary gap-3"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center shrink-0">
                          <User className="w-5 h-5 text-primary" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">
                            {video.student_name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {video.title || "Untitled"} ·{" "}
                            {new Date(video.session_date).toLocaleDateString("en-GB", {
                              weekday: "short",
                              day: "numeric",
                              month: "short",
                            })}
                          </p>
                          {video.description && (
                            <p className="text-xs text-muted-foreground mt-0.5 truncate">
                              {video.description}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <Button variant="ghost" size="sm" onClick={() => handlePlay(video)}>
                          <Play className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDownload(video)}>
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))
      )}

      {/* Video Player Dialog */}
      <Dialog open={!!playingVideo} onOpenChange={() => setPlayingVideo(null)}>
        <DialogContent className="bg-card border-border max-w-3xl">
          <DialogHeader>
            <DialogTitle className="font-display text-foreground">
              {playingVideo?.student_name} — {playingVideo?.title || "Video"}
            </DialogTitle>
          </DialogHeader>
          {playingVideo && (
            <div className="space-y-3">
              <video
                src={playingVideo.video_url}
                controls
                className="w-full rounded-lg bg-black"
                autoPlay
              />
              <div className="flex gap-4 text-xs text-muted-foreground">
                <span>Week {playingVideo.week_number}</span>
                <span>
                  Session:{" "}
                  {new Date(playingVideo.session_date).toLocaleDateString("en-GB", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </span>
                <span>
                  Submitted: {new Date(playingVideo.created_at).toLocaleString()}
                </span>
              </div>
              {playingVideo.description && (
                <p className="text-sm text-muted-foreground">{playingVideo.description}</p>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Audit Log Dialog */}
      <Dialog open={showLogs} onOpenChange={setShowLogs}>
        <DialogContent className="bg-card border-border max-w-2xl max-h-[80vh] overflow-auto">
          <DialogHeader>
            <DialogTitle className="font-display text-foreground flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" /> Access Audit Log
            </DialogTitle>
          </DialogHeader>
          {logsLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : accessLogs.length === 0 ? (
            <p className="text-center text-muted-foreground py-8 text-sm">
              No access logs recorded yet.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Action</TableHead>
                  <TableHead>Video ID</TableHead>
                  <TableHead>Date/Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {accessLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>
                      <span
                        className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${
                          log.action_type === "download"
                            ? "bg-primary/10 text-primary"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {log.action_type === "download" ? (
                          <Download className="w-3 h-3" />
                        ) : (
                          <Eye className="w-3 h-3" />
                        )}
                        {log.action_type}
                      </span>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground font-mono truncate max-w-[120px]">
                      {log.video_id.slice(0, 8)}...
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {new Date(log.created_at).toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StudentVideos;
