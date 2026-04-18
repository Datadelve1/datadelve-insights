// Admin storage manager: list & delete files in storage buckets.
// Always returns HTTP 200 with { ok, error?, ... } per project convention.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const ALLOWED_BUCKETS = ["student-videos", "class-videos", "form-uploads"];

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    const authHeader = req.headers.get("Authorization") || "";
    const token = authHeader.replace("Bearer ", "");
    if (!token) return json({ ok: false, error: "Missing auth token" });

    // Verify user
    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData, error: userErr } = await userClient.auth.getUser(token);
    if (userErr || !userData?.user) return json({ ok: false, error: "Unauthorized" });

    // Verify admin role
    const admin = createClient(supabaseUrl, serviceKey);
    const { data: roleRow } = await admin
      .from("user_roles")
      .select("role")
      .eq("user_id", userData.user.id)
      .eq("role", "admin")
      .maybeSingle();
    if (!roleRow) return json({ ok: false, error: "Admin access required" });

    const body = await req.json().catch(() => ({}));
    const { action, bucket, path } = body as {
      action?: string;
      bucket?: string;
      path?: string;
    };

    if (!bucket || !ALLOWED_BUCKETS.includes(bucket)) {
      return json({ ok: false, error: "Invalid bucket" });
    }

    if (action === "list") {
      // Recursively list all files in the bucket
      const allFiles: Array<{
        path: string;
        name: string;
        size: number;
        created_at: string | null;
        updated_at: string | null;
      }> = [];

      const walk = async (prefix: string) => {
        let offset = 0;
        const pageSize = 1000;
        while (true) {
          const { data, error } = await admin.storage
            .from(bucket)
            .list(prefix, { limit: pageSize, offset, sortBy: { column: "name", order: "asc" } });
          if (error) throw error;
          if (!data || data.length === 0) break;
          for (const item of data) {
            const fullPath = prefix ? `${prefix}/${item.name}` : item.name;
            // It's a folder if metadata is null and it has no id
            if (item.id === null) {
              await walk(fullPath);
            } else {
              allFiles.push({
                path: fullPath,
                name: item.name,
                size: (item.metadata as any)?.size ?? 0,
                created_at: item.created_at ?? null,
                updated_at: item.updated_at ?? null,
              });
            }
          }
          if (data.length < pageSize) break;
          offset += pageSize;
        }
      };

      await walk("");

      // Enrich student-videos with student name from profiles via user_id (first path segment)
      const enriched = allFiles.map((f) => {
        const userId = f.path.split("/")[0];
        return { ...f, user_id: userId };
      });

      const userIds = [...new Set(enriched.map((f) => f.user_id))];
      let profilesMap: Record<string, { full_name: string; email: string }> = {};
      if (userIds.length > 0) {
        const { data: profiles } = await admin
          .from("profiles")
          .select("id, full_name, email")
          .in("id", userIds);
        profilesMap = Object.fromEntries(
          (profiles || []).map((p: any) => [p.id, { full_name: p.full_name, email: p.email }])
        );
      }

      const result = enriched.map((f) => ({
        ...f,
        student_name: profilesMap[f.user_id]?.full_name || null,
        student_email: profilesMap[f.user_id]?.email || null,
      }));

      return json({ ok: true, files: result, total: result.length });
    }

    if (action === "delete") {
      if (!path) return json({ ok: false, error: "Missing path" });
      const { error } = await admin.storage.from(bucket).remove([path]);
      if (error) return json({ ok: false, error: error.message });
      return json({ ok: true });
    }

    return json({ ok: false, error: "Unknown action" });
  } catch (e: any) {
    return json({ ok: false, error: e?.message || "Server error" });
  }
});
