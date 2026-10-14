import { generateToken, json } from '../../_utils.js';
import { sendEmail, resetPasswordEmail } from '../../_emails.js';

export async function onRequestPost({ request, env, waitUntil }) {
  try {
    const body = await request.json();
    const email = (body.email || '').trim().toLowerCase();
    if (!email) return json({ ok: false, error: 'Email required' }, 400);

    // Security: always return ok even if email takde (elak enumeration)
    const user = await env.DB.prepare('SELECT id, name, email FROM users WHERE email = ?').bind(email).first();

    if (user) {
      // Delete old unused resets for this user
      await env.DB.prepare('DELETE FROM password_resets WHERE user_id = ? AND used = 0').bind(user.id).run();

      const token = generateToken(32);
      const expiresAt = new Date(Date.now() + 30 * 60 * 1000).toISOString(); // 30 min
      await env.DB.prepare(
        'INSERT INTO password_resets (token, user_id, expires_at) VALUES (?, ?, ?)'
      ).bind(token, user.id, expiresAt).run();

      const resetUrl = 'https://hairiamri.buzz/reset-password.html?token=' + token;
      const emailPromise = sendEmail(env, user.email, 'Reset your HairiHosting password', resetPasswordEmail(user.name || 'there', resetUrl, 30));
      if (waitUntil) waitUntil(emailPromise);
      else await emailPromise;
    }

    return json({ ok: true, message: 'If the email exists, a reset link has been sent.' });
  } catch (err) {
    return json({ ok: false, error: err.message }, 500);
  }
}
