/** Ready-made emails for Ops Centre tasks (class links, Saturday recording/assignment notices, etc.). */
import { addDays, format, parseISO } from "date-fns";

export interface OpsTaskLike {
  id: string;
  title: string;
  task_type: string | null;
  due_date: string | null;
  description?: string | null;
}

export type TaskTrack = "all" | "beginner" | "professional";

export function isRecordingTask(t: OpsTaskLike): boolean {
  return /Recording & Assignment Uploaded/i.test(t.title);
}

/** Tasks that send an email to the cohort when the assignee clicks "Send". */
export function isSendableTask(t: OpsTaskLike): boolean {
  return t.task_type === "email" || t.task_type === "class_link";
}

/**
 * Assignment deadline after a Saturday class: the next Wednesday, 11:59 PM.
 * If the email goes out late, the deadline is counted from the send day so it is never in the past.
 */
export function assignmentDeadline(saturdayISO: string, sendDay: Date = new Date()): Date {
  const sat = parseISO(saturdayISO);
  const today = new Date(sendDay.getFullYear(), sendDay.getMonth(), sendDay.getDate());
  let d = addDays(sat > today ? sat : today, 1);
  while (d.getDay() !== 3) d = addDays(d, 1);
  d.setHours(23, 59, 0, 0);
  return d;
}

export function formatDeadline(saturdayISO: string, sendDay?: Date): string {
  return format(assignmentDeadline(saturdayISO, sendDay), "EEEE, MMMM d") + " at 11:59 PM";
}

export function taskTrack(t: OpsTaskLike): TaskTrack {
  if (/Beginner/i.test(t.title)) return "beginner";
  if (/Professional/i.test(t.title)) return "professional";
  return "all";
}

/** Tracks whose students receive the email. Advanced students attend professional classes too. */
export function tracksFor(track: TaskTrack): string[] | null {
  if (track === "beginner") return ["beginner"];
  if (track === "professional") return ["professional", "advanced"];
  return null;
}

function weekLabel(title: string): string {
  const m = title.match(/\((Week \d+) - (Friday|Saturday)\)/i);
  return m ? `${m[1]} (${m[2]})` : "";
}

export function buildTaskEmail(t: OpsTaskLike, cohortNumber: number | null, classLink = "", sendDay: Date = new Date()) {
  const cohort = cohortNumber ? `Cohort ${cohortNumber}` : "your cohort";
  const week = weekLabel(t.title);
  const sign = "The Delvetek Team";
  const help = "Any questions? Reply to this email or message us on WhatsApp: +44 7775 739225.";

  if (isRecordingTask(t) && t.due_date) {
    const deadline = formatDeadline(t.due_date, sendDay);
    return {
      needsClassLink: false,
      subject: `${week ? week + " — " : ""}Recording is up & new assignment (due ${format(assignmentDeadline(t.due_date, sendDay), "EEE MMM d")}, 11:59 PM)`,
      body: [
        "Hi {first_name},",
        `Thank you for joining this week's ${cohort} classes.`,
        "• The class recording has been uploaded to your student dashboard.\n• This week's assignment has also been uploaded.",
        `Assignment deadline: ${deadline}. Please submit before then — late submissions are not accepted.`,
        "Log in here:\nhttps://www.datadelve.io/dashboard",
        help,
        sign,
      ].join("\n\n"),
    };
  }

  if (t.task_type === "class_link") {
    return {
      needsClassLink: true,
      subject: `${cohort} class link${week ? ` — ${week}` : ""}`,
      body: [
        "Hi {first_name},",
        `Here is your Delvetek class link${week ? ` for ${week}` : ""}.`,
        `Join the class here:\n${classLink.trim() || "[add class link]"}`,
        "Please join on time with your laptop and tools ready.",
        "See you in class,\n" + sign,
      ].join("\n\n"),
    };
  }

  const topic = t.title.replace(/^Cohort \d+\s*[—-]\s*/i, "").trim();
  return {
    needsClassLink: false,
    subject: `${cohort}: ${topic}`,
    body: ["Hi {first_name},", `[Write the ${topic} message here.]`, help, sign].join("\n\n"),
  };
}
