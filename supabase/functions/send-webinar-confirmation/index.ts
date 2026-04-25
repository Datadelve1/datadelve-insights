import { corsHeaders } from "../_shared/cors.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email } = await req.json();
    if (!email) {
      return new Response(JSON.stringify({ error: "Email is required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Send confirmation to registrant
    await supabase.functions.invoke("send-transactional-email", {
      body: {
        templateName: "webinar-confirmation",
        recipientEmail: email,
        idempotencyKey: `webinar-confirm-${email}`,
        templateData: { email },
      },
    });

    // Notify admin
    await supabase.functions.invoke("send-transactional-email", {
      body: {
        templateName: "admin-notification",
        recipientEmail: "info@datadelve.io",
        idempotencyKey: `webinar-admin-${email}-${Date.now()}`,
        templateData: { type: "New Webinar Registration", email, name: email },
      },
    });

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
