import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { sendMetaPurchase } from "../_shared/metaCapi.ts";

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

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return respond(false, { error: "Missing authorization" });

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Verify caller is admin
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
    const isAdmin = roles?.some((r) => r.role === "admin");
    if (!isAdmin) return respond(false, { error: "Admin access required" });

    const { enrollment_id, resend_email } = await req.json();
    if (!enrollment_id) return respond(false, { error: "Missing enrollment_id" });

    const { data: enrollment, error: fetchErr } = await supabase
      .from("cohort2_enrollments")
      .select("*")
      .eq("id", enrollment_id)
      .single();

    if (fetchErr || !enrollment) return respond(false, { error: "Enrollment not found" });
    if (!resend_email && enrollment.payment_status === "paid" && enrollment.confirmed_by_admin) {
      return respond(false, { error: "Already confirmed" });
    }

    const email = enrollment.email.toLowerCase();
    const fullName = enrollment.full_name;

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

    if (userError?.message?.includes("already been registered") || userError?.message?.includes("already exists")) {
      // Paginate through all users to find by email (listUsers default page size is small)
      const perPage = 1000;
      let page = 1;
      while (!userId) {
        const { data: list, error: listErr } = await supabase.auth.admin.listUsers({ page, perPage });
        if (listErr) { console.error("listUsers error", listErr); break; }
        const found = list?.users?.find((u: any) => u.email?.toLowerCase() === email);
        if (found) { userId = found.id; break; }
        if (!list?.users?.length || list.users.length < perPage) break;
        page++;
        if (page > 50) break;
      }
      // Fallback: look up via profiles table (kept in sync via handle_new_user trigger)
      if (!userId) {
        const { data: prof } = await supabase
          .from("profiles")
          .select("id")
          .ilike("email", email)
          .maybeSingle();
        userId = prof?.id;
      }
      // Reset password so welcome email works
      if (userId) {
        await supabase.auth.admin.updateUserById(userId, { password });
      }
    } else if (userError) {
      return respond(false, { error: userError.message });
    } else {
      userId = userData?.user?.id;
    }

    if (!userId) return respond(false, { error: "Could not create user account" });

    // Update enrollment
    await supabase
      .from("cohort2_enrollments")
      .update({
        payment_status: "paid",
        paid_at: new Date().toISOString(),
        confirmed_by_admin: true,
        user_id: userId,
        must_change_password: true,
      })
      .eq("id", enrollment_id);

    // Certificate payment record if requested
    if (enrollment.certificate_requested) {
      await supabase.from("certificate_payments").upsert({
        user_id: userId,
        amount: 10000,
        payment_status: "paid",
        paid_at: new Date().toISOString(),
        payment_reference: (enrollment.payment_reference || enrollment_id) + "_cert",
      }, { onConflict: "user_id" });
    }

    // Send welcome email with login details (idempotency key includes timestamp on resend so it always sends)
    let emailSent = false;
    const idempotencyKey = resend_email
      ? `enrollment-welcome-${enrollment.payment_reference || enrollment_id}-resend-${Date.now()}`
      : `enrollment-welcome-${enrollment.payment_reference || enrollment_id}`;
    try {
      const { error: emailError } = await supabase.functions.invoke("send-transactional-email", {
        body: {
          templateName: "enrollment-welcome",
          recipientEmail: email,
          idempotencyKey,
          templateData: {
            fullName,
            email,
            password,
            track: enrollment.track,
            classSchedule: enrollment.class_schedule,
            certificateRequested: enrollment.certificate_requested,
          },
        },
      });
      if (!emailError) emailSent = true;
      else console.error("Welcome email error:", emailError);
    } catch (e) {
      console.error("Welcome email failed:", e);
    }

    // Send Meta Conversions API Purchase event (server-side, dedup via event_id)
    if (!resend_email) {
      try {
        await sendMetaPurchase({
          email,
          fullName,
          phone: enrollment.phone || undefined,
          value: Number(enrollment.amount_paid) || 0,
          currency: "NGN",
          eventId: `enrollment-${enrollment_id}`,
          contentName: `${enrollment.track} Track Enrollment`,
          contentCategory: enrollment.track,
          clientIp: req.headers.get("x-forwarded-for")?.split(",")[0]?.trim(),
          userAgent: req.headers.get("user-agent") || undefined,
        });
      } catch (e) {
        console.error("Meta CAPI failed:", e);
      }
    }

    return respond(true, { success: true, email_sent: emailSent, password: emailSent ? undefined : password });
  } catch (err) {
    return respond(false, { error: (err as Error).message });
  }
});
