import { authenticate, json } from '../_utils.js';

export async function onRequestGet({ request, env }) {
  const session = await authenticate(request, env);
  if (!session) return json({ ok: false, error: 'Unauthorized' }, 401);

  const url = new URL(request.url);
  const q = url.searchParams.get('q');
  const limit = Math.min(parseInt(url.searchParams.get('limit')) || 100, 200);

  try {
    let sql = 'SELECT id, site_id, site_name, site_subdomain, action, site_deleted, created_at FROM deployments WHERE user_id = ?';
    const binds = [session.userId];

    if (q) {
      sql += ' AND (site_name LIKE ? OR site_subdomain LIKE ?)';
      const like = '%' + q + '%';
      binds.push(like, like);
    }

    sql += ' ORDER BY created_at DESC LIMIT ?';
    binds.push(limit);

    const stmt = env.DB.prepare(sql);
    const { results } = await stmt.bind.apply(stmt, binds).all();

    return json({ ok: true, deployments: results || [] });
  } catch (err) {
    return json({ ok: false, error: err.message }, 500);
  }
}
