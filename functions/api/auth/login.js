import { verifyPassword, createSession, buildCookie, json } from '../../_utils/auth.js';

export async function onRequestPost({ request, env }) {
  try {
    const body = await request.json();
    const email = (body.email || '').trim().toLowerCase();
    const password = body.password || '';

    if (!email || !password) {
      return json({ ok: false, error: 'Email dan kata laluan diperlukan' }, 400);
    }

    const user = await env.DB.prepare(
      'SELECT id, email, password_hash, name, role, status FROM users WHERE email = ?'
    ).bind(email).first();

    if (!user) {
      return json({ ok: false, error: 'Email atau kata laluan salah' }, 401);
    }

    if (user.status !== 'active') {
      return json({ ok: false, error: 'Akaun disekat. Hubungi admin.' }, 403);
    }

    const valid = await verifyPassword(password, user.password_hash);
    if (!valid) {
      return json({ ok: false, error: 'Email atau kata laluan salah' }, 401);
    }

    const session = await createSession(env, user.id);

    return json({
      ok: true,
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
      redirect: '/dashboard/'
    }, 200, {
      'Set-Cookie': buildCookie('hh_session', session.token)
    });

  } catch (err) {
    console.error('Login error:', err);
    return json({ ok: false, error: 'Server error: ' + err.message }, 500);
  }
}
