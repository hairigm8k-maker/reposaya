import { getCookie, verifySession, json } from '../../../_utils.js';

export async function onRequestPost({ request, env }) {
  try {
    const token = getCookie(request, 'hh_session');
    const session = await verifySession(env, token);
    if (!session) return json({ ok: false, error: 'Not authenticated' }, 401);

    const user = await env.DB.prepare(
      'SELECT id, email, name FROM users WHERE id = ?'
    ).bind(session.userId).first();
    if (!user) return json({ ok: false, error: 'User not found' }, 404);

    const existing = await env.DB.prepare(
      'SELECT id FROM webauthn_credentials WHERE user_id = ?'
    ).bind(user.id).all();

    const host = new URL(request.url).hostname.replace(/^www\./, '');

    const { generateRegistrationOptions } = await import('../../_simplewebauthn.js');
    const options = await generateRegistrationOptions({
      rpName: 'HairiHosting',
      rpID: host,
      userID: new TextEncoder().encode(String(user.id)),
      userName: user.email,
      userDisplayName: user.name || user.email,
      attestationType: 'none',
      excludeCredentials: (existing.results || []).map(c => ({
        id: c.id,
        type: 'public-key'
      })),
      authenticatorSelection: {
        residentKey: 'preferred',
        userVerification: 'preferred'
      }
    });

    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();
    await env.DB.prepare(
      'INSERT OR REPLACE INTO webauthn_challenges (user_id, type, challenge, expires_at) VALUES (?, ?, ?, ?)'
    ).bind(user.id, 'registration', options.challenge, expiresAt).run();

    return json({ ok: true, options });
  } catch (err) {
    return json({ ok: false, error: err.message }, 500);
  }
}
