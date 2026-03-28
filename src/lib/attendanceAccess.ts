/**
 * Attendance-based access control utilities.
 * Students can only access videos, assignments, and reviews for a week if:
 * 1. Admin has marked them as "present" for that week
 * 2. Current time is past 9 PM WAT on the Friday of that week
 * 
 * Admins are exempt from all restrictions.
 */

const PROGRAM_START_MS = new Date("2026-03-27T18:00:00+01:00").getTime();

/** Check if the current time is past 9PM WAT on the Friday of the given week */
export function isAfter9PMForWeek(weekNumber: number): boolean {
  // PROGRAM_START = Friday 6PM WAT for week 1
  // Friday 9PM WAT = PROGRAM_START + (week-1)*7 days + 3 hours
  const friday9PM = PROGRAM_START_MS + (weekNumber - 1) * 7 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000;
  return Date.now() >= friday9PM;
}

/** Check if a student has access to a specific week's content */
export function hasWeekAccess(
  weekNumber: number,
  attendance: Record<number, string>,
  isAdmin: boolean
): boolean {
  if (isAdmin) return true;
  const isPresent = attendance[weekNumber] === "present";
  return isPresent && isAfter9PMForWeek(weekNumber);
}

/** Count number of weeks where student was absent (marked by admin) */
export function countMissedClasses(attendance: Record<number, string>, totalWeeksMarked: number[]): number {
  return totalWeeksMarked.filter(w => attendance[w] === "absent" || !(w in attendance && attendance[w] === "present")).length;
}
