import { getCookie, verifySession, json } from '../_utils.js';

export async function onRequestGet({ request, env }) {
  const token = getCookie(request, 'hh_session');
  const session = await verifySession(env, token);
  if (!session) return json({ ok: false, error: 'Unauthorized' }, 401);

  try {
    const total = await env.DB.prepare(
      'SELECT COUNT(*) as c FROM analytics a JOIN sites s ON s.id = a.site_id WHERE s.user_id = ?'
    ).bind(session.userId).first();

    const last7 = await env.DB.prepare(
      "SELECT COUNT(*) as c FROM analytics a JOIN sites s ON s.id = a.site_id WHERE s.user_id = ? AND a.created_at >= datetime('now', '-7 days')"
    ).bind(session.userId).first();

    const month = await env.DB.prepare(
      "SELECT COUNT(*) as c FROM analytics a JOIN sites s ON s.id = a.site_id WHERE s.user_id = ? AND a.created_at >= datetime('now', 'start of month')"
    ).bind(session.userId).first();

    const liveSites = await env.DB.prepare(
      "SELECT COUNT(*) as c FROM sites WHERE user_id = ? AND status = 'live'"
    ).bind(session.userId).first();

    const daily = await env.DB.prepare(
      "SELECT date(a.created_at) as date, COUNT(*) as count FROM analytics a JOIN sites s ON s.id = a.site_id WHERE s.user_id = ? AND a.created_at >= datetime('now', '-30 days') GROUP BY date(a.created_at) ORDER BY date ASC"
    ).bind(session.userId).all();

    const topSites = await env.DB.prepare(
      "SELECT s.name, s.subdomain, COUNT(*) as count FROM analytics a JOIN sites s ON s.id = a.site_id WHERE s.user_id = ? GROUP BY s.id ORDER BY count DESC LIMIT 5"
    ).bind(session.userId).all();

    const recent = await env.DB.prepare(
      "SELECT a.subdomain, a.path, a.country, a.created_at FROM analytics a JOIN sites s ON s.id = a.site_id WHERE s.user_id = ? ORDER BY a.created_at DESC LIMIT 10"
    ).bind(session.userId).all();

    return json({
      ok: true,
      total: total ? total.c : 0,
      last7: last7 ? last7.c : 0,
      month: month ? month.c : 0,
      liveSites: liveSites ? liveSites.c : 0,
      daily: daily.results || [],
      topSites: topSites.results || [],
      recent: recent.results || []
    });
  } catch (err) {
    return json({ ok: false, error: err.message }, 500);
  }
}
