import { authenticate, isStudentUser, studentBlocked, json } from '../../_utils.js';

export async function onRequestGet({ request, env }) {
  const session = await authenticate(request, env);
  if (!session) return json({ ok: false, error: 'Unauthorized' }, 401);
  if (await isStudentUser(env, session.userId)) return studentBlocked('CLI access');
  return json({
    ok: true,
    user: {
      id: session.userId,
      email: session.email,
      name: session.name,
      role: session.role
    },
    is_api_key: !!session.isApiKey
  });
}
