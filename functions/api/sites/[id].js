import { getCookie, verifySession, json } from '../../../_utils/auth.js';

// GET — Site detail
export async function onRequestGet({ request, env, params }) {
  const token = getCookie(request, 'hh_session');
  const session = await verifySession(env, token);
  if (!session) return json({ ok: false, error: 'Unauthorized' }, 401);

  const siteId = parseInt(params.id);

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

// PATCH — Update site
export async function onRequestPatch({ request, env, params }) {
  const token = getCookie(request, 'hh_session');
  const session = await verifySession(env, token);
  if (!session) return json({ ok: false, error: 'Unauthorized' }, 401);

  const siteId = parseInt(params.id);

  try {
    const site = await env.DB.prepare(
      'SELECT id FROM sites WHERE id = ? AND user_id = ?'
    ).bind(siteId, session.userId).first();

    if (!site) return json({ ok: false, error: 'Site tak jumpa' }, 404);

    const body = await request.json();
    const fields = [];
    const values = [];

    if (body.name !== undefined) {
      fields.push('name = ?');
      values.push(String(body.name).trim());
    }
    if (body.html !== undefined) {
      fields.push('html = ?');
      values.push(String(body.html));
    }
    if (body.css !== undefined) {
      fields.push('css = ?');
      values.push(String(body.css));
    }
    if (body.js !== undefined) {
      fields.push('js = ?');
      values.push(String(body.js));
    }
    if (body.status !== undefined && ['draft', 'live'].includes(body.status)) {
      fields.push('status = ?');
      values.push(body.status);
      if (body.status === 'live') {
        fields.push('published_at = CURRENT_TIMESTAMP');
      }
    }

    if (fields.length === 0) {
      return json({ ok: false, error: 'Tiada perubahan' }, 400);
    }

    fields.push('updated_at = CURRENT_TIMESTAMP');
    values.push(siteId);
    values.push(session.userId);

    const sql = 'UPDATE sites SET ' + fields.join(', ') + ' WHERE id = ? AND user_id = ?';
    await env.DB.prepare(sql).bind.apply(env.DB.prepare(sql), values).run();

    return json({ ok: true });
  } catch (err) {
    return json({ ok: false, error: err.message }, 500);
  }
}

// DELETE
export async function onRequestDelete({ request, env, params }) {
  const token = getCookie(request, 'hh_session');
  const session = await verifySession(env, token);
  if (!session) return json({ ok: false, error: 'Unauthorized' }, 401);

  const siteId = parseInt(params.id);

  try {
    await env.DB.prepare(
      'DELETE FROM sites WHERE id = ? AND user_id = ?'
    ).bind(siteId, session.userId).run();

    return json({ ok: true });
  } catch (err) {
    return json({ ok: false, error: err.message }, 500);
  }
}
