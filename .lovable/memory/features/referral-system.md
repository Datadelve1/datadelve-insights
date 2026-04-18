---
name: Referral system
description: Cohort 2 referral codes — admin-managed referrers table, optional code on enrollment form, filterable in admin
type: feature
---
**Referral tracking for Cohort 2 enrollments.**

- New `referrers` table: `code` (unique, uppercase), `full_name`, optional email/notes, `is_active` flag.
- Admin manages referrers at `/admin/referrers` — CRUD interface with referral count per code.
- Enrollment form (`EnrollmentModal.tsx` Step 1) has an **optional** "Referral Code" field. Auto-uppercased.
- `submit-manual-enrollment` edge function validates the code against `referrers` table (must exist + be active) and stores normalized uppercase value in `cohort2_enrollments.referral_code`. Empty/null is allowed.
- Admin Enrollments page (`/admin/enrollments`) shows a **Referral** column and a top-level **search box** that filters all 3 track tabs by referral code substring (case-insensitive).
- Admin notification email includes referral code in detail line when present.
