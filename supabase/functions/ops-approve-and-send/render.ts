const LOGO = 'https://cszwkukwkcrecirbvvee.supabase.co/storage/v1/object/public/ambassador-assets/brand/delvetek-email-logo.png'

export function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = []
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size))
  return out
}

/** Replaces {first_name} with the recipient's first name ("there" when unknown). */
export function personalize(text: string, firstName: string | undefined): string {
  return String(text || '').replace(/\{first_name\}/gi, firstName || 'there')
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

function linkify(escaped: string): string {
  return escaped.replace(/(https?:\/\/[^\s<]+)/g, (u) =>
    `<a href="${u}" style="color:#1A1A1A;font-weight:600;text-decoration:underline">${u}</a>`)
}

/** Plain-text body -> branded HTML (paragraphs on blank lines, links clickable). */
export function buildHtml(body: string): string {
  const paras = body.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean)
    .map((p) => `<p style="margin:0 0 16px;font-size:15px;line-height:1.7;color:#333333">${linkify(escapeHtml(p)).replace(/\n/g, '<br>')}</p>`)
    .join('')
  return `<!doctype html><html><body style="margin:0;background:#ffffff;font-family:Inter,'Helvetica Neue',Arial,sans-serif">
<div style="max-width:600px;margin:0 auto;padding:20px 25px">
<div style="text-align:center;padding:24px 0 8px"><img src="${LOGO}" width="56" height="56" alt="Delvetek" style="border-radius:12px"></div>
<div style="height:4px;background:#FFCC00;border-radius:2px;margin:8px 0 20px"></div>
<div style="background:#FAFAF7;border:1px solid #E8E0D4;border-radius:12px;padding:24px">${paras}</div>
<p style="font-size:11px;color:#999999;margin:24px 0 0;text-align:center">DELVETEK — Data Analytics &amp; Tech Education · info@delvetek.io</p>
</div></body></html>`
}
