import { getCookie, verifySession, json } from '../../_utils.js';

const DEFAULTS = {
  appearance: { reduceAnimations: false, compactSidebar: false },
  region: { language: 'en', timezone: 'Asia/Kuala_Lumpur', dateFormat: 'dmy' },
  defaults: { template: 'blank', autoPublish: false, subdomainPrefix: '' },
  notifications: { emailLogin: true, emailPublish: false, emailWeekly: true },
  data: { autoDeleteAnalytics: false, autoDeleteDeployments: false }
};

export async function onRequestGet({ request, env }) {
  const token = getCookie(request, 'hh_session');
  const session = await verifySession(env, token);
  if (!session) return json({ ok: false, error: 'Unauthorized' }, 401);

  try {
    const row = await env.DB.prepare('SELECT settings FROM users WHERE id = ?').bind(session.userId).first();
    let settings = DEFAULTS;
    if (row && row.settings) {
      try {
        var parsed = JSON.parse(row.settings);
        settings = Object.assign({}, DEFAULTS, parsed);
        settings.appearance = Object.assign({}, DEFAULTS.appearance, parsed.appearance || {});
        settings.region = Object.assign({}, DEFAULTS.region, parsed.region || {});
        settings.defaults = Object.assign({}, DEFAULTS.defaults, parsed.defaults || {});
        settings.notifications = Object.assign({}, DEFAULTS.notifications, parsed.notifications || {});
        settings.data = Object.assign({}, DEFAULTS.data, parsed.data || {});
      } catch (e) {}
    }
    return json({ ok: true, settings: settings });
  } catch (err) {
    return json({ ok: false, error: err.message }, 500);
  }
}

export async function onRequestPatch({ request, env }) {
  const token = getCookie(request, 'hh_session');
  const session = await verifySession(env, token);
  if (!session) return json({ ok: false, error: 'Unauthorized' }, 401);

  try {
    const body = await request.json();
    if (!body || typeof body !== 'object') return json({ ok: false, error: 'Invalid body' }, 400);
    const jsonStr = JSON.stringify(body);
    if (jsonStr.length > 4000) return json({ ok: false, error: 'Settings too large' }, 400);
    await env.DB.prepare('UPDATE users SET settings = ? WHERE id = ?').bind(jsonStr, session.userId).run();
    return json({ ok: true });
  } catch (err) {
    return json({ ok: false, error: err.message }, 500);
  }
}
