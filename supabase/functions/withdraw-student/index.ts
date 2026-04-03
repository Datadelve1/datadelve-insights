import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify the caller is an admin
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    // Verify caller is admin using their JWT
    const callerClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user: caller } } = await callerClient.auth.getUser();
    if (!caller) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check admin role
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

    // Delete all student data from related tables
    await Promise.all([
      adminClient.from("training_commitments").delete().eq("user_id", studentId),
      adminClient.from("training_commitments").delete().eq("email", email),
      adminClient.from("weekly_reviews").delete().eq("user_id", studentId),
      adminClient.from("assignment_submissions").delete().eq("user_id", studentId),
      adminClient.from("student_attendance").delete().eq("user_id", studentId),
      adminClient.from("student_video_submissions").delete().eq("user_id", studentId),
      adminClient.from("google_review_confirmations").delete().eq("user_id", studentId),
      adminClient.from("admin_notes").delete().eq("user_id", studentId),
      adminClient.from("video_access_logs").delete().eq("accessed_by", studentId),
    ]);

    // Delete auth user (cascades to profiles table)
    const { error: deleteError } = await adminClient.auth.admin.deleteUser(studentId);
    if (deleteError) {
      console.error("Failed to delete auth user:", deleteError);
      return new Response(JSON.stringify({ error: "Failed to delete student account" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Send withdrawal notification email
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (RESEND_API_KEY) {
      try {
        await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${RESEND_API_KEY}`,
          },
          body: JSON.stringify({
            from: "DELVETEK <info@datadelve.io>",
            to: [email],
            subject: "Notice of Withdrawal – Delvetek Data Analysis Training",
            html: `
              <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #FAF8F5; padding: 40px 30px; border-radius: 16px;">
                <div style="text-align: center; margin-bottom: 30px;">
                  <img src="https://delve-insight-connect.lovable.app/delveschool-full-logo.png" alt="Delvetek" style="width: 120px; height: auto; margin-bottom: 12px;" />
                </div>
                <div style="background: #FFFFFF; border-radius: 12px; padding: 24px; border: 1px solid #E8E0D4;">
                  <h2 style="font-size: 22px; color: #1A1A1A; margin: 0 0 16px;">Hello ${full_name},</h2>
                  <p style="color: #5A5A5A; font-size: 15px; line-height: 1.8;">
                    We regret to inform you that your enrollment in the <strong>Delvetek Free Data Analysis Training Program</strong> has been withdrawn.
                  </p>
                  <p style="color: #5A5A5A; font-size: 15px; line-height: 1.8;">
                    As a result, your account and all associated data have been removed from the platform. You will no longer be able to access the student dashboard, recordings, assignments, or any course materials.
                  </p>
                  <p style="color: #5A5A5A; font-size: 15px; line-height: 1.8;">
                    If you believe this was done in error, or if you have any questions, please reach out to us at <a href="mailto:info@datadelve.io" style="color: #D4A017;">info@datadelve.io</a>.
                  </p>
                  <p style="color: #1A1A1A; font-size: 15px; margin-top: 20px;">– Delvetek Team</p>
                </div>
                <div style="text-align: center; border-top: 1px solid #E8E0D4; padding-top: 20px; margin-top: 20px;">
                  <p style="color: #999; font-size: 12px;">DELVETEK — Data Analytics & Tech Education</p>
                </div>
              </div>
            `,
          }),
        });

        // Notify admin
        await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${RESEND_API_KEY}`,
          },
          body: JSON.stringify({
            from: "DELVETEK <info@datadelve.io>",
            to: ["info@datadelve.io"],
            subject: `🚫 Student Withdrawn: ${full_name}`,
            html: `<div style="font-family: Arial; padding: 20px;"><h2>Student Withdrawn</h2><p><strong>Name:</strong> ${full_name}</p><p><strong>Email:</strong> ${email}</p><p><strong>Withdrawn by:</strong> ${caller.email}</p><p><strong>Date:</strong> ${new Date().toISOString()}</p></div>`,
          }),
        });
      } catch (emailErr) {
        console.error("Email send failed (non-blocking):", emailErr);
      }
    }

    return new Response(JSON.stringify({ success: true, message: `${full_name} has been withdrawn and all data deleted.` }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Withdraw error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
