import { corsHeaders } from "../_shared/cors.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const GOOGLE_MEET_LINK = "https://meet.google.com/imz-pqyp-kib";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { reminder_type } = await req.json();

    if (!["3_days", "1_day", "30_mins"].includes(reminder_type)) {
      return new Response(JSON.stringify({ error: "Invalid reminder_type" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: registrations, error } = await supabase
      .from("webinar_registrations")
      .select("email");

    if (error) throw error;
    if (!registrations?.length) {
      return new Response(JSON.stringify({ message: "No registrations found" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Note: Webinar reminders are sent individually to each registrant.
    // Each send is triggered by the admin action of sending reminders,
    // and each registrant individually registered (expects the reminder).
    const emails = registrations.map((r: { email: string }) => r.email);
    let sent = 0;

    for (const to of emails) {
      await supabase.functions.invoke("send-transactional-email", {
        body: {
          templateName: "webinar-confirmation",
          recipientEmail: to,
          idempotencyKey: `webinar-reminder-${reminder_type}-${to}`,
          templateData: { email: to },
        },
      });
      sent++;
    }

    // Notify admin
    await supabase.functions.invoke("send-transactional-email", {
      body: {
        templateName: "admin-notification",
        recipientEmail: "info@datadelve.io",
        idempotencyKey: `webinar-reminder-admin-${reminder_type}-${Date.now()}`,
        templateData: { type: `Webinar Reminder Sent (${reminder_type})`, detail: `Sent to ${sent} attendees` },
      },
    });

    return new Response(JSON.stringify({ success: true, sent }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
