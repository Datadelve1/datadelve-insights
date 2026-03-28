import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Video, Lock, Play, Loader2, Shield, Clock, FileText } from "lucide-react";
import ProtectedVideoPlayer from "./ProtectedVideoPlayer";
import { hasWeekAccess, hasReviewForWeek } from "@/lib/attendanceAccess";

interface ClassRecording {
  id: string;
  week_number: number;
  title: string;
  description: string;
  video_url: string;
}

interface ClassRecordingsProps {
  attendance: Record<string, string>;
  submittedReviews: Record<string, boolean>;
}

const ClassRecordings = ({ attendance, submittedReviews }: ClassRecordingsProps) => {
  const { user, isAdmin } = useAuth();
  const [recordings, setRecordings] = useState<ClassRecording[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeRecording, setActiveRecording] = useState<ClassRecording | null>(null);

  useEffect(() => {
    const fetchRecordings = async () => {
      const { data } = await supabase
        .from("class_recordings")
        .select("*")
        .order("week_number");
      setRecordings(data || []);
      setIsLoading(false);
    };
    if (user) fetchRecordings();
  }, [user]);

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
    <>
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="font-display flex items-center gap-2 text-foreground">
            <Video className="w-5 h-5 text-primary" /> Class Recordings
            <span className="ml-auto flex items-center gap-1 text-xs text-muted-foreground font-normal">
              <Shield className="w-3 h-3" /> Protected Content
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recordings.length === 0 ? (
            <div className="text-center py-8">
              <Video className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground font-medium">No recordings yet</p>
              <p className="text-sm text-muted-foreground">
                Class recordings will appear here after each session.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {recordings.map((rec) => {
                const timingOk = hasWeekAccess(rec.week_number, attendance, isAdmin);
                const reviewDone = isAdmin || hasReviewForWeek(rec.week_number, submittedReviews);
                const unlocked = timingOk && reviewDone;
                const attended =
                  attendance[`${rec.week_number}-friday`] === "present" ||
                  attendance[`${rec.week_number}-saturday`] === "present";

                let statusMessage = "";
                if (!attended) statusMessage = "Attendance required to unlock";
                else if (!timingOk) statusMessage = "Available after 10 PM";
                else if (!reviewDone) statusMessage = "Submit review first";

                return (
                  <div
                    key={rec.id}
                    className={`relative rounded-xl border p-4 transition-all ${
                      unlocked
                        ? "border-primary/20 bg-primary/5 hover:bg-primary/10"
                        : "border-border bg-secondary/50"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            unlocked
                              ? "bg-primary/20 text-primary"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {unlocked ? (
                            <Play className="w-5 h-5" />
                          ) : (
                            <Lock className="w-5 h-5" />
                          )}
                        </div>
                        <div>
                          <p className="font-display font-semibold text-foreground text-sm">
                            {rec.title}
                          </p>
                          {rec.description && (
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {rec.description}
                            </p>
                          )}
                        </div>
                      </div>

                      {unlocked ? (
                        <button
                          onClick={() => setActiveRecording(rec)}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
                        >
                          <Play className="w-4 h-4" /> Watch
                        </button>
                      ) : (
                        <span className="text-xs text-muted-foreground bg-muted px-3 py-1.5 rounded-lg flex items-center gap-1">
                          {!attended ? (
                            <Lock className="w-3 h-3" />
                          ) : !timingOk ? (
                            <Clock className="w-3 h-3" />
                          ) : (
                            <FileText className="w-3 h-3" />
                          )}
                          {statusMessage}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Secure Video Player Modal */}
      <Dialog open={!!activeRecording} onOpenChange={(open) => !open && setActiveRecording(null)}>
        <DialogContent className="max-w-5xl bg-card border-border p-0 overflow-hidden">
          <DialogHeader className="p-4 pb-0">
            <DialogTitle className="font-display text-foreground flex items-center gap-2">
              <Shield className="w-4 h-4 text-primary" />
              {activeRecording?.title}
            </DialogTitle>
          </DialogHeader>
          <div className="p-4 pt-2">
            {activeRecording && (
              <ProtectedVideoPlayer
                src={activeRecording.video_url}
                title={activeRecording.title}
              />
            )}
            <p className="text-[10px] text-muted-foreground mt-2 text-center">
              This content is protected. Downloading, sharing, or screen recording is prohibited.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ClassRecordings;
