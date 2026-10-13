import { getCookie, verifySession, json } from '../_utils.js';

export async function onRequestGet({ request, env }) {
  const token = getCookie(request, 'hh_session');
  const session = await verifySession(env, token);
  if (!session) return json({ ok: false, error: 'Unauthorized' }, 401);

  const url = new URL(request.url);
  const siteId = parseInt(url.searchParams.get('site'));
  if (!siteId) return json({ ok: false, error: 'Site ID diperlukan' }, 400);

  try {
    const site = await env.DB.prepare('SELECT id FROM sites WHERE id = ? AND user_id = ?').bind(siteId, session.userId).first();
    if (!site) return json({ ok: false, error: 'Site not found' }, 404);

    const total = await env.DB.prepare('SELECT COUNT(*) as c FROM analytics WHERE site_id = ?').bind(siteId).first();

    const daily = await env.DB.prepare(
      "SELECT DATE(created_at) as date, COUNT(*) as count FROM analytics WHERE site_id = ? AND created_at > datetime('now', '-7 days') GROUP BY DATE(created_at) ORDER BY date"
    ).bind(siteId).all();

    const countries = await env.DB.prepare(
      'SELECT country, COUNT(*) as count FROM analytics WHERE site_id = ? AND country IS NOT NULL GROUP BY country ORDER BY count DESC LIMIT 10'
    ).bind(siteId).all();

    return json({
      ok: true,
      total: total ? total.c : 0,
      daily: daily.results || [],
      countries: countries.results || []
    });
  } catch (error) {
    return json({ ok: false, error: error.message }, 500);
  }
}
