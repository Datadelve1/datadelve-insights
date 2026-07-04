// Ops approve-and-send: dispatches an approved ops_emails row.
// SECURITY: only admins may invoke. No cron ever calls this function.
import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders })

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!

  try {
    const authHeader = req.headers.get('Authorization') || ''
    if (!authHeader.startsWith('Bearer ')) {
      return json({ ok: false, error: 'Missing authorization' })
    }
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
    const emailId: string | undefined = body?.emailId
    if (!emailId) return json({ ok: false, error: 'emailId required' })

    const { data: email, error: fetchErr } = await admin
      .from('ops_emails').select('*').eq('id', emailId).maybeSingle()
    if (fetchErr || !email) return json({ ok: false, error: 'Email not found' })
    if (email.status === 'sent') return json({ ok: false, error: 'Already sent' })

    const recipients: Array<{ email: string; name?: string }> = Array.isArray(email.recipients)
      ? email.recipients : []
    if (recipients.length === 0) return json({ ok: false, error: 'No recipients' })

    let sent = 0, failed = 0
    const errors: string[] = []

    for (const r of recipients) {
      try {
        const idempotencyKey = `ops-${emailId}-${r.email}`
        const { data, error } = await admin.functions.invoke('send-transactional-email', {
          body: {
            templateName: 'ops-custom',
            recipientEmail: r.email,
            idempotencyKey,
            templateData: {
              subject: email.subject,
              body: email.body,
              firstName: r.name ? String(r.name).split(' ')[0] : undefined,
            },
            subjectOverride: email.subject,
          },
        })
        if (error || (data && (data as any).error)) {
          failed++
          errors.push(`${r.email}: ${error?.message || (data as any)?.error || 'unknown'}`)
        } else {
          sent++
        }
      } catch (e: any) {
        failed++
        errors.push(`${r.email}: ${e?.message || String(e)}`)
      }
    }

    const status = failed === 0 ? 'sent' : (sent === 0 ? 'failed' : 'sent')
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
      detail: { sent, failed, subject: email.subject },
    })

    return json({ ok: true, sent, failed, errors })
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
