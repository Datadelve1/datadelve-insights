-- Enable required extensions for scheduled jobs
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA pg_catalog;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Grant usage
GRANT USAGE ON SCHEMA cron TO postgres;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA cron TO postgres;

-- 3-day reminder: March 25, 2026 at 8:00 PM GMT+1 (7:00 PM UTC)
SELECT cron.schedule(
  'webinar-reminder-3-days',
  '0 19 25 3 *',
  $$
  SELECT net.http_post(
    url := 'https://cszwkukwkcrecirbvvee.supabase.co/functions/v1/send-webinar-reminders',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNzendrdWt3a2NyZWNpcmJ2dmVlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk5OTU3NDgsImV4cCI6MjA4NTU3MTc0OH0.c-dASZqz1IvpuhIeDMD_hSS5NvqzrDUpr_4hAbKsFt8"}'::jsonb,
    body := '{"reminder_type": "3_days"}'::jsonb
  ) AS request_id;
  $$
);

-- 30-min reminder: March 28, 2026 at 7:30 PM UTC (8:00 PM GMT+1 minus 30 mins)
SELECT cron.schedule(
  'webinar-reminder-30-mins',
  '30 19 28 3 *',
  $$
  SELECT net.http_post(
    url := 'https://cszwkukwkcrecirbvvee.supabase.co/functions/v1/send-webinar-reminders',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNzendrdWt3a2NyZWNpcmJ2dmVlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk5OTU3NDgsImV4cCI6MjA4NTU3MTc0OH0.c-dASZqz1IvpuhIeDMD_hSS5NvqzrDUpr_4hAbKsFt8"}'::jsonb,
    body := '{"reminder_type": "30_mins"}'::jsonb
  ) AS request_id;
  $$
);

-- Allow the edge function to read registrations
CREATE POLICY "Service role can read registrations"
ON public.webinar_registrations
FOR SELECT
USING (true);