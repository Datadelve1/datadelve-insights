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

    const { studentId } = await req.json();
    if (!studentId) {
      return new Response(JSON.stringify({ error: "studentId required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get student profile before deletion
    const { data: profile } = await adminClient
      .from("profiles")
      .select("full_name, email")
      .eq("id", studentId)
      .single();

    if (!profile) {
      return new Response(JSON.stringify({ error: "Student not found" }), {
        status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { full_name, email } = profile;

    // Delete student data but KEEP weekly_reviews and student_video_submissions
    await Promise.all([
      adminClient.from("training_commitments").delete().eq("user_id", studentId),
      adminClient.from("training_commitments").delete().eq("email", email),
      adminClient.from("assignment_submissions").delete().eq("user_id", studentId),
      adminClient.from("student_attendance").delete().eq("user_id", studentId),
      adminClient.from("google_review_confirmations").delete().eq("user_id", studentId),
      adminClient.from("admin_notes").delete().eq("user_id", studentId),
      adminClient.from("video_access_logs").delete().eq("accessed_by", studentId),
      adminClient.from("certificate_payments").delete().eq("user_id", studentId),
      adminClient.from("cohort2_enrollments").delete().eq("user_id", studentId),
      adminClient.from("user_roles").delete().eq("user_id", studentId),
    ]);

    // Delete the profile
    await adminClient.from("profiles").delete().eq("id", studentId);

    // Permanently delete the auth user
    const { error: deleteAuthError } = await adminClient.auth.admin.deleteUser(studentId);
    if (deleteAuthError) {
      console.error("Failed to delete auth user:", deleteAuthError);
    }

    // Send withdrawal notification email
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (RESEND_API_KEY && LOVABLE_API_KEY) {
      try {
        await fetch("https://connector-gateway.lovable.dev/resend/emails", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${LOVABLE_API_KEY}`,
            "X-Connection-Api-Key": RESEND_API_KEY,
          },
          body: JSON.stringify({
            from: "DelveTek <onboarding@resend.dev>",
            to: [email],
            subject: "Notice of Withdrawal – Delvetek Data Analysis Training",
            html: `
              <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #FAF8F5; padding: 40px 30px; border-radius: 16px;">
                <div style="background: #FFFFFF; border-radius: 12px; padding: 24px; border: 1px solid #E8E0D4;">
                  <h2 style="font-size: 22px; color: #1A1A1A; margin: 0 0 16px;">Hello ${full_name},</h2>
                  <p style="color: #5A5A5A; font-size: 15px; line-height: 1.8;">
                    We regret to inform you that your enrollment in the <strong>Delvetek Data Analysis Training Program</strong> has been withdrawn.
                  </p>
                  <p style="color: #5A5A5A; font-size: 15px; line-height: 1.8;">
                    Your account and all associated data have been permanently removed from the platform.
                  </p>
                  <p style="color: #5A5A5A; font-size: 15px; line-height: 1.8;">
                    If you believe this was done in error, please reach out at <a href="mailto:info@delvetek.io" style="color: #D4A017;">info@delvetek.io</a> or WhatsApp: +447775739225.
                  </p>
                  <p style="color: #1A1A1A; font-size: 15px; margin-top: 20px;">– DelveTek Team</p>
                </div>
              </div>
            `,
          }),
        });
      } catch (emailErr) {
        console.error("Email send failed (non-blocking):", emailErr);
      }
    }

    return new Response(JSON.stringify({ success: true, message: `${full_name} has been permanently removed.` }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Withdraw error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
