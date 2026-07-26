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
  professional: 100000,
  advanced: 150000,
};

// Discount remains active until we manually revert. Set far in the future.
export const DISCOUNT_DEADLINE_ISO = "2099-12-31T23:00:00Z";
// Registration stays open alongside the discount.
export const REGISTRATION_CLOSE_ISO = "2099-12-31T23:00:00Z";

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
  "Limited-time discounted pricing — secure your seat today";

