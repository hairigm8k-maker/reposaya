import { json } from '../../_utils.js';

export async function onRequestPatch({ request, env, params }) {
  try {
    const siteId = params.id;
    const body = await request.json();

    const { html, css, js } = body;

    if (!siteId) return json({ ok: false, error: 'Site ID diperlukan' }, 400);

    // Update database D1 (guna COALESCE supaya kalau takde data baru, kekalkan yang lama)
    await env.DB.prepare(
      'UPDATE sites SET html = COALESCE(?, html), css = COALESCE(?, css), js = COALESCE(?, js) WHERE id = ?'
    ).bind(html, css, js, siteId).run();

    return json({ ok: true, message: 'Site berjaya di-update' });
  } catch (err) {
    return json({ ok: false, error: err.message }, 500);
  }
}
