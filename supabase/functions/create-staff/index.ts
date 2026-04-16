import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const STAFF_LIST = [
  { email: "adewoleaderemi2019@gmail.com", salary: 100000, full_name: "Adewole" },
  { email: "marvellousayomide92@gmail.com", salary: 100000, full_name: "Ayomide" },
  { email: "goodydavis82@gmail.com", salary: 150000, full_name: "Goodness" },
  { email: "edwardolamide925@gmail.com", salary: 130000, full_name: "Edward" },
  { email: "oloyedeopeyemi253@gmail.com", salary: 150000, full_name: "Opeyemi" },
  { email: "oshinubipipeloluwa@gmail.com", salary: 150000, full_name: "Pipe" },
];

const ADMIN_EMAIL = "datadelve1@gmail.com";
const ADMIN_PASSWORD = "Ox12fa34n_";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  // Verify caller is admin
  const authHeader = req.headers.get("Authorization");
  if (authHeader) {
    const token = authHeader.replace("Bearer ", "");
    const { data: { user } } = await supabase.auth.getUser(token);
    if (!user) {
      return new Response(JSON.stringify({ ok: false, error: "Unauthorized" }), {
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }
    const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", user.id);
    const isAdmin = roles?.some((r: any) => r.role === "admin");
    if (!isAdmin) {
      return new Response(JSON.stringify({ ok: false, error: "Admin only" }), {
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }
  }

  const results: any[] = [];

  // --- Handle staff accounts ---
  for (const staff of STAFF_LIST) {
    try {
      const emailLower = staff.email.toLowerCase();

      // Check if staff profile already exists
      const { data: existing } = await supabase
        .from("staff_profiles")
        .select("id, user_id")
        .eq("email", emailLower)
        .maybeSingle();

      if (existing) {
        // Update password and full_name for existing user
        await supabase.auth.admin.updateUserById(existing.user_id, {
          password: "1234_",
          user_metadata: { full_name: staff.full_name },
        });
        await supabase.from("staff_profiles").update({
          full_name: staff.full_name,
          must_change_password: true,
        }).eq("id", existing.id);
        results.push({ email: emailLower, status: "updated" });
        continue;
      }

      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: emailLower,
        password: "1234_",
        email_confirm: true,
        user_metadata: { full_name: staff.full_name },
      });

      if (authError) {
        if (authError.message.includes("already been registered")) {
          const { data: { users } } = await supabase.auth.admin.listUsers();
          const existingUser = users?.find((u: any) => u.email === emailLower);
          if (existingUser) {
            await supabase.auth.admin.updateUserById(existingUser.id, {
              password: "1234_",
              user_metadata: { full_name: staff.full_name },
            });
            await supabase.from("staff_profiles").insert({
              user_id: existingUser.id,
              email: emailLower,
              salary: staff.salary,
              full_name: staff.full_name,
              must_change_password: true,
              has_onboarded: false,
            });
            results.push({ email: emailLower, status: "profile_created" });
          } else {
            results.push({ email: emailLower, status: "error", error: authError.message });
          }
          continue;
        }
        results.push({ email: emailLower, status: "error", error: authError.message });
        continue;
      }

      await supabase.from("staff_profiles").insert({
        user_id: authData.user.id,
        email: emailLower,
        salary: staff.salary,
        full_name: staff.full_name,
        must_change_password: true,
        has_onboarded: false,
      });

      results.push({ email: emailLower, status: "created" });
    } catch (e: any) {
      results.push({ email: staff.email, status: "error", error: e.message });
    }
  }

  // --- Handle admin account ---
  try {
    const adminEmail = ADMIN_EMAIL.toLowerCase();
    const { data: { users } } = await supabase.auth.admin.listUsers();
    const adminUser = users?.find((u: any) => u.email === adminEmail);
    
    if (adminUser) {
      await supabase.auth.admin.updateUserById(adminUser.id, { password: ADMIN_PASSWORD });
      // Ensure admin role exists
      await supabase.from("user_roles").upsert(
        { user_id: adminUser.id, role: "admin" },
        { onConflict: "user_id,role" }
      );
      results.push({ email: adminEmail, status: "admin_updated" });
    } else {
      const { data: newAdmin, error: adminErr } = await supabase.auth.admin.createUser({
        email: adminEmail,
        password: ADMIN_PASSWORD,
        email_confirm: true,
      });
      if (adminErr) {
        results.push({ email: adminEmail, status: "error", error: adminErr.message });
      } else {
        await supabase.from("user_roles").upsert(
          { user_id: newAdmin.user.id, role: "admin" },
          { onConflict: "user_id,role" }
        );
        results.push({ email: adminEmail, status: "admin_created" });
      }
    }
  } catch (e: any) {
    results.push({ email: ADMIN_EMAIL, status: "error", error: e.message });
  }

  return new Response(JSON.stringify({ ok: true, results }), {
    status: 200,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
