import { requireAdmin, logAdmin } from '../../_admin.js';
import { json } from '../../_utils.js';

const DEFAULTS = {
  maintenance_mode: 'off',
  signup_enabled: 'on',
  announcement: '',
  max_sites_per_user: '20'
};

export async function onRequestGet({ request, env }) {
  const guard = await requireAdmin(request, env);
  if (guard.error) return guard.error;
  try {
    const { results } = await env.DB.prepare('SELECT key, value FROM global_settings').all();
    const s = Object.assign({}, DEFAULTS);
    (results || []).forEach(function(r){ s[r.key] = r.value; });
    return json({ ok: true, settings: s });
  } catch (err) { return json({ ok: false, error: err.message }, 500); }
}

export async function onRequestPatch({ request, env }) {
  const guard = await requireAdmin(request, env);
  if (guard.error) return guard.error;
  try {
    const body = await request.json();
    const keys = Object.keys(body);
    for (var i = 0; i < keys.length; i++) {
      const k = keys[i];
      const v = String(body[k]);
      await env.DB.prepare(
        'INSERT INTO global_settings (key, value, updated_at) VALUES (?, ?, datetime(\'now\')) ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = datetime(\'now\')'
      ).bind(k, v).run();
    }
    await logAdmin(env, guard.session.userId, 'settings.update', 'global', null, keys.join(', '), request);
    return json({ ok: true });
  } catch (err) { return json({ ok: false, error: err.message }, 500); }
}
