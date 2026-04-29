// Meta Conversions API helper (server-side)
// Sends events directly to Meta to complement the browser pixel (more reliable, bypasses ad-blockers)

const PIXEL_ID = "1339164311368050";
const API_VERSION = "v19.0";

async function sha256(input: string): Promise<string> {
  const data = new TextEncoder().encode(input.trim().toLowerCase());
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

interface PurchaseEventInput {
  email: string;
  fullName?: string;
  phone?: string;
  value: number; // NGN
  currency?: string;
  eventId: string; // for dedup with browser pixel
  eventSourceUrl?: string;
  contentName?: string; // e.g. "Beginner Track Enrollment"
  contentCategory?: string; // e.g. "beginner"
  clientIp?: string;
  userAgent?: string;
  fbp?: string;
  fbc?: string;
}

export async function sendMetaPurchase(input: PurchaseEventInput): Promise<{ ok: boolean; error?: string }> {
  const accessToken = Deno.env.get("META_CAPI_ACCESS_TOKEN");
  if (!accessToken) {
    console.warn("META_CAPI_ACCESS_TOKEN not configured; skipping CAPI event");
    return { ok: false, error: "no_token" };
  }

  try {
    const emailHash = await sha256(input.email);
    const userData: Record<string, unknown> = { em: [emailHash] };

    if (input.fullName) {
      const parts = input.fullName.trim().split(/\s+/);
      const fn = parts[0];
      const ln = parts.slice(1).join(" ") || parts[0];
      userData.fn = [await sha256(fn)];
      userData.ln = [await sha256(ln)];
    }
    if (input.phone) {
      const digits = input.phone.replace(/\D/g, "");
      if (digits) userData.ph = [await sha256(digits)];
    }
    if (input.clientIp) userData.client_ip_address = input.clientIp;
    if (input.userAgent) userData.client_user_agent = input.userAgent;
    if (input.fbp) userData.fbp = input.fbp;
    if (input.fbc) userData.fbc = input.fbc;

    const event = {
      event_name: "Purchase",
      event_time: Math.floor(Date.now() / 1000),
      event_id: input.eventId,
      action_source: "website",
      event_source_url: input.eventSourceUrl || "https://www.datadelve.io/enroll",
      user_data: userData,
      custom_data: {
        currency: input.currency || "NGN",
        value: input.value,
        content_name: input.contentName,
        content_category: input.contentCategory,
      },
    };

    const url = `https://graph.facebook.com/${API_VERSION}/${PIXEL_ID}/events?access_token=${accessToken}`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data: [event] }),
    });
    const body = await res.json();
    if (!res.ok) {
      console.error("Meta CAPI error:", body);
      return { ok: false, error: JSON.stringify(body) };
    }
    console.log("Meta CAPI Purchase sent:", body);
    return { ok: true };
  } catch (e) {
    console.error("Meta CAPI exception:", e);
    return { ok: false, error: (e as Error).message };
  }
}
