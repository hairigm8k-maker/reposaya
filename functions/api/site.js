import { getCookie, verifySession, json } from '../../_utils/auth.js';

// ═══════════════════════════════════════════
// GET /api/site?id=2
// ═══════════════════════════════════════════
export async function onRequestGet({ request, env }) {
  const token = getCookie(request, 'hh_session');
  const session = await verifySession(env, token);
  if (!session) return json({ ok: false, error: 'Unauthorized' }, 401);

  const url = new URL(request.url);
  const siteId = parseInt(url.searchParams.get('id'));

  if (!siteId) return json({ ok: false, error: 'ID required' }, 400);

  try {
    const site = await env.DB.prepare(
      'SELECT * FROM sites WHERE id = ? AND user_id = ?'
    ).bind(siteId, session.userId).first();

    if (!site) return json({ ok: false, error: 'Site tak jumpa' }, 404);
    return json({ ok: true, site });
  } catch (err) {
    return json({ ok: false, error: err.message }, 500);
  }
}

// ═══════════════════════════════════════════
// PATCH /api/site?id=2
// ═══════════════════════════════════════════
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

    if (body.name !== undefined) {
      sets.push('name = ?');
      vals.push(String(body.name).trim());
    }
    if (body.html !== undefined) {
      sets.push('html = ?');
      vals.push(String(body.html));
    }
    if (body.css !== undefined) {
      sets.push('css = ?');
      vals.push(String(body.css));
    }
    if (body.js !== undefined) {
      sets.push('js = ?');
      vals.push(String(body.js));
    }
    if (body.status !== undefined && ['draft', 'live'].includes(body.status)) {
      sets.push('status = ?');
      vals.push(body.status);
      if (body.status === 'live') {
        sets.push('published_at = CURRENT_TIMESTAMP');
      }
    }

    if (sets.length === 0) return json({ ok: false, error: 'Tiada perubahan' }, 400);

    sets.push('updated_at = CURRENT_TIMESTAMP');
    vals.push(siteId);
    vals.push(session.userId);

    const sql = 'UPDATE sites SET ' + sets.join(', ') + ' WHERE id = ? AND user_id = ?';

    // Bind dynamic values
    let stmt = env.DB.prepare(sql);
    for (let i = 0; i < vals.length; i++) {
      stmt = stmt.bind(vals[i]);
    }
    await stmt.run();

    return json({ ok: true });
  } catch (err) {
    return json({ ok: false, error: err.message }, 500);
  }
}

// ═══════════════════════════════════════════
// DELETE /api/site?id=2
// ═══════════════════════════════════════════
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
