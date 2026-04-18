import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const respond = (ok: boolean, body: Record<string, any>) =>
    new Response(JSON.stringify({ ok, ...body }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Verify caller is an admin
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return respond(false, { error: "Unauthorized" });
    const token = authHeader.replace("Bearer ", "");
    const { data: { user: caller } } = await supabase.auth.getUser(token);
    if (!caller) return respond(false, { error: "Unauthorized" });
    const { data: callerRoles } = await supabase
      .from("user_roles").select("role").eq("user_id", caller.id);
    if (!callerRoles?.some((r: any) => r.role === "admin")) {
      return respond(false, { error: "Admin only" });
    }

    const { email, full_name, password, login_url, send_email } = await req.json();
    if (!email || !password) return respond(false, { error: "Missing email or password" });

    const emailLower = String(email).toLowerCase().trim();
    const name = full_name || emailLower.split("@")[0];
    const loginUrl = login_url || "https://datadelve.io/admin/login";

    // Check if user already exists
    const { data: { users } } = await supabase.auth.admin.listUsers({ perPage: 1000 });
    let userId = users?.find((u: any) => u.email?.toLowerCase() === emailLower)?.id;

    if (userId) {
      // Update existing user's password
      const { error: updErr } = await supabase.auth.admin.updateUserById(userId, {
        password,
        email_confirm: true,
        user_metadata: { full_name: name },
      });
      if (updErr) return respond(false, { error: `Update failed: ${updErr.message}` });
    } else {
      // Create new auth user
      const { data: created, error: createErr } = await supabase.auth.admin.createUser({
        email: emailLower,
        password,
        email_confirm: true,
        user_metadata: { full_name: name },
      });
      if (createErr) return respond(false, { error: `Create failed: ${createErr.message}` });
      userId = created.user.id;
    }

    // Ensure profile exists
    await supabase.from("profiles").upsert(
      { id: userId, email: emailLower, full_name: name },
      { onConflict: "id" }
    );

    // Grant admin role
    const { error: roleErr } = await supabase.from("user_roles").upsert(
      { user_id: userId, role: "admin" },
      { onConflict: "user_id,role" }
    );
    if (roleErr) return respond(false, { error: `Role grant failed: ${roleErr.message}` });

    // Send welcome email
    if (send_email !== false) {
      const { error: mailErr } = await supabase.functions.invoke("send-transactional-email", {
        body: {
          templateName: "admin-welcome",
          recipientEmail: emailLower,
          idempotencyKey: `admin-welcome-${userId}-${Date.now()}`,
          templateData: { name, email: emailLower, password, loginUrl },
        },
      });
      if (mailErr) {
        return respond(true, {
          warning: `Admin created but email send failed: ${mailErr.message}`,
          user_id: userId,
        });
      }
    }

    return respond(true, { user_id: userId, email: emailLower });
  } catch (e: any) {
    return respond(false, { error: e?.message || String(e) });
  }
});
