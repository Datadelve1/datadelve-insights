---
name: Referral system
description: Cohort 2 referral codes — admin-managed referrers, optional code on enrollment form, leaderboard on admin overview, email notify referrer on use
type: feature
---
**Referral tracking for Cohort 2 enrollments.**

- `referrers` table: `code` (unique, uppercase), `full_name`, optional email/notes, `is_active` flag.
- Admin manages referrers at `/admin/referrers` — CRUD interface with referral count per code.
- Enrollment form (`EnrollmentModal.tsx` Step 1) has an **optional** "Referral Code" field, auto-uppercased.
- `submit-manual-enrollment` edge function:
  - Validates the code against `referrers` (must exist + be active); stores normalized uppercase value in `cohort2_enrollments.referral_code`.
  - When the code is valid AND the referrer has an email on file, sends a `referrer-notification` transactional email so they know they earned a referral.
- Admin Enrollments page (`/admin/enrollments`) shows a **Referral** column and a top-level **search box** filtering all 3 track tabs by referral code substring.
- Admin Overview (`/admin`) includes a **Referrals Leaderboard** card listing referrer name, code, and enrollment count, sorted descending.
- Admin notification email includes referral code in detail line when present.
