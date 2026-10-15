import { json } from '../../../_utils.js';
import { generateAuthenticationOptions } from 'https://esm.sh/@simplewebauthn/server@11.0.0';

export async function onRequestPost({ request, env }) {
  try {
    const body = await request.json();
    const email = (body.email || '').trim().toLowerCase();
    if (!email) return json({ ok: false, error: 'Email required' }, 400);

    const user = await env.DB.prepare(
      'SELECT id FROM users WHERE email = ?'
    ).bind(email).first();
    if (!user) return json({ ok: false, error: 'No passkey for this email' }, 404);

    const creds = await env.DB.prepare(
      'SELECT id, transports FROM webauthn_credentials WHERE user_id = ?'
    ).bind(user.id).all();
    if (!creds.results || creds.results.length === 0) {
      return json({ ok: false, error: 'No passkey registered' }, 404);
    }

    const host = new URL(request.url).hostname.replace(/^www\./, '');

    const options = await generateAuthenticationOptions({
      rpID: host,
      allowCredentials: creds.results.map(c => ({
        id: c.id,
        type: 'public-key',
        transports: c.transports ? c.transports.split(',') : undefined
      })),
      userVerification: 'preferred'
    });

    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();
    await env.DB.prepare(
      'INSERT OR REPLACE INTO webauthn_challenges (user_id, type, challenge, expires_at) VALUES (?, ?, ?, ?)'
    ).bind(user.id, 'authentication', options.challenge, expiresAt).run();

    return json({ ok: true, options, userId: user.id });
  } catch (err) {
    return json({ ok: false, error: err.message }, 500);
  }
}
