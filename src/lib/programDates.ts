/**
 * Program Date Mapping (Cohort 2)
 * Maps each week to its actual Friday and Saturday calendar dates.
 * Week 1: Fri Jun 12 / Sat Jun 13, 2026
 * Week 2: Fri Jun 19 / Sat Jun 20, 2026
 * ... follows weekly pattern through Week 8 (Fri Jul 31 / Sat Aug 1, 2026).
 */

// Program starts Friday June 12, 2026 at 6 PM WAT (UTC+1) — Cohort 2 default
export const PROGRAM_START = new Date("2026-06-12T18:00:00+01:00");
export const TOTAL_WEEKS = 8;

/** Week 1 Friday 6 PM WAT for each cohort */
export const COHORT_START_DATES: Record<string, string> = {
  "Cohort 1": "2026-03-27T18:00:00+01:00",
  "Cohort 2": "2026-06-12T18:00:00+01:00",
  "Cohort 3": "2026-07-31T18:00:00+01:00",
};

/** Resolve the Week 1 Friday start for a given cohort (falls back to Cohort 2) */
export function getCohortStart(cohort?: string | null): Date {
  const iso = (cohort && COHORT_START_DATES[cohort]) || COHORT_START_DATES["Cohort 2"];
  return new Date(iso);
}

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

function buildSessionDate(week: number, day: "friday" | "saturday", start: Date = PROGRAM_START): SessionDate {
  const dayOffset = day === "friday" ? 0 : 1; // Saturday is 1 day after Friday
  const weekOffset = (week - 1) * 7;
  const date = new Date(start.getTime() + (weekOffset + dayOffset) * 24 * 60 * 60 * 1000);

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

/** Build the full session list for a cohort */
export function getSessionsForCohort(cohort?: string | null): SessionDate[] {
  const start = getCohortStart(cohort);
  const sessions: SessionDate[] = [];
  for (let w = 1; w <= TOTAL_WEEKS; w++) {
    sessions.push(buildSessionDate(w, "friday", start));
    sessions.push(buildSessionDate(w, "saturday", start));
  }
  return sessions;
}

// Pre-computed session dates for all weeks (Cohort 2 default)
export const ALL_SESSIONS: SessionDate[] = getSessionsForCohort();

/** Get session info for a specific week and day */
export function getSessionDate(week: number, day: "friday" | "saturday", cohort?: string | null): SessionDate {
  return getSessionsForCohort(cohort).find(s => s.week === week && s.day === day)!;
}

/** Get all sessions for a specific week */
export function getWeekSessions(week: number, cohort?: string | null): SessionDate[] {
  return getSessionsForCohort(cohort).filter(s => s.week === week);
}

/** Determine the current program week based on the current date (1-8, or null if before/after) */
export function getCurrentWeek(cohort?: string | null): number | null {
  const now = Date.now();
  const startMs = getCohortStart(cohort).getTime();
  
  if (now < startMs) return null;
  
  // Each week spans 7 days starting from the Friday
  const elapsed = now - startMs;
  const weekIndex = Math.floor(elapsed / (7 * 24 * 60 * 60 * 1000));
  const week = weekIndex + 1;
  
  if (week > TOTAL_WEEKS) return TOTAL_WEEKS;
  return week;
}

/** Get the ISO date string (YYYY-MM-DD) for a session — useful for pre-filling date fields */
export function getSessionISODate(week: number, day: "friday" | "saturday", cohort?: string | null): string {
  return getSessionDate(week, day, cohort).fullDate;
}
