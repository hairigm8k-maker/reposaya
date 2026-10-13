import { getCookie, verifySession, json } from '../_utils.js';

export async function onRequestGet({ request, env }) {
  const token = getCookie(request, 'hh_session');
  const session = await verifySession(env, token);
  if (!session) return json({ ok: true, authenticated: false });

  try {
    const user = await env.DB.prepare(
      'SELECT id, email, name, role, status, username, avatar_url, bio, website, created_at FROM users WHERE id = ?'
    ).bind(session.userId).first();
    if (!user) return json({ ok: true, authenticated: false });
    return json({
      ok: true,
      authenticated: true,
      user: {
        id: user.id, email: user.email, name: user.name, role: user.role,
        status: user.status, username: user.username, avatar_url: user.avatar_url,
        bio: user.bio, website: user.website, created_at: user.created_at
      }
    });
  } catch (err) {
    return json({ ok: false, error: err.message }, 500);
  }
}
