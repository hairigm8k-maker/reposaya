import { requireAdmin, logAdmin } from '../../_admin.js';
import { hashPassword, generateToken, json } from '../../_utils.js';

export async function onRequestPost({ request, env }) {
  const guard = await requireAdmin(request, env);
  if (guard.error) return guard.error;

  try {
    const body = await request.json();
    const userId = body.user_id;

    if (!userId) return json({ ok: false, error: 'User ID required' }, 400);

    // 1. Generate new password
    const newPassword = generateToken(8);
    const hash = await hashPassword(newPassword);

    // 2. Update DB (reset password & potentially clear device_id if you have that column)
    // Assuming you just need to update password and clear sessions
    await env.DB.prepare(
      'UPDATE users SET password_hash = ? WHERE id = ?'
    ).bind(hash, userId).run();

    // 3. Delete all active sessions for this user (force logout everywhere)
    await env.DB.prepare(
      'DELETE FROM sessions WHERE user_id = ?'
    ).bind(userId).run();

    // 4. Log action
    await logAdmin(env, guard.session.userId, 'user.reset', 'user', userId, 'Password & Device Reset', request);

    return json({ ok: true, new_password: newPassword });
  } catch (err) {
    return json({ ok: false, error: err.message }, 500);
  }
}
