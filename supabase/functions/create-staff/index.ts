import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const STAFF_LIST = [
  { email: "adewoleaderemi2019@gmail.com", salary: 100000, full_name: "Adewole Aderemi" },
  { email: "marvellousayomide92@gmail.com", salary: 100000, full_name: "Marvellous Ayomide" },
  { email: "goodydavis82@gmail.com", salary: 150000, full_name: "Goody Davis" },
  { email: "edwardolamide925@gmail.com", salary: 130000, full_name: "Edward Olamide" },
  { email: "oloyedeopeyemi253@gmail.com", salary: 150000, full_name: "Oloyede Opeyemi" },
  { email: "oshinubipipeloluwa@gmail.com", salary: 150000, full_name: "Oshinubi Pipeloluwa" },
  { email: "david.gbadebo4@gmail.com", salary: 100000, full_name: "David Gbadebo" },
];

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

  for (const staff of STAFF_LIST) {
    try {
      // Check if user already exists
      const { data: existing } = await supabase
        .from("staff_profiles")
        .select("id")
        .eq("email", staff.email.toLowerCase())
        .maybeSingle();

      if (existing) {
        results.push({ email: staff.email, status: "already_exists" });
        continue;
      }

      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: staff.email.toLowerCase(),
        password: "1234",
        email_confirm: true,
        user_metadata: { full_name: staff.full_name },
      });

      if (authError) {
        // User might already exist in auth but not in staff_profiles
        if (authError.message.includes("already been registered")) {
          const { data: { users } } = await supabase.auth.admin.listUsers();
          const existingUser = users?.find((u: any) => u.email === staff.email.toLowerCase());
          if (existingUser) {
            await supabase.from("staff_profiles").insert({
              user_id: existingUser.id,
              email: staff.email.toLowerCase(),
              salary: staff.salary,
              must_change_password: true,
              has_onboarded: false,
            });
            results.push({ email: staff.email, status: "profile_created" });
          } else {
            results.push({ email: staff.email, status: "error", error: authError.message });
          }
          continue;
        }
        results.push({ email: staff.email, status: "error", error: authError.message });
        continue;
      }

      // Create staff profile
      await supabase.from("staff_profiles").insert({
        user_id: authData.user.id,
        email: staff.email.toLowerCase(),
        salary: staff.salary,
        must_change_password: true,
        has_onboarded: false,
      });

      results.push({ email: staff.email, status: "created" });
    } catch (e: any) {
      results.push({ email: staff.email, status: "error", error: e.message });
    }
  }

  return new Response(JSON.stringify({ ok: true, results }), {
    status: 200,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
