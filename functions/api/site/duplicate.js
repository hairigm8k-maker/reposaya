import { authenticate, json } from '../../_utils.js';

export async function onRequestPost({ request, env }) {
  const session = await authenticate(request, env);
  if (!session) return json({ ok: false, error: 'Unauthorized' }, 401);

  try {
    const body = await request.json();
    const sourceId = parseInt(body.source_id);
    const name = (body.name || '').trim();
    const subdomain = (body.subdomain || '').trim().toLowerCase();
    const description = (body.description || '').trim().slice(0, 300);
    const analyticsEnabled = body.analytics_enabled === false ? 0 : 1;
    const autoPublish = body.auto_publish === true;

    if (!sourceId) return json({ ok: false, error: 'Source site required' }, 400);
    if (!name) return json({ ok: false, error: 'Name required' }, 400);

    let sub = subdomain || name.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '').slice(0, 30);
    if (!sub) sub = 'site-' + Date.now();
    if (!/^[a-z0-9-]{3,30}$/.test(sub)) return json({ ok: false, error: 'Invalid subdomain' }, 400);

    const reserved = ['www', 'api', 'admin', 'dashboard', 'login', 'signup', 'app', 'mail', 'support', 'help', 'blog', 'cdn', 'assets', 'admin-hh', 'cli', 'static', 'main'];
    if (reserved.indexOf(sub) >= 0) return json({ ok: false, error: 'Subdomain is reserved' }, 400);

    const existing = await env.DB.prepare('SELECT id FROM sites WHERE subdomain = ?').bind(sub).first();
    if (existing) return json({ ok: false, error: 'Subdomain already taken' }, 400);

    const src = await env.DB.prepare(
      'SELECT id, html, css, js FROM sites WHERE id = ? AND user_id = ?'
    ).bind(sourceId, session.userId).first();
    if (!src) return json({ ok: false, error: 'Source site not found' }, 404);

    const status = autoPublish ? 'live' : 'draft';
    const publishedAt = autoPublish ? new Date().toISOString() : null;

    const result = await env.DB.prepare(
      'INSERT INTO sites (user_id, name, subdomain, html, css, js, status, description, analytics_enabled, published_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
    ).bind(session.userId, name, sub, src.html || '', src.css || '', src.js || '', status, description || null, analyticsEnabled, publishedAt).run();

    const newId = result.meta ? result.meta.last_row_id : null;

    const { results } = await env.DB.prepare(
      'SELECT filename, mime_type, size, data FROM files WHERE site_id = ?'
    ).bind(sourceId).all();

    let filesCopied = 0;
    if (newId && results && results.length) {
      for (let i = 0; i < results.length; i++) {
        const f = results[i];
        try {
          await env.DB.prepare(
            'INSERT INTO files (site_id, filename, mime_type, size, data) VALUES (?, ?, ?, ?, ?)'
          ).bind(newId, f.filename, f.mime_type, f.size, f.data).run();
          filesCopied++;
        } catch (e) {}
      }
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
