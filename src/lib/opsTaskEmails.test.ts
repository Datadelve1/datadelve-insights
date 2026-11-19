import { describe, expect, it } from "vitest";
import { assignmentDeadline, buildTaskEmail, tracksFor, taskTrack } from "./opsTaskEmails";

describe("Saturday recording & assignment email", () => {
  it("sets the assignment deadline to the following Wednesday at 11:59 PM", () => {
    const d = assignmentDeadline("2026-11-21"); // Saturday
    expect(d.getDay()).toBe(3); // Wednesday
    expect([d.getFullYear(), d.getMonth() + 1, d.getDate(), d.getHours(), d.getMinutes()]).toEqual([2026, 11, 25, 23, 59]);
  });

  it("puts the Wednesday 11:59 PM deadline in the email students receive", () => {
    const e = buildTaskEmail({ id: "1", title: "Cohort 4 — Beginner Recording & Assignment Uploaded (Week 1 - Saturday)", task_type: "email", due_date: "2026-11-21" }, 4);
    expect(e.body).toContain("Wednesday, November 25 at 11:59 PM");
  });

  it("sends beginner tasks to beginner students only, professional tasks to professional and advanced", () => {
    expect(tracksFor(taskTrack({ id: "1", title: "Cohort 4 — Beginner Class Link (Week 1 - Saturday)", task_type: "class_link", due_date: null }))).toEqual(["beginner"]);
    expect(tracksFor(taskTrack({ id: "1", title: "Cohort 4 — Professional Class Link (Week 1 - Saturday)", task_type: "class_link", due_date: null }))).toEqual(["professional", "advanced"]);
  });
});
