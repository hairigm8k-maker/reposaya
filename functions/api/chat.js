import { getCookie, verifySession, json } from '../_utils.js';

export async function onRequestGet({ request, env }) {
  const token = getCookie(request, 'hh_session');
  const session = await verifySession(env, token);
  if (!session) return json({ ok: false, error: 'Unauthorized' }, 401);

  try {
    const user = await env.DB.prepare('SELECT chat_joined_at FROM users WHERE id = ?').bind(session.userId).first();
    let joinedAt = user ? user.chat_joined_at : null;

    // First time join — set to now
    if (!joinedAt) {
      await env.DB.prepare('UPDATE users SET chat_joined_at = datetime(\'now\') WHERE id = ?').bind(session.userId).run();
      return json({ ok: true, messages: [], joined_at: new Date().toISOString(), just_joined: true });
    }

    const { results } = await env.DB.prepare(
      'SELECT cm.id, cm.user_id, cm.message, cm.image_data, cm.image_mime, cm.created_at, u.name, u.username, u.avatar_url FROM chat_messages cm JOIN users u ON u.id = cm.user_id WHERE cm.created_at >= ? ORDER BY cm.created_at DESC LIMIT 80'
    ).bind(joinedAt).all();

    return json({ ok: true, messages: (results || []).reverse(), joined_at: joinedAt });
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
    const message = (body.message || '').trim();
    const imageData = body.image_data || null;
    const imageMime = body.image_mime || null;

    if (!message && !imageData) return json({ ok: false, error: 'Message or image required' }, 400);
    if (message.length > 500) return json({ ok: false, error: 'Message too long (max 500)' }, 400);
    if (imageData && imageData.length > 800000) return json({ ok: false, error: 'Image too large (max ~600KB)' }, 400);

    // Rate limit: 1 msg per 1.5 sec
    const last = await env.DB.prepare(
      'SELECT created_at FROM chat_messages WHERE user_id = ? ORDER BY created_at DESC LIMIT 1'
    ).bind(session.userId).first();
    if (last) {
      const t = new Date(String(last.created_at).replace(' ', 'T') + 'Z').getTime();
      if (Date.now() - t < 1500) return json({ ok: false, error: 'Slow down — wait a moment' }, 429);
    }

    // Ensure user has joined
    const u = await env.DB.prepare('SELECT chat_joined_at FROM users WHERE id = ?').bind(session.userId).first();
    if (u && !u.chat_joined_at) {
      await env.DB.prepare('UPDATE users SET chat_joined_at = datetime(\'now\') WHERE id = ?').bind(session.userId).run();
    }

    const result = await env.DB.prepare(
      'INSERT INTO chat_messages (user_id, message, image_data, image_mime) VALUES (?, ?, ?, ?)'
    ).bind(session.userId, message || null, imageData, imageMime).run();

    return json({ ok: true, id: result.meta ? result.meta.last_row_id : null });
  } catch (err) {
    return json({ ok: false, error: err.message }, 500);
  }
}
