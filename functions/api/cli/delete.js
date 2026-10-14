import { authenticate, json } from '../../_utils.js';

export async function onRequestDelete({ request, env }) {
  const session = await authenticate(request, env);
  if (!session) return json({ ok: false, error: 'Unauthorized' }, 401);
  const url = new URL(request.url);
  const subdomain = (url.searchParams.get('subdomain') || '').trim().toLowerCase();
  if (!subdomain) return json({ ok: false, error: 'Subdomain required' }, 400);
  try {
    const site = await env.DB.prepare(
      'SELECT id FROM sites WHERE subdomain = ? AND user_id = ?'
    ).bind(subdomain, session.userId).first();
    if (!site) return json({ ok: false, error: 'Site not found' }, 404);
    await env.DB.prepare('DELETE FROM files WHERE site_id = ?').bind(site.id).run();
    await env.DB.prepare('DELETE FROM analytics WHERE site_id = ?').bind(site.id).run();
    await env.DB.prepare('DELETE FROM sites WHERE id = ?').bind(site.id).run();
    await env.DB.prepare('UPDATE deployments SET site_deleted = 1 WHERE site_id = ?').bind(site.id).run();
    return json({ ok: true });
  } catch (err) {
    return json({ ok: false, error: err.message }, 500);
  }
}
