import { verifyPassword, createSession, buildCookie, json } from '../../_utils.js';

async function logAttempt(env, userId, email, status, reason, request) {
  try {
    const ip = request.headers.get('CF-Connecting-IP') || request.headers.get('X-Forwarded-For') || '';
    const ua = (request.headers.get('User-Agent') || '').slice(0, 500);
    await env.DB.prepare(
      'INSERT INTO login_logs (user_id, email, status, reason, ip, user_agent) VALUES (?, ?, ?, ?, ?, ?)'
    ).bind(userId, email, status, reason, ip, ua).run();
  } catch (e) {}
}

export async function onRequestPost({ request, env }) {
  try {
    const body = await request.json();
    const email = (body.email || '').trim().toLowerCase();
    const password = body.password || '';

    if (!email || !password) {
      await logAttempt(env, null, email, 'failed', 'missing_fields', request);
      return json({ ok: false, error: 'Email and password required' }, 400);
    }

    const user = await env.DB.prepare(
      'SELECT id, email, password_hash, name, role, status, deactivated_at FROM users WHERE email = ?'
    ).bind(email).first();

    if (!user) {
      await logAttempt(env, null, email, 'failed', 'user_not_found', request);
      return json({ ok: false, error: 'Email or password wrong' }, 401);
    }
    if (user.status === 'suspended') {
      await logAttempt(env, user.id, email, 'failed', 'suspended', request);
      return json({ ok: false, error: 'Account suspended' }, 403);
    }
    if (user.status !== 'active') {
      await logAttempt(env, user.id, email, 'failed', 'inactive', request);
      return json({ ok: false, error: 'Account inactive' }, 403);
    }

    const valid = await verifyPassword(password, user.password_hash);
    if (!valid) {
      await logAttempt(env, user.id, email, 'failed', 'wrong_password', request);
      return json({ ok: false, error: 'Email or password wrong' }, 401);
    }

    const ua = request.headers.get('User-Agent') || '';
    const ip = request.headers.get('CF-Connecting-IP') || request.headers.get('X-Forwarded-For') || '';
    const session = await createSession(env, user.id, { userAgent: ua, ip: ip });

    await logAttempt(env, user.id, email, 'success', null, request);

    return json({
      ok: true,
      user: { id: user.id, email: user.email, name: user.name, role: user.role, deactivated_at: user.deactivated_at },
      redirect: '/dashboard/'
    }, 200, { 'Set-Cookie': buildCookie('hh_session', session.token) });
  } catch (error) {
    return json({ ok: false, error: error.message }, 500);
  }
}
