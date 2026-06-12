import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const admins = [
    { email: "davidgbadebo4@gmail.com", full_name: "David Gbadebo" },
    { email: "marvellousayomide992@gmail.com", full_name: "Marvellous Ayomide" },
  ];
  const password = "DelvetekAdmin2026!";
  const loginUrl = "https://datadelve.io/admin";
  const results: any[] = [];

  for (const a of admins) {
    try {
      const { data: { users } } = await supabase.auth.admin.listUsers({ perPage: 1000 });
      let userId = users?.find((u: any) => u.email?.toLowerCase() === a.email)?.id;

      if (userId) {
        await supabase.auth.admin.updateUserById(userId, {
          password, email_confirm: true, user_metadata: { full_name: a.full_name },
        });
      } else {
        const { data: created, error } = await supabase.auth.admin.createUser({
          email: a.email, password, email_confirm: true,
          user_metadata: { full_name: a.full_name },
        });
        if (error) { results.push({ email: a.email, error: error.message }); continue; }
        userId = created.user.id;
      }

      await supabase.from("profiles").upsert(
        { id: userId, email: a.email, full_name: a.full_name },
        { onConflict: "id" }
      );
      await supabase.from("user_roles").upsert(
        { user_id: userId, role: "admin" },
        { onConflict: "user_id,role" }
      );

      const { error: mailErr } = await supabase.functions.invoke("send-transactional-email", {
        body: {
          templateName: "admin-welcome",
          recipientEmail: a.email,
          idempotencyKey: `admin-welcome-${userId}-bootstrap`,
          templateData: { name: a.full_name, email: a.email, password, loginUrl },
        },
      });
      results.push({ email: a.email, user_id: userId, mail_error: mailErr?.message ?? null });
    } catch (e: any) {
      results.push({ email: a.email, error: e?.message || String(e) });
    }
  }

  return new Response(JSON.stringify({ ok: true, results }), {
    status: 200,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
