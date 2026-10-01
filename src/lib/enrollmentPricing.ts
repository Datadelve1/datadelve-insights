// Discounted pricing remains active until Delvetek explicitly changes it.

export type TrackId = "beginner" | "professional" | "advanced";

export const DISCOUNTED_PRICES: Record<TrackId, number> = {
  beginner: 50000,
  professional: 100000,
  advanced: 150000,
};

// Registration stays open until the cohort starts.
export const REGISTRATION_CLOSE_ISO = "2026-10-29T22:59:59Z";

export function isRegistrationOpen(now: Date = new Date()): boolean {
  return now.getTime() <= new Date(REGISTRATION_CLOSE_ISO).getTime();
}

export function getTrackPrice(track: TrackId): number {
  return DISCOUNTED_PRICES[track];
}

export const PRICING_NOTICE =
  "Limited-time discounted pricing — secure your seat today";

