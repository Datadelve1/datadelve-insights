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

import { PROGRAM_START, getCohortStart } from "./programDates";

/** Students who get unrestricted access to all recordings regardless of attendance */
const VIDEO_EXEMPT_USER_IDS = new Set([
  "5037fadb-d49c-4a29-b09b-d44e7982ecb2", // Ikediashi Joshua
  "f329ab0d-22a3-4cc9-ac5b-95191f99c56e", // Eniola Lambo
]);

export function isVideoExempt(userId: string | undefined): boolean {
  return !!userId && VIDEO_EXEMPT_USER_IDS.has(userId);
}

const PROGRAM_START_MS = PROGRAM_START.getTime();

function sessionStartMs(cohort?: string | null): number {
  return cohort ? getCohortStart(cohort).getTime() : PROGRAM_START_MS;
}

/** Check if the current time is past 10 PM WAT for a specific session */
export function isAfter10PMForSession(weekNumber: number, day: 'friday' | 'saturday', cohort?: string | null): boolean {
  // Friday 10 PM WAT = cohort start (Fri 6 PM WAT) + 4 hours
  // Saturday 10 PM WAT = cohort start + 28 hours
  const dayOffset = day === 'friday' ? 4 : 28;
  const sessionTime = sessionStartMs(cohort) + (weekNumber - 1) * 7 * 24 * 60 * 60 * 1000 + dayOffset * 60 * 60 * 1000;
  return Date.now() >= sessionTime;
}

/** Check if the current time is past 8 PM WAT for a specific session (for reviews) */
export function isAfter8PMForSession(weekNumber: number, day: 'friday' | 'saturday', cohort?: string | null): boolean {
  // Friday 8 PM WAT = cohort start (Fri 6 PM) + 2 hours
  // Saturday 8 PM WAT = cohort start + 26 hours
  const dayOffset = day === 'friday' ? 2 : 26;
  const sessionTime = sessionStartMs(cohort) + (weekNumber - 1) * 7 * 24 * 60 * 60 * 1000 + dayOffset * 60 * 60 * 1000;
  return Date.now() >= sessionTime;
}

/**
 * Check if a student has access to a specific week's content (videos/assignments).
 * Requires the session time to have passed.
 */
export function hasWeekAccess(
  weekNumber: number,
  attendance: Record<string, string>,
  isAdmin: boolean,
  userId?: string,
  cohort?: string | null
): boolean {
  if (isAdmin || isVideoExempt(userId)) return true;
  return isAfter10PMForSession(weekNumber, 'friday', cohort) ||
         isAfter10PMForSession(weekNumber, 'saturday', cohort);
}

/**
 * Full content access: timing + review gate.
 * Must have submitted review before accessing videos/assignments.
 */
export function hasContentAccess(
  weekNumber: number,
  attendance: Record<string, string>,
  submittedReviews: Record<string, boolean>,
  isAdmin: boolean,
  userId?: string,
  cohort?: string | null
): boolean {
  if (isAdmin || isVideoExempt(userId)) return true;
  const weekAccess = hasWeekAccess(weekNumber, attendance, isAdmin, userId, cohort);
  const reviewDone = hasReviewForWeek(weekNumber, submittedReviews);
  return weekAccess && reviewDone;
}

/** Check access for a specific session (Friday or Saturday) */
export function hasSessionAccess(
  weekNumber: number,
  day: 'friday' | 'saturday',
  attendance: Record<string, string>,
  isAdmin: boolean,
  cohort?: string | null
): boolean {
  if (isAdmin) return true;
  return isAfter10PMForSession(weekNumber, day, cohort);
}

/**
 * Check if review can be submitted for a specific session.
 * Only gated by the session time (8 PM WAT) — admin attendance marking is not required.
 */
export function canSubmitReview(
  weekNumber: number,
  day: 'friday' | 'saturday',
  attendance: Record<string, string>,
  isAdmin: boolean,
  cohort?: string | null
): boolean {
  if (isAdmin) return true;
  return isAfter8PMForSession(weekNumber, day, cohort);
}

/** Check if student has submitted a review for at least one session in a week */
export function hasReviewForWeek(
  weekNumber: number,
  submittedReviews: Record<string, boolean>
): boolean {
  return !!submittedReviews[`${weekNumber}-any`] ||
         !!submittedReviews[`${weekNumber}-friday`] ||
         !!submittedReviews[`${weekNumber}-saturday`];
}

/** Count number of sessions where student was absent */
export function countMissedSessions(attendance: Record<string, string>, totalSessionKeys: string[]): number {
  return totalSessionKeys.filter(key => attendance[key] !== "present").length;
}
