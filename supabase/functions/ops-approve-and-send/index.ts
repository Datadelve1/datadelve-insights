// Ops approve-and-send: dispatches an approved ops_emails row through Brevo.
// SECURITY: only admins may invoke. No cron ever calls this function —
// every group email is reviewed and sent manually by an admin.
import { createClient } from 'npm:@supabase/supabase-js@2'
import { buildHtml, personalize, chunk } from './render.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const GATEWAY_URL = 'https://connector-gateway.lovable.dev/brevo'
const PREFERRED_SENDER = 'info@delvetek.io'
const REPLY_TO = 'info@delvetek.io'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders })

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!
  const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY')
  const BREVO_API_KEY = Deno.env.get('BREVO_API_KEY')

  try {
    if (!LOVABLE_API_KEY || !BREVO_API_KEY) {
      return json({ ok: false, error: 'Brevo is not connected' })
    }

    const authHeader = req.headers.get('Authorization') || ''
    if (!authHeader.startsWith('Bearer ')) return json({ ok: false, error: 'Missing authorization' })
    const jwt = authHeader.replace('Bearer ', '')

    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: `Bearer ${jwt}` } },
    })
    const { data: userRes, error: userErr } = await userClient.auth.getUser()
    if (userErr || !userRes.user) return json({ ok: false, error: 'Not authenticated' })
    const userId = userRes.user.id

    const admin = createClient(supabaseUrl, serviceKey)
    const { data: isAdminRow } = await admin.rpc('has_role', { _user_id: userId, _role: 'admin' })
    if (!isAdminRow) return json({ ok: false, error: 'Admin only' })

    const body = await req.json().catch(() => ({}))
    const emailId: unknown = body?.emailId
    if (typeof emailId !== 'string' || !/^[0-9a-f-]{36}$/i.test(emailId)) {
      return json({ ok: false, error: 'emailId required' })
    }

    const { data: email, error: fetchErr } = await admin
      .from('ops_emails').select('*').eq('id', emailId).maybeSingle()
    if (fetchErr || !email) return json({ ok: false, error: 'Email not found' })
    if (email.status === 'sent') return json({ ok: false, error: 'Already sent' })
    if (!email.subject?.trim() || !email.body?.trim()) {
      return json({ ok: false, error: 'Subject and body are required' })
    }

    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    const seen = new Set<string>()
    const recipients: Array<{ email: string; name?: string }> = (Array.isArray(email.recipients) ? email.recipients : [])
      .map((r: any) => ({ email: String(r?.email || '').trim().toLowerCase(), name: r?.name ? String(r.name).trim() : undefined }))
      .filter((r: any) => emailRe.test(r.email) && !seen.has(r.email) && seen.add(r.email))
    if (recipients.length === 0) return json({ ok: false, error: 'No valid recipients' })

    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${LOVABLE_API_KEY}`,
      'X-Connection-Api-Key': BREVO_API_KEY,
    }

    // Pick a confirmed Brevo sender (prefer info@delvetek.io once it is confirmed).
    const sRes = await fetch(`${GATEWAY_URL}/senders`, { headers })
    if (!sRes.ok) {
      const t = await sRes.text()
      return json({ ok: false, error: `Brevo senders lookup failed [${sRes.status}]: ${t.slice(0, 300)}` })
    }
    const senders = ((await sRes.json())?.senders || []).filter((s: any) => s.active)
    const sender = senders.find((s: any) => s.email?.toLowerCase() === PREFERRED_SENDER) || senders[0]
    if (!sender) return json({ ok: false, error: 'No confirmed sender in Brevo' })

    let sent = 0, failed = 0
    const errors: string[] = []

    for (const group of chunk(recipients, 100)) {
      const payload = {
        sender: { name: 'Delvetek', email: sender.email },
        replyTo: { email: REPLY_TO, name: 'Delvetek' },
        subject: email.subject,
        htmlContent: buildHtml(personalize(email.body, undefined)),
        messageVersions: group.map((r) => {
          const firstName = r.name ? r.name.split(/\s+/)[0] : undefined
          return {
            to: [{ email: r.email, ...(r.name ? { name: r.name } : {}) }],
            subject: personalize(email.subject, firstName),
            htmlContent: buildHtml(personalize(email.body, firstName)),
          }
        }),
        tags: ['ops', String(email.email_type || 'custom')],
      }
      const res = await fetch(`${GATEWAY_URL}/smtp/email`, { method: 'POST', headers, body: JSON.stringify(payload) })
      if (res.ok) {
        sent += group.length
      } else {
        const t = await res.text()
        console.error(`Brevo send failed [${res.status}]: ${t}`)
        failed += group.length
        errors.push(`[${res.status}] ${t.slice(0, 300)}`)
      }
    }

    const status = sent === 0 ? 'failed' : 'sent'
    await admin.from('ops_emails').update({
      status,
      sent_at: new Date().toISOString(),
      sent_count: sent,
      failed_count: failed,
      error: errors.length ? errors.join(' | ').slice(0, 2000) : null,
      approved_by: userId,
      approved_at: new Date().toISOString(),
    }).eq('id', emailId)

    await admin.from('ops_activity_log').insert({
      actor_user_id: userId,
      actor_kind: 'admin',
      action: 'email_sent',
      entity_type: 'ops_emails',
      entity_id: emailId,
      detail: { sent, failed, subject: email.subject, provider: 'brevo', sender: sender.email },
    })

    return json({ ok: sent > 0, sent, failed, errors, error: sent === 0 ? errors[0] || 'Send failed' : undefined })
  } catch (e: any) {
    return json({ ok: false, error: e?.message || String(e) })
  }
})

function json(body: unknown) {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}
