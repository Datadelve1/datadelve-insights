import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Video, Lock, Play, Loader2 } from "lucide-react";

interface ClassRecording {
  id: string;
  week_number: number;
  title: string;
  description: string;
  video_url: string;
}

const ClassRecordings = ({ submittedWeeks }: { submittedWeeks: Set<number> }) => {
  const { user } = useAuth();
  const [recordings, setRecordings] = useState<ClassRecording[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle className="font-display flex items-center gap-2 text-foreground">
          <Video className="w-5 h-5 text-primary" /> Class Recordings
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
              const unlocked = submittedWeeks.has(rec.week_number);
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
                          Week {rec.week_number}: {rec.title}
                        </p>
                        {rec.description && (
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {rec.description}
                          </p>
                        )}
                      </div>
                    </div>

                    {unlocked ? (
                      <a
                        href={rec.video_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
                      >
                        <Play className="w-4 h-4" /> Watch
                      </a>
                    ) : (
                      <span className="text-xs text-muted-foreground bg-muted px-3 py-1.5 rounded-lg">
                        Submit Week {rec.week_number} review to unlock
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
  );
};

export default ClassRecordings;
