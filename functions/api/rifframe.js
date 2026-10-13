import { getCookie, verifySession, json } from '../_utils.js';

export async function onRequestGet({ request, env }) {
  const token = getCookie(request, 'hh_session');
  const session = await verifySession(env, token);
  if (!session) return json({ ok: false, error: 'Unauthorized' }, 401);

  const url = new URL(request.url);
  const action = url.searchParams.get('action') || 'list';

  try {
    let target = '';
    if (action === 'list') {
      const q = url.searchParams.get('q') || '';
      const type = url.searchParams.get('type') || '';
      const limit = url.searchParams.get('limit') || '48';
      target = 'https://rifframe.app/api/v1/sections?limit=' + limit;
      if (q) target += '&q=' + encodeURIComponent(q);
      if (type) target += '&type=' + encodeURIComponent(type);
    } else if (action === 'detail') {
      const id = url.searchParams.get('id');
      if (!id) return json({ ok: false, error: 'ID diperlukan' }, 400);
      target = 'https://rifframe.app/api/v1/sections/' + encodeURIComponent(id) + '?anchors=true';
    } else {
      return json({ ok: false, error: 'Action tak dikenali' }, 400);
    }

    const r = await fetch(target, {
      headers: { 'Accept': 'application/json', 'User-Agent': 'HairiHosting/1.0' }
    });
    if (!r.ok) return json({ ok: false, error: 'Rifframe error ' + r.status }, r.status);
    const data = await r.json();
    return json({ ok: true, data: data });
  } catch (err) {
    return json({ ok: false, error: err.message }, 500);
  }
}
