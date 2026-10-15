import { createSession, buildCookie, json } from '../../../_utils.js';

export async function onRequestPost({ request, env }) {
  try {
    const body = await request.json();
    const { response, userId } = body;
    if (!response || !userId) return json({ ok: false, error: 'Missing data' }, 400);

    const stored = await env.DB.prepare(
      'SELECT challenge, expires_at FROM webauthn_challenges WHERE user_id = ? AND type = ?'
    ).bind(userId, 'authentication').first();
    if (!stored) return json({ ok: false, error: 'Challenge expired' }, 400);

    if (new Date(stored.expires_at) < new Date()) {
      await env.DB.prepare('DELETE FROM webauthn_challenges WHERE user_id = ? AND type = ?')
        .bind(userId, 'authentication').run();
      return json({ ok: false, error: 'Challenge expired' }, 400);
    }

    const cred = await env.DB.prepare(
      'SELECT id, public_key, counter, transports FROM webauthn_credentials WHERE id = ? AND user_id = ?'
    ).bind(response.id, userId).first();
    if (!cred) return json({ ok: false, error: 'Credential not found' }, 404);

    const host = new URL(request.url).hostname.replace(/^www\./, '');
    const origin = 'https://' + host;

    const { verifyAuthenticationResponse } = await import('../../_simplewebauthn.js');
    const verification = await verifyAuthenticationResponse({
      response,
      expectedChallenge: stored.challenge,
      expectedOrigin: origin,
      expectedRPID: host,
      credential: {
        id: cred.id,
        publicKey: Uint8Array.from(atob(cred.public_key), c => c.charCodeAt(0)),
        counter: cred.counter || 0,
        transports: cred.transports ? cred.transports.split(',') : undefined
      },
      requireUserVerification: false
    });

    if (!verification.verified) {
      return json({ ok: false, error: 'Verification failed' }, 400);
    }

    const newCounter = verification.authenticationInfo.newCounter;
    await env.DB.prepare(
      'UPDATE webauthn_credentials SET counter = ?, last_used_at = ? WHERE id = ?'
    ).bind(newCounter, new Date().toISOString(), cred.id).run();

    await env.DB.prepare('DELETE FROM webauthn_challenges WHERE user_id = ? AND type = ?')
      .bind(userId, 'authentication').run();

    const user = await env.DB.prepare(
      'SELECT id, email, name, role, status FROM users WHERE id = ?'
    ).bind(userId).first();
    if (!user) return json({ ok: false, error: 'User not found' }, 404);
    if (user.status !== 'active') return json({ ok: false, error: 'Account not active' }, 403);

    const token = await createSession(env, user.id, { ip: request.headers.get('CF-Connecting-IP') || '' });

    return json(
      { ok: true, redirect: '/dashboard/' },
      200,
      { 'Set-Cookie': buildCookie('hh_session', token) }
    );
  } catch (err) {
    return json({ ok: false, error: err.message }, 500);
  }
}
