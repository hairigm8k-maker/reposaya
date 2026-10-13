import { getCookie, verifySession, json } from '../_utils.js';

export async function onRequestGet({ request, env }) {
  const token = getCookie(request, 'hh_session');
  const session = await verifySession(env, token);
  if (!session) return json({ ok: false, error: 'Unauthorized' }, 401);

  const url = new URL(request.url);
  const siteIdParam = url.searchParams.get('site');

  try {
    if (siteIdParam) {
      const siteId = parseInt(siteIdParam);
      if (!siteId) return json({ ok: false, error: 'Site ID diperlukan' }, 400);
      const site = await env.DB.prepare(
        'SELECT id, subdomain, name FROM sites WHERE id = ? AND user_id = ?'
      ).bind(siteId, session.userId).first();
      if (!site) return json({ ok: false, error: 'Site tak jumpa' }, 404);

      const { results } = await env.DB.prepare(
        'SELECT id, filename, mime_type, size, created_at FROM files WHERE site_id = ? ORDER BY created_at DESC'
      ).bind(site.id).all();

      const baseUrl = 'https://' + site.subdomain + '.hairiamri.buzz/';
      const files = (results || []).map(function(f) {
        return {
          id: f.id, filename: f.filename, mime_type: f.mime_type,
          size: f.size, created_at: f.created_at,
          site_id: site.id, site_name: site.name, subdomain: site.subdomain,
          url: baseUrl + f.filename
        };
      });
      return json({ ok: true, files: files });
    }

    const { results } = await env.DB.prepare(
      'SELECT f.id, f.filename, f.mime_type, f.size, f.created_at, s.id as site_id, s.name as site_name, s.subdomain FROM files f JOIN sites s ON s.id = f.site_id WHERE s.user_id = ? ORDER BY f.created_at DESC'
    ).bind(session.userId).all();

    const files = (results || []).map(function(f) {
      return {
        id: f.id, filename: f.filename, mime_type: f.mime_type,
        size: f.size, created_at: f.created_at,
        site_id: f.site_id, site_name: f.site_name, subdomain: f.subdomain,
        url: 'https://' + f.subdomain + '.hairiamri.buzz/' + f.filename
      };
    });
    return json({ ok: true, files: files });
  } catch (err) {
    return json({ ok: false, error: err.message }, 500);
  }
}

export async function onRequestDelete({ request, env }) {
  const token = getCookie(request, 'hh_session');
  const session = await verifySession(env, token);
  if (!session) return json({ ok: false, error: 'Unauthorized' }, 401);

  const url = new URL(request.url);
  const fileId = parseInt(url.searchParams.get('id'));
  if (!fileId) return json({ ok: false, error: 'File ID diperlukan' }, 400);

  try {
    const file = await env.DB.prepare(
      'SELECT f.id FROM files f JOIN sites s ON s.id = f.site_id WHERE f.id = ? AND s.user_id = ?'
    ).bind(fileId, session.userId).first();
    if (!file) return json({ ok: false, error: 'File tak jumpa' }, 404);

    await env.DB.prepare('DELETE FROM files WHERE id = ?').bind(fileId).run();
    return json({ ok: true });
  } catch (err) {
    return json({ ok: false, error: err.message }, 500);
  }
}
