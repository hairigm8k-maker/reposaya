import { getCookie, verifySession, json } from '../../../_utils.js';

export async function onRequestGet({ request, env }) {
  try {
    const token = getCookie(request, 'hh_session');
    const session = await verifySession(env, token);
    if (!session) return json({ ok: false, error: 'Not authenticated' }, 401);

    const creds = await env.DB.prepare(
      'SELECT id, name, device_type, backed_up, created_at, last_used_at FROM webauthn_credentials WHERE user_id = ? ORDER BY created_at DESC'
    ).bind(session.userId).all();

    return json({
      ok: true,
      credentials: (creds.results || []).map(c => ({
        id: c.id,
        name: c.name || 'Biometric',
        deviceType: c.device_type,
        backedUp: c.backed_up === 1,
        createdAt: c.created_at,
        lastUsedAt: c.last_used_at
      }))
    });
  } catch (err) {
    return json({ ok: false, error: err.message }, 500);
  }
}

export async function onRequestDelete({ request, env }) {
  try {
    const token = getCookie(request, 'hh_session');
    const session = await verifySession(env, token);
    if (!session) return json({ ok: false, error: 'Not authenticated' }, 401);

    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    if (!id) return json({ ok: false, error: 'ID required' }, 400);

    await env.DB.prepare(
      'DELETE FROM webauthn_credentials WHERE id = ? AND user_id = ?'
    ).bind(id, session.userId).run();

    return json({ ok: true });
  } catch (err) {
    return json({ ok: false, error: err.message }, 500);
  }
}
