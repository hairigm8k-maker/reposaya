import { requireAdmin, logAdmin } from '../../_admin.js';
import { json } from '../../_utils.js';

export async function onRequestGet({ request, env }) {
  const guard = await requireAdmin(request, env);
  if (guard.error) return guard.error;
  try {
    const { results } = await env.DB.prepare(
      'SELECT s.token, s.user_id, s.user_agent, s.ip, s.created_at, s.last_active, u.email, u.name FROM sessions s JOIN users u ON u.id = s.user_id WHERE u.role = \'admin\' OR u.role = \'superadmin\' ORDER BY s.last_active DESC'
    ).all();
    const sessions = (results || []).map(function(s){
      return { token_prefix: s.token.slice(0, 8), user_id: s.user_id, email: s.email, name: s.name, user_agent: s.user_agent || '', ip: s.ip || '', created_at: s.created_at, last_active: s.last_active };
    });
    return json({ ok: true, sessions: sessions });
  } catch (err) { return json({ ok: false, error: err.message }, 500); }
}

export async function onRequestDelete({ request, env }) {
  const guard = await requireAdmin(request, env);
  if (guard.error) return guard.error;
  const url = new URL(request.url);
  const prefix = url.searchParams.get('prefix');
  if (!prefix) return json({ ok: false, error: 'prefix required' }, 400);
  try {
    const row = await env.DB.prepare('SELECT token, user_id FROM sessions WHERE token LIKE ?').bind(prefix + '%').first();
    if (!row) return json({ ok: false, error: 'Session not found' }, 404);
    await env.DB.prepare('DELETE FROM sessions WHERE token = ?').bind(row.token).run();
    await logAdmin(env, guard.session.userId, 'session.revoke', 'user', row.user_id, 'Prefix: ' + prefix, request);
    return json({ ok: true });
  } catch (err) { return json({ ok: false, error: err.message }, 500); }
}
