/**
 * Program Date Mapping (Cohort 2)
 * Maps each week to its actual Friday and Saturday calendar dates.
 * Week 1: Fri Jun 12 / Sat Jun 13, 2026
 * Week 2: Fri Jun 19 / Sat Jun 20, 2026
 * ... follows weekly pattern through Week 8 (Fri Jul 31 / Sat Aug 1, 2026).
 */

// Program starts Friday June 12, 2026 at 6 PM WAT (UTC+1)
export const PROGRAM_START = new Date("2026-06-12T18:00:00+01:00");
export const TOTAL_WEEKS = 8;

export interface SessionDate {
  week: number;
  day: "friday" | "saturday";
  date: Date;
  label: string;       // e.g. "Week 2 Friday"
  shortLabel: string;  // e.g. "W2 Fri"
  dateLabel: string;   // e.g. "Apr 4"
  fullDate: string;    // e.g. "2026-04-04"
}

function pad(n: number) { return n < 10 ? `0${n}` : `${n}`; }

function buildSessionDate(week: number, day: "friday" | "saturday"): SessionDate {
  const dayOffset = day === "friday" ? 0 : 1; // Saturday is 1 day after Friday
  const weekOffset = (week - 1) * 7;
  const date = new Date(PROGRAM_START.getTime());
  // Move to the correct day: add weekOffset + dayOffset days, reset to midnight WAT
  date.setTime(PROGRAM_START.getTime() + (weekOffset + dayOffset) * 24 * 60 * 60 * 1000);

  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  // Extract date components in WAT (UTC+1)
  const watDate = new Date(date.getTime() + 1 * 60 * 60 * 1000); // shift to WAT for display
  const month = watDate.getUTCMonth();
  const dayOfMonth = watDate.getUTCDate();
  const year = watDate.getUTCFullYear();
  
  const dayName = day === "friday" ? "Friday" : "Saturday";
  const shortDay = day === "friday" ? "Fri" : "Sat";

  return {
    week,
    day,
    date,
    label: `Week ${week} ${dayName}`,
    shortLabel: `W${week} ${shortDay}`,
    dateLabel: `${monthNames[month]} ${dayOfMonth}`,
    fullDate: `${year}-${pad(month + 1)}-${pad(dayOfMonth)}`,
  };
}

// Pre-computed session dates for all weeks
export const ALL_SESSIONS: SessionDate[] = [];
for (let w = 1; w <= TOTAL_WEEKS; w++) {
  ALL_SESSIONS.push(buildSessionDate(w, "friday"));
  ALL_SESSIONS.push(buildSessionDate(w, "saturday"));
}

/** Get session info for a specific week and day */
export function getSessionDate(week: number, day: "friday" | "saturday"): SessionDate {
  return ALL_SESSIONS.find(s => s.week === week && s.day === day)!;
}

/** Get all sessions for a specific week */
export function getWeekSessions(week: number): SessionDate[] {
  return ALL_SESSIONS.filter(s => s.week === week);
}

/** Determine the current program week based on the current date (1-8, or null if before/after) */
export function getCurrentWeek(): number | null {
  const now = Date.now();
  const startMs = PROGRAM_START.getTime();
  
  if (now < startMs) return null;
  
  // Each week spans 7 days starting from the Friday
  const elapsed = now - startMs;
  const weekIndex = Math.floor(elapsed / (7 * 24 * 60 * 60 * 1000));
  const week = weekIndex + 1;
  
  if (week > TOTAL_WEEKS) return TOTAL_WEEKS;
  return week;
}

/** Get the ISO date string (YYYY-MM-DD) for a session — useful for pre-filling date fields */
export function getSessionISODate(week: number, day: "friday" | "saturday"): string {
  return getSessionDate(week, day).fullDate;
}
