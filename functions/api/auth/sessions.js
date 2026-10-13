import { getCookie, verifySession, deleteSession, json } from '../../_utils.js';

function detectDevice(ua) {
  if (!ua) return 'Unknown';
  var u = ua.toLowerCase();
  if (/ipad|tablet/.test(u)) return 'Tablet';
  if (/mobile|iphone|ipod|android/.test(u)) return 'Mobile';
  if (/windows|macintosh|linux/.test(u)) return 'Desktop';
  return 'Unknown';
}

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
  const token = getCookie(request, 'hh_session');
  const session = await verifySession(env, token);
  if (!session) return json({ ok: false, error: 'Unauthorized' }, 401);

  try {
    const { results } = await env.DB.prepare(
      'SELECT token, user_agent, ip, created_at, last_active FROM sessions WHERE user_id = ? ORDER BY last_active DESC'
    ).bind(session.userId).all();

    const sessions = (results || []).map(function(s) {
      return {
        token_prefix: s.token.slice(0, 8) + '...',
        is_current: s.token === token,
        device: detectDevice(s.user_agent),
        browser: detectBrowser(s.user_agent),
        os: detectOS(s.user_agent),
        ip: s.ip || 'Unknown',
        created_at: s.created_at,
        last_active: s.last_active || s.created_at
      };
    });

    return json({ ok: true, sessions: sessions });
  } catch (err) {
    return json({ ok: false, error: err.message }, 500);
  }
}

export async function onRequestDelete({ request, env }) {
  const token = getCookie(request, 'hh_session');
  const session = await verifySession(env, token);
  if (!session) return json({ ok: false, error: 'Unauthorized' }, 401);

  const url = new URL(request.url);
  const prefix = url.searchParams.get('prefix');
  const all = url.searchParams.get('all');

  try {
    if (all === '1') {
      await env.DB.prepare('DELETE FROM sessions WHERE user_id = ? AND token != ?').bind(session.userId, token).run();
      return json({ ok: true });
    }

    if (prefix) {
      const row = await env.DB.prepare(
        'SELECT token FROM sessions WHERE user_id = ? AND token LIKE ? AND token != ?'
      ).bind(session.userId, prefix + '%', token).first();
      if (!row) return json({ ok: false, error: 'Session not found' }, 404);
      await deleteSession(env, row.token);
      return json({ ok: true });
    }

    return json({ ok: false, error: 'Prefix or all required' }, 400);
  } catch (err) {
    return json({ ok: false, error: err.message }, 500);
  }
}
