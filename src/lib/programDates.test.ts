import { describe, expect, it } from "vitest";
import { getSessionISODate } from "./programDates";

describe("Cohort 4 class calendar", () => {
  it("starts with the first actual class on Friday November 20, 2026", () => {
    expect(getSessionISODate(1, "friday", "Cohort 4")).toBe("2026-11-20");
    expect(getSessionISODate(1, "saturday", "Cohort 4")).toBe("2026-11-21");
  });
});
