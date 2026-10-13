import { getCookie, verifySession, json } from '../_utils.js';

function detectDevice(ua) {
  if (!ua) return 'Unknown';
  var u = ua.toLowerCase();
  if (/ipad|tablet|playbook|silk/.test(u) || (/android/.test(u) && !/mobile/.test(u))) return 'Tablet';
  if (/mobile|iphone|ipod|android|blackberry|opera mini|iemobile/.test(u)) return 'Mobile';
  if (/windows|macintosh|linux|x11/.test(u)) return 'Desktop';
  return 'Unknown';
}

function detectBrowser(ua) {
  if (!ua) return 'Unknown';
  if (/edg\//i.test(ua)) return 'Edge';
  if (/opr\//i.test(ua) || /opera/i.test(ua)) return 'Opera';
  if (/chrome\//i.test(ua) && !/edg|opr/i.test(ua)) return 'Chrome';
  if (/firefox\//i.test(ua)) return 'Firefox';
  if (/safari\//i.test(ua) && !/chrome/i.test(ua)) return 'Safari';
  return 'Other';
}

function detectOS(ua) {
  if (!ua) return 'Unknown';
  if (/android/i.test(ua)) return 'Android';
  if (/iphone|ipad|ipod/i.test(ua)) return 'iOS';
  if (/windows/i.test(ua)) return 'Windows';
  if (/mac os x|macintosh/i.test(ua)) return 'macOS';
  if (/linux/i.test(ua)) return 'Linux';
  return 'Other';
}

export async function onRequestGet({ request, env }) {
  const token = getCookie(request, 'hh_session');
  const session = await verifySession(env, token);
  if (!session) return json({ ok: false, error: 'Unauthorized' }, 401);

  try {
    const { results } = await env.DB.prepare(
      'SELECT a.user_agent FROM analytics a JOIN sites s ON s.id = a.site_id WHERE s.user_id = ?'
    ).bind(session.userId).all();

    const rows = results || [];
    const total = rows.length;

    const devCount = {}, browCount = {}, osCount = {};
    rows.forEach(function(r) {
      var d = detectDevice(r.user_agent);
      var b = detectBrowser(r.user_agent);
      var o = detectOS(r.user_agent);
      devCount[d] = (devCount[d] || 0) + 1;
      browCount[b] = (browCount[b] || 0) + 1;
      osCount[o] = (osCount[o] || 0) + 1;
    });

    function toArr(obj) {
      var arr = Object.keys(obj).map(function(k) {
        return { name: k, count: obj[k], pct: total ? Math.round(obj[k] / total * 100) : 0 };
      });
      arr.sort(function(a, b) { return b.count - a.count; });
      return arr;
    }

    return json({
      ok: true,
      total: total,
      devices: toArr(devCount),
      browsers: toArr(browCount),
      os: toArr(osCount)
    });
  } catch (err) {
    return json({ ok: false, error: err.message }, 500);
  }
}
