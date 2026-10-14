import { getCookie, verifySession, json } from '../_utils.js';
import { sendEmail, testEmail } from '../_emails.js';

export async function onRequestPost({ request, env }) {
  const token = getCookie(request, 'hh_session');
  const session = await verifySession(env, token);
  if (!session) return json({ ok: false, error: 'Unauthorized' }, 401);
  if (session.role !== 'admin' && session.role !== 'superadmin') {
    return json({ ok: false, error: 'Admin only' }, 403);
  }
  try {
    const body = await request.json().catch(function(){ return {}; });
    const to = body.to || session.email;
    const result = await sendEmail(env, to, 'HairiHosting Test Email', testEmail());
    return json({ ok: result.ok, sent_to: to, data: result.data || result.error });
  } catch (err) {
    return json({ ok: false, error: err.message }, 500);
  }
}
