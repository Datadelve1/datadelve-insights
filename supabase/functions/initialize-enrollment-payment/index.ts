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
    const { full_name, email, track, certificate_requested, callback_url, class_schedule, commitment_accepted } = await req.json();

    if (!full_name || !email || !track || !callback_url || !class_schedule) {
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

    // Check if already enrolled
    const { data: existing } = await supabase
      .from("cohort2_enrollments")
      .select("id, payment_status")
      .eq("email", email.toLowerCase())
      .single();

    if (existing?.payment_status === "paid") {
      return respond(false, { error: "This email is already enrolled and paid" });
    }

    // Initialize Paystack payment
    const paystackKey = Deno.env.get("PAYSTACK_SECRET_KEY");
    const paystackRes = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${paystackKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: email.toLowerCase(),
        amount: totalAmount * 100,
        callback_url,
        metadata: {
          full_name,
          track,
          certificate_requested,
          class_schedule,
          commitment_accepted,
          type: "cohort2_enrollment",
        },
      }),
    });

    const paystackData = await paystackRes.json();
    if (!paystackData.status) {
      return respond(false, { error: paystackData.message || "Paystack error" });
    }

    const reference = paystackData.data.reference;

    // Upsert enrollment record
    if (existing) {
      await supabase
        .from("cohort2_enrollments")
        .update({
          full_name,
          track,
          certificate_requested,
          amount_paid: totalAmount,
          payment_reference: reference,
          payment_status: "pending",
          class_schedule,
          commitment_accepted: true,
        })
        .eq("id", existing.id);
    } else {
      await supabase.from("cohort2_enrollments").insert({
        full_name,
        email: email.toLowerCase(),
        track,
        certificate_requested,
        amount_paid: totalAmount,
        payment_reference: reference,
        payment_status: "pending",
        class_schedule,
        commitment_accepted: true,
      });
    }

    return respond(true, { authorization_url: paystackData.data.authorization_url });
  } catch (err) {
    return respond(false, { error: err.message });
  }
});
