import { describe, expect, it } from "vitest";
import { assignmentDeadline, buildTaskEmail, tracksFor, taskTrack } from "./opsTaskEmails";

const ymdhm = (d: Date) => [d.getFullYear(), d.getMonth() + 1, d.getDate(), d.getHours(), d.getMinutes()];

describe("Saturday recording & assignment email", () => {
  it("sets the deadline to the Wednesday after the Saturday class at 11:59 PM", () => {
    const d = assignmentDeadline("2026-11-21", new Date(2026, 10, 21, 22, 0)); // sent Saturday night
    expect(d.getDay()).toBe(3);
    expect(ymdhm(d)).toEqual([2026, 11, 25, 23, 59]);
  });

  it("keeps the same Wednesday when the email goes out on Sunday", () => {
    expect(ymdhm(assignmentDeadline("2026-11-21", new Date(2026, 10, 22, 9, 0)))).toEqual([2026, 11, 25, 23, 59]);
  });

  it("never gives a deadline in the past when the email is sent late", () => {
    expect(ymdhm(assignmentDeadline("2026-09-12", new Date(2026, 10, 20, 9, 0)))).toEqual([2026, 11, 25, 23, 59]);
  });

  it("puts the Wednesday 11:59 PM deadline in the email students receive", () => {
    const e = buildTaskEmail({ id: "1", title: "Cohort 4 — Beginner Recording & Assignment Uploaded (Week 1 - Saturday)", task_type: "email", due_date: "2026-11-21" }, 4, "", new Date(2026, 10, 21, 22, 0));
    expect(e.body).toContain("Wednesday, November 25 at 11:59 PM");
  });

  it("sends beginner tasks to beginner students only, professional tasks to professional and advanced", () => {
    expect(tracksFor(taskTrack({ id: "1", title: "Cohort 4 — Beginner Class Link (Week 1 - Saturday)", task_type: "class_link", due_date: null }))).toEqual(["beginner"]);
    expect(tracksFor(taskTrack({ id: "1", title: "Cohort 4 — Professional Class Link (Week 1 - Saturday)", task_type: "class_link", due_date: null }))).toEqual(["professional", "advanced"]);
  });
});
