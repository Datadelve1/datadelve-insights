import { describe, it, expect } from "vitest";
import { sortOpsTasks } from "./opsTaskOrder";

const t = (id: string, title: string, task_type: string | null, due_date: string | null) => ({ id, title, task_type, due_date });

describe("ops task order", () => {
  it("puts the Saturday recording email right after that Saturday's class link", () => {
    const sorted = sortOpsTasks([
      t("rec", "Cohort 4 — Beginner Recording & Assignment Uploaded (Week 1 - Saturday)", "email", "2026-11-21"),
      t("link", "Cohort 4 — Beginner Class Link (Week 1 - Saturday)", "class_link", "2026-11-21"),
      t("fri", "Cohort 4 — Beginner Class Link (Week 1 - Friday)", "class_link", "2026-11-20"),
      t("next", "Cohort 4 — Beginner Class Link (Week 2 - Friday)", "class_link", "2026-11-27"),
    ]);
    expect(sorted.map((x) => x.id)).toEqual(["fri", "link", "rec", "next"]);
  });

  it("keeps the recording email after other emails on the same Saturday", () => {
    const sorted = sortOpsTasks([
      t("rec", "Cohort 4 — Professional Recording & Assignment Uploaded (Week 1 - Saturday)", "email", "2027-02-13"),
      t("other", "Cohort 4 — Reminder email", "email", "2027-02-13"),
      t("link", "Cohort 4 — Professional Class Link (Week 1 - Saturday)", "class_link", "2027-02-13"),
    ]);
    expect(sorted.map((x) => x.id)).toEqual(["link", "other", "rec"]);
  });
});
