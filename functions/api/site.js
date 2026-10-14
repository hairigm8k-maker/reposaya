import { authenticate, json } from '../_utils.js';

export async function onRequestGet({ request, env }) {
  const session = await authenticate(request, env);
  if (!session) return json({ ok: false, error: 'Unauthorized' }, 401);

  const url = new URL(request.url);
  const id = parseInt(url.searchParams.get('id'));

  try {
    if (id) {
      const site = await env.DB.prepare(
        'SELECT id, name, subdomain, html, css, js, status, published_at, created_at, updated_at FROM sites WHERE id = ? AND user_id = ?'
      ).bind(id, session.userId).first();
      if (!site) return json({ ok: false, error: 'Site not found' }, 404);
      return json({ ok: true, site: site });
    }

    const { results } = await env.DB.prepare(
      'SELECT id, name, subdomain, status, published_at, created_at, updated_at FROM sites WHERE user_id = ? ORDER BY updated_at DESC'
    ).bind(session.userId).all();
    return json({ ok: true, sites: results || [] });
  } catch (err) {
    return json({ ok: false, error: err.message }, 500);
  }
}

export async function onRequestPost({ request, env }) {
  const session = await authenticate(request, env);
  if (!session) return json({ ok: false, error: 'Unauthorized' }, 401);

  try {
    const body = await request.json();
    const name = (body.name || '').trim();
    const subdomain = (body.subdomain || '').trim().toLowerCase();
    const description = (body.description || '').trim().slice(0, 300);
    const analyticsEnabled = body.analytics_enabled === false ? 0 : 1;
    const autoPublish = body.auto_publish === true;
    const duplicateFrom = parseInt(body.duplicate_from) || 0;

    if (!name) return json({ ok: false, error: 'Name required' }, 400);
    if (name.length > 60) return json({ ok: false, error: 'Name too long (max 60)' }, 400);

    let sub = subdomain || name.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '').slice(0, 30);
    if (!sub) sub = 'site-' + Date.now();
    if (!/^[a-z0-9-]{3,30}$/.test(sub)) return json({ ok: false, error: 'Subdomain: 3-30 chars, a-z 0-9 dash only' }, 400);

    const reserved = ['www', 'api', 'admin', 'dashboard', 'login', 'signup', 'app', 'mail', 'support', 'help', 'blog', 'cdn', 'assets', 'admin-hh', 'cli', 'static', 'main'];
    if (reserved.indexOf(sub) >= 0) return json({ ok: false, error: 'Subdomain is reserved' }, 400);

    const existing = await env.DB.prepare('SELECT id FROM sites WHERE subdomain = ?').bind(sub).first();
    if (existing) return json({ ok: false, error: 'Subdomain already taken' }, 400);

    let html = '', css = '', js = '';
    let sourceFiles = [];

    if (duplicateFrom) {
      const src = await env.DB.prepare('SELECT id, html, css, js FROM sites WHERE id = ? AND user_id = ?').bind(duplicateFrom, session.userId).first();
      if (!src) return json({ ok: false, error: 'Source site not found' }, 404);
      html = src.html || '';
      css = src.css || '';
      js = src.js || '';
      const { results } = await env.DB.prepare('SELECT filename, mime_type, size, data FROM files WHERE site_id = ?').bind(duplicateFrom).all();
      sourceFiles = results || [];
    } else {
      html = '<!DOCTYPE html>\n<html lang="en">\n<head>\n<meta charset="UTF-8">\n<meta name="viewport" content="width=device-width,initial-scale=1">\n<title>' + name + '</title>\n</head>\n<body>\n<h1>Hello World</h1>\n<p>Your new site is ready.</p>\n</body>\n</html>';
    }

    const status = autoPublish ? 'live' : 'draft';
    const publishedAt = autoPublish ? new Date().toISOString() : null;

    const result = await env.DB.prepare(
      'INSERT INTO sites (user_id, name, subdomain, html, css, js, status, description, analytics_enabled, published_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
    ).bind(session.userId, name, sub, html, css, js, status, description || null, analyticsEnabled, publishedAt).run();

    const newId = result.meta ? result.meta.last_row_id : null;

    // Copy files kalau duplicate
    let filesCopied = 0;
    if (newId && sourceFiles.length) {
      for (let i = 0; i < sourceFiles.length; i++) {
        const sf = sourceFiles[i];
        try {
          await env.DB.prepare(
            'INSERT INTO files (site_id, filename, mime_type, size, data) VALUES (?, ?, ?, ?, ?)'
          ).bind(newId, sf.filename, sf.mime_type, sf.size, sf.data).run();
          filesCopied++;
        } catch (e) {}
      }
    }

    if (newId && autoPublish) {
      try {
        await env.DB.prepare(
          'INSERT INTO deployments (user_id, site_id, site_name, site_subdomain, action) VALUES (?, ?, ?, ?, ?)'
        ).bind(session.userId, newId, name, sub, 'publish').run();
      } catch (e) {}
    }

    return json({
      ok: true,
      site: { id: newId, name: name, subdomain: sub, status: status },
      files_copied: filesCopied
    });
  } catch (err) {
    return json({ ok: false, error: err.message }, 500);
  }
}

