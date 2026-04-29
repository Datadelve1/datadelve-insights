import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function respond(ok: boolean, payload: Record<string, unknown>): Response {
  return new Response(JSON.stringify({ ok, ...payload }), {
    status: 200,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

const VALID_TRACKS = ["beginner", "professional", "advanced"];
const VALID_SCHEDULES = ["weekday", "weekend"];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return respond(false, { error: "Missing authorization" });

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const userClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );
    const { data: { user } } = await userClient.auth.getUser();
    if (!user) return respond(false, { error: "Not authenticated" });

    const { data: roles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id);
    if (!roles?.some((r) => r.role === "admin")) {
      return respond(false, { error: "Admin access required" });
    }

    const body = await req.json();
    const fullName = String(body?.full_name || "").trim();
    const email = String(body?.email || "").trim().toLowerCase();
    const track = String(body?.track || "beginner").trim().toLowerCase();
    const classSchedule = String(body?.class_schedule || "weekend").trim().toLowerCase();
    const cohort = String(body?.cohort || "Cohort 2").trim();
    const certificateRequested = Boolean(body?.certificate_requested);

    if (!fullName) return respond(false, { error: "Full name is required" });
    if (fullName.length > 100) return respond(false, { error: "Name too long" });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return respond(false, { error: "Invalid email" });
    if (!VALID_TRACKS.includes(track)) return respond(false, { error: "Invalid track" });
    if (!VALID_SCHEDULES.includes(classSchedule)) return respond(false, { error: "Invalid class schedule" });

    // Generate password
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$";
    let password = "";
    for (let i = 0; i < 12; i++) password += chars.charAt(Math.floor(Math.random() * chars.length));

    // Create or find user
    let userId: string | undefined;
    const { data: userData, error: userError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName },
    });

    if (userError?.message?.includes("already been registered")) {
      const { data: list } = await supabase.auth.admin.listUsers();
      const found = list?.users?.find((u: any) => u.email?.toLowerCase() === email);
      userId = found?.id;
      if (userId) {
        await supabase.auth.admin.updateUserById(userId, { password });
      }
    } else if (userError) {
      return respond(false, { error: userError.message });
    } else {
      userId = userData?.user?.id;
    }

    if (!userId) return respond(false, { error: "Could not create user account" });

    // Generate a reference for tracking
    const reference = "DLV-" + Math.random().toString(36).slice(2, 8).toUpperCase();

    // Upsert enrollment record (so they show up in admin lists & dashboard works)
    const { data: existing } = await supabase
      .from("cohort2_enrollments")
      .select("id")
      .eq("email", email)
      .maybeSingle();

    const enrollmentPayload = {
      full_name: fullName,
      email,
      track,
      class_schedule: classSchedule,
      cohort,
      certificate_requested: certificateRequested,
      commitment_accepted: true,
      payment_status: "paid",
      paid_at: new Date().toISOString(),
      confirmed_by_admin: true,
      user_id: userId,
      must_change_password: true,
      payment_reference: reference,
      amount_paid: 0,
    };

    let enrollmentId: string | undefined;
    if (existing?.id) {
      await supabase.from("cohort2_enrollments").update(enrollmentPayload).eq("id", existing.id);
      enrollmentId = existing.id;
    } else {
      const { data: inserted, error: insErr } = await supabase
        .from("cohort2_enrollments")
        .insert(enrollmentPayload)
        .select("id")
        .single();
      if (insErr) return respond(false, { error: insErr.message });
      enrollmentId = inserted?.id;
    }

    // Certificate payment record if requested
    if (certificateRequested) {
      await supabase.from("certificate_payments").upsert({
        user_id: userId,
        amount: 10000,
        payment_status: "paid",
        paid_at: new Date().toISOString(),
        payment_reference: reference + "_cert",
      }, { onConflict: "user_id" });
    }

    // Send welcome email
    let emailSent = false;
    try {
      const { error: emailError } = await supabase.functions.invoke("send-transactional-email", {
        body: {
          templateName: "enrollment-welcome",
          recipientEmail: email,
          idempotencyKey: `enrollment-welcome-admin-${enrollmentId}-${Date.now()}`,
          templateData: {
            fullName,
            email,
            password,
            track,
            classSchedule,
            certificateRequested,
          },
        },
      });
      if (!emailError) emailSent = true;
      else console.error("Welcome email error:", emailError);
    } catch (e) {
      console.error("Welcome email failed:", e);
    }

    return respond(true, {
      success: true,
      email_sent: emailSent,
      password: emailSent ? undefined : password,
      enrollment_id: enrollmentId,
    });
  } catch (err) {
    return respond(false, { error: (err as Error).message });
  }
});
