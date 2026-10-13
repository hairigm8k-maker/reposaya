import { getCookie, deleteSession, clearCookie, json } from '../../_utils/auth.js';

export async function onRequestPost({ request, env }) {
  const token = getCookie(request, 'hh_session');
  if (token) {
    await deleteSession(env, token);
  }
  return json({ ok: true }, 200, { 'Set-Cookie': clearCookie('hh_session') });
}
