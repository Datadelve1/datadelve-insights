// Cohort 3 pricing — discounted until July 24 (end-of-day WAT),
// then normal price until registration closes end-of-day July 30 WAT.

export type TrackId = "beginner" | "professional" | "advanced";

export const NORMAL_PRICES: Record<TrackId, number> = {
  beginner: 150000,
  professional: 275000,
  advanced: 350000,
};

export const DISCOUNTED_PRICES: Record<TrackId, number> = {
  beginner: 50000,
  professional: 75000,
  advanced: 125000,
};

// WAT is UTC+1 with no DST — end of July 24 WAT === 2026-07-24T23:00:00Z
export const DISCOUNT_DEADLINE_ISO = "2026-07-24T23:00:00Z";
// End of July 30 WAT
export const REGISTRATION_CLOSE_ISO = "2026-07-30T23:00:00Z";

export function isDiscountActive(now: Date = new Date()): boolean {
  return now.getTime() <= new Date(DISCOUNT_DEADLINE_ISO).getTime();
}

export function isRegistrationOpen(now: Date = new Date()): boolean {
  return now.getTime() <= new Date(REGISTRATION_CLOSE_ISO).getTime();
}

export function getTrackPrice(track: TrackId, now: Date = new Date()): number {
  return isDiscountActive(now) ? DISCOUNTED_PRICES[track] : NORMAL_PRICES[track];
}

export const PRICING_NOTICE =
  "Discounted fee ends 24th July • Normal price applies from 25th July • Registration closes 30th July";
