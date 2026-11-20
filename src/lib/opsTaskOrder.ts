/** One order for Ops Centre tasks everywhere: by day, then by step within the day. */
import { isRecordingTask, type OpsTaskLike } from "./opsTaskEmails";

/** Within one day the class link goes out first; the recording & assignment email always comes after it. */
function stepRank(t: OpsTaskLike): number {
  if (t.task_type === "pre_onboarding" || t.task_type === "dashboard") return 0;
  if (t.task_type === "class_link") return 1;
  if (isRecordingTask(t)) return 3;
  return 2;
}

export function compareOpsTasks(a: OpsTaskLike, b: OpsTaskLike): number {
  if (a.due_date !== b.due_date) {
    if (!a.due_date) return 1;
    if (!b.due_date) return -1;
    return a.due_date < b.due_date ? -1 : 1;
  }
  const r = stepRank(a) - stepRank(b);
  if (r !== 0) return r;
  return a.title.localeCompare(b.title);
}

export function sortOpsTasks<T extends OpsTaskLike>(tasks: T[]): T[] {
  return [...tasks].sort(compareOpsTasks);
}
