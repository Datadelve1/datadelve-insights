/**
 * Attendance-based access control utilities.
 * Students can only access videos, assignments, and reviews for a week if:
 * 1. Admin has marked them as "present" for that session (Friday or Saturday)
 * 2. Current time is past the required hour (8 PM for reviews, 10 PM for content)
 * 3. Review must be submitted before accessing videos/assignments
 *
 * Admins are exempt from all restrictions.
 * Certain students are exempted from attendance/timing checks for video access.
 */

/** Students who get unrestricted access to all recordings regardless of attendance */
const VIDEO_EXEMPT_USER_IDS = new Set([
  "5037fadb-d49c-4a29-b09b-d44e7982ecb2", // Ikediashi Joshua
]);

export function isVideoExempt(userId: string | undefined): boolean {
  return !!userId && VIDEO_EXEMPT_USER_IDS.has(userId);
}

const PROGRAM_START_MS = new Date("2026-03-27T18:00:00+01:00").getTime();

/** Check if the current time is past 10 PM WAT for a specific session */
export function isAfter10PMForSession(weekNumber: number, day: 'friday' | 'saturday'): boolean {
  const dayOffset = day === 'friday' ? 4 : 28;
  const sessionTime = PROGRAM_START_MS + (weekNumber - 1) * 7 * 24 * 60 * 60 * 1000 + dayOffset * 60 * 60 * 1000;
  return Date.now() >= sessionTime;
}

/** Check if the current time is past 8 PM WAT for a specific session (for reviews) */
export function isAfter8PMForSession(weekNumber: number, day: 'friday' | 'saturday'): boolean {
  // Friday 8 PM WAT = PROGRAM_START (Fri 6 PM) + 2 hours
  // Saturday 8 PM WAT = PROGRAM_START + 26 hours
  const dayOffset = day === 'friday' ? 2 : 26;
  const sessionTime = PROGRAM_START_MS + (weekNumber - 1) * 7 * 24 * 60 * 60 * 1000 + dayOffset * 60 * 60 * 1000;
  return Date.now() >= sessionTime;
}

/**
 * Check if a student has access to a specific week's content (videos/assignments).
 * Requires attendance + past 10 PM + review submitted.
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

/**
 * Full content access: attendance + timing + review gate.
 * Must have submitted review before accessing videos/assignments.
 */
export function hasContentAccess(
  weekNumber: number,
  attendance: Record<string, string>,
  submittedReviews: Record<string, boolean>,
  isAdmin: boolean
): boolean {
  if (isAdmin) return true;
  const weekAccess = hasWeekAccess(weekNumber, attendance, isAdmin);
  const reviewDone = hasReviewForWeek(weekNumber, submittedReviews);
  return weekAccess && reviewDone;
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

/** Check if review can be submitted for a specific session */
export function canSubmitReview(
  weekNumber: number,
  day: 'friday' | 'saturday',
  attendance: Record<string, string>,
  isAdmin: boolean
): boolean {
  if (isAdmin) return true;
  const key = `${weekNumber}-${day}`;
  return attendance[key] === "present" && isAfter8PMForSession(weekNumber, day);
}

/** Check if student has submitted a review for at least one session in a week */
export function hasReviewForWeek(
  weekNumber: number,
  submittedReviews: Record<string, boolean>
): boolean {
  return !!submittedReviews[`${weekNumber}-friday`] || !!submittedReviews[`${weekNumber}-saturday`];
}

/** Count number of sessions where student was absent */
export function countMissedSessions(attendance: Record<string, string>, totalSessionKeys: string[]): number {
  return totalSessionKeys.filter(key => attendance[key] !== "present").length;
}
