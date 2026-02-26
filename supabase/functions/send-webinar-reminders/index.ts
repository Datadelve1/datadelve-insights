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
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!RESEND_API_KEY) throw new Error("RESEND_API_KEY not configured");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: registrations, error } = await supabase
      .from("webinar_registrations")
      .select("email");

    if (error) throw error;
    if (!registrations?.length) {
      return new Response(JSON.stringify({ message: "No registrations found" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const is3Days = reminder_type === "3_days";
    const is1Day = reminder_type === "1_day";

    const subject = is3Days
      ? "⏰ 3 Days To Go! Stop Learning Tech Webinar"
      : is1Day
      ? "⏰ Tomorrow! Stop Learning Tech Webinar"
      : "🔴 Starting in 30 Minutes! Stop Learning Tech Webinar";

    const heading = is3Days
      ? "3 Days To Go! ⏰"
      : is1Day
      ? "It's Tomorrow! ⏰"
      : "We're Live in 30 Minutes! 🔴";

    const bodyText = is3Days
      ? "Just a friendly reminder — the <strong>Stop Learning Tech</strong> webinar is happening in 3 days. Make sure you've blocked out time in your calendar!"
      : is1Day
      ? "The <strong>Stop Learning Tech</strong> webinar is happening <strong>tomorrow</strong>! Make sure you're ready to join us at 8:00 PM (GMT+1)."
      : "The wait is almost over! The <strong>Stop Learning Tech</strong> webinar starts in just 30 minutes. Get ready to join us!";

    const ctaText = is3Days ? "Add to Calendar" : is1Day ? "Save the Link" : "Join Now";

    const GOOGLE_CALENDAR_LINK = "https://calendar.google.com/calendar/render?action=TEMPLATE&text=Stop+Learning+Tech+Webinar&dates=20260328T190000Z/20260328T200000Z&details=Join+via+Google+Meet:+${encodeURIComponent(GOOGLE_MEET_LINK)}&location=Online+(Google+Meet)";

    const ctaLink = is3Days ? GOOGLE_CALENDAR_LINK : GOOGLE_MEET_LINK;

    const emailHtml = `
      <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #FAF8F5; padding: 40px 30px; border-radius: 16px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <img src="https://delve-insight-connect.lovable.app/favicon.png" alt="DelveSchool" style="width: 80px; height: 80px; margin-bottom: 12px;" />
          <h1 style="font-size: 28px; color: #1A1A1A; margin: 0 0 8px;">${heading}</h1>
        </div>
        
        <div style="background: #FFFFFF; border-radius: 12px; padding: 24px; border: 1px solid #E8E0D4; margin-bottom: 24px;">
          <h2 style="font-size: 20px; color: #1A1A1A; margin: 0 0 16px;">Stop Learning Tech — Unless You Want To Stay Relevant</h2>
          <p style="color: #5A5A5A; font-size: 14px; line-height: 1.8; margin: 0 0 16px;">${bodyText}</p>
          <div style="color: #5A5A5A; font-size: 14px; line-height: 1.8;">
            <p style="margin: 0;">📅 <strong>Date:</strong> 28th March, 2026</p>
            <p style="margin: 0;">🕗 <strong>Time:</strong> 8:00 PM (GMT+1)</p>
            <p style="margin: 0;">📍 <strong>Location:</strong> Online (Google Meet)</p>
          </div>
        </div>

        <div style="text-align: center; margin-bottom: 24px;">
          <a href="${ctaLink}" style="display: inline-block; background: #D4A017; color: #FFFFFF; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px;">${ctaText}</a>
        </div>

        <div style="background: #FFFFFF; border-radius: 12px; padding: 24px; border: 1px solid #E8E0D4; margin-bottom: 24px;">
          <h3 style="font-size: 16px; color: #D4A017; margin: 0 0 12px;">Your Speakers</h3>
          <p style="color: #1A1A1A; font-size: 14px; margin: 0 0 4px;"><strong>Pipeloluwa Oshinubi</strong> — Data Analyst & Co-Founder, DelveSchool (Host)</p>
          <p style="color: #1A1A1A; font-size: 14px; margin: 0;"><strong>Tobi Anifowose</strong> — Senior Software Engineer (Guest)</p>
        </div>

        <div style="text-align: center; padding: 20px 0;">
          <p style="color: #5A5A5A; font-size: 14px; margin: 0;">See you there! 👋</p>
        </div>

        <div style="text-align: center; border-top: 1px solid #E8E0D4; padding-top: 20px; margin-top: 20px;">
          <p style="color: #999; font-size: 12px; margin: 0;">DELVESCHOOL — Data Analytics & Tech Education</p>
        </div>
      </div>
    `;

    // Send to all registrants (batch in groups of 50 for Resend limits)
    const emails = registrations.map((r: { email: string }) => r.email);
    const batchSize = 50;
    let sent = 0;

    for (let i = 0; i < emails.length; i += batchSize) {
      const batch = emails.slice(i, i + batchSize);

      // Send individually to avoid exposing other emails
      for (const to of batch) {
        await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${RESEND_API_KEY}`,
          },
          body: JSON.stringify({
            from: "DELVESCHOOL <info@datadelve.io>",
            to: [to],
            subject,
            html: emailHtml,
          }),
        });
        sent++;
      }
    }

    // Notify admin
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "DELVESCHOOL <info@datadelve.io>",
        to: ["info@datadelve.io"],
        subject: `✅ Reminder sent (${reminder_type}) to ${sent} attendees`,
        html: `<p>Successfully sent <strong>${reminder_type}</strong> reminder to <strong>${sent}</strong> registered attendees.</p>`,
      }),
    });

    return new Response(JSON.stringify({ success: true, sent }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
