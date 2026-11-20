# Project Architecture Rules

- Course enrollment prices must come from the shared pricing module in the client and matching fixed maps in payment functions, so displayed and charged amounts remain aligned.
- Group emails (Ops Centre approve-and-send, class reminders, after-class follow-ups) go through the Brevo connector, never the Lovable app-email queue, which is reserved for one-recipient event emails; keeps sender reputation of account emails safe.
- Ops tasks are completed only through `completeOpsTask` (src/lib/opsTaskComplete.ts), which logs the change and sends the fixed-recipient "ops-task-completed" transactional email with a per-task idempotency key; one path means no completion skips the notification or sends it twice.
- People limited to the Operations page and certain cohorts are listed in `src/lib/opsScope.ts`; the admin portal, staff dashboard and other Ops routes redirect them to `/staff/ops`, and the Ops dashboard filters to their cohorts. This trims the view only; data rights still come from roles.
- Ops task lists are ordered only through `sortOpsTasks` (src/lib/opsTaskOrder.ts): by day, then cohort, then step within the day (each cohort's class link directly before its Saturday recording email); one order everywhere so the dashboard, task list and calendar agree.
- The admin portal menu, page titles and home shortcuts all read from `src/lib/adminNav.ts`, and the cohort picker from `ADMIN_COHORTS`; one list keeps the three in step when pages or cohorts change.
