/**
 * Submission Window Logic
 * Opens: Saturday 8 PM WAT (UTC+1)
 * Closes: Wednesday 11:59 PM WAT (UTC+1)
 * Weekly cycle starting from Week 1 class on Friday March 27, 2026
 */

const PROGRAM_START = new Date("2026-03-27T18:00:00+01:00"); // Friday March 27 2026, 6PM WAT
const TOTAL_WEEKS = 8;

// WAT = UTC+1
const WAT_OFFSET_MS = 1 * 60 * 60 * 1000;

function nowWAT(): Date {
  const now = new Date();
  // Convert to WAT by getting UTC time + 1 hour
  return new Date(now.getTime() + WAT_OFFSET_MS + now.getTimezoneOffset() * 60 * 1000);
}

export interface SubmissionWindowInfo {
  /** Is any submission window currently open? */
  isOpen: boolean;
  /** Which week number is currently accepting submissions (1-8), or null */
  currentWeek: number | null;
  /** When the current/next window opens */
  windowOpen: Date;
  /** When the current/next window closes */
  windowClose: Date;
  /** Human-readable status message */
  message: string;
  /** Time remaining as a formatted string */
  timeRemaining: string;
}

function getWindowForWeek(week: number): { open: Date; close: Date } {
  // Week N class is on Friday of that week
  // Friday = PROGRAM_START + (week-1)*7 days
  const fridayMs = PROGRAM_START.getTime() + (week - 1) * 7 * 24 * 60 * 60 * 1000;
  
  // Saturday 8 PM WAT = Friday + 1 day + 20 hours = Friday + 44 hours
  // In UTC: Saturday 8PM WAT = Saturday 7PM UTC
  const openMs = fridayMs + (26 * 60 * 60 * 1000); // +26 hours from Friday 6PM = Saturday 8PM
  
  // Wednesday 11:59 PM WAT = Friday + 5 days + 23h59m
  // From Friday 6PM WAT: +5 days + 5h59m = +125h59m
  const closeMs = fridayMs + (125 * 60 + 59) * 60 * 1000; // +125h59m from Friday 6PM

  return {
    open: new Date(openMs),
    close: new Date(closeMs),
  };
}

function formatTimeRemaining(ms: number): string {
  if (ms <= 0) return "0m";
  const totalMinutes = Math.floor(ms / 60000);
  const days = Math.floor(totalMinutes / 1440);
  const hours = Math.floor((totalMinutes % 1440) / 60);
  const minutes = totalMinutes % 60;
  
  const parts: string[] = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0 || parts.length === 0) parts.push(`${minutes}m`);
  return parts.join(" ");
}

export function getSubmissionWindow(): SubmissionWindowInfo {
  const now = new Date();

  for (let week = 1; week <= TOTAL_WEEKS; week++) {
    const { open, close } = getWindowForWeek(week);

    if (now >= open && now <= close) {
      return {
        isOpen: true,
        currentWeek: week,
        windowOpen: open,
        windowClose: close,
        message: `Week ${week} submissions are open`,
        timeRemaining: formatTimeRemaining(close.getTime() - now.getTime()),
      };
    }
  }

  // Find next upcoming window
  for (let week = 1; week <= TOTAL_WEEKS; week++) {
    const { open, close } = getWindowForWeek(week);
    if (now < open) {
      return {
        isOpen: false,
        currentWeek: null,
        windowOpen: open,
        windowClose: close,
        message: `Submissions open Saturday 8 PM (Week ${week})`,
        timeRemaining: formatTimeRemaining(open.getTime() - now.getTime()),
      };
    }
  }

  // All windows have passed
  return {
    isOpen: false,
    currentWeek: null,
    windowOpen: new Date(),
    windowClose: new Date(),
    message: "Submission period has ended",
    timeRemaining: "0m",
  };
}

/** Returns which weeks currently have open or past-open windows (for filtering) */
export function getOpenWeeks(): Set<number> {
  const now = new Date();
  const weeks = new Set<number>();
  for (let week = 1; week <= TOTAL_WEEKS; week++) {
    const { close } = getWindowForWeek(week);
    // A week's window has been available if we're past its close
    // or currently within its window
    if (now <= close) {
      const { open } = getWindowForWeek(week);
      if (now >= open) weeks.add(week);
    }
  }
  return weeks;
}
