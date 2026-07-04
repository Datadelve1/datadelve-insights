# Staff Operations Centre

A new internal system inside the LMS, completely hidden from students. It manages cohorts, students, communications, events, tasks and reminders — but **never sends any email without explicit admin approval**.

## Core principle

The system **prepares** everything (drafts, schedules, reminders, tasks) and **waits for a human admin to approve** before any email leaves. No cron, trigger, or automation is allowed to call the email sender directly.

## Where it lives

- New section under the existing Staff area at `/staff/ops/*` (staff login required).
- Students have zero access — enforced by role check + RLS.
- Reuses existing staff auth (`useStaffAuth`) and the `has_role('admin')` function for elevated actions.

## Pages / modules

1. **Ops Dashboard** (`/staff/ops`) — Today's tasks, overdue tasks, upcoming events, upcoming cohorts, emails pending approval, alerts, recent activity.
2. **Ops Calendar** (`/staff/ops/calendar`) — Month / Week / Day views. Shows cohort onboarding, beginner classes, professional classes, graduation, meetings, task deadlines, pending email schedules, company events. Click an item → detail drawer.
3. **Cohorts** (`/staff/ops/cohorts`) — List + detail. Each cohort: number, onboarding date, graduation date, beginner class dates, professional class dates, assigned staff, students, email schedule, operational checklist. "Create from template" duplicates a prior cohort's workflow (tasks + email schedule).
4. **Cohort students** (inside cohort detail) — Table with Name / Email / Status (Registered / Confirmed / Withdrawn). Add manually, paste multiple emails (one per line or comma-separated), edit, remove.
5. **Communications Centre** (`/staff/ops/emails`) — All email drafts. Filters by status: Draft, Waiting for Approval, Scheduled, Sent, Failed. Row actions: open, edit subject/body, edit recipients, preview, Approve → Send Now, Approve → Schedule, Reject.
6. **Tasks** (`/staff/ops/tasks`) — "My Tasks" (staff sees only their own) and "Company Board" (shared operational tasks, admin-managed). Fields: title, assignee, due date, priority, status, notes, recurrence rule.
7. **Activity Log** (`/staff/ops/activity`) — Append-only audit of every action (who, when, what, result).
8. **Notifications** — Bell in the ops header showing tasks due, overdue, emails awaiting approval, upcoming cohorts/events, failed sends.

## Email workflow (the important part)

1. When a cohort is created (or a scheduled email is added), the system inserts **draft** rows into `ops_emails` with status `waiting_approval`, a scheduled date, template hint, and recipient snapshot from the cohort's student list.
2. A daily/periodic check surfaces "due for review" emails on the dashboard and in notifications — it never sends.
3. Admin opens the draft → edits subject/body → reviews/edits recipient list → previews.
4. Admin clicks **Send Now** or **Approve & Schedule**.
   - Send Now → server action calls the existing `send-transactional-email` function per recipient, marks row `sent` (or `failed` with error).
   - Schedule → status `scheduled` with `send_at`. A cron job only flips scheduled rows to a queue *and pings admins to confirm*, it does not send on its own. (Optional stricter mode: scheduled rows still require a final one-click confirm at send time — configurable per email.)
5. Every state change writes to `ops_activity_log`.

Statuses: `draft`, `waiting_approval`, `scheduled`, `sent`, `failed`.

## Roles

- **Student**: no access. Any `/staff/ops/*` route redirects to `/dashboard`.
- **Staff (non-admin)**: Dashboard, Calendar (read), own Tasks, Cohorts (read), Emails (read, cannot approve/send).
- **Admin** (`has_role('admin')`): full access, only role allowed to approve/send emails, create cohorts, manage company task board.

## Seed data

Cohort 3 pre-created: number = 3, onboarding = 2026-07-31, empty student list, empty email schedule template that admin can populate as students register.

## Database (new tables, all in `public`, RLS on, GRANTs included)

- `ops_cohorts` — number, onboarding_date, graduation_date, beginner_dates (date[]), professional_dates (date[]), notes.
- `ops_cohort_staff` — cohort_id, staff_user_id, role.
- `ops_cohort_students` — cohort_id, full_name, email, status.
- `ops_emails` — cohort_id (nullable), type, subject, body, recipients (jsonb), scheduled_at, status, approved_by, approved_at, sent_at, error, created_by.
- `ops_events` — title, kind (meeting/class/graduation/onboarding/custom), starts_at, ends_at, cohort_id (nullable), location, notes.
- `ops_tasks` — title, description, assignee_user_id (nullable = company board), cohort_id (nullable), due_date, priority, status, recurrence (jsonb), created_by, completed_at.
- `ops_checklist_items` — cohort_id, label, done, done_at, done_by.
- `ops_activity_log` — actor_user_id, actor_kind (staff/admin/system), action, entity_type, entity_id, detail (jsonb), created_at.
- `ops_notifications` — user_id, kind, title, body, link, read_at, created_at.

RLS: staff can read rows relevant to them; only admins can insert/update cohorts, approve/send emails, and manage the company board. Students have no grants.

## Technical section

- Stack: existing React + Vite + Tailwind + shadcn + Lovable Cloud (Supabase). No new deps required for calendar — build lightweight month/week/day grid with existing `date-fns` + shadcn primitives (or add `react-day-picker` views already present).
- Layout: new `StaffOpsLayout` with sidebar (Dashboard, Calendar, Cohorts, Communications, Tasks, Activity) + top bar with notification bell. Reuses existing sidebar primitives.
- Route guard: wrapper hook using `useStaffAuth` + role check; non-staff → `/dashboard`, non-admin hitting admin-only routes → read-only view.
- Email sending: reuses existing `send-transactional-email` edge function. New edge function `ops-approve-and-send` runs only when invoked by an authenticated admin (verifies `has_role('admin')` server-side), iterates recipients, writes results to `ops_emails` + `ops_activity_log`. **No cron ever calls this function.**
- Scheduled reminders: a lightweight cron edge function `ops-tick` (every 15 min) only creates `ops_notifications` rows (e.g. "3 emails ready for review", "task overdue") — it never sends email.
- Recurring tasks: on completion, if `recurrence` set, insert the next occurrence.
- Activity log: written by both client actions (via RPC) and the send function.

## Build order

1. Migration: create all `ops_*` tables + GRANTs + RLS + `ops_approve_email` / `ops_log_activity` RPCs. Seed Cohort 3.
2. Route guard hook + `StaffOpsLayout` + sidebar + placeholder pages.
3. Cohorts module (list, create, detail, students, checklist).
4. Communications Centre (list, filters, editor, preview, approve/send/schedule).
5. `ops-approve-and-send` edge function.
6. Tasks module (My Tasks + Company Board, recurrence).
7. Calendar module (month/week/day aggregating cohorts, events, tasks, scheduled emails).
8. Ops Dashboard aggregating all widgets.
9. Notifications bell + `ops-tick` cron (notifications only).
10. Activity Log page.

## Out of scope for this build

- SMS / WhatsApp / push notifications (email + in-app only).
- Bulk CSV import beyond paste-multiple-emails.
- Per-recipient email personalization tokens beyond `{{first_name}}` (can add later).
