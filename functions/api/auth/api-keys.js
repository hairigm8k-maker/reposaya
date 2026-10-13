import { getCookie, verifySession, hashPassword, generateToken, json } from '../../_utils.js';

export async function onRequestGet({ request, env }) {
  const token = getCookie(request, 'hh_session');
  const session = await verifySession(env, token);
  if (!session) return json({ ok: false, error: 'Unauthorized' }, 401);

  try {
    const { results } = await env.DB.prepare(
      'SELECT id, name, key_prefix, scopes, last_used, expires_at, created_at FROM api_keys WHERE user_id = ? ORDER BY created_at DESC'
    ).bind(session.userId).all();

    return json({ ok: true, keys: results || [] });
  } catch (err) {
    return json({ ok: false, error: err.message }, 500);
  }
}

export async function onRequestPost({ request, env }) {
  const token = getCookie(request, 'hh_session');
  const session = await verifySession(env, token);
  if (!session) return json({ ok: false, error: 'Unauthorized' }, 401);

  try {
    const body = await request.json();
    const name = String(body.name || '').trim();
    const expiresIn = body.expires_in || 'never';

    if (!name) return json({ ok: false, error: 'Name required' }, 400);
    if (name.length > 60) return json({ ok: false, error: 'Name too long (max 60)' }, 400);

    const existing = await env.DB.prepare(
      'SELECT COUNT(*) as c FROM api_keys WHERE user_id = ?'
    ).bind(session.userId).first();
    if (existing && existing.c >= 10) {
      return json({ ok: false, error: 'Maximum 10 API keys per account' }, 400);
    }

    const randomPart = generateToken(24);
    const fullKey = 'hh_live_' + randomPart;
    const keyHash = await hashPassword(fullKey);
    const keyPrefix = fullKey.slice(0, 16);

    let expiresAt = null;
    if (expiresIn === '30d') expiresAt = new Date(Date.now() + 30 * 86400000).toISOString();
    else if (expiresIn === '90d') expiresAt = new Date(Date.now() + 90 * 86400000).toISOString();
    else if (expiresIn === '1y') expiresAt = new Date(Date.now() + 365 * 86400000).toISOString();

    const result = await env.DB.prepare(
      'INSERT INTO api_keys (user_id, name, key_hash, key_prefix, scopes, expires_at) VALUES (?, ?, ?, ?, ?, ?)'
    ).bind(session.userId, name, keyHash, keyPrefix, 'read,write', expiresAt).run();

    return json({
      ok: true,
      key: fullKey,
      id: result.meta ? result.meta.last_row_id : null,
      name: name,
      expires_at: expiresAt
    });
  } catch (err) {
    return json({ ok: false, error: err.message }, 500);
  }
}

export async function onRequestDelete({ request, env }) {
  const token = getCookie(request, 'hh_session');
  const session = await verifySession(env, token);
  if (!session) return json({ ok: false, error: 'Unauthorized' }, 401);

  const url = new URL(request.url);
  const id = parseInt(url.searchParams.get('id'));
  if (!id) return json({ ok: false, error: 'ID required' }, 400);

  try {
    const row = await env.DB.prepare(
      'SELECT id FROM api_keys WHERE id = ? AND user_id = ?'
    ).bind(id, session.userId).first();
    if (!row) return json({ ok: false, error: 'Key not found' }, 404);

    await env.DB.prepare('DELETE FROM api_keys WHERE id = ?').bind(id).run();
    return json({ ok: true });
  } catch (err) {
    return json({ ok: false, error: err.message }, 500);
  }
}
