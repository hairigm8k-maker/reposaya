import { hashPassword, createSession, buildCookie, json } from '../../_utils.js';

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
    const token = (body.token || '').trim();
    if (!token) return json({ ok: false, error: 'Token required' }, 400);

    const tokenHash = await hashPassword(token);
    const row = await env.DB.prepare(
      'SELECT t.id, t.user_id, t.expires_at, t.used_at, u.email, u.name, u.role, u.status FROM login_tokens t JOIN users u ON u.id = t.user_id WHERE t.token_hash = ?'
    ).bind(tokenHash).first();

    if (!row) {
      await logAttempt(env, null, '', 'failed', 'invalid_token', request);
      return json({ ok: false, error: 'Invalid token' }, 401);
    }

    if (row.used_at) {
      await logAttempt(env, row.user_id, row.email, 'failed', 'token_used', request);
      return json({ ok: false, error: 'Token already used' }, 401);
    }
    if (row.expires_at && new Date(row.expires_at).getTime() < Date.now()) {
      await logAttempt(env, row.user_id, row.email, 'failed', 'token_expired', request);
      return json({ ok: false, error: 'Token expired' }, 401);
    }
    if (row.status === 'suspended') {
      await logAttempt(env, row.user_id, row.email, 'failed', 'suspended', request);
      return json({ ok: false, error: 'Account suspended' }, 403);
    }
    if (row.status !== 'active') {
      await logAttempt(env, row.user_id, row.email, 'failed', 'inactive', request);
      return json({ ok: false, error: 'Account inactive' }, 403);
    }

    await env.DB.prepare('UPDATE login_tokens SET used_at = datetime(\'now\') WHERE id = ?').bind(row.id).run();

    const ua = request.headers.get('User-Agent') || '';
    const ip = request.headers.get('CF-Connecting-IP') || request.headers.get('X-Forwarded-For') || '';
    const session = await createSession(env, row.user_id, { userAgent: ua, ip: ip });

    await logAttempt(env, row.user_id, row.email, 'success', 'token', request);

    return json({
      ok: true,
      user: { id: row.user_id, email: row.email, name: row.name, role: row.role },
      redirect: '/dashboard/'
    }, 200, { 'Set-Cookie': buildCookie('hh_session', session.token) });
  } catch (err) {
    return json({ ok: false, error: err.message }, 500);
  }
}