export async function onRequestPatch({ request, env }) {
  const session = await authenticate(request, env);
  if (!session) return json({ ok: false, error: 'Unauthorized' }, 401);

  const url = new URL(request.url);
  const id = parseInt(url.searchParams.get('id'));
  if (!id) return json({ ok: false, error: 'ID required' }, 400);

  try {
    const site = await env.DB.prepare('SELECT id, status, name, subdomain FROM sites WHERE id = ? AND user_id = ?').bind(id, session.userId).first();
    if (!site) return json({ ok: false, error: 'Site not found' }, 404);

    const body = await request.json();
    const fields = [];
    const values = [];

    if (typeof body.html === 'string') { fields.push('html = ?'); values.push(body.html); }
    if (typeof body.css === 'string') { fields.push('css = ?'); values.push(body.css); }
    if (typeof body.js === 'string') { fields.push('js = ?'); values.push(body.js); }
    if (typeof body.name === 'string' && body.name.trim()) { fields.push('name = ?'); values.push(body.name.trim()); }

    let statusChanged = false;
    if (typeof body.status === 'string' && (body.status === 'draft' || body.status === 'live')) {
      fields.push('status = ?'); values.push(body.status);
      if (body.status === 'live' && site.status !== 'live') {
        fields.push('published_at = datetime(\'now\')');
        statusChanged = true;
      }
    }

    fields.push('updated_at = datetime(\'now\')');
    values.push(id);

    const sql = 'UPDATE sites SET ' + fields.join(', ') + ' WHERE id = ?';
    const stmt = env.DB.prepare(sql);
    await stmt.bind.apply(stmt, values).run();

    if (statusChanged) {
      try {
        await env.DB.prepare(
          'INSERT INTO deployments (user_id, site_id, site_name, site_subdomain, action) VALUES (?, ?, ?, ?, ?)'
        ).bind(session.userId, site.id, site.name, site.subdomain, 'publish').run();
      } catch (e) {}
    }

    return json({ ok: true });
  } catch (err) {
    return json({ ok: false, error: err.message }, 500);
  }
}

export async function onRequestDelete({ request, env }) {
  const session = await authenticate(request, env);
  if (!session) return json({ ok: false, error: 'Unauthorized' }, 401);

  const url = new URL(request.url);
  const id = parseInt(url.searchParams.get('id'));
  if (!id) return json({ ok: false, error: 'ID required' }, 400);

  try {
    const site = await env.DB.prepare('SELECT id FROM sites WHERE id = ? AND user_id = ?').bind(id, session.userId).first();
    if (!site) return json({ ok: false, error: 'Site not found' }, 404);

    await env.DB.prepare('DELETE FROM files WHERE site_id = ?').bind(id).run();
    await env.DB.prepare('DELETE FROM analytics WHERE site_id = ?').bind(id).run();
    await env.DB.prepare('DELETE FROM custom_domains WHERE site_id = ?').bind(id).run();
    await env.DB.prepare('DELETE FROM sites WHERE id = ?').bind(id).run();
    await env.DB.prepare('UPDATE deployments SET site_deleted = 1 WHERE site_id = ?').bind(id).run();

    return json({ ok: true });
  } catch (err) {
    return json({ ok: false, error: err.message }, 500);
  }
}
