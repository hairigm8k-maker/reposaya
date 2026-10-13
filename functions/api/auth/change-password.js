import { getCookie, verifySession, verifyPassword, hashPassword, json } from '../../_utils.js';

export async function onRequestPost({ request, env }) {
  const token = getCookie(request, 'hh_session');
  const session = await verifySession(env, token);
  if (!session) return json({ ok: false, error: 'Unauthorized' }, 401);

  try {
    const body = await request.json();
    const current = body.current_password || '';
    const next = body.new_password || '';
    const confirm = body.confirm_password || '';

    if (!current || !next || !confirm) return json({ ok: false, error: 'All fields required' }, 400);
    if (next !== confirm) return json({ ok: false, error: 'New passwords do not match' }, 400);
    if (next.length < 8) return json({ ok: false, error: 'Password must be at least 8 characters' }, 400);
    if (!/[a-zA-Z]/.test(next) || !/[0-9]/.test(next)) return json({ ok: false, error: 'Password must contain letters and numbers' }, 400);
    if (current === next) return json({ ok: false, error: 'New password must be different' }, 400);

    const user = await env.DB.prepare('SELECT password_hash FROM users WHERE id = ?').bind(session.userId).first();
    if (!user) return json({ ok: false, error: 'User not found' }, 404);

    const valid = await verifyPassword(current, user.password_hash);
    if (!valid) return json({ ok: false, error: 'Current password is wrong' }, 401);

    const newHash = await hashPassword(next);
    await env.DB.prepare('UPDATE users SET password_hash = ?, updated_at = datetime(\'now\') WHERE id = ?').bind(newHash, session.userId).run();

    // Logout all other devices
    await env.DB.prepare('DELETE FROM sessions WHERE user_id = ? AND token != ?').bind(session.userId, token).run();

    return json({ ok: true });
  } catch (err) {
    return json({ ok: false, error: err.message }, 500);
  }
}
