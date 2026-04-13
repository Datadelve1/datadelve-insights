import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    const callerClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user: caller } } = await callerClient.auth.getUser();
    if (!caller) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const adminClient = createClient(supabaseUrl, serviceRoleKey);
    const { data: roles } = await adminClient.from("user_roles").select("role").eq("user_id", caller.id);
    const isAdmin = roles?.some((r: any) => r.role === "admin");
    if (!isAdmin) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get all withdrawn students
    const { data: withdrawn } = await adminClient
      .from("profiles")
      .select("id, full_name, email")
      .eq("student_status", "withdrawn");

    if (!withdrawn || withdrawn.length === 0) {
      return new Response(JSON.stringify({ success: true, message: "No withdrawn students to purge.", count: 0 }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let purgedCount = 0;

    for (const student of withdrawn) {
      const sid = student.id;
      const semail = student.email;

      // Delete all related data
      await Promise.all([
        adminClient.from("training_commitments").delete().eq("user_id", sid),
        adminClient.from("training_commitments").delete().eq("email", semail),
        adminClient.from("weekly_reviews").delete().eq("user_id", sid),
        adminClient.from("assignment_submissions").delete().eq("user_id", sid),
        adminClient.from("student_attendance").delete().eq("user_id", sid),
        adminClient.from("student_video_submissions").delete().eq("user_id", sid),
        adminClient.from("google_review_confirmations").delete().eq("user_id", sid),
        adminClient.from("admin_notes").delete().eq("user_id", sid),
        adminClient.from("video_access_logs").delete().eq("accessed_by", sid),
        adminClient.from("certificate_payments").delete().eq("user_id", sid),
        adminClient.from("cohort2_enrollments").delete().eq("user_id", sid),
        adminClient.from("user_roles").delete().eq("user_id", sid),
      ]);

      // Delete profile
      await adminClient.from("profiles").delete().eq("id", sid);

      // Delete auth user
      try {
        await adminClient.auth.admin.deleteUser(sid);
      } catch (e) {
        console.error(`Failed to delete auth user ${sid}:`, e);
      }

      purgedCount++;
    }

    return new Response(JSON.stringify({ success: true, message: `${purgedCount} withdrawn students permanently removed.`, count: purgedCount }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Purge error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
