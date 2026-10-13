import { getCookie, verifySession, json } from '../_utils.js';

export async function onRequestGet({ request, env }) {
  const token = getCookie(request, 'hh_session');
  const session = await verifySession(env, token);
  if (!session) return json({ ok: false, error: 'Unauthorized' }, 401);

  const url = new URL(request.url);
  const id = url.searchParams.get('id');

  try {
    if (id) {
      const site = await env.DB.prepare('SELECT * FROM sites WHERE id = ? AND user_id = ?').bind(parseInt(id), session.userId).first();
      if (!site) return json({ ok: false, error: 'Site not found' }, 404);
      return json({ ok: true, site });
    }
    const result = await env.DB.prepare('SELECT id, name, subdomain, status, created_at, updated_at FROM sites WHERE user_id = ? ORDER BY created_at DESC').bind(session.userId).all();
    return json({ ok: true, sites: result.results || [] });
  } catch (error) {
    return json({ ok: false, error: error.message }, 500);
  }
}

export async function onRequestPost({ request, env }) {
  const token = getCookie(request, 'hh_session');
  const session = await verifySession(env, token);
  if (!session) return json({ ok: false, error: 'Unauthorized' }, 401);

  try {
    const body = await request.json();
    const name = (body.name || '').trim();
    let sub = (body.subdomain || '').trim().toLowerCase();

    if (!name) return json({ ok: false, error: 'Nama diperlukan' }, 400);

    if (!sub) {
      sub = name.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '').slice(0, 30);
    }

    if (!/^[a-z0-9][a-z0-9-]{1,28}[a-z0-9]$/.test(sub)) return json({ ok: false, error: 'Subdomain not sah' }, 400);

    const reserved = ['admin','api','www','mail','support','login','signup','dashboard','app','blog','help','docs'];
    if (reserved.indexOf(sub) >= 0) return json({ ok: false, error: 'Subdomain not dibenarkan' }, 400);

    const dup = await env.DB.prepare('SELECT id FROM sites WHERE subdomain = ?').bind(sub).first();
    if (dup) return json({ ok: false, error: 'Subdomain already digunakan' }, 400);

    const html = '<!DOCTYPE html>\n<html lang="ms">\n<head>\n<meta charset="UTF-8">\n<meta name="viewport" content="width=device-width, initial-scale=1.0">\n<title>' + name + '</title>\n</head>\n<body>\n<h1>Welcome ke ' + name + '</h1>\n<p>Edit HTML ni for mula.</p>\n</body>\n</html>';

    const result = await env.DB.prepare('INSERT INTO sites (user_id, name, subdomain, html, status) VALUES (?, ?, ?, ?, \'draft\')').bind(session.userId, name, sub, html).run();

    return json({ ok: true, site: { id: result.meta.last_row_id, name: name, subdomain: sub, status: 'draft' } });
  } catch (error) {
    return json({ ok: false, error: error.message }, 500);
  }
}

export async function onRequestPatch({ request, env }) {
  const token = getCookie(request, 'hh_session');
  const session = await verifySession(env, token);
  if (!session) return json({ ok: false, error: 'Unauthorized' }, 401);

  const url = new URL(request.url);
  const id = parseInt(url.searchParams.get('id'));
  if (!id) return json({ ok: false, error: 'ID diperlukan' }, 400);

  try {
    const existing = await env.DB.prepare('SELECT id FROM sites WHERE id = ? AND user_id = ?').bind(id, session.userId).first();
    if (!existing) return json({ ok: false, error: 'Site not found' }, 404);

    const body = await request.json();
    const sets = [];
    const vals = [];

    if (body.name !== undefined) { sets.push('name = ?'); vals.push(String(body.name).trim()); }
    if (body.html !== undefined) { sets.push('html = ?'); vals.push(String(body.html)); }
    if (body.css !== undefined) { sets.push('css = ?'); vals.push(String(body.css)); }
    if (body.js !== undefined) { sets.push('js = ?'); vals.push(String(body.js)); }
    if (body.status !== undefined && (body.status === 'draft' || body.status === 'live')) {
      sets.push('status = ?');
      vals.push(body.status);
      if (body.status === 'live') sets.push('published_at = CURRENT_TIMESTAMP');
    }

    if (sets.length === 0) return json({ ok: false, error: 'Tiada perubahan' }, 400);

    sets.push('updated_at = CURRENT_TIMESTAMP');
    vals.push(id);
    vals.push(session.userId);

    const sql = 'UPDATE sites SET ' + sets.join(', ') + ' WHERE id = ? AND user_id = ?';
    await env.DB.prepare(sql).bind(...vals).run();

    return json({ ok: true });
  } catch (error) {
    return json({ ok: false, error: error.message }, 500);
  }
}

export async function onRequestDelete({ request, env }) {
  const token = getCookie(request, 'hh_session');
  const session = await verifySession(env, token);
  if (!session) return json({ ok: false, error: 'Unauthorized' }, 401);

  const url = new URL(request.url);
  const id = parseInt(url.searchParams.get('id'));
  if (!id) return json({ ok: false, error: 'ID diperlukan' }, 400);

  try {
    await env.DB.prepare('DELETE FROM sites WHERE id = ? AND user_id = ?').bind(id, session.userId).run();
    return json({ ok: true });
  } catch (error) {
    return json({ ok: false, error: error.message }, 500);
  }
}
