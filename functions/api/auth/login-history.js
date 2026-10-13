import { getCookie, verifySession, json } from '../../_utils.js';

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
      'SELECT status, reason, ip, user_agent, created_at FROM login_logs WHERE user_id = ? OR email = ? ORDER BY created_at DESC LIMIT 30'
    ).bind(session.userId, session.email).all();

    const logs = (results || []).map(function(l) {
      return {
        status: l.status,
        reason: l.reason,
        ip: l.ip || 'Unknown',
        browser: detectBrowser(l.user_agent),
        os: detectOS(l.user_agent),
        created_at: l.created_at
      };
    });

    return json({ ok: true, logs: logs });
  } catch (err) {
    return json({ ok: false, error: err.message }, 500);
  }
}
