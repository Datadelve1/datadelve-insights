# Project Architecture Rules

- Course enrollment prices must come from the shared pricing module in the client and matching fixed maps in payment functions, so displayed and charged amounts remain aligned.
- Group emails (Ops Centre approve-and-send, class reminders, after-class follow-ups) go through the Brevo connector, never the Lovable app-email queue, which is reserved for one-recipient event emails; keeps sender reputation of account emails safe.
- Ops tasks are completed only through `completeOpsTask` (src/lib/opsTaskComplete.ts), which logs the change and sends the fixed-recipient "ops-task-completed" transactional email with a per-task idempotency key; one path means no completion skips the notification or sends it twice.
- People limited to the Operations page and certain cohorts are listed in `src/lib/opsScope.ts`; the admin portal, staff dashboard and other Ops routes redirect them to `/staff/ops`, and the Ops dashboard filters to their cohorts. This trims the view only; data rights still come from roles.
