import { corsHeaders } from "../_shared/cors.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email } = await req.json();

    if (!email) {
      return new Response(JSON.stringify({ error: "Email is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY not configured");
    }

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Delve <info@datadelve.io>",
        to: [email],
        subject: "You're Registered! 🎉 Stop Learning Tech Webinar",
        html: `
          <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #FAF8F5; padding: 40px 30px; border-radius: 16px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="font-size: 28px; color: #1A1A1A; margin: 0 0 8px;">You're In! 🎉</h1>
              <p style="color: #5A5A5A; font-size: 16px; margin: 0;">Your spot has been reserved</p>
            </div>
            
            <div style="background: #FFFFFF; border-radius: 12px; padding: 24px; border: 1px solid #E8E0D4; margin-bottom: 24px;">
              <h2 style="font-size: 20px; color: #1A1A1A; margin: 0 0 16px;">Stop Learning Tech — Unless You Want To Stay Relevant</h2>
              <div style="color: #5A5A5A; font-size: 14px; line-height: 1.8;">
                <p style="margin: 0;">📅 <strong>Date:</strong> 28th March, 2026</p>
                <p style="margin: 0;">🕗 <strong>Time:</strong> 8:00 PM (GMT+1)</p>
                <p style="margin: 0;">📍 <strong>Location:</strong> Online — Free</p>
              </div>
            </div>

            <div style="background: #FFFFFF; border-radius: 12px; padding: 24px; border: 1px solid #E8E0D4; margin-bottom: 24px;">
              <h3 style="font-size: 16px; color: #D4A017; margin: 0 0 12px;">Your Speakers</h3>
              <p style="color: #1A1A1A; font-size: 14px; margin: 0 0 4px;"><strong>Pipeloluwa Oshinubi</strong> — Data Analyst & Co-Founder, DelveSchool (Host)</p>
              <p style="color: #1A1A1A; font-size: 14px; margin: 0;"><strong>Tobi Anifowose</strong> — Senior Software Engineer (Guest)</p>
            </div>

            <div style="text-align: center; padding: 20px 0;">
              <p style="color: #5A5A5A; font-size: 14px; margin: 0 0 12px;">Join the webinar via Google Meet:</p>
              <a href="PASTE_YOUR_GOOGLE_MEET_LINK_HERE" style="display: inline-block; background: #D4A017; color: #FFFFFF; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600;">Join Webinar</a>
              <p style="color: #5A5A5A; font-size: 14px; margin: 12px 0 0;">We'll send you a reminder before the event.</p>
              <p style="color: #5A5A5A; font-size: 14px; margin: 8px 0 0;">See you there! 👋</p>
            </div>

            <div style="text-align: center; border-top: 1px solid #E8E0D4; padding-top: 20px; margin-top: 20px;">
              <p style="color: #999; font-size: 12px; margin: 0;">Delve — Data Analytics & Tech Education</p>
            </div>
          </div>
        `,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      console.error("Resend error:", data);
      return new Response(JSON.stringify({ error: "Failed to send email", details: data }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Send notification to admin
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Delve <info@datadelve.io>",
        to: ["info@datadelve.io"],
        subject: `🔔 New Webinar Registration: ${email}`,
        html: `
          <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 30px;">
            <h2 style="color: #1A1A1A;">New Webinar Registration</h2>
            <p style="color: #5A5A5A; font-size: 16px;"><strong>Email:</strong> ${email}</p>
            <p style="color: #5A5A5A; font-size: 14px;"><strong>Registered at:</strong> ${new Date().toLocaleString()}</p>
            <hr style="border: 1px solid #E8E0D4; margin: 20px 0;" />
            <p style="color: #999; font-size: 12px;">Stop Learning Tech Webinar — 28th March, 2026</p>
          </div>
        `,
      }),
    });

    return new Response(JSON.stringify({ success: true }), {
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
