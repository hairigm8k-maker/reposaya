import { getCookie, verifySession, json } from '../../_utils.js';

export async function onRequestGet({ request, env }) {
  const token = getCookie(request, 'hh_session');
  const session = await verifySession(env, token);
  if (!session) return json({ ok: false, authenticated: false }, 401);
  return json({ ok: true, authenticated: true, user: session });
}
