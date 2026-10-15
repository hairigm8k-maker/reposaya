import { authenticate, isStudentUser, studentBlocked, json } from '../../_utils.js';

const RESERVED = ['www','api','admin','dashboard','login','signup','app','mail','support','help','blog','cdn','assets','admin-hh','cli','static','main'];

export async function onRequestPost({ request, env }) {
  const session = await authenticate(request, env);
  if (!session) return json({ ok: false, error: 'Unauthorized. Provide API key via Authorization: Bearer hh_live_xxx' }, 401);
  if (await isStudentUser(env, session.userId)) return studentBlocked('CLI access');

  try {
    const body = await request.json();
    const subdomain = (body.subdomain || '').trim().toLowerCase();
    const html = body.html || '';
    const css = body.css || '';
    const js = body.js || '';
    const files = body.files || [];
    const mode = body.mode || 'prompt';
    const siteName = (body.name || subdomain).trim();
    const shouldPublish = body.publish === true;

    if (!subdomain) return json({ ok: false, error: 'Subdomain required' }, 400);
    if (!/^[a-z0-9-]{3,30}$/.test(subdomain)) return json({ ok: false, error: 'Subdomain must be 3-30 chars, a-z 0-9 dash only' }, 400);
    if (RESERVED.indexOf(subdomain) >= 0) return json({ ok: false, error: 'Subdomain "' + subdomain + '" is reserved' }, 400);

    const existing = await env.DB.prepare(
      'SELECT id, user_id, name, status FROM sites WHERE subdomain = ?'
    ).bind(subdomain).first();

    if (existing && existing.user_id !== session.userId) {
      return json({ ok: false, error: 'Subdomain owned by another user' }, 403);
    }

    if (existing && mode === 'prompt') {
      return json({
        ok: false,
        error: 'SITE_EXISTS',
        needs_confirmation: true,
        site: { id: existing.id, name: existing.name, subdomain: subdomain, status: existing.status }
      }, 409);
    }

    let siteId;
    if (existing) {
      siteId = existing.id;
      if (mode === 'overwrite') {
        await env.DB.prepare(
          'UPDATE sites SET html = ?, css = ?, js = ?, updated_at = datetime(\'now\') WHERE id = ?'
        ).bind(html, css, js, siteId).run();
        await env.DB.prepare('DELETE FROM files WHERE site_id = ?').bind(siteId).run();
      } else {
        const updates = [];
        const values = [];
        if (html) { updates.push('html = ?'); values.push(html); }
        if (css) { updates.push('css = ?'); values.push(css); }
        if (js) { updates.push('js = ?'); values.push(js); }
        if (updates.length) {
          updates.push("updated_at = datetime('now')");
          values.push(siteId);
          const stmt = env.DB.prepare('UPDATE sites SET ' + updates.join(', ') + ' WHERE id = ?');
          await stmt.bind.apply(stmt, values).run();
        }
      }
    } else {
      const result = await env.DB.prepare(
        'INSERT INTO sites (user_id, name, subdomain, html, css, js, status) VALUES (?, ?, ?, ?, ?, ?, \'draft\')'
      ).bind(session.userId, siteName, subdomain, html, css, js).run();
      siteId = result.meta ? result.meta.last_row_id : null;
    }

    if (shouldPublish && siteId) {
      const cur = await env.DB.prepare('SELECT status FROM sites WHERE id = ?').bind(siteId).first();
      if (cur && cur.status !== 'live') {
        await env.DB.prepare('UPDATE sites SET status = \'live\', published_at = datetime(\'now\') WHERE id = ?').bind(siteId).run();
        try {
          await env.DB.prepare(
            'INSERT INTO deployments (user_id, site_id, site_name, site_subdomain, action) VALUES (?, ?, ?, ?, ?)'
          ).bind(session.userId, siteId, siteName, subdomain, 'publish').run();
        } catch (e) {}
      }
    }

    let uploaded = 0;
    let skipped = 0;
    const maxBytes = 1.5 * 1024 * 1024;

    for (let i = 0; i < files.length; i++) {
      const f = files[i];
      if (!f.name || !f.data) { skipped++; continue; }
      let bufLen = 0;
      try {
        bufLen = Math.floor(f.data.length * 0.75);
      } catch (e) { skipped++; continue; }
      if (bufLen > maxBytes) { skipped++; continue; }

      if (mode === 'merge') {
        const ex = await env.DB.prepare('SELECT id FROM files WHERE site_id = ? AND filename = ?').bind(siteId, f.name).first();
        if (ex) {
          await env.DB.prepare('UPDATE files SET data = ?, mime_type = ?, size = ? WHERE id = ?').bind(f.data, f.mime || 'application/octet-stream', bufLen, ex.id).run();
          uploaded++;
          continue;
        }
      }
      await env.DB.prepare(
        'INSERT INTO files (site_id, filename, mime_type, size, data) VALUES (?, ?, ?, ?, ?)'
      ).bind(siteId, f.name, f.mime || 'application/octet-stream', bufLen, f.data).run();
      uploaded++;
    }

    const url = 'https://' + subdomain + '.hairiamri.buzz';
    const finalStatus = shouldPublish ? 'live' : (existing ? existing.status : 'draft');

    return json({
      ok: true,
      site: { id: siteId, name: siteName, subdomain: subdomain, status: finalStatus },
      url: url,
      files_uploaded: uploaded,
      files_skipped: skipped
    });
  } catch (err) {
    return json({ ok: false, error: err.message }, 500);
  }
}
