import { getCookie, verifySession, json } from '../_utils.js';

export async function onRequestPatch({ request, env }) {
  const token = getCookie(request, 'hh_session');
  const session = await verifySession(env, token);
  if (!session) return json({ ok: false, error: 'Unauthorized' }, 401);

  try {
    const body = await request.json();
    const name = String(body.name || '').trim();
    const username = String(body.username || '').trim().toLowerCase();
    const bio = String(body.bio || '').trim();
    const website = String(body.website || '').trim();

    if (!name) return json({ ok: false, error: 'Name required' }, 400);
    if (name.length < 2 || name.length > 40) return json({ ok: false, error: 'Name must be 2-40 characters' }, 400);
    if (bio.length > 160) return json({ ok: false, error: 'Bio max 160 characters' }, 400);
    if (website && website.length > 200) return json({ ok: false, error: 'Website URL too long' }, 400);

    if (username) {
      if (!/^[a-z0-9-]{3,20}$/.test(username)) {
        return json({ ok: false, error: 'Username: 3-20 chars, a-z 0-9 dash only' }, 400);
      }
      const reserved = ['admin', 'api', 'dashboard', 'login', 'logout', 'signup', 'u', 'www', 'mail', 'root', 'support', 'help', 'settings'];
      if (reserved.indexOf(username) >= 0) return json({ ok: false, error: 'Username is reserved' }, 400);
      const existing = await env.DB.prepare('SELECT id FROM users WHERE username = ? AND id != ?').bind(username, session.userId).first();
      if (existing) return json({ ok: false, error: 'Username already taken' }, 400);
    }

    await env.DB.prepare(
      'UPDATE users SET name = ?, username = ?, bio = ?, website = ? WHERE id = ?'
    ).bind(name, username || null, bio || null, website || null, session.userId).run();

    return json({ ok: true });
  } catch (err) {
    return json({ ok: false, error: err.message }, 500);
  }
}
