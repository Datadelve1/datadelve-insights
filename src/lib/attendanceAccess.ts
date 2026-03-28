/**
 * Attendance-based access control utilities.
 * Students can only access videos, assignments, and reviews for a week if:
 * 1. Admin has marked them as "present" for that session (Friday or Saturday)
 * 2. Current time is past 10 PM WAT on the day of that session
 * 
 * Admins are exempt from all restrictions.
 */

const PROGRAM_START_MS = new Date("2026-03-27T18:00:00+01:00").getTime();

/** Check if the current time is past 10 PM WAT for a specific session */
export function isAfter10PMForSession(weekNumber: number, day: 'friday' | 'saturday'): boolean {
  // PROGRAM_START = Friday 6 PM WAT for week 1
  // Friday 10 PM WAT = PROGRAM_START + (week-1)*7 days + 4 hours
  // Saturday 10 PM WAT = PROGRAM_START + (week-1)*7 days + 28 hours
  const dayOffset = day === 'friday' ? 4 : 28;
  const sessionTime = PROGRAM_START_MS + (weekNumber - 1) * 7 * 24 * 60 * 60 * 1000 + dayOffset * 60 * 60 * 1000;
  return Date.now() >= sessionTime;
}

/**
 * Check if a student has access to a specific week's content.
 * Access is granted if they attended either Friday or Saturday
 * and the current time is past 10 PM WAT on that session day.
 */
export function hasWeekAccess(
  weekNumber: number,
  attendance: Record<string, string>,
  isAdmin: boolean
): boolean {
  if (isAdmin) return true;
  const friPresent = attendance[`${weekNumber}-friday`] === "present";
  const satPresent = attendance[`${weekNumber}-saturday`] === "present";
  return (friPresent && isAfter10PMForSession(weekNumber, 'friday')) ||
         (satPresent && isAfter10PMForSession(weekNumber, 'saturday'));
}

/** Check access for a specific session (Friday or Saturday) */
export function hasSessionAccess(
  weekNumber: number,
  day: 'friday' | 'saturday',
  attendance: Record<string, string>,
  isAdmin: boolean
): boolean {
  if (isAdmin) return true;
  const key = `${weekNumber}-${day}`;
  return attendance[key] === "present" && isAfter10PMForSession(weekNumber, day);
}

/** Count number of sessions where student was absent */
export function countMissedSessions(attendance: Record<string, string>, totalSessionKeys: string[]): number {
  return totalSessionKeys.filter(key => attendance[key] !== "present").length;
}
