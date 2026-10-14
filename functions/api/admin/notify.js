import { requireAdmin, logAdmin } from '../../_admin.js';
import { json } from '../../_utils.js';

export async function onRequestPost({ request, env }) {
  const guard = await requireAdmin(request, env);
  if (guard.error) return guard.error;
  try {
    const body = await request.json();
    const title = (body.title || '').trim();
    const htmlBody = (body.body || '').trim();
    const target = body.target || 'all';
    const userId = body.user_id ? parseInt(body.user_id) : null;
    if (!title) return json({ ok: false, error: 'Title required' }, 400);
    if (!htmlBody) return json({ ok: false, error: 'Body required' }, 400);
    if (title.length > 120) return json({ ok: false, error: 'Title too long' }, 400);
    if (htmlBody.length > 5000) return json({ ok: false, error: 'Body too long' }, 400);

    if (target === 'user' && userId) {
      await env.DB.prepare('INSERT INTO notifications (user_id, title, body, type) VALUES (?, ?, ?, ?)').bind(userId, title, htmlBody, 'info').run();
      await logAdmin(env, guard.session.userId, 'notify.user', 'user', userId, title, request);
      return json({ ok: true, sent: 1 });
    }

    const users = await env.DB.prepare('SELECT id FROM users').all();
    let sent = 0;
    for (var i = 0; i < (users.results || []).length; i++) {
      try {
        await env.DB.prepare('INSERT INTO notifications (user_id, title, body, type) VALUES (?, ?, ?, ?)').bind(users.results[i].id, title, htmlBody, 'info').run();
        sent++;
      } catch (e) {}
    }
    await logAdmin(env, guard.session.userId, 'notify.broadcast', 'all', null, title + ' (' + sent + ' users)', request);
    return json({ ok: true, sent: sent });
  } catch (err) { return json({ ok: false, error: err.message }, 500); }
}
