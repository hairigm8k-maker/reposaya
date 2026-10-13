import { getCookie, verifySession, clearCookie, json } from '../../_utils.js';

export async function onRequestPost({ request, env }) {
  const token = getCookie(request, 'hh_session');
  const session = await verifySession(env, token);
  if (!session) return json({ ok: false, error: 'Unauthorized' }, 401);

  try {
    const body = await request.json().catch(function() { return {}; });
    const action = body.action;

    if (action === 'deactivate') {
      await env.DB.prepare('UPDATE users SET deactivated_at = datetime(\'now\') WHERE id = ?').bind(session.userId).run();
      await env.DB.prepare('DELETE FROM sessions WHERE user_id = ?').bind(session.userId).run();
      return json({ ok: true }, 200, { 'Set-Cookie': clearCookie('hh_session') });
    }

    if (action === 'reactivate') {
      await env.DB.prepare('UPDATE users SET deactivated_at = NULL WHERE id = ?').bind(session.userId).run();
      return json({ ok: true });
    }

    return json({ ok: false, error: 'Unknown action' }, 400);
  } catch (err) {
    return json({ ok: false, error: err.message }, 500);
  }
}
