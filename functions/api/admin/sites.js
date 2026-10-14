import { requireAdmin, logAdmin } from '../../_admin.js';
import { json } from '../../_utils.js';

export async function onRequestGet({ request, env }) {
  const guard = await requireAdmin(request, env);
  if (guard.error) return guard.error;
  const url = new URL(request.url);
  const q = (url.searchParams.get('q') || '').trim().toLowerCase();
  try {
    let sql = 'SELECT s.id, s.name, s.subdomain, s.status, s.created_at, s.updated_at, u.email as owner_email, u.name as owner_name FROM sites s JOIN users u ON u.id = s.user_id';
    const binds = [];
    if (q) {
      sql += ' WHERE LOWER(s.name) LIKE ? OR LOWER(s.subdomain) LIKE ? OR LOWER(u.email) LIKE ?';
      const like = '%' + q + '%';
      binds.push(like, like, like);
    }
    sql += ' ORDER BY s.updated_at DESC LIMIT 300';
    const stmt = env.DB.prepare(sql);
    const { results } = binds.length ? await stmt.bind.apply(stmt, binds).all() : await stmt.all();
    return json({ ok: true, sites: results || [] });
  } catch (err) { return json({ ok: false, error: err.message }, 500); }
}

export async function onRequestDelete({ request, env }) {
  const guard = await requireAdmin(request, env);
  if (guard.error) return guard.error;
  const url = new URL(request.url);
  const id = parseInt(url.searchParams.get('id'));
  if (!id) return json({ ok: false, error: 'ID required' }, 400);
  try {
    const s = await env.DB.prepare('SELECT name, subdomain, user_id FROM sites WHERE id = ?').bind(id).first();
    if (!s) return json({ ok: false, error: 'Site not found' }, 404);
    await env.DB.prepare('DELETE FROM files WHERE site_id = ?').bind(id).run();
    await env.DB.prepare('DELETE FROM analytics WHERE site_id = ?').bind(id).run();
    await env.DB.prepare('DELETE FROM sites WHERE id = ?').bind(id).run();
    await env.DB.prepare('UPDATE deployments SET site_deleted = 1 WHERE site_id = ?').bind(id).run();
    await logAdmin(env, guard.session.userId, 'site.delete', 'site', id, s.subdomain, request);
    return json({ ok: true });
  } catch (err) { return json({ ok: false, error: err.message }, 500); }
}
