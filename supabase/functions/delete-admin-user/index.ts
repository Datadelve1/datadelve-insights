import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://esm.sh/zod@3.23.8";
import { corsHeaders } from "../_shared/cors.ts";

const BodySchema = z.object({
  email: z.string().email().optional(),
  user_id: z.string().uuid().optional(),
}).refine((value) => value.email || value.user_id, {
  message: "Provide email or user_id",
});

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const respond = (ok: boolean, body: Record<string, unknown>) =>
    new Response(JSON.stringify({ ok, ...body }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return respond(false, { error: "Unauthorized" });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    const callerClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const {
      data: { user: caller },
    } = await callerClient.auth.getUser();

    if (!caller) {
      return respond(false, { error: "Unauthorized" });
    }

    const adminClient = createClient(supabaseUrl, serviceRoleKey);
    const { data: roles, error: rolesError } = await adminClient
      .from("user_roles")
      .select("role")
      .eq("user_id", caller.id);

    if (rolesError || !roles?.some((role: { role: string }) => role.role === "admin")) {
      return respond(false, { error: "Forbidden" });
    }

    const parsed = BodySchema.safeParse(await req.json());
    if (!parsed.success) {
      return respond(false, { error: parsed.error.issues[0]?.message ?? "Invalid request body" });
    }

    const { email, user_id } = parsed.data;

    const { data: authUsers, error: listUsersError } = await adminClient.auth.admin.listUsers({ perPage: 1000 });
    if (listUsersError) {
      return respond(false, { error: `Unable to load users: ${listUsersError.message}` });
    }

    const matchedAuthUser = authUsers.users.find((user) => {
      if (user_id && user.id === user_id) return true;
      if (email && user.email?.toLowerCase() === email.toLowerCase()) return true;
      return false;
    });

    const targetUserId = user_id ?? matchedAuthUser?.id;
    if (!targetUserId) {
      return respond(false, { error: "Admin account not found" });
    }

    const { data: roleRows, error: roleLookupError } = await adminClient
      .from("user_roles")
      .select("role")
      .eq("user_id", targetUserId);

    if (roleLookupError) {
      return respond(false, { error: `Unable to verify role: ${roleLookupError.message}` });
    }

    if (!roleRows?.some((role: { role: string }) => role.role === "admin")) {
      return respond(false, { error: "Target user is not an admin" });
    }

    const { data: profile } = await adminClient
      .from("profiles")
      .select("full_name, email")
      .eq("id", targetUserId)
      .maybeSingle();

    const targetEmail = profile?.email ?? matchedAuthUser?.email ?? email ?? null;
    const targetName = profile?.full_name ?? matchedAuthUser?.user_metadata?.full_name ?? targetEmail ?? targetUserId;

    const deletions = await Promise.all([
      adminClient.from("user_roles").delete().eq("user_id", targetUserId),
      adminClient.from("profiles").delete().eq("id", targetUserId),
      adminClient.from("cohort2_enrollments").delete().eq("user_id", targetUserId),
      adminClient.from("certificate_payments").delete().eq("user_id", targetUserId),
      adminClient.from("training_commitments").delete().eq("user_id", targetUserId),
      adminClient.from("assignment_submissions").delete().eq("user_id", targetUserId),
      adminClient.from("student_attendance").delete().eq("user_id", targetUserId),
      adminClient.from("google_review_confirmations").delete().eq("user_id", targetUserId),
      adminClient.from("admin_notes").delete().eq("user_id", targetUserId),
      adminClient.from("video_access_logs").delete().eq("accessed_by", targetUserId),
      adminClient.from("weekly_reviews").delete().eq("user_id", targetUserId),
      adminClient.from("staff_profiles").delete().eq("user_id", targetUserId),
      adminClient.from("time_sessions").delete().eq("user_id", targetUserId),
      adminClient.from("activity_logs").delete().eq("user_id", targetUserId),
      adminClient.from("idle_periods").delete().eq("user_id", targetUserId),
      adminClient.from("student_video_submissions").delete().eq("user_id", targetUserId),
    ]);

    const deletionError = deletions.find((result) => result.error)?.error;
    if (deletionError) {
      return respond(false, { error: `Cleanup failed: ${deletionError.message}` });
    }

    const { error: deleteAuthError } = await adminClient.auth.admin.deleteUser(targetUserId);
    if (deleteAuthError) {
      return respond(false, { error: `Auth delete failed: ${deleteAuthError.message}` });
    }

    return respond(true, {
      message: `${targetName} was deleted successfully`,
      user_id: targetUserId,
      email: targetEmail,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return respond(false, { error: message });
  }
});