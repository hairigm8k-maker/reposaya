import { requireAdmin, logAdmin } from '../../_admin.js';
import { hashPassword, generateToken, json } from '../../_utils.js';
import { sendEmail, welcomeEmail, receiptEmail } from '../../_emails.js';

const PLAN_DURATIONS = {
  monthly: 1,    // 1 bulan
  pro: 5,        // 5 bulan
  bisnes: 12     // 1 tahun
};

const PLAN_PRICES = {
  monthly: 9.80,
  pro: 49,
  bisnes: 117
};

export async function onRequestGet({ request, env }) {
  const guard = await requireAdmin(request, env);
  if (guard.error) return guard.error;
  const url = new URL(request.url);
  const q = (url.searchParams.get('q') || '').trim().toLowerCase();
  try {
    let sql = 'SELECT id, email, name, username, role, status, plan, plan_expires_at, created_at FROM users WHERE role = \'user\'';
    const binds = [];
    if (q) {
      sql += ' AND (LOWER(email) LIKE ? OR LOWER(name) LIKE ? OR LOWER(username) LIKE ?)';
      const like = '%' + q + '%';
      binds.push(like, like, like);
    }
    sql += ' ORDER BY created_at DESC LIMIT 200';
    const stmt = env.DB.prepare(sql);
    const { results } = binds.length ? await stmt.bind.apply(stmt, binds).all() : await stmt.all();
    const userIds = (results || []).map(function(u){ return u.id; });
    const counts = {};
    if (userIds.length) {
      const placeholders = userIds.map(function(){ return '?'; }).join(',');
      const siteSql = 'SELECT user_id, COUNT(*) as c FROM sites WHERE user_id IN (' + placeholders + ') GROUP BY user_id';
      const siteStmt = env.DB.prepare(siteSql);
      const siteRows = await siteStmt.bind.apply(siteStmt, userIds).all();
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
    const plan = (body.plan === 'bisnes' || body.plan === 'monthly') ? body.plan : 'pro';
    if (!email || !name) return json({ ok: false, error: 'Email and name required' }, 400);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return json({ ok: false, error: 'Invalid email' }, 400);
    const existing = await env.DB.prepare('SELECT id FROM users WHERE email = ?').bind(email).first();
    if (existing) return json({ ok: false, error: 'Email already exists' }, 400);
    const tempPassword = generateToken(8);
    const hash = await hashPassword(tempPassword);
    const months = PLAN_DURATIONS[plan] || 5;
    const expiresAt = new Date(Date.now() + months * 30 * 86400000).toISOString();
    const result = await env.DB.prepare(
      'INSERT INTO users (email, name, password_hash, role, status, plan, plan_expires_at) VALUES (?, ?, ?, \'user\', \'active\', ?, ?)'
    ).bind(email, name, hash, plan, expiresAt).run();
    const newId = result.meta ? result.meta.last_row_id : null;
    await logAdmin(env, guard.session.userId, 'user.create', 'user', newId, email + ' (' + plan + ' - RM' + (PLAN_PRICES[plan] || 0) + ')', request);

    // Send Emails (Welcome + Receipt)
    try {
      // 1. Welcome Email
      await sendEmail(env, email, 'Welcome to HairiHosting', welcomeEmail(name, email, tempPassword, plan));
      
      // 2. Receipt Email
      const price = PLAN_PRICES[plan] || 0;
      const invoiceId = 'INV-' + Date.now().toString().slice(-6);
      const expiryStr = new Date(expiresAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
      await sendEmail(env, email, 'Receipt for your purchase - ' + invoiceId, receiptEmail(name, email, plan, price, invoiceId, expiryStr));
      
    } catch (e) { 
      console.error('Failed to send emails:', e); 
    }
    try { await sendEmail(env, email, 'Selamat Datang ke HairiHosting 🎉', welcomeEmail(name, email, tempPassword, plan)); } catch (e) { console.error('Welcome email failed:', e); }
    return json({ ok: true, user: { id: newId, email: email, name: name, plan: plan, plan_expires_at: expiresAt, temp_password: tempPassword } });
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
    const user = await env.DB.prepare('SELECT id, email, role, plan FROM users WHERE id = ?').bind(id).first();
    if (!user) return json({ ok: false, error: 'User not found' }, 404);
    if (user.id === guard.session.userId) return json({ ok: false, error: 'Cannot modify yourself' }, 400);

    if (body.status && (body.status === 'active' || body.status === 'suspended')) {
      await env.DB.prepare('UPDATE users SET status = ? WHERE id = ?').bind(body.status, id).run();
      if (body.status === 'suspended') await env.DB.prepare('DELETE FROM sessions WHERE user_id = ?').bind(id).run();
      await logAdmin(env, guard.session.userId, 'user.' + body.status, 'user', id, user.email, request);
      return json({ ok: true });
    }

    if (body.plan && (body.plan === 'pro' || body.plan === 'bisnes' || body.plan === 'monthly')) {
      const months = PLAN_DURATIONS[body.plan] || 5;
      const expiresAt = new Date(Date.now() + months * 30 * 86400000).toISOString();
      await env.DB.prepare('UPDATE users SET plan = ?, plan_expires_at = ? WHERE id = ?').bind(body.plan, expiresAt, id).run();
      await logAdmin(env, guard.session.userId, 'user.plan', 'user', id, user.email + ' -> ' + body.plan, request);
      return json({ ok: true });
    }

    if (body.extend && body.extend === true) {
      const months = PLAN_DURATIONS[user.plan] || 5;
      const current = user.plan_expires_at ? new Date(user.plan_expires_at).getTime() : Date.now();
      const newExpires = new Date(Math.max(current, Date.now()) + months * 30 * 86400000).toISOString();
      await env.DB.prepare('UPDATE users SET plan_expires_at = ? WHERE id = ?').bind(newExpires, id).run();
      await logAdmin(env, guard.session.userId, 'user.extend', 'user', id, user.email, request);
      return json({ ok: true, plan_expires_at: newExpires });
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
