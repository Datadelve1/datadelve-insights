import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function respond(ok: boolean, payload: Record<string, unknown>): Response {
  return new Response(JSON.stringify({ ok, ...payload }), {
    status: 200,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { reference } = await req.json();
    if (!reference) {
      return respond(false, { error: "Missing reference" });
    }

    const paystackKey = Deno.env.get("PAYSTACK_SECRET_KEY");
    const verifyRes = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: { Authorization: `Bearer ${paystackKey}` },
    });
    const verifyData = await verifyRes.json();

    if (!verifyData.status || verifyData.data.status !== "success") {
      return respond(false, { error: "Payment not successful" });
    }

    const metadata = verifyData.data.metadata || {};
    if (metadata.type !== "cohort2_enrollment") {
      return respond(false, { error: "Invalid payment type" });
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
      return respond(true, { success: true, already_processed: true });
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

    if (userError?.message?.includes("already been registered")) {
      const { data: existingUsers } = await supabase.auth.admin.listUsers();
      const existingUser = existingUsers?.users?.find(
        (u: any) => u.email?.toLowerCase() === email
      );
      userId = existingUser?.id;
    } else if (userError) {
      return respond(false, { error: userError.message });
    }

    // Update enrollment record
    await supabase
      .from("cohort2_enrollments")
      .update({
        payment_status: "paid",
        paid_at: new Date().toISOString(),
        user_id: userId,
        class_schedule: classSchedule,
        commitment_accepted: commitmentAccepted,
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
    let emailSent = false;
    try {
      const { error: emailError } = await supabase.functions.invoke("send-transactional-email", {
        body: {
          templateName: "enrollment-welcome",
          recipientEmail: email,
          idempotencyKey: `enrollment-welcome-${reference}`,
          templateData: {
            fullName,
            email,
            password,
            track,
            classSchedule,
            certificateRequested,
          },
        },
      });

      if (emailError) {
        console.error("Email send error:", emailError);
      } else {
        emailSent = true;
        console.log("Enrollment welcome email queued successfully");
      }

      // Notify admin
      await supabase.functions.invoke("send-transactional-email", {
        body: {
          templateName: "admin-notification",
          recipientEmail: "info@datadelve.io",
          idempotencyKey: `enrollment-admin-${reference}`,
          templateData: {
            type: "New Enrollment Payment",
            name: fullName,
            email,
            detail: `${track} track, ${classSchedule} schedule${certificateRequested ? ', certificate requested' : ''}`,
          },
        },
      });
    } catch (emailErr) {
      console.error("Email send failed:", emailErr);
    }

    return respond(true, { success: true, password_sent: emailSent });
  } catch (err) {
    return respond(false, { error: (err as Error).message });
  }
});
