import { requireAdmin } from '../../_admin.js';
import { json } from '../../_utils.js';

export async function onRequestGet({ request, env }) {
  const guard = await requireAdmin(request, env);
  if (guard.error) return guard.error;
  try {
    const { results } = await env.DB.prepare(
      'SELECT l.id, l.action, l.target_type, l.target_id, l.details, l.ip, l.created_at, u.email as admin_email, u.name as admin_name FROM admin_logs l LEFT JOIN users u ON u.id = l.admin_id ORDER BY l.created_at DESC LIMIT 200'
    ).all();
    return json({ ok: true, logs: results || [] });
  } catch (err) { return json({ ok: false, error: err.message }, 500); }
}
