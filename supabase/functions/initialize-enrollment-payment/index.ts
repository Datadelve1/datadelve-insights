import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { full_name, email, track, certificate_requested, callback_url, class_schedule, commitment_accepted } = await req.json();

    if (!full_name || !email || !track || !callback_url || !class_schedule) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!commitment_accepted) {
      return new Response(JSON.stringify({ error: "Commitment form must be accepted" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const trackPrices: Record<string, number> = {
      beginner: 10000,
      professional: 50000,
      advanced: 100000,
    };
    const certPrice = certificate_requested ? 10000 : 0;
    const totalAmount = (trackPrices[track] || 0) + certPrice;

    if (totalAmount === 0) {
      return new Response(JSON.stringify({ error: "Invalid track" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
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
      return new Response(JSON.stringify({ error: "This email is already enrolled and paid" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
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
        amount: totalAmount * 100, // kobo
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
      return new Response(JSON.stringify({ error: paystackData.message || "Paystack error" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
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

    return new Response(
      JSON.stringify({ authorization_url: paystackData.data.authorization_url }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
