import { getCookie, verifySession, json } from '../_utils.js';

export async function onRequestGet({ request, env }) {
  const token = getCookie(request, 'hh_session');
  const session = await verifySession(env, token);
  if (!session) return json({ ok: false, error: 'Unauthorized' }, 401);

  const url = new URL(request.url);
  const slug = url.searchParams.get('slug');
  const q = url.searchParams.get('q');
  const cat = url.searchParams.get('category');

  try {
    if (slug) {
      const t = await env.DB.prepare(
        'SELECT slug, name, category, description, html FROM templates WHERE slug = ?'
      ).bind(slug).first();
      if (!t) return json({ ok: false, error: 'Template tak jumpa' }, 404);
      return json({ ok: true, template: t });
    }

    let sql = 'SELECT slug, name, category, description, substr(html,1,1) as has_html FROM templates';
    const conds = [];
    const binds = [];
    if (cat) { conds.push('category = ?'); binds.push(cat); }
    if (q) { conds.push('(name LIKE ? OR description LIKE ? OR slug LIKE ?)'); const like = '%' + q + '%'; binds.push(like, like, like); }
    if (conds.length) sql += ' WHERE ' + conds.join(' AND ');
    sql += ' ORDER BY category, name';

    const stmt = binds.length ? env.DB.prepare(sql).bind.apply(env.DB.prepare(sql), binds) : env.DB.prepare(sql);
    const { results } = await stmt.all();

    const cats = await env.DB.prepare('SELECT DISTINCT category FROM templates ORDER BY category').all();

    return json({
      ok: true,
      templates: (results || []).map(function(t) {
        return { slug: t.slug, name: t.name, category: t.category, description: t.description };
      }),
      categories: (cats.results || []).map(function(c) { return c.category; })
    });
  } catch (err) {
    return json({ ok: false, error: err.message }, 500);
  }
}
