import { getCookie, verifySession, clearCookie, json } from '../../_utils.js';

export async function onRequestDelete({ request, env }) {
  const token = getCookie(request, 'hh_session');
  const session = await verifySession(env, token);
  if (!session) return json({ ok: false, error: 'Unauthorized' }, 401);

  try {
    const body = await request.json().catch(function() { return {}; });
    const confirmEmail = String(body.confirm_email || '').trim().toLowerCase();

    if (confirmEmail !== session.email.toLowerCase()) {
      return json({ ok: false, error: 'Email does not match' }, 400);
    }

    const uid = session.userId;

    // Cascade delete — semua data user
    await env.DB.prepare('DELETE FROM files WHERE site_id IN (SELECT id FROM sites WHERE user_id = ?)').bind(uid).run();
    await env.DB.prepare('DELETE FROM analytics WHERE site_id IN (SELECT id FROM sites WHERE user_id = ?)').bind(uid).run();
    await env.DB.prepare('DELETE FROM custom_domains WHERE user_id = ?').bind(uid).run();
    await env.DB.prepare('DELETE FROM sites WHERE user_id = ?').bind(uid).run();
    await env.DB.prepare('DELETE FROM sessions WHERE user_id = ?').bind(uid).run();
    await env.DB.prepare('DELETE FROM notifications WHERE user_id = ?').bind(uid).run();
    await env.DB.prepare('DELETE FROM users WHERE id = ?').bind(uid).run();

    return json({ ok: true }, 200, { 'Set-Cookie': clearCookie('hh_session') });
  } catch (err) {
    return json({ ok: false, error: err.message }, 500);
  }
}
