import { requireAdmin } from '../../_admin.js';
import { json } from '../../_utils.js';

export async function onRequestGet({ request, env }) {
  const guard = await requireAdmin(request, env);
  if (guard.error) return guard.error;
  try {
    const users = await env.DB.prepare('SELECT COUNT(*) as c FROM users').first();
    const activeUsers = await env.DB.prepare("SELECT COUNT(*) as c FROM users WHERE status = 'active'").first();
    const sites = await env.DB.prepare('SELECT COUNT(*) as c FROM sites').first();
    const liveSites = await env.DB.prepare("SELECT COUNT(*) as c FROM sites WHERE status = 'live'").first();
    const files = await env.DB.prepare('SELECT COUNT(*) as c, COALESCE(SUM(size), 0) as bytes FROM files').first();
    const visitors = await env.DB.prepare('SELECT COUNT(*) as c FROM analytics').first();
    const tokens = await env.DB.prepare('SELECT COUNT(*) as c FROM login_tokens WHERE used_at IS NULL AND expires_at > datetime(\'now\')').first();
    const recentUsers = await env.DB.prepare('SELECT id, email, name, role, status, created_at FROM users ORDER BY created_at DESC LIMIT 5').all();
    const recentSites = await env.DB.prepare('SELECT s.id, s.name, s.subdomain, s.status, s.created_at, u.email as owner_email FROM sites s JOIN users u ON u.id = s.user_id ORDER BY s.created_at DESC LIMIT 5').all();
    return json({
      ok: true,
      stats: {
        users: users ? users.c : 0,
        active_users: activeUsers ? activeUsers.c : 0,
        sites: sites ? sites.c : 0,
        live_sites: liveSites ? liveSites.c : 0,
        files: files ? files.c : 0,
        storage_bytes: files ? files.bytes : 0,
        visitors: visitors ? visitors.c : 0,
        active_tokens: tokens ? tokens.c : 0
      },
      recent_users: recentUsers.results || [],
      recent_sites: recentSites.results || []
    });
  } catch (err) {
    return json({ ok: false, error: err.message }, 500);
  }
}
