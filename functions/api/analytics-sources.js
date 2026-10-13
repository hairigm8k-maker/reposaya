import { getCookie, verifySession, json } from '../_utils.js';

export async function onRequestGet({ request, env }) {
  const token = getCookie(request, 'hh_session');
  const session = await verifySession(env, token);
  if (!session) return json({ ok: false, error: 'Unauthorized' }, 401);

  try {
    const totalRow = await env.DB.prepare(
      'SELECT COUNT(*) as c FROM analytics a JOIN sites s ON s.id = a.site_id WHERE s.user_id = ?'
    ).bind(session.userId).first();
    const total = totalRow ? totalRow.c : 0;

    const { results: refs } = await env.DB.prepare(
      "SELECT CASE WHEN referrer IS NULL OR referrer = '' THEN 'direct' ELSE referrer END as src, COUNT(*) as count FROM analytics a JOIN sites s ON s.id = a.site_id WHERE s.user_id = ? GROUP BY src ORDER BY count DESC LIMIT 10"
    ).bind(session.userId).all();

    const { results: countries } = await env.DB.prepare(
      "SELECT COALESCE(NULLIF(country,''), 'Unknown') as country, COUNT(*) as count FROM analytics a JOIN sites s ON s.id = a.site_id WHERE s.user_id = ? GROUP BY country ORDER BY count DESC LIMIT 10"
    ).bind(session.userId).all();

    const { results: paths } = await env.DB.prepare(
      "SELECT COALESCE(NULLIF(path,''), '/') as path, COUNT(*) as count FROM analytics a JOIN sites s ON s.id = a.site_id WHERE s.user_id = ? GROUP BY path ORDER BY count DESC LIMIT 10"
    ).bind(session.userId).all();

    function cleanRef(r) {
      if (!r || r === 'direct') return 'Direct';
      try {
        var u = new URL(r);
        return u.hostname.replace(/^www\./, '');
      } catch (e) {
        return String(r).slice(0, 40);
      }
    }

    return json({
      ok: true,
      total: total,
      referrers: (refs || []).map(function(r) { return { source: cleanRef(r.src), count: r.count, pct: total ? Math.round(r.count / total * 100) : 0 }; }),
      countries: (countries || []).map(function(c) { return { country: c.country, count: c.count, pct: total ? Math.round(c.count / total * 100) : 0 }; }),
      paths: (paths || []).map(function(p) { return { path: p.path, count: p.count, pct: total ? Math.round(p.count / total * 100) : 0 }; })
    });
  } catch (err) {
    return json({ ok: false, error: err.message }, 500);
  }
}
