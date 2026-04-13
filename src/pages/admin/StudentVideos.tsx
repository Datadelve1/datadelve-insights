import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAdminCohort } from "@/contexts/AdminCohortContext";
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
  Video,
  Play,
  Loader2,
  Filter,
  FileVideo,
  Calendar,
  User,
  Globe,
  EyeOff,
  CheckCircle2,
} from "lucide-react";

interface ReviewVideo {
  id: string;
  user_id: string | null;
  full_name: string;
  email: string;
  week_number: number;
  session_day: string;
  video_url: string | null;
  written_reflection: string | null;
  is_approved: boolean;
  approved_by: string | null;
  created_at: string;
  class_name: string | null;
  topic_covered: string | null;
}

const WEEKS = [1, 2, 3, 4, 5, 6, 7, 8];

const StudentVideos = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { cohort } = useAdminCohort();
  const [videos, setVideos] = useState<ReviewVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterWeek, setFilterWeek] = useState<string>("all");
  const [filterStudent, setFilterStudent] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [playingVideo, setPlayingVideo] = useState<ReviewVideo | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const fetchVideos = async () => {
    // Get cohort user ids
    const { data: enrollments } = await supabase
      .from("cohort2_enrollments")
      .select("user_id")
      .eq("cohort", cohort)
      .eq("payment_status", "paid");
    const cohortIdArr = (enrollments || []).map((e: any) => e.user_id).filter(Boolean) as string[];

    if (cohortIdArr.length === 0) {
      setVideos([]);
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("weekly_reviews")
      .select("*")
      .not("video_url", "is", null)
      .in("user_id", cohortIdArr)
      .order("week_number")
      .order("created_at", { ascending: false });

    if (error) {
      toast({ title: "Error loading videos", description: error.message, variant: "destructive" });
    }
    setVideos((data as unknown as ReviewVideo[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchVideos();
  }, [cohort]);

  const toggleApproval = async (video: ReviewVideo) => {
    if (!user) return;
    setTogglingId(video.id);
    const newApproved = !video.is_approved;
    const { error } = await supabase
      .from("weekly_reviews")
      .update({
        is_approved: newApproved,
        approved_by: newApproved ? user.id : null,
      } as any)
      .eq("id", video.id);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: newApproved ? "Video approved for homepage ✅" : "Video removed from homepage" });
      setVideos((prev) =>
        prev.map((v) =>
          v.id === video.id ? { ...v, is_approved: newApproved, approved_by: newApproved ? user.id : null } : v
        )
      );
    }
    setTogglingId(null);
  };

  const uniqueStudents = [...new Set(videos.map((v) => v.full_name))].sort();

  const filtered = videos.filter((v) => {
    if (filterWeek !== "all" && v.week_number !== parseInt(filterWeek)) return false;
    if (filterStudent !== "all" && v.full_name !== filterStudent) return false;
    if (filterStatus === "approved" && !v.is_approved) return false;
    if (filterStatus === "pending" && v.is_approved) return false;
    return true;
  });

  const groupedByWeek = filtered.reduce<Record<number, ReviewVideo[]>>((acc, v) => {
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
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">Student Review Videos</h1>
        <p className="text-muted-foreground text-sm">
          {videos.length} video review{videos.length !== 1 ? "s" : ""} submitted · {videos.filter((v) => v.is_approved).length} approved for homepage
        </p>
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
                <SelectItem key={w} value={String(w)}>Week {w}</SelectItem>
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
              <SelectItem key={s} value={s}>{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[160px] bg-secondary border-border">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {Object.keys(groupedByWeek).length === 0 ? (
        <Card className="border-border bg-card">
          <CardContent className="text-center py-16 space-y-3">
            <FileVideo className="w-12 h-12 text-muted-foreground mx-auto" />
            <p className="font-display font-semibold text-foreground">No student video reviews yet</p>
            <p className="text-sm text-muted-foreground">
              Saturday video reviews submitted by students will appear here.
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
                  Week {week} {weekVideos[0]?.session_day === "saturday" ? "(Saturday)" : ""}
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
                            {video.full_name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {video.topic_covered || video.class_name || "Review"} · W{video.week_number} {video.session_day}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(video.created_at).toLocaleDateString("en-GB", {
                              day: "numeric", month: "short", year: "numeric",
                            })}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        {video.is_approved && (
                          <span className="text-xs text-primary font-medium flex items-center gap-1 mr-2">
                            <Globe className="w-3 h-3" /> Live
                          </span>
                        )}
                        <Button variant="ghost" size="sm" onClick={() => setPlayingVideo(video)}>
                          <Play className="w-4 h-4" />
                        </Button>
                        <Button
                          variant={video.is_approved ? "outline" : "default"}
                          size="sm"
                          disabled={togglingId === video.id}
                          onClick={() => toggleApproval(video)}
                          className="text-xs"
                        >
                          {togglingId === video.id ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : video.is_approved ? (
                            <><EyeOff className="w-3 h-3 mr-1" /> Remove</>
                          ) : (
                            <><CheckCircle2 className="w-3 h-3 mr-1" /> Approve</>
                          )}
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
              {playingVideo?.full_name} — W{playingVideo?.week_number} {playingVideo?.session_day}
            </DialogTitle>
          </DialogHeader>
          {playingVideo?.video_url && (
            <div className="space-y-3">
              <video
                src={playingVideo.video_url}
                controls
                className="w-full rounded-lg bg-black"
                autoPlay
              />
              <div className="flex gap-4 text-xs text-muted-foreground flex-wrap">
                <span>Week {playingVideo.week_number}</span>
                <span>{playingVideo.topic_covered}</span>
                <span>Submitted: {new Date(playingVideo.created_at).toLocaleString()}</span>
              </div>
              {playingVideo.written_reflection && (
                <div className="text-sm text-muted-foreground bg-secondary p-3 rounded-lg">
                  <p className="font-medium text-foreground mb-1">Written reflection:</p>
                  {playingVideo.written_reflection}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StudentVideos;
