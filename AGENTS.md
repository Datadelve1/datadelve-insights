# Project Architecture Rules

- Course enrollment prices must come from the shared pricing module in the client and matching fixed maps in payment functions, so displayed and charged amounts remain aligned.- Group emails (Ops Centre approve-and-send, class reminders, after-class follow-ups) go through the Brevo connector, never the Lovable app-email queue, which is reserved for one-recipient event emails; keeps sender reputation of account emails safe.
