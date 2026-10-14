import { hashPassword, json } from '../../_utils.js';

export async function onRequestPost({ request, env }) {
  try {
    const body = await request.json();
    const token = (body.token || '').trim();
    const password = body.password || '';
    const confirm = body.confirm || '';

    if (!token) return json({ ok: false, error: 'Token required' }, 400);
    if (!password || password.length < 8) return json({ ok: false, error: 'Password must be at least 8 characters' }, 400);
    if (!/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) return json({ ok: false, error: 'Password must contain letters and numbers' }, 400);
    if (password !== confirm) return json({ ok: false, error: 'Passwords do not match' }, 400);

    const reset = await env.DB.prepare(
      'SELECT token, user_id, expires_at, used FROM password_resets WHERE token = ?'
    ).bind(token).first();

    if (!reset) return json({ ok: false, error: 'Invalid or expired reset link' }, 400);
    if (reset.used) return json({ ok: false, error: 'This reset link has already been used' }, 400);
    if (new Date(reset.expires_at).getTime() < Date.now()) return json({ ok: false, error: 'Reset link has expired. Request a new one.' }, 400);

    const newHash = await hashPassword(password);

    await env.DB.prepare('UPDATE users SET password_hash = ?, updated_at = datetime(\'now\') WHERE id = ?').bind(newHash, reset.user_id).run();
    await env.DB.prepare('UPDATE password_resets SET used = 1 WHERE token = ?').bind(token).run();
    // Revoke all sessions
    await env.DB.prepare('DELETE FROM sessions WHERE user_id = ?').bind(reset.user_id).run();

    return json({ ok: true, message: 'Password updated. Please sign in with your new password.' });
  } catch (err) {
    return json({ ok: false, error: err.message }, 500);
  }
}
