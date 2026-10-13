import { getCookie, verifySession, json } from '../../_utils.js';

export async function onRequestGet({ request, env }) {
  const token = getCookie(request, 'hh_session');
  const session = await verifySession(env, token);
  if (!session) return json({ ok: false, error: 'Unauthorized' }, 401);

  const url = new URL(request.url);
  const u = String(url.searchParams.get('u') || '').trim().toLowerCase();
  if (!u) return json({ ok: false, error: 'u required' }, 400);
  if (!/^[a-z0-9-]{3,20}$/.test(u)) return json({ ok: true, available: false, reason: 'Invalid format' });

  const reserved = ['admin', 'api', 'dashboard', 'login', 'logout', 'signup', 'u', 'www', 'mail', 'root', 'support', 'help', 'settings'];
  if (reserved.indexOf(u) >= 0) return json({ ok: true, available: false, reason: 'Reserved' });

  const existing = await env.DB.prepare('SELECT id FROM users WHERE username = ? AND id != ?').bind(u, session.userId).first();
  return json({ ok: true, available: !existing });
}
