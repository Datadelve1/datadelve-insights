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

function makeReference(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "DLV-";
  for (let i = 0; i < 6; i++) code += chars.charAt(Math.floor(Math.random() * chars.length));
  return code;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { full_name, email, track, certificate_requested, class_schedule, commitment_accepted, referral_code } = await req.json();

    if (!full_name || !email || !track || !class_schedule) {
      return respond(false, { error: "Missing required fields" });
    }

    if (!commitment_accepted) {
      return respond(false, { error: "Commitment form must be accepted" });
    }

    const trackPrices: Record<string, number> = {
      beginner: 10000,
      professional: 50000,
      advanced: 100000,
    };
    const certPrice = certificate_requested ? 10000 : 0;
    const totalAmount = (trackPrices[track] || 0) + certPrice;

    if (totalAmount === 0) {
      return respond(false, { error: "Invalid track" });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Validate referral code if provided
    let normalizedReferral: string | null = null;
    let referrerInfo: { full_name: string; email: string | null } | null = null;
    if (referral_code && typeof referral_code === "string" && referral_code.trim()) {
      const code = referral_code.trim().toUpperCase();
      const { data: referrer } = await supabase
        .from("referrers")
        .select("code, is_active, full_name, email")
        .ilike("code", code)
        .maybeSingle();
      if (!referrer || !referrer.is_active) {
        return respond(false, { error: "Invalid or inactive referral code. Leave blank if you weren't referred." });
      }
      normalizedReferral = referrer.code.toUpperCase();
      referrerInfo = { full_name: referrer.full_name, email: referrer.email };
    }

    const lowerEmail = email.toLowerCase().trim();

    // Check if already enrolled and paid
    const { data: existing } = await supabase
      .from("cohort2_enrollments")
      .select("id, payment_status, payment_reference")
      .eq("email", lowerEmail)
      .maybeSingle();

    if (existing?.payment_status === "paid") {
      return respond(false, { error: "This email is already enrolled and paid" });
    }

    const reference = existing?.payment_reference || makeReference();

    if (existing) {
      await supabase
        .from("cohort2_enrollments")
        .update({
          full_name,
          track,
          certificate_requested,
          amount_paid: totalAmount,
          payment_reference: reference,
          payment_status: "pending_manual",
          class_schedule,
          commitment_accepted: true,
          confirmed_by_admin: false,
          referral_code: normalizedReferral,
        })
        .eq("id", existing.id);
    } else {
      await supabase.from("cohort2_enrollments").insert({
        full_name,
        email: lowerEmail,
        track,
        certificate_requested,
        amount_paid: totalAmount,
        payment_reference: reference,
        payment_status: "pending_manual",
        class_schedule,
        commitment_accepted: true,
        confirmed_by_admin: false,
        referral_code: normalizedReferral,
      });
    }

    // Notify admin of new pending enrollment
    try {
      await supabase.functions.invoke("send-transactional-email", {
        body: {
          templateName: "admin-notification",
          recipientEmail: "info@datadelve.io",
          idempotencyKey: `manual-enrollment-${reference}`,
          templateData: {
            type: "New Manual Enrollment (Awaiting Payment Confirmation)",
            name: full_name,
            email: lowerEmail,
            detail: `${track} track · ${class_schedule} · ₦${totalAmount.toLocaleString()}${certificate_requested ? ' · certificate requested' : ''}${normalizedReferral ? ` · Referral: ${normalizedReferral}` : ''} · Ref: ${reference}`,
          },
        },
      });
    } catch (e) {
      console.error("Admin notify failed:", e);
    }

    // Notify referrer if their code was used and we have their email
    if (normalizedReferral && referrerInfo?.email) {
      try {
        await supabase.functions.invoke("send-transactional-email", {
          body: {
            templateName: "referrer-notification",
            recipientEmail: referrerInfo.email,
            idempotencyKey: `referrer-notify-${reference}`,
            templateData: {
              referrerName: referrerInfo.full_name,
              referralCode: normalizedReferral,
              studentName: full_name,
              track,
            },
          },
        });
      } catch (e) {
        console.error("Referrer notify failed:", e);
      }
    }

    return respond(true, { reference, total_amount: totalAmount });
  } catch (err) {
    return respond(false, { error: (err as Error).message });
  }
});
