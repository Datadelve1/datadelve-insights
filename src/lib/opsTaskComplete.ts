import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

/**
 * Marks an Ops task done, logs it, and emails the operations lead (fixed recipient in the
 * "ops-task-completed" template). The idempotency key means re-ticking a task never re-sends.
 */
export async function completeOpsTask(
  task: { id: string; title: string; due_date: string | null },
  actor: { id: string; name: string; isAdmin: boolean },
  detail?: string,
): Promise<{ ok: boolean; error?: string }> {
  const now = new Date();
  const { error } = await supabase.from("ops_tasks").update({
    status: "completed",
    completed_at: now.toISOString(),
    completed_by: actor.id,
  }).eq("id", task.id);
  if (error) return { ok: false, error: error.message };

  await supabase.from("ops_activity_log").insert({
    actor_user_id: actor.id, actor_kind: actor.isAdmin ? "admin" : "staff",
    action: "task_completed", entity_type: "ops_tasks", entity_id: task.id,
    detail: { title: task.title, ...(detail ? { detail } : {}) },
  });

  const { error: mailErr } = await supabase.functions.invoke("send-transactional-email", {
    body: {
      templateName: "ops-task-completed",
      idempotencyKey: `ops-task-done-${task.id}`,
      templateData: {
        taskTitle: task.title,
        completedBy: actor.name,
        completedAt: format(now, "MMM d, yyyy h:mm a"),
        dueDate: task.due_date ? format(new Date(task.due_date + "T00:00:00"), "MMM d, yyyy") : undefined,
        detail,
      },
    },
  });
  if (mailErr) console.error("ops-task-completed notification failed:", mailErr);
  return { ok: true };
}
