import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const EMAIL = "david.gbadebo4@gmail.com";
const PASSWORD = "Ox12fa34nlo";
const FULL_NAME = "David Gbadebo";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const results: any[] = [];
  try {
    // Find user
    const { data: { users } } = await supabase.auth.admin.listUsers({ perPage: 1000 });
    let user = users?.find((u: any) => (u.email || "").toLowerCase() === EMAIL);

    if (!user) {
      const { data: created, error: cErr } = await supabase.auth.admin.createUser({
        email: EMAIL,
        password: PASSWORD,
        email_confirm: true,
        user_metadata: { full_name: FULL_NAME },
      });
      if (cErr) throw cErr;
      user = created.user;
      results.push({ step: "created_user" });
    } else {
      const { error: uErr } = await supabase.auth.admin.updateUserById(user.id, {
        password: PASSWORD,
        email_confirm: true,
        user_metadata: { full_name: FULL_NAME },
      });
      if (uErr) throw uErr;
      results.push({ step: "updated_password" });
    }

    // Ensure staff_profile
    const { data: existingStaff } = await supabase
      .from("staff_profiles")
      .select("id")
      .eq("user_id", user!.id)
      .maybeSingle();

    if (existingStaff) {
      await supabase.from("staff_profiles").update({
        full_name: FULL_NAME,
        must_change_password: false,
        has_onboarded: true,
      }).eq("id", existingStaff.id);
      results.push({ step: "staff_profile_updated" });
    } else {
      await supabase.from("staff_profiles").insert({
        user_id: user!.id,
        email: EMAIL,
        full_name: FULL_NAME,
        salary: 0,
        must_change_password: false,
        has_onboarded: true,
      });
      results.push({ step: "staff_profile_created" });
    }

    // Ensure admin role
    await supabase.from("user_roles").upsert(
      { user_id: user!.id, role: "admin" },
      { onConflict: "user_id,role" }
    );
    results.push({ step: "admin_role_ensured" });

    return new Response(JSON.stringify({ ok: true, results }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ ok: false, error: e.message, results }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
