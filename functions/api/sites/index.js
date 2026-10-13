import { getCookie, verifySession, json } from '../_utils/auth.js';

// GET — List semua sites user
export async function onRequestGet({ request, env }) {
  const token = getCookie(request, 'hh_session');
  const session = await verifySession(env, token);

  if (!session) {
    return json({ ok: false, error: 'Unauthorized' }, 401);
  }

  try {
    const { results } = await env.DB.prepare(
      `SELECT id, name, subdomain, status, created_at, updated_at, published_at
       FROM sites WHERE user_id = ? ORDER BY created_at DESC`
    ).bind(session.userId).all();

    return json({ ok: true, sites: results || [] });
  } catch (err) {
    console.error('List sites error:', err);
    return json({ ok: false, error: err.message }, 500);
  }
}

// POST — Create site baru
export async function onRequestPost({ request, env }) {
  const token = getCookie(request, 'hh_session');
  const session = await verifySession(env, token);

  if (!session) {
    return json({ ok: false, error: 'Unauthorized' }, 401);
  }

  try {
    const body = await request.json();
    const name = (body.name || '').trim();
    let subdomain = (body.subdomain || '').trim().toLowerCase();

    // Validate
    if (!name) {
      return json({ ok: false, error: 'Nama site diperlukan' }, 400);
    }

    if (!subdomain) {
      // Auto-generate dari name
      subdomain = name.toLowerCase()
        .replace(/[^a-z0-9-]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '')
        .slice(0, 30);
    }

    // Validate subdomain format
    if (!/^[a-z0-9][a-z0-9-]{1,28}[a-z0-9]$/.test(subdomain)) {
      return json({ ok: false, error: 'Subdomain tidak sah. Guna huruf, nombor, dan tanda -' }, 400);
    }

    // Reserved subdomains
    const reserved = ['admin', 'api', 'www', 'mail', 'support', 'login',
                     'signup', 'dashboard', 'app', 'blog', 'help', 'docs'];
    if (reserved.includes(subdomain)) {
      return json({ ok: false, error: 'Subdomain ni tidak dibenarkan' }, 400);
    }

    // Check duplicate
    const existing = await env.DB.prepare(
      'SELECT id FROM sites WHERE subdomain = ?'
    ).bind(subdomain).first();

    if (existing) {
      return json({ ok: false, error: 'Subdomain dah digunakan. Cuba nama lain.' }, 400);
    }

    // Default template
    const defaultHtml = `<!DOCTYPE html>
<html lang="ms">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${name}</title>
</head>
<body>
  <h1>Selamat datang ke ${name}</h1>
  <p>Edit HTML ni untuk mula.</p>
</body>
</html>`;

    // Insert
    const result = await env.DB.prepare(
      `INSERT INTO sites (user_id, name, subdomain, html, status)
       VALUES (?, ?, ?, ?, 'draft')`
    ).bind(session.userId, name, subdomain, defaultHtml).run();

    const siteId = result.meta.last_row_id;

    return json({
      ok: true,
      site: {
        id: siteId,
        name: name,
        subdomain: subdomain,
        status: 'draft'
      }
    });

  } catch (err) {
    console.error('Create site error:', err);
    return json({ ok: false, error: err.message }, 500);
  }
}
