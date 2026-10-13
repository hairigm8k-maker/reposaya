import { getCookie, verifySession, json } from '../_utils.js';

export async function onRequestGet({ request, env }) {
  const token = getCookie(request, 'hh_session');
  const session = await verifySession(env, token);
  if (!session) return json({ ok: false, error: 'Unauthorized' }, 401);

  try {
    const filesSize = await env.DB.prepare(
      'SELECT COALESCE(SUM(f.size), 0) as total FROM files f JOIN sites s ON s.id = f.site_id WHERE s.user_id = ?'
    ).bind(session.userId).first();

    const sitesCodeSize = await env.DB.prepare(
      'SELECT COALESCE(SUM(LENGTH(html) + LENGTH(css) + LENGTH(js)), 0) as total FROM sites WHERE user_id = ?'
    ).bind(session.userId).first();

    const siteCount = await env.DB.prepare('SELECT COUNT(*) as c FROM sites WHERE user_id = ?').bind(session.userId).first();
    const fileCount = await env.DB.prepare('SELECT COUNT(*) as c FROM files f JOIN sites s ON s.id = f.site_id WHERE s.user_id = ?').bind(session.userId).first();
    const domainCount = await env.DB.prepare('SELECT COUNT(*) as c FROM custom_domains WHERE user_id = ?').bind(session.userId).first();
    const liveCount = await env.DB.prepare("SELECT COUNT(*) as c FROM sites WHERE user_id = ? AND status = 'live'").bind(session.userId).first();
    const visitorTotal = await env.DB.prepare('SELECT COUNT(*) as c FROM analytics a JOIN sites s ON s.id = a.site_id WHERE s.user_id = ?').bind(session.userId).first();

    const { results: perSite } = await env.DB.prepare(
      'SELECT s.id, s.name, s.subdomain, COALESCE((SELECT SUM(f.size) FROM files f WHERE f.site_id = s.id), 0) as files_size, LENGTH(s.html) + LENGTH(s.css) + LENGTH(s.js) as code_size FROM sites s WHERE s.user_id = ? ORDER BY files_size DESC'
    ).bind(session.userId).all();

    const fileBytes = filesSize ? filesSize.total : 0;
    const codeBytes = sitesCodeSize ? sitesCodeSize.total : 0;
    const totalBytes = fileBytes + codeBytes;

    return json({
      ok: true,
      total_bytes: totalBytes,
      files_bytes: fileBytes,
      code_bytes: codeBytes,
      sites: siteCount ? siteCount.c : 0,
      live_sites: liveCount ? liveCount.c : 0,
      files: fileCount ? fileCount.c : 0,
      domains: domainCount ? domainCount.c : 0,
      visitors: visitorTotal ? visitorTotal.c : 0,
      per_site: (perSite || []).map(function(s) {
        return {
          id: s.id,
          name: s.name,
          subdomain: s.subdomain,
          bytes: (s.files_size || 0) + (s.code_size || 0),
          files_bytes: s.files_size || 0,
          code_bytes: s.code_size || 0
        };
      })
    });
  } catch (err) {
    return json({ ok: false, error: err.message }, 500);
  }
}
