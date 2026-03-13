import { corsHeaders } from "../_shared/cors.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, full_name } = await req.json();
    if (!email || !full_name) {
      return new Response(JSON.stringify({ error: "Email and name required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!RESEND_API_KEY) throw new Error("RESEND_API_KEY not configured");

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${RESEND_API_KEY}` },
      body: JSON.stringify({
        from: "DELVETEK <info@datadelve.io>",
        to: [email],
        subject: "Thank You for Your Ambassador Application – Delvetek",
        html: `
          <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #FAF8F5; padding: 40px 30px; border-radius: 16px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <img src="https://delve-insight-connect.lovable.app/delveschool-full-logo.png" alt="Delvetek" style="width: 120px; height: auto; margin-bottom: 12px;" />
            </div>
            <div style="background: #FFFFFF; border-radius: 12px; padding: 24px; border: 1px solid #E8E0D4;">
              <h2 style="font-size: 22px; color: #1A1A1A; margin: 0 0 16px;">Hello ${full_name},</h2>
              <p style="color: #5A5A5A; font-size: 15px; line-height: 1.8;">
                Thank you for submitting your Ambassador Program Application. Your application has been successfully received and is under review.
              </p>
              <p style="color: #5A5A5A; font-size: 15px; line-height: 1.8;">
                The Delvetek team will carefully evaluate all submissions and contact selected candidates regarding next steps.
              </p>
              <p style="color: #5A5A5A; font-size: 15px; line-height: 1.8;">
                We appreciate your interest and commitment to becoming a Delvetek Ambassador.
              </p>
              <p style="color: #1A1A1A; font-size: 15px; margin-top: 24px;">– Delvetek Team</p>
            </div>
            <div style="text-align: center; border-top: 1px solid #E8E0D4; padding-top: 20px; margin-top: 20px;">
              <p style="color: #999; font-size: 12px;">DELVETEK — Data Analytics & Tech Education</p>
            </div>
          </div>
        `,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      console.error("Resend error:", data);
      return new Response(JSON.stringify({ error: "Failed to send email", details: data }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Notify admin
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${RESEND_API_KEY}` },
      body: JSON.stringify({
        from: "DELVETEK <info@datadelve.io>",
        to: ["info@datadelve.io"],
        subject: `🔔 New Ambassador Application: ${full_name}`,
        html: `<div style="font-family: Arial; padding: 20px;"><h2>New Ambassador Application</h2><p><strong>Name:</strong> ${full_name}</p><p><strong>Email:</strong> ${email}</p><p><strong>Date:</strong> ${new Date().toLocaleString()}</p></div>`,
      }),
    });

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
