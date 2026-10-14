import { requireAdmin, logAdmin } from '../../_admin.js';
import { hashPassword, generateToken, json } from '../../_utils.js';

export async function onRequestGet({ request, env }) {
  const guard = await requireAdmin(request, env);
  if (guard.error) return guard.error;
  try {
    const { results } = await env.DB.prepare(
      'SELECT t.id, t.user_id, t.token_prefix, t.label, t.expires_at, t.used_at, t.created_at, u.email, u.name FROM login_tokens t JOIN users u ON u.id = t.user_id ORDER BY t.created_at DESC LIMIT 200'
    ).all();
    return json({ ok: true, tokens: results || [] });
  } catch (err) { return json({ ok: false, error: err.message }, 500); }
}

export async function onRequestPost({ request, env }) {
  const guard = await requireAdmin(request, env);
  if (guard.error) return guard.error;
  try {
    const body = await request.json();
    const userId = parseInt(body.user_id);
    const label = (body.label || '').trim() || null;
    const expiresDays = parseInt(body.expires_days) || 7;
    if (!userId) return json({ ok: false, error: 'User required' }, 400);
    const user = await env.DB.prepare('SELECT id, email FROM users WHERE id = ?').bind(userId).first();
    if (!user) return json({ ok: false, error: 'User not found' }, 404);
    const raw = 'hh_tok_' + generateToken(20);
    const tokenHash = await hashPassword(raw);
    const tokenPrefix = raw.slice(0, 16);
    const expiresAt = new Date(Date.now() + expiresDays * 86400000).toISOString();
    const result = await env.DB.prepare(
      'INSERT INTO login_tokens (user_id, token_hash, token_prefix, label, expires_at) VALUES (?, ?, ?, ?, ?)'
    ).bind(userId, tokenHash, tokenPrefix, label, expiresAt).run();
    await logAdmin(env, guard.session.userId, 'token.create', 'user', userId, 'Label: ' + (label || '-'), request);
    return json({ ok: true, token: raw, id: result.meta ? result.meta.last_row_id : null, expires_at: expiresAt });
  } catch (err) { return json({ ok: false, error: err.message }, 500); }
}

export async function onRequestDelete({ request, env }) {
  const guard = await requireAdmin(request, env);
  if (guard.error) return guard.error;
  const url = new URL(request.url);
  const id = parseInt(url.searchParams.get('id'));
  if (!id) return json({ ok: false, error: 'ID required' }, 400);
  try {
    const t = await env.DB.prepare('SELECT user_id FROM login_tokens WHERE id = ?').bind(id).first();
    await env.DB.prepare('DELETE FROM login_tokens WHERE id = ?').bind(id).run();
    await logAdmin(env, guard.session.userId, 'token.revoke', 'user', t ? t.user_id : null, 'Token #' + id, request);
    return json({ ok: true });
  } catch (err) { return json({ ok: false, error: err.message }, 500); }
}
