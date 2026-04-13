import { corsHeaders } from "../_shared/cors.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Send confirmation to applicant
    await supabase.functions.invoke("send-transactional-email", {
      body: {
        templateName: "ambassador-confirmation",
        recipientEmail: email,
        idempotencyKey: `ambassador-confirm-${email}-${Date.now()}`,
        templateData: { fullName: full_name },
      },
    });

    // Notify admin
    await supabase.functions.invoke("send-transactional-email", {
      body: {
        templateName: "admin-notification",
        recipientEmail: "info@datadelve.io",
        idempotencyKey: `ambassador-admin-${email}-${Date.now()}`,
        templateData: { type: "New Ambassador Application", name: full_name, email },
      },
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
