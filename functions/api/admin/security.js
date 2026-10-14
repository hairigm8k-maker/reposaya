import { requireAdmin } from '../../_admin.js';
import { json } from '../../_utils.js';

export async function onRequestGet({ request, env }) {
  const guard = await requireAdmin(request, env);
  if (guard.error) return guard.error;
  const url = new URL(request.url);
  const filter = url.searchParams.get('filter') || 'all';
  try {
    let sql = 'SELECT id, user_id, email, status, reason, ip, user_agent, created_at FROM login_logs';
    if (filter === 'failed') sql += ' WHERE status = \'failed\'';
    else if (filter === 'success') sql += ' WHERE status = \'success\'';
    sql += ' ORDER BY created_at DESC LIMIT 200';
    const { results } = await env.DB.prepare(sql).all();
    return json({ ok: true, logs: results || [] });
  } catch (err) { return json({ ok: false, error: err.message }, 500); }
}
