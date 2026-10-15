import { hashPassword, generateToken, createSession, buildCookie, json } from '../_utils.js';

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
    const classCode = (body.class_code || '').trim().toUpperCase();
    const token = (body.token || '').trim();

    if (!classCode) return json({ ok: false, error: 'Class code required' }, 400);
    if (!token) return json({ ok: false, error: 'Token required' }, 400);

    // Verify class code
    const cls = await env.DB.prepare(
      'SELECT code, cohort, plan_days FROM class_codes WHERE code = ?'
    ).bind(classCode).first();
    if (!cls) {
      await logAttempt(env, null, '', 'failed', 'invalid_class_code', request);
      return json({ ok: false, error: 'Class code tidak sah' }, 404);
    }

    // Verify token belongs to this class
    const tokenHash = await hashPassword(token);
    const row = await env.DB.prepare(
      'SELECT id, user_id, expires_at, used_at, class_code, cohort, assigned_username FROM login_tokens WHERE token_hash = ?'
    ).bind(tokenHash).first();

    if (!row) {
      await logAttempt(env, null, '', 'failed', 'invalid_token', request);
      return json({ ok: false, error: 'Token tidak sah' }, 401);
    }
    if (row.used_at) {
      await logAttempt(env, null, '', 'failed', 'token_used', request);
      return json({ ok: false, error: 'Token dah digunakan' }, 401);
    }
    if (row.class_code !== classCode) {
      await logAttempt(env, null, '', 'failed', 'code_mismatch', request);
      return json({ ok: false, error: 'Token tak padan dengan class code' }, 401);
    }
    if (row.expires_at && new Date(row.expires_at).getTime() < Date.now()) {
      await logAttempt(env, null, '', 'failed', 'token_expired', request);
      return json({ ok: false, error: 'Token dah expired' }, 401);
    }

    const username = row.assigned_username || ('student' + Date.now());

    // Check username uniqueness
    const existingUser = await env.DB.prepare('SELECT id FROM users WHERE username = ?').bind(username).first();
    if (existingUser) {
      await logAttempt(env, null, '', 'failed', 'username_taken', request);
      return json({ ok: false, error: 'Username dah wujud. Contact admin.' }, 409);
    }

    // Auto-create user
    const email = username + '@student.hairiamri.buzz';
    const tempPassword = generateToken(12);
    const passwordHash = await hashPassword(tempPassword);
    const planDays = cls.plan_days || 90;
    const expiresPlan = new Date(Date.now() + planDays * 86400000).toISOString();

    const insertResult = await env.DB.prepare(
      'INSERT INTO users (email, name, username, password_hash, role, status, plan, plan_expires_at, is_student, cohort, settings) VALUES (?, ?, ?, ?, \'user\', \'active\', \'student\', ?, 1, ?, ?)'
    ).bind(email, username, username, passwordHash, expiresPlan, cls.cohort, JSON.stringify({ appearance: { reduceAnimations: false, lockZoom: false } })).run();

    const newUserId = insertResult.meta ? insertResult.meta.last_row_id : null;
    if (!newUserId) throw new Error('Failed to create user');

    // Mark token as used
    await env.DB.prepare(
      'UPDATE login_tokens SET used_at = datetime(\'now\'), used_by_user_id = ? WHERE id = ?'
    ).bind(newUserId, row.id).run();

    // Increment class tokens_used
    await env.DB.prepare(
      'UPDATE class_codes SET tokens_used = tokens_used + 1 WHERE code = ?'
    ).bind(classCode).run();

    // Create session + auto-login
    const ua = request.headers.get('User-Agent') || '';
    const ip = request.headers.get('CF-Connecting-IP') || request.headers.get('X-Forwarded-For') || '';
    const session = await createSession(env, newUserId, { userAgent: ua, ip: ip });

    await logAttempt(env, newUserId, email, 'success', 'class_redeem', request);

    return json({
      ok: true,
      user: { id: newUserId, email: email, name: username, username: username, plan: 'student' },
      cohort: cls.cohort,
      redirect: '/dashboard/'
    }, 200, { 'Set-Cookie': buildCookie('hh_session', session.token) });
  } catch (err) {
    return json({ ok: false, error: err.message }, 500);
  }
}
