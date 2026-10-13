import { getCookie, verifySession, json } from '../_utils.js';

function genToken() {
  const b = new Uint8Array(16);
  crypto.getRandomValues(b);
  return Array.from(b).map(x => x.toString(16).padStart(2, '0')).join('');
}

export async function onRequestGet({ request, env }) {
  const token = getCookie(request, 'hh_session');
  const session = await verifySession(env, token);
  if (!session) return json({ ok: false, error: 'Unauthorized' }, 401);

  try {
    const { results } = await env.DB.prepare(
      'SELECT d.*, s.subdomain FROM custom_domains d JOIN sites s ON s.id = d.site_id WHERE d.user_id = ?'
    ).bind(session.userId).all();
    return json({ ok: true, domains: results || [] });
  } catch (err) {
    return json({ ok: false, error: err.message }, 500);
  }
}

export async function onRequestPost({ request, env }) {
  const token = getCookie(request, 'hh_session');
  const session = await verifySession(env, token);
  if (!session) return json({ ok: false, error: 'Unauthorized' }, 401);

  try {
    const body = await request.json();
    const domain = (body.domain || '').trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/$/, '');
    const siteId = parseInt(body.siteId);

    if (!domain || !siteId) return json({ ok: false, error: 'Domain & site diperlukan' }, 400);
    if (!/^[a-z0-9][a-z0-9.-]+\.[a-z]{2,}$/.test(domain)) return json({ ok: false, error: 'Domain not sah' }, 400);

    const site = await env.DB.prepare('SELECT id FROM sites WHERE id = ? AND user_id = ?').bind(siteId, session.userId).first();
    if (!site) return json({ ok: false, error: 'Site not found' }, 404);

    const existing = await env.DB.prepare('SELECT id FROM custom_domains WHERE domain = ?').bind(domain).first();
    if (existing) return json({ ok: false, error: 'Domain already digunakan' }, 400);

    const vtoken = 'sitehost-verify-' + genToken();

    await env.DB.prepare(
      'INSERT INTO custom_domains (site_id, user_id, domain, verification_token) VALUES (?, ?, ?, ?)'
    ).bind(siteId, session.userId, domain, vtoken).run();

    return json({ ok: true, domain: domain, verification_token: vtoken });
  } catch (err) {
    return json({ ok: false, error: err.message }, 500);
  }
}

export async function onRequestDelete({ request, env }) {
  const token = getCookie(request, 'hh_session');
  const session = await verifySession(env, token);
  if (!session) return json({ ok: false, error: 'Unauthorized' }, 401);

  const url = new URL(request.url);
  const id = parseInt(url.searchParams.get('id'));
  if (!id) return json({ ok: false, error: 'ID diperlukan' }, 400);

  try {
    await env.DB.prepare('DELETE FROM custom_domains WHERE id = ? AND user_id = ?').bind(id, session.userId).run();
    return json({ ok: true });
  } catch (err) {
    return json({ ok: false, error: err.message }, 500);
  }
}
