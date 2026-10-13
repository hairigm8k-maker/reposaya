import { authenticate, json } from '../_utils.js';

function detectBrowser(ua) {
  if (!ua) return 'Unknown';
  if (/edg\//i.test(ua)) return 'Edge';
  if (/opr\//i.test(ua)) return 'Opera';
  if (/chrome\//i.test(ua)) return 'Chrome';
  if (/firefox\//i.test(ua)) return 'Firefox';
  if (/safari\//i.test(ua)) return 'Safari';
  return 'Unknown';
}

function detectOS(ua) {
  if (!ua) return 'Unknown';
  if (/android/i.test(ua)) return 'Android';
  if (/iphone|ipad|ipod/i.test(ua)) return 'iOS';
  if (/windows/i.test(ua)) return 'Windows';
  if (/mac os x/i.test(ua)) return 'macOS';
  if (/linux/i.test(ua)) return 'Linux';
  return 'Unknown';
}

export async function onRequestGet({ request, env }) {
  const session = await authenticate(request, env);
  if (!session) return json({ ok: false, error: 'Unauthorized' }, 401);

  const url = new URL(request.url);
  const limit = Math.min(parseInt(url.searchParams.get('limit')) || 50, 200);

  try {
    const publishes = await env.DB.prepare(
      'SELECT site_name, site_subdomain, action, site_deleted, created_at FROM deployments WHERE user_id = ? ORDER BY created_at DESC LIMIT ?'
    ).bind(session.userId, limit).all();

    const logins = await env.DB.prepare(
      'SELECT ip, user_agent, created_at FROM login_logs WHERE user_id = ? AND status = \'success\' ORDER BY created_at DESC LIMIT ?'
    ).bind(session.userId, limit).all();

    const createdSites = await env.DB.prepare(
      'SELECT name, subdomain, created_at FROM sites WHERE user_id = ? ORDER BY created_at DESC LIMIT ?'
    ).bind(session.userId, limit).all();

    const uploads = await env.DB.prepare(
      'SELECT f.filename, f.mime_type, f.created_at, s.subdomain FROM files f JOIN sites s ON s.id = f.site_id WHERE s.user_id = ? ORDER BY f.created_at DESC LIMIT ?'
    ).bind(session.userId, limit).all();

    const events = [];

    (publishes.results || []).forEach(function(d) {
      events.push({
        type: 'publish',
        title: 'Published site "' + d.site_name + '"',
        subtitle: d.site_subdomain + '.hairiamri.buzz',
        meta: d.site_deleted ? 'Site deleted' : null,
        created_at: d.created_at
      });
    });

    (logins.results || []).forEach(function(l) {
      events.push({
        type: 'login',
        title: 'Signed in',
        subtitle: detectBrowser(l.user_agent) + ' on ' + detectOS(l.user_agent),
        meta: l.ip || null,
        created_at: l.created_at
      });
    });

    (createdSites.results || []).forEach(function(s) {
      events.push({
        type: 'site_created',
        title: 'Created site "' + s.name + '"',
        subtitle: s.subdomain + '.hairiamri.buzz',
        meta: null,
        created_at: s.created_at
      });
    });

    (uploads.results || []).forEach(function(f) {
      events.push({
        type: 'upload',
        title: 'Uploaded ' + f.filename,
        subtitle: f.subdomain + '.hairiamri.buzz',
        meta: f.mime_type || null,
        created_at: f.created_at
      });
    });

    events.sort(function(a, b) {
      var ta = new Date(String(a.created_at).replace(' ', 'T') + 'Z').getTime();
      var tb = new Date(String(b.created_at).replace(' ', 'T') + 'Z').getTime();
      return tb - ta;
    });

    return json({ ok: true, events: events.slice(0, limit) });
  } catch (err) {
    return json({ ok: false, error: err.message }, 500);
  }
}
