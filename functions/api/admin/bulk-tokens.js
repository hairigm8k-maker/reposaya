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

export async function onRequestGet({ request, env }) {
  const guard = await requireAdmin(request, env);
  if (guard.error) return guard.error;

  try {
    const { results } = await env.DB.prepare(
      'SELECT code, cohort, token_count, plan_days, created_at FROM class_codes ORDER BY created_at DESC LIMIT 50'
    ).all();

    // Compute used count per class
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
