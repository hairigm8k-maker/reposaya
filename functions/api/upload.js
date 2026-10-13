import { authenticate, json } from '../_utils.js';

export async function onRequestPost({ request, env }) {
  const session = await authenticate(request, env);
  if (!session) return json({ ok: false, error: 'Unauthorized' }, 401);

  const url = new URL(request.url);
  const siteId = parseInt(url.searchParams.get('site'));
  if (!siteId) return json({ ok: false, error: 'Site ID diperlukan' }, 400);

  try {
    const site = await env.DB.prepare('SELECT id, subdomain FROM sites WHERE id = ? AND user_id = ?').bind(siteId, session.userId).first();
    if (!site) return json({ ok: false, error: 'Site not found' }, 404);

    const formData = await request.formData();
    const file = formData.get('file');
    if (!file) return json({ ok: false, error: 'File diperlukan' }, 400);

    if (file.size > 1.5 * 1024 * 1024) {
      return json({ ok: false, error: 'File terlalu besar. Max 1.5MB.' }, 400);
    }

    const ext = file.name.split('.').pop().toLowerCase();
    const allowed = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'ico'];
    if (allowed.indexOf(ext) < 0) {
      return json({ ok: false, error: 'Format not dibenarkan' }, 400);
    }

    const rand = Math.random().toString(36).slice(2, 8);
    const filename = Date.now() + '-' + rand + '.' + ext;

    const arrayBuffer = await file.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);
    let binary = '';
    const chunk = 8192;
    for (let i = 0; i < bytes.length; i += chunk) {
      binary += String.fromCharCode.apply(null, bytes.subarray(i, i + chunk));
    }
    const base64 = btoa(binary);

    await env.DB.prepare(
      'INSERT INTO files (site_id, filename, mime_type, size, data) VALUES (?, ?, ?, ?, ?)'
    ).bind(site.id, filename, file.type || 'application/octet-stream', file.size, base64).run();

    const publicUrl = 'https://' + site.subdomain + '.hairiamri.buzz/' + filename;

    return json({ ok: true, url: publicUrl, filename: filename });
  } catch (error) {
    return json({ ok: false, error: error.message }, 500);
  }
}
