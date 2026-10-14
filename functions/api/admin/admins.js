import { requireAdmin, logAdmin } from '../../_admin.js';
import { hashPassword, generateToken, json } from '../../_utils.js';

export async function onRequestGet({ request, env }) {
  const guard = await requireAdmin(request, env);
  if (guard.error) return guard.error;
  try {
    const { results } = await env.DB.prepare(
      'SELECT id, email, name, role, status, created_at FROM users WHERE role = \'admin\' OR role = \'superadmin\' ORDER BY created_at DESC'
    ).all();
    return json({ ok: true, admins: results || [] });
  } catch (err) { return json({ ok: false, error: err.message }, 500); }
}

export async function onRequestPost({ request, env }) {
  const guard = await requireAdmin(request, env);
  if (guard.error) return guard.error;
  try {
    const body = await request.json();
    const email = (body.email || '').trim().toLowerCase();
    const name = (body.name || '').trim();
    if (!email || !name) return json({ ok: false, error: 'Email and name required' }, 400);
    const existing = await env.DB.prepare('SELECT id, role FROM users WHERE email = ?').bind(email).first();
    if (existing) {
      if (existing.role === 'admin' || existing.role === 'superadmin') return json({ ok: false, error: 'Already admin' }, 400);
      await env.DB.prepare('UPDATE users SET role = \'admin\' WHERE id = ?').bind(existing.id).run();
      await logAdmin(env, guard.session.userId, 'admin.promote', 'user', existing.id, email, request);
      return json({ ok: true, promoted: true, user_id: existing.id });
    }
    const tempPassword = generateToken(8);
    const hash = await hashPassword(tempPassword);
    const result = await env.DB.prepare(
      'INSERT INTO users (email, name, password_hash, role, status) VALUES (?, ?, ?, \'admin\', \'active\')'
    ).bind(email, name, hash).run();
    const newId = result.meta ? result.meta.last_row_id : null;
    await logAdmin(env, guard.session.userId, 'admin.create', 'user', newId, email, request);
    return json({ ok: true, admin: { id: newId, email: email, name: name, temp_password: tempPassword } });
  } catch (err) { return json({ ok: false, error: err.message }, 500); }
}

export async function onRequestDelete({ request, env }) {
  const guard = await requireAdmin(request, env);
  if (guard.error) return guard.error;
  const url = new URL(request.url);
  const id = parseInt(url.searchParams.get('id'));
  if (!id) return json({ ok: false, error: 'ID required' }, 400);
  if (id === guard.session.userId) return json({ ok: false, error: 'Cannot remove yourself' }, 400);
  try {
    const user = await env.DB.prepare('SELECT email, role FROM users WHERE id = ?').bind(id).first();
    if (!user) return json({ ok: false, error: 'Not found' }, 404);
    if (user.role !== 'admin' && user.role !== 'superadmin') return json({ ok: false, error: 'Not an admin' }, 400);
    await env.DB.prepare('UPDATE users SET role = \'user\' WHERE id = ?').bind(id).run();
    await env.DB.prepare('DELETE FROM sessions WHERE user_id = ?').bind(id).run();
    await logAdmin(env, guard.session.userId, 'admin.demote', 'user', id, user.email, request);
    return json({ ok: true });
  } catch (err) { return json({ ok: false, error: err.message }, 500); }
}
