// ═══════════════════════════════════════════
// AUTH UTILS — Single file at root
// ═══════════════════════════════════════════

export async function hashPassword(password) {
  const enc = new TextEncoder();
  const data = enc.encode(password);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function verifyPassword(password, hash) {
  const computed = await hashPassword(password);
  return computed === hash;
}

export function generateToken(len) {
  len = len || 32;
  const bytes = new Uint8Array(len);
  crypto.getRandomValues(bytes);
  return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function createSession(env, userId) {
  const token = generateToken(32);
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
  await env.DB.prepare('INSERT INTO sessions (token, user_id, expires_at) VALUES (?, ?, ?)').bind(token, userId, expiresAt).run();
  return { token, expiresAt };
}

export async function verifySession(env, token) {
  if (!token) return null;
  const row = await env.DB.prepare(
    'SELECT s.token, s.user_id, s.expires_at, u.email, u.name, u.role, u.status FROM sessions s JOIN users u ON u.id = s.user_id WHERE s.token = ? AND s.expires_at > datetime(\'now\')'
  ).bind(token).first();
  if (!row || row.status !== 'active') return null;
  return { userId: row.user_id, email: row.email, name: row.name, role: row.role };
}

export async function deleteSession(env, token) {
  if (!token) return;
  await env.DB.prepare('DELETE FROM sessions WHERE token = ?').bind(token).run();
}

export function getCookie(request, name) {
  const header = request.headers.get('Cookie') || '';
  const parts = header.split(';');
  for (let i = 0; i < parts.length; i++) {
    const c = parts[i].trim();
    if (c.indexOf(name + '=') === 0) {
      return c.substring(name.length + 1);
    }
  }
  return null;
}

export function buildCookie(name, value) {
  return name + '=' + value + '; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=604800';
}

export function clearCookie(name) {
  return name + '=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0';
}

export function json(data, status, extra) {
  status = status || 200;
  extra = extra || {};
  const headers = Object.assign({ 'Content-Type': 'application/json' }, extra);
  return new Response(JSON.stringify(data), { status: status, headers: headers });
}
