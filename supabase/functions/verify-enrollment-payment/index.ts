import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { reference } = await req.json();
    if (!reference) {
      return new Response(JSON.stringify({ error: "Missing reference" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const paystackKey = Deno.env.get("PAYSTACK_SECRET_KEY");
    const verifyRes = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: { Authorization: `Bearer ${paystackKey}` },
    });
    const verifyData = await verifyRes.json();

    if (!verifyData.status || verifyData.data.status !== "success") {
      return new Response(JSON.stringify({ error: "Payment not successful" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const metadata = verifyData.data.metadata || {};
    if (metadata.type !== "cohort2_enrollment") {
      return new Response(JSON.stringify({ error: "Invalid payment type" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const email = verifyData.data.customer.email.toLowerCase();
    const fullName = metadata.full_name || "";
    const track = metadata.track || "beginner";
    const certificateRequested = metadata.certificate_requested || false;
    const classSchedule = metadata.class_schedule || "weekend";
    const commitmentAccepted = metadata.commitment_accepted || false;

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Check if already processed
    const { data: enrollment } = await supabase
      .from("cohort2_enrollments")
      .select("*")
      .eq("payment_reference", reference)
      .single();

    if (enrollment?.payment_status === "paid") {
      return new Response(JSON.stringify({ success: true, already_processed: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Generate random password
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$";
    let password = "";
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    // Create user account
    const { data: userData, error: userError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName },
    });

    let userId = userData?.user?.id;

    // If user already exists, get their ID
    if (userError?.message?.includes("already been registered")) {
      const { data: existingUsers } = await supabase.auth.admin.listUsers();
      const existingUser = existingUsers?.users?.find(
        (u: any) => u.email?.toLowerCase() === email
      );
      userId = existingUser?.id;
    } else if (userError) {
      return new Response(JSON.stringify({ error: userError.message }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Update enrollment record
    await supabase
      .from("cohort2_enrollments")
      .update({
        payment_status: "paid",
        paid_at: new Date().toISOString(),
        user_id: userId,
      })
      .eq("payment_reference", reference);

    // If certificate was requested, create certificate_payments record
    if (certificateRequested && userId) {
      await supabase.from("certificate_payments").upsert({
        user_id: userId,
        amount: 10000,
        payment_status: "paid",
        paid_at: new Date().toISOString(),
        payment_reference: reference + "_cert",
      }, { onConflict: "user_id" });
    }

    // Send welcome email with login details
    try {
      const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
      const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
      if (RESEND_API_KEY && LOVABLE_API_KEY) {
        await fetch("https://connector-gateway.lovable.dev/resend/emails", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${LOVABLE_API_KEY}`,
            "X-Connection-Api-Key": RESEND_API_KEY,
          },
          body: JSON.stringify({
            from: "DelveTek <onboarding@resend.dev>",
            to: [email],
            subject: "Welcome to DelveTek Cohort 2 — Your Login Details",
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #0ea5e9;">Welcome to DelveTek, ${fullName}! 🎉</h2>
                <p>Your enrollment in the <strong>${track.charAt(0).toUpperCase() + track.slice(1)} Track</strong> (Cohort 2) has been confirmed.</p>
                <div style="background: #f0f9ff; border-radius: 8px; padding: 20px; margin: 20px 0;">
                  <h3 style="margin-top: 0;">Your Login Details</h3>
                  <p><strong>Email:</strong> ${email}</p>
                  <p><strong>Temporary Password:</strong> ${password}</p>
                  <p style="color: #ef4444; font-size: 14px;">⚠️ Please change your password on first login.</p>
                </div>
                <p>Access your dashboard here:</p>
                <a href="https://delve-insight-connect.lovable.app/auth" style="display: inline-block; background: #0ea5e9; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold;">Go to Dashboard</a>
                <p style="margin-top: 20px; color: #666; font-size: 14px;">Classes start June 5. See you there!</p>
                ${certificateRequested ? '<p style="color: #22c55e; font-size: 14px;">✅ Certificate payment included — it will be issued upon completion.</p>' : ''}
              </div>
            `,
          }),
        });
      }
    } catch (emailErr) {
      console.error("Email send failed:", emailErr);
    }

    return new Response(
      JSON.stringify({ success: true, password_sent: true }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
