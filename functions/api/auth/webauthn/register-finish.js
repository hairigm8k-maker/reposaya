import { getCookie, verifySession, json } from '../../../_utils.js';

export async function onRequestPost({ request, env }) {
  try {
    const token = getCookie(request, 'hh_session');
    const session = await verifySession(env, token);
    if (!session) return json({ ok: false, error: 'Not authenticated' }, 401);

    const body = await request.json();
    const { response, name } = body;
    if (!response) return json({ ok: false, error: 'Missing response' }, 400);

    const stored = await env.DB.prepare(
      'SELECT challenge, expires_at FROM webauthn_challenges WHERE user_id = ? AND type = ?'
    ).bind(session.userId, 'registration').first();
    if (!stored) return json({ ok: false, error: 'Challenge expired' }, 400);

    if (new Date(stored.expires_at) < new Date()) {
      await env.DB.prepare('DELETE FROM webauthn_challenges WHERE user_id = ? AND type = ?')
        .bind(session.userId, 'registration').run();
      return json({ ok: false, error: 'Challenge expired' }, 400);
    }

    const host = new URL(request.url).hostname.replace(/^www\./, '');
    const origin = 'https://' + host;

    const { verifyRegistrationResponse } = await import('../../../_simplewebauthn.js');
    const verification = await verifyRegistrationResponse({
      response,
      expectedChallenge: stored.challenge,
      expectedOrigin: origin,
      expectedRPID: host,
      requireUserVerification: false
    });

    if (!verification.verified || !verification.registrationInfo) {
      return json({ ok: false, error: 'Verification failed' }, 400);
    }

    const info = verification.registrationInfo;
    const credId = info.credentialID;
    const pubKey = info.credentialPublicKey;
    const counter = info.counter || 0;
    const deviceType = info.credentialDeviceType || 'singleDevice';
    const backedUp = info.credentialBackedUp ? 1 : 0;

    const credIdB64 = typeof credId === 'string'
      ? credId
      : btoa(String.fromCharCode.apply(null, new Uint8Array(credId)))
          .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

    const pubKeyB64 = typeof pubKey === 'string'
      ? pubKey
      : btoa(String.fromCharCode.apply(null, new Uint8Array(pubKey)));

    const now = new Date().toISOString();
    await env.DB.prepare(
      'INSERT OR REPLACE INTO webauthn_credentials (id, user_id, public_key, counter, device_type, backed_up, name, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
    ).bind(credIdB64, session.userId, pubKeyB64, counter, deviceType, backedUp, name || 'Biometric', now).run();

    await env.DB.prepare('DELETE FROM webauthn_challenges WHERE user_id = ? AND type = ?')
      .bind(session.userId, 'registration').run();

    return json({ ok: true });
  } catch (err) {
    return json({ ok: false, error: err.message }, 500);
  }
}
