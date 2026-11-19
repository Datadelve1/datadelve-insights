import { describe, expect, it } from "vitest";
import { getOpsScope } from "./opsScope";

describe("Operations-only access", () => {
  it("limits David to Cohort 4", () => {
    expect(getOpsScope("David.Gbadebo4@gmail.com")).toEqual({ cohorts: [4] });
  });
  it("leaves other admins unrestricted", () => {
    expect(getOpsScope("datadelve1@gmail.com")).toBeNull();
  });
});
