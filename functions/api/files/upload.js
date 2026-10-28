import { json } from '../../_utils.js';

export async function onRequestPost({ request, env }) {
  try {
    const body = await request.json();
    const { site_id, filename, data } = body;

    if (!site_id || !filename || !data) {
      return json({ ok: false, error: 'site_id, filename, dan data diperlukan' }, 400);
    }

    // Detect mime type (simple version)
    let mime_type = 'application/octet-stream';
    const ext = filename.split('.').pop().toLowerCase();
    if (ext === 'png') mime_type = 'image/png';
    if (ext === 'jpg' || ext === 'jpeg') mime_type = 'image/jpeg';
    if (ext === 'gif') mime_type = 'image/gif';
    if (ext === 'svg') mime_type = 'image/svg+xml';
    if (ext === 'css') mime_type = 'text/css';
    if (ext === 'js') mime_type = 'application/javascript';

    // Simpan ke database D1
    await env.DB.prepare(
      'INSERT INTO files (site_id, filename, mime_type, data) VALUES (?, ?, ?, ?)'
    ).bind(site_id, filename, mime_type, data).run();

    return json({ ok: true, message: 'Fail berjaya disimpan' });
  } catch (err) {
    return json({ ok: false, error: err.message }, 500);
  }
}
