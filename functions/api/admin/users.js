import { requireAdmin, logAdmin } from '../../_admin.js';
import { hashPassword, generateToken, json } from '../../_utils.js';

export async function onRequestGet({ request, env }) {
  const guard = await requireAdmin(request, env);
  if (guard.error) return guard.error;
  const url = new URL(request.url);
  const q = (url.searchParams.get('q') || '').trim().toLowerCase();
  try {
    let sql = 'SELECT id, email, name, username, role, status, avatar_url, created_at FROM users';
    const binds = [];
    if (q) {
      sql += ' WHERE LOWER(email) LIKE ? OR LOWER(name) LIKE ? OR LOWER(username) LIKE ?';
      const like = '%' + q + '%';
      binds.push(like, like, like);
    }
    sql += ' ORDER BY created_at DESC LIMIT 200';
    const stmt = env.DB.prepare(sql);
    const { results } = binds.length ? await stmt.bind.apply(stmt, binds).all() : await stmt.all();
    const userIds = (results || []).map(function(u){ return u.id; });
    const counts = {};
    if (userIds.length) {
      const siteRows = await env.DB.prepare(
        'SELECT user_id, COUNT(*) as c FROM sites WHERE user_id IN (' + userIds.map(function(){ return '?'; }).join(',') + ') GROUP BY user_id'
      ).bind.apply(env.DB.prepare('SELECT user_id, COUNT(*) as c FROM sites WHERE user_id IN (' + userIds.map(function(){ return '?'; }).join(',') + ') GROUP BY user_id'), userIds).all();
      (siteRows.results || []).forEach(function(r){ counts[r.user_id] = r.c; });
    }
    return json({ ok: true, users: (results || []).map(function(u){ return Object.assign({}, u, { site_count: counts[u.id] || 0 }); }) });
  } catch (err) { return json({ ok: false, error: err.message }, 500); }
}

export async function onRequestPost({ request, env }) {
  const guard = await requireAdmin(request, env);
  if (guard.error) return guard.error;
  try {
    const body = await request.json();
    const email = (body.email || '').trim().toLowerCase();
    const name = (body.name || '').trim();
    const role = body.role === 'admin' ? 'admin' : 'user';
    if (!email || !name) return json({ ok: false, error: 'Email and name required' }, 400);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return json({ ok: false, error: 'Invalid email' }, 400);
    const existing = await env.DB.prepare('SELECT id FROM users WHERE email = ?').bind(email).first();
    if (existing) return json({ ok: false, error: 'Email already exists' }, 400);
    const tempPassword = generateToken(8);
    const hash = await hashPassword(tempPassword);
    const result = await env.DB.prepare(
      'INSERT INTO users (email, name, password_hash, role, status) VALUES (?, ?, ?, ?, \'active\')'
    ).bind(email, name, hash, role).run();
    const newId = result.meta ? result.meta.last_row_id : null;
    await logAdmin(env, guard.session.userId, 'user.create', 'user', newId, 'Created ' + email, request);
    return json({ ok: true, user: { id: newId, email: email, name: name, role: role, temp_password: tempPassword } });
  } catch (err) { return json({ ok: false, error: err.message }, 500); }
}

export async function onRequestPatch({ request, env }) {
  const guard = await requireAdmin(request, env);
  if (guard.error) return guard.error;
  const url = new URL(request.url);
  const id = parseInt(url.searchParams.get('id'));
  if (!id) return json({ ok: false, error: 'ID required' }, 400);
  try {
    const body = await request.json();
    const user = await env.DB.prepare('SELECT id, email, role FROM users WHERE id = ?').bind(id).first();
    if (!user) return json({ ok: false, error: 'User not found' }, 404);
    if (user.id === guard.session.userId) return json({ ok: false, error: 'Cannot modify yourself' }, 400);
    if (body.status && (body.status === 'active' || body.status === 'suspended')) {
      await env.DB.prepare('UPDATE users SET status = ? WHERE id = ?').bind(body.status, id).run();
      if (body.status === 'suspended') await env.DB.prepare('DELETE FROM sessions WHERE user_id = ?').bind(id).run();
      await logAdmin(env, guard.session.userId, 'user.' + body.status, 'user', id, user.email, request);
      return json({ ok: true });
    }
    if (body.role && (body.role === 'user' || body.role === 'admin')) {
      await env.DB.prepare('UPDATE users SET role = ? WHERE id = ?').bind(body.role, id).run();
      await logAdmin(env, guard.session.userId, 'user.role', 'user', id, user.email + ' -> ' + body.role, request);
      return json({ ok: true });
    }
    return json({ ok: false, error: 'Nothing to update' }, 400);
  } catch (err) { return json({ ok: false, error: err.message }, 500); }
}

export async function onRequestDelete({ request, env }) {
  const guard = await requireAdmin(request, env);
  if (guard.error) return guard.error;
  const url = new URL(request.url);
  const id = parseInt(url.searchParams.get('id'));
  if (!id) return json({ ok: false, error: 'ID required' }, 400);
  if (id === guard.session.userId) return json({ ok: false, error: 'Cannot delete yourself' }, 400);
  try {
    const user = await env.DB.prepare('SELECT email FROM users WHERE id = ?').bind(id).first();
    if (!user) return json({ ok: false, error: 'User not found' }, 404);
    await env.DB.prepare('DELETE FROM files WHERE site_id IN (SELECT id FROM sites WHERE user_id = ?)').bind(id).run();
    await env.DB.prepare('DELETE FROM analytics WHERE site_id IN (SELECT id FROM sites WHERE user_id = ?)').bind(id).run();
    await env.DB.prepare('DELETE FROM custom_domains WHERE user_id = ?').bind(id).run();
    await env.DB.prepare('DELETE FROM sites WHERE user_id = ?').bind(id).run();
    await env.DB.prepare('DELETE FROM sessions WHERE user_id = ?').bind(id).run();
    await env.DB.prepare('DELETE FROM notifications WHERE user_id = ?').bind(id).run();
    await env.DB.prepare('DELETE FROM login_tokens WHERE user_id = ?').bind(id).run();
    await env.DB.prepare('DELETE FROM login_logs WHERE user_id = ?').bind(id).run();
    await env.DB.prepare('DELETE FROM users WHERE id = ?').bind(id).run();
    await logAdmin(env, guard.session.userId, 'user.delete', 'user', id, user.email, request);
    return json({ ok: true });
  } catch (err) { return json({ ok: false, error: err.message }, 500); }
}
