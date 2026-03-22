import { useState, useEffect } from "react";
import { getSubmissionWindow, type SubmissionWindowInfo } from "@/lib/submissionWindow";
import { Clock, CalendarDays, Lock } from "lucide-react";

const SubmissionWindowBanner = ({ children }: { children: React.ReactNode }) => {
  const [windowInfo, setWindowInfo] = useState<SubmissionWindowInfo>(getSubmissionWindow());

  useEffect(() => {
    const interval = setInterval(() => {
      setWindowInfo(getSubmissionWindow());
    }, 60_000); // update every minute
    return () => clearInterval(interval);
  }, []);

  if (windowInfo.isOpen) {
    return (
      <>
        <div className="flex items-center gap-3 rounded-xl bg-primary/10 border border-primary/20 p-4 mb-4">
          <CalendarDays className="w-5 h-5 text-primary shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-display font-semibold text-foreground">
              {windowInfo.message}
            </p>
            <p className="text-xs text-muted-foreground">
              Closes Wednesday 11:59 PM · <Clock className="w-3 h-3 inline" /> {windowInfo.timeRemaining} remaining
            </p>
          </div>
        </div>
        {children}
      </>
    );
  }

  return (
    <div className="flex items-center gap-3 rounded-xl bg-secondary border border-border p-6">
      <Lock className="w-5 h-5 text-muted-foreground shrink-0" />
      <div>
        <p className="text-sm font-display font-semibold text-foreground">
          Submissions are currently closed
        </p>
        <p className="text-xs text-muted-foreground">
          {windowInfo.message} · Opens in {windowInfo.timeRemaining}
        </p>
      </div>
    </div>
  );
};

export default SubmissionWindowBanner;

export function useSubmissionWindow() {
  const [windowInfo, setWindowInfo] = useState<SubmissionWindowInfo>(getSubmissionWindow());

  useEffect(() => {
    const interval = setInterval(() => {
      setWindowInfo(getSubmissionWindow());
    }, 60_000);
    return () => clearInterval(interval);
  }, []);

  return windowInfo;
}
