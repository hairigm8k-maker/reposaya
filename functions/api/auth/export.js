import { getCookie, verifySession, json } from '../../_utils.js';

export async function onRequestGet({ request, env }) {
  const token = getCookie(request, 'hh_session');
  const session = await verifySession(env, token);
  if (!session) return json({ ok: false, error: 'Unauthorized' }, 401);

  try {
    const user = await env.DB.prepare(
      'SELECT id, email, name, username, bio, website, role, status, created_at FROM users WHERE id = ?'
    ).bind(session.userId).first();

    const sites = await env.DB.prepare(
      'SELECT id, name, subdomain, status, html, css, js, published_at, created_at, updated_at FROM sites WHERE user_id = ?'
    ).bind(session.userId).all();

    const filesMeta = await env.DB.prepare(
      'SELECT f.filename, f.mime_type, f.size, f.created_at, s.subdomain FROM files f JOIN sites s ON s.id = f.site_id WHERE s.user_id = ?'
    ).bind(session.userId).all();

    const domains = await env.DB.prepare(
      'SELECT domain, verified, created_at FROM custom_domains WHERE user_id = ?'
    ).bind(session.userId).all();

    const analyticsSummary = await env.DB.prepare(
      'SELECT COUNT(*) as total FROM analytics a JOIN sites s ON s.id = a.site_id WHERE s.user_id = ?'
    ).bind(session.userId).first();

    return json({
      ok: true,
      data: {
        exported_at: new Date().toISOString(),
        user: user,
        sites: sites.results || [],
        files_metadata: filesMeta.results || [],
        custom_domains: domains.results || [],
        analytics: { total_visits: analyticsSummary ? analyticsSummary.total : 0 }
      }
    });
  } catch (err) {
    return json({ ok: false, error: err.message }, 500);
  }
}
