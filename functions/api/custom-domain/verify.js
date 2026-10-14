import { getCookie, verifySession, json } from '../../_utils.js';

export async function onRequestPost({ request, env }) {
  const token = getCookie(request, 'hh_session');
  const session = await verifySession(env, token);
  if (!session) return json({ ok: false, error: 'Unauthorized' }, 401);

  const url = new URL(request.url);
  const id = parseInt(url.searchParams.get('id'));
  if (!id) return json({ ok: false, error: 'ID required' }, 400);

  try {
    const dom = await env.DB.prepare(
      'SELECT id, domain, user_id, verified, verification_token FROM custom_domains WHERE id = ? AND user_id = ?'
    ).bind(id, session.userId).first();
    if (!dom) return json({ ok: false, error: 'Domain not found' }, 404);
    if (dom.verified === 1) return json({ ok: true, message: 'Already verified' });
    if (!dom.verification_token) return json({ ok: false, error: 'No verification token' }, 400);

    const dnsRes = await fetch('https://cloudflare-dns.com/dns-query?name=' + encodeURIComponent(dom.domain) + '&type=TXT', {
      headers: { 'Accept': 'application/dns-json' }
    });
    if (!dnsRes.ok) return json({ ok: false, error: 'DNS lookup failed' }, 500);

    const dnsData = await dnsRes.json();
    const answers = dnsData.Answer || [];
    const txtValues = answers
      .filter(function(a){ return a.type === 16; })
      .map(function(a){ return String(a.data).replace(/^"|"$/g, '').replace(/\\"/g, '"'); });

    const found = txtValues.some(function(v) { return v === dom.verification_token; });

    if (!found) {
      return json({
        ok: false,
        error: 'TXT record not found. DNS may take 5-30 minutes to propagate.',
        expected: dom.verification_token,
        found_records: txtValues.length
      }, 404);
    }

    await env.DB.prepare('UPDATE custom_domains SET verified = 1 WHERE id = ?').bind(id).run();
    return json({ ok: true, message: 'Domain verified successfully' });
  } catch (err) {
    return json({ ok: false, error: err.message }, 500);
  }
}
