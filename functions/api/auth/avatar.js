import { getCookie, verifySession, json } from '../_utils.js';

export async function onRequestPost({ request, env }) {
  const token = getCookie(request, 'hh_session');
  const session = await verifySession(env, token);
  if (!session) return json({ ok: false, error: 'Unauthorized' }, 401);

  try {
    const formData = await request.formData();
    const file = formData.get('file');
    if (!file) return json({ ok: false, error: 'File required' }, 400);
    if (file.size > 1.5 * 1024 * 1024) return json({ ok: false, error: 'File too large (max 1.5MB)' }, 400);

    const ext = file.name.split('.').pop().toLowerCase();
    const allowed = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
    if (allowed.indexOf(ext) < 0) return json({ ok: false, error: 'Format not allowed (JPG PNG GIF WebP only)' }, 400);

    const arrayBuffer = await file.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);
    let binary = '';
    const chunk = 8192;
    for (let i = 0; i < bytes.length; i += chunk) {
      binary += String.fromCharCode.apply(null, bytes.subarray(i, i + chunk));
    }
    const base64 = btoa(binary);
    const dataUrl = 'data:' + (file.type || 'image/jpeg') + ';base64,' + base64;

    await env.DB.prepare('UPDATE users SET avatar_url = ? WHERE id = ?').bind(dataUrl, session.userId).run();
    return json({ ok: true, avatar_url: dataUrl });
  } catch (err) {
    return json({ ok: false, error: err.message }, 500);
  }
}

export async function onRequestDelete({ request, env }) {
  const token = getCookie(request, 'hh_session');
  const session = await verifySession(env, token);
  if (!session) return json({ ok: false, error: 'Unauthorized' }, 401);
  try {
    await env.DB.prepare('UPDATE users SET avatar_url = NULL WHERE id = ?').bind(session.userId).run();
    return json({ ok: true });
  } catch (err) {
    return json({ ok: false, error: err.message }, 500);
  }
}
