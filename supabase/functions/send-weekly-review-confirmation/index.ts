import { corsHeaders } from "../_shared/cors.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, full_name, week_number } = await req.json();
    if (!email || !full_name || !week_number) {
      return new Response(JSON.stringify({ error: "Email, name, and week number required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Send confirmation to student
    await supabase.functions.invoke("send-transactional-email", {
      body: {
        templateName: "weekly-review-confirmation",
        recipientEmail: email,
        idempotencyKey: `review-confirm-${email}-week${week_number}`,
        templateData: { fullName: full_name, weekNumber: week_number },
      },
    });

    // Notify admin
    await supabase.functions.invoke("send-transactional-email", {
      body: {
        templateName: "admin-notification",
        recipientEmail: "info@datadelve.io",
        idempotencyKey: `review-admin-${email}-week${week_number}`,
        templateData: { type: "Weekly Review Submitted", name: full_name, email, detail: `Week ${week_number}` },
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
