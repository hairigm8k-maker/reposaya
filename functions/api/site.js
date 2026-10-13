import { getCookie, verifySession, json } from '../../_utils/auth.js';

// GET — List sites (kalau takde id) atau Single site (kalau ada id)
export async function onRequestGet({ request, env }) {
  const token = getCookie(request, 'hh_session');
  const session = await verifySession(env, token);
  if (!session) return json({ ok: false, error: 'Unauthorized' }, 401);

  const url = new URL(request.url);
  const siteId = url.searchParams.get('id');

  try {
    if (siteId) {
      // Single site
      const site = await env.DB.prepare(
        'SELECT * FROM sites WHERE id = ? AND user_id = ?'
      ).bind(parseInt(siteId), session.userId).first();

      if (!site) return json({ ok: false, error: 'Site tak jumpa' }, 404);
      return json({ ok: true, site });
    } else {
      // List semua
      const { results } = await env.DB.prepare(
        'SELECT id, name, subdomain, status, created_at, updated_at, published_at FROM sites WHERE user_id = ? ORDER BY created_at DESC'
      ).bind(session.userId).all();

      return json({ ok: true, sites: results || [] });
    }
  } catch (err) {
    return json({ ok: false, error: err.message }, 500);
  }
}

// POST — Create site baru
export async function onRequestPost({ request, env }) {
  const token = getCookie(request, 'hh_session');
  const session = await verifySession(env, token);
  if (!session) return json({ ok: false, error: 'Unauthorized' }, 401);

  try {
    const body = await request.json();
    const name = (body.name || '').trim();
    let subdomain = (body.subdomain || '').trim().toLowerCase();

    if (!name) return json({ ok: false, error: 'Nama diperlukan' }, 400);

    if (!subdomain) {
      subdomain = name.toLowerCase()
        .replace(/[^a-z0-9-]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '')
        .slice(0, 30);
    }

    if (!/^[a-z0-9][a-z0-9-]{1,28}[a-z0-9]$/.test(subdomain)) {
      return json({ ok: false, error: 'Subdomain tak sah' }, 400);
    }

    const reserved = ['admin', 'api', 'www', 'mail', 'support', 'login', 'signup', 'dashboard', 'app', 'blog', 'help', 'docs'];
    if (reserved.includes(subdomain)) {
      return json({ ok: false, error: 'Subdomain ni tidak dibenarkan' }, 400);
    }

    const existing = await env.DB.prepare(
      'SELECT id FROM sites WHERE subdomain = ?'
    ).bind(subdomain).first();
    if (existing) return json({ ok: false, error: 'Subdomain dah digunakan' }, 400);

    const defaultHtml = '<!DOCTYPE html>\n<html lang="ms">\n<head>\n<meta charset="UTF-8">\n<meta name="viewport" content="width=device-width, initial-scale=1.0">\n<title>' + name + '</title>\n</head>\n<body>\n<h1>Selamat datang ke ' + name + '</h1>\n<p>Edit HTML ni untuk mula.</p>\n</body>\n</html>';

    const result = await env.DB.prepare(
      'INSERT INTO sites (user_id, name, subdomain, html, status) VALUES (?, ?, ?, ?, \'draft\')'
    ).bind(session.userId, name, subdomain, defaultHtml).run();

    return json({
      ok: true,
      site: { id: result.meta.last_row_id, name: name, subdomain: subdomain, status: 'draft' }
    });
  } catch (err) {
    return json({ ok: false, error: err.message }, 500);
  }
}

// PATCH — Update site (?id=xxx)
export async function onRequestPatch({ request, env }) {
  const token = getCookie(request, 'hh_session');
  const session = await verifySession(env, token);
  if (!session) return json({ ok: false, error: 'Unauthorized' }, 401);

  const url = new URL(request.url);
  const siteId = parseInt(url.searchParams.get('id'));
  if (!siteId) return json({ ok: false, error: 'ID required' }, 400);

  try {
    const existing = await env.DB.prepare(
      'SELECT id FROM sites WHERE id = ? AND user_id = ?'
    ).bind(siteId, session.userId).first();
    if (!existing) return json({ ok: false, error: 'Site tak jumpa' }, 404);

    const body = await request.json();
    const sets = [];
    const vals = [];

    if (body.name !== undefined) { sets.push('name = ?'); vals.push(String(body.name).trim()); }
    if (body.html !== undefined) { sets.push('html = ?'); vals.push(String(body.html)); }
    if (body.css !== undefined) { sets.push('css = ?'); vals.push(String(body.css)); }
    if (body.js !== undefined) { sets.push('js = ?'); vals.push(String(body.js)); }
    if (body.status !== undefined && ['draft', 'live'].includes(body.status)) {
      sets.push('status = ?');
      vals.push(body.status);
      if (body.status === 'live') sets.push('published_at = CURRENT_TIMESTAMP');
    }

    if (sets.length === 0) return json({ ok: false, error: 'Tiada perubahan' }, 400);

    sets.push('updated_at = CURRENT_TIMESTAMP');
    vals.push(siteId);
    vals.push(session.userId);

    const sql = 'UPDATE sites SET ' + sets.join(', ') + ' WHERE id = ? AND user_id = ?';

    let stmt = env.DB.prepare(sql);
    vals.forEach(function(v) { stmt = stmt.bind(v); });
    await stmt.run();

    return json({ ok: true });
  } catch (err) {
    return json({ ok: false, error: err.message }, 500);
  }
}

// DELETE — Padam site (?id=xxx)
export async function onRequestDelete({ request, env }) {
  const token = getCookie(request, 'hh_session');
  const session = await verifySession(env, token);
  if (!session) return json({ ok: false, error: 'Unauthorized' }, 401);

  const url = new URL(request.url);
  const siteId = parseInt(url.searchParams.get('id'));
  if (!siteId) return json({ ok: false, error: 'ID required' }, 400);

  try {
    await env.DB.prepare(
      'DELETE FROM sites WHERE id = ? AND user_id = ?'
    ).bind(siteId, session.userId).run();

    return json({ ok: true });
  } catch (err) {
    return json({ ok: false, error: err.message }, 500);
  }
}
