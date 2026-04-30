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
    const enrollmentId = String(body?.enrollment_id || "").trim();
    const email = String(body?.email || "").trim().toLowerCase();
    const targetCohort = String(body?.target_cohort || "Cohort 2").trim();
    const newTrack = body?.track ? String(body.track).trim().toLowerCase() : null;
    const newSchedule = body?.class_schedule ? String(body.class_schedule).trim().toLowerCase() : null;

    if (!enrollmentId && !email) {
      return respond(false, { error: "Provide enrollment_id or email" });
    }
    if (newTrack && !VALID_TRACKS.includes(newTrack)) return respond(false, { error: "Invalid track" });
    if (newSchedule && !VALID_SCHEDULES.includes(newSchedule)) return respond(false, { error: "Invalid class schedule" });

    // Find target enrollment
    let query = supabase.from("cohort2_enrollments").select("*");
    query = enrollmentId ? query.eq("id", enrollmentId) : query.eq("email", email);
    const { data: existing, error: findErr } = await query.maybeSingle();
    if (findErr) return respond(false, { error: findErr.message });

    if (!existing) {
      return respond(false, { error: "Student enrollment not found. Use 'Create Student Account' instead." });
    }

    const updates: Record<string, unknown> = { cohort: targetCohort };
    if (newTrack) updates.track = newTrack;
    if (newSchedule) updates.class_schedule = newSchedule;

    const { error: updErr } = await supabase
      .from("cohort2_enrollments")
      .update(updates)
      .eq("id", existing.id);

    if (updErr) return respond(false, { error: updErr.message });

    return respond(true, {
      success: true,
      enrollment_id: existing.id,
      previous_cohort: existing.cohort,
      new_cohort: targetCohort,
    });
  } catch (err) {
    return respond(false, { error: (err as Error).message });
  }
});
