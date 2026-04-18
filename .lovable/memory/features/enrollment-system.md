---
name: Enrollment system
description: Cohort 2 manual bank-transfer enrollment flow with admin confirmation
type: feature
---
**Cohort 2 enrollment is via manual bank transfer (Paystack disabled).**

5-step flow in `EnrollmentModal.tsx`:
1. Personal Details & Track Selection (Beginner ₦10k, Professional ₦50k, Advanced ₦100k; +₦10k optional certificate)
2. Commitment Agreement — "commitment fee, not full payment" reassurance text shows for ALL tracks (Beginner, Professional, Advanced) so the experience is identical across tiers.
3. Class schedule (weekday Mon/Wed 5-8pm or weekend Fri/Sat 6-9pm)
4. Payment instructions — display bank details: **Wema Bank · 0127561293 · Delvetek Limited**. Instruction copy emphasises "pay first, THEN click". Primary button is labelled **"Next — After Payment"** (not "I Have Paid"); clicking it registers enrollment as `pending_manual` (edge function `submit-manual-enrollment`).
5. Success screen — shows generated reference code (DLV-XXXXXX) and "Send Proof on WhatsApp" button (wa.me/447775739225 with prefilled message containing name/email/track/reference). Copy reminds the student we will get back to them after they send proof.

**Admin confirmation flow**: Admin sees pending enrollments in Enrollment Management with reference code visible. Clicking "Confirm Payment & Send Login" calls `confirm-manual-enrollment` edge function which:
- Creates Supabase auth user (or updates existing user's password)
- Sets enrollment to paid + confirmed_by_admin=true
- Creates certificate_payments record if requested
- Sends `enrollment-welcome` transactional email with login credentials

**CRITICAL**: Welcome email with dashboard login is ONLY sent after admin confirms payment — never automatically.
