import { authenticate, json } from './_utils.js';

export async function requireAdmin(request, env) {
  const session = await authenticate(request, env);
  if (!session) {
    return { error: json({ ok: false, error: 'Unauthorized' }, 401) };
  }
  if (session.role !== 'admin' && session.role !== 'superadmin') {
    return { error: json({ ok: false, error: 'Forbidden' }, 403) };
  }
  return { session: session };
}

export async function logAdmin(env, adminId, action, targetType, targetId, details, request) {
  try {
    const ip = request ? (request.headers.get('CF-Connecting-IP') || '') : '';
    await env.DB.prepare(
      'INSERT INTO admin_logs (admin_id, action, target_type, target_id, details, ip) VALUES (?, ?, ?, ?, ?, ?)'
    ).bind(adminId, action, targetType || null, targetId || null, details || null, ip).run();
  } catch (e) {}
}
