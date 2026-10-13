import { getCookie, verifySession, json } from '../_utils.js';

export async function onRequestGet({ request, env }) {
  const token = getCookie(request, 'hh_session');
  const session = await verifySession(env, token);
  if (!session) return json({ ok: false, error: 'Unauthorized' }, 401);

  const url = new URL(request.url);
  const countOnly = url.searchParams.get('count');
  const unreadOnly = url.searchParams.get('unread') === '1';
  const limit = Math.min(parseInt(url.searchParams.get('limit')) || 20, 100);

  try {
    if (countOnly) {
      const r = await env.DB.prepare(
        'SELECT COUNT(*) as c FROM notifications WHERE (user_id IS NULL OR user_id = ?) AND is_read = 0'
      ).bind(session.userId).first();
      return json({ ok: true, unread: r ? r.c : 0 });
    }

    let sql = 'SELECT id, title, body, type, is_read, created_at FROM notifications WHERE (user_id IS NULL OR user_id = ?)';
    if (unreadOnly) sql += ' AND is_read = 0';
    sql += ' ORDER BY created_at DESC LIMIT ?';

    const { results } = await env.DB.prepare(sql).bind(session.userId, limit).all();
    const notifs = (results || []).map(function(n) {
      return { id: n.id, title: n.title, body: n.body, type: n.type, is_read: n.is_read, created_at: n.created_at };
    });
    return json({ ok: true, notifications: notifs });
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
    const action = body.action;

    if (action === 'read') {
      const id = parseInt(body.id);
      if (!id) return json({ ok: false, error: 'ID required' }, 400);
      await env.DB.prepare(
        'UPDATE notifications SET is_read = 1 WHERE id = ? AND (user_id IS NULL OR user_id = ?)'
      ).bind(id, session.userId).run();
      return json({ ok: true });
    }

    if (action === 'read-all') {
      await env.DB.prepare(
        'UPDATE notifications SET is_read = 1 WHERE is_read = 0 AND (user_id IS NULL OR user_id = ?)'
      ).bind(session.userId).run();
      return json({ ok: true });
    }

    return json({ ok: false, error: 'Unknown action' }, 400);
  } catch (err) {
    return json({ ok: false, error: err.message }, 500);
  }
}
