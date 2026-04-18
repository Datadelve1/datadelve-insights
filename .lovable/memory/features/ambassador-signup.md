---
name: Ambassador signup & tracking
description: Public /become-ambassador form, admin approval+code assignment in /admin/referrers (Signups tab), and no-login /track/:code referrer dashboard via SECURITY DEFINER RPC
type: feature
---
**Public ambassador onboarding without student-login overlap.**

- Public form at `/become-ambassador` (`AmbassadorSignup.tsx`) collects: full_name, email, phone, why_refer. Saves to `ambassador_signups` table with `status='pending'`.
- Admins review at `/admin/referrers` → "Ambassador Signups" tab. Approve action opens dialog to assign a referral code (suggestion: `FIRSTNAME2026`), which:
  - Creates a row in `referrers` table linked back via `signup.referrer_id`.
  - Updates signup `status='approved'`.
  - Admin then copies tracking link from Referrers tab (link icon button) and emails it manually.
- No-login tracking page `/track/:code` (`ReferrerTracking.tsx`) — calls `get_referrer_tracking(_code)` RPC (SECURITY DEFINER) which returns referrer name, code, total count, paid count, and a list of enrollments showing only **first name** (privacy), track, payment status, date.
- `ambassador_signups` RLS: anyone can INSERT, only admins can SELECT/UPDATE/DELETE.
- `get_referrer_tracking` is granted to `anon` and `authenticated` so the link works without a login.
- No new auth users are created — fully decoupled from student/staff/admin login systems.
