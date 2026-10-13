import { verifyPassword, createSession, buildCookie, json } from '../../_utils.js';

export async function onRequestPost({ request, env }) {
  try {
    const body = await request.json();
    const email = (body.email || '').trim().toLowerCase();
    const password = body.password || '';

    if (!email || !password) return json({ ok: false, error: 'Email and password required' }, 400);

    const user = await env.DB.prepare(
      'SELECT id, email, password_hash, name, role, status FROM users WHERE email = ?'
    ).bind(email).first();
    if (!user) return json({ ok: false, error: 'Email or password wrong' }, 401);
    if (user.status === 'suspended') return json({ ok: false, error: 'Account suspended' }, 403);
    if (user.status !== 'active') return json({ ok: false, error: 'Account inactive' }, 403);

    const valid = await verifyPassword(password, user.password_hash);
    if (!valid) return json({ ok: false, error: 'Email or password wrong' }, 401);

    const ua = request.headers.get('User-Agent') || '';
    const ip = request.headers.get('CF-Connecting-IP') || request.headers.get('X-Forwarded-For') || '';
    const session = await createSession(env, user.id, { userAgent: ua, ip: ip });

    return json({
      ok: true,
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
      redirect: '/dashboard/'
    }, 200, { 'Set-Cookie': buildCookie('hh_session', session.token) });
  } catch (error) {
    return json({ ok: false, error: error.message }, 500);
  }
}
