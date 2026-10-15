import { requireAdmin, logAdmin } from '../../_admin.js';
import { hashPassword, generateToken, json } from '../../_utils.js';

function randomCode(len) {
  var chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  var out = '';
  var bytes = new Uint8Array(len);
  crypto.getRandomValues(bytes);
  for (var i = 0; i < len; i++) out += chars[bytes[i] % chars.length];
  return out;
}

function slugCohort(name) {
  return String(name || '').toUpperCase().replace(/[^A-Z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 20);
}

export async function onRequestPost({ request, env }) {
  const guard = await requireAdmin(request, env);
  if (guard.error) return guard.error;

  try {
    const body = await request.json();
    const cohortName = String(body.cohort || '').trim();
    const count = parseInt(body.count);
    const expiresHours = parseInt(body.expires_hours) || 24;
    const planDays = parseInt(body.plan_days) || 90;

    if (!cohortName) return json({ ok: false, error: 'Cohort name required' }, 400);
    if (!count || count < 1 || count > 200) return json({ ok: false, error: 'Count must be 1-200' }, 400);
    if (expiresHours < 1 || expiresHours > 8760) return json({ ok: false, error: 'Expires hours must be 1-8760' }, 400);
    if (planDays < 1 || planDays > 3650) return json({ ok: false, error: 'Plan days must be 1-3650' }, 400);

    const lastStudent = await env.DB.prepare(
      "SELECT username FROM users WHERE username LIKE 'student%' ORDER BY CAST(SUBSTR(username, 8) AS INTEGER) DESC LIMIT 1"
    ).first();

    let startNum = 1;
    if (lastStudent && lastStudent.username) {
      var parsed = parseInt(lastStudent.username.replace('student', ''));
      if (!isNaN(parsed)) startNum = parsed + 1;
    }

    var codeBase = slugCohort(cohortName);
    if (!codeBase) codeBase = 'CLASS';
    var classCode = codeBase + '-' + randomCode(4);
    var exists = await env.DB.prepare('SELECT code FROM class_codes WHERE code = ?').bind(classCode).first();
    var tries = 0;
    while (exists && tries < 5) {
      classCode = codeBase + '-' + randomCode(4);
      exists = await env.DB.prepare('SELECT code FROM class_codes WHERE code = ?').bind(classCode).first();
      tries++;
    }

    const expiresAt = new Date(Date.now() + expiresHours * 3600000).toISOString();

    await env.DB.prepare(
      'INSERT INTO class_codes (code, cohort, admin_id, token_count, plan_days) VALUES (?, ?, ?, ?, ?)'
    ).bind(classCode, cohortName, guard.session.userId, count, planDays).run();

    const tokens = [];
    for (let i = 0; i < count; i++) {
      const username = 'student' + (startNum + i);
      const raw = 'hh_tok_' + generateToken(20);
      const tokenHash = await hashPassword(raw);
      const tokenPrefix = raw.slice(0, 16);

      const result = await env.DB.prepare(
        'INSERT INTO login_tokens (user_id, token_hash, token_prefix, label, expires_at, is_class_token, class_code, cohort, assigned_username) VALUES (?, ?, ?, ?, ?, 1, ?, ?, ?)'
      ).bind(0, tokenHash, tokenPrefix, 'Class: ' + cohortName, expiresAt, classCode, cohortName, username).run();

      tokens.push({
        id: result.meta ? result.meta.last_row_id : null,
        token: raw,
        username: username,
        expires_at: expiresAt
      });
    }

    await logAdmin(env, guard.session.userId, 'class.bulk_generate', 'class_code', null, cohortName + ' · ' + count, request);

    return json({
      ok: true,
      class_code: classCode,
      cohort: cohortName,
      count: count,
      plan_days: planDays,
      expires_at: expiresAt,
      tokens: tokens
    });
  } catch (err) {
    return json({ ok: false, error: err.message }, 500);
  }
}

export async function onRequestGet({ request, env }) {
  const guard = await requireAdmin(request, env);
  if (guard.error) return guard.error;

  try {
    const { results } = await env.DB.prepare(
      'SELECT code, cohort, token_count, plan_days, created_at FROM class_codes ORDER BY created_at DESC LIMIT 50'
    ).all();

    const codes = (results || []).map(function(c) { return c.code; });
    const usage = {};
    if (codes.length) {
      const placeholders = codes.map(function(){ return '?'; }).join(',');
      const sql = 'SELECT class_code, COUNT(*) as used FROM login_tokens WHERE class_code IN (' + placeholders + ') AND used_at IS NOT NULL GROUP BY class_code';
      const stmt = env.DB.prepare(sql);
      const usedRows = await stmt.bind.apply(stmt, codes).all();
      (usedRows.results || []).forEach(function(r) { usage[r.class_code] = r.used; });
    }

    const classes = (results || []).map(function(c) {
      return {
        code: c.code,
        cohort: c.cohort,
        token_count: c.token_count,
        tokens_used: usage[c.code] || 0,
        plan_days: c.plan_days,
        created_at: c.created_at
      };
    });

    return json({ ok: true, classes: classes });
  } catch (err) {
    return json({ ok: false, error: err.message }, 500);
  }
}
