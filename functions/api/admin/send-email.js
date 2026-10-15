import { requireAdmin, logAdmin } from '../../_admin.js';
import { json } from '../../_utils.js';
import { sendEmail } from '../../_emails.js';

export async function onRequestPost({ request, env }) {
  const guard = await requireAdmin(request, env);
  if (guard.error) return guard.error;
  try {
    const body = await request.json();
    const subject = (body.subject || '').trim();
    const htmlBody = (body.body || '').trim();
    const target = body.target || 'all';
    const userId = body.user_id ? parseInt(body.user_id) : null;

    if (!subject) return json({ ok: false, error: 'Subject required' }, 400);
    if (!htmlBody) return json({ ok: false, error: 'Body required' }, 400);
    if (subject.length > 200) return json({ ok: false, error: 'Subject too long' }, 400);
    if (htmlBody.length > 50000) return json({ ok: false, error: 'Body too long' }, 400);

    const wrappedHtml = wrapEmail(htmlBody);

    if (target === 'user' && userId) {
      const user = await env.DB.prepare("SELECT id, email, name FROM users WHERE id = ? AND role = 'user'").bind(userId).first();
      if (!user) return json({ ok: false, error: 'User not found' }, 404);
      const r = await sendEmail(env, user.email, subject, wrappedHtml);
      if (!r.ok) return json({ ok: false, error: 'Email failed: ' + (r.error || 'unknown') }, 500);
      await logAdmin(env, guard.session.userId, 'email.user', 'user', user.id, subject, request);
      return json({ ok: true, sent: 1 });
    }

    const users = await env.DB.prepare("SELECT id, email, name FROM users WHERE role = 'user' AND status = 'active'").all();
    let sent = 0, failed = 0;
    for (let i = 0; i < (users.results || []).length; i++) {
      const u = users.results[i];
      try {
        const r = await sendEmail(env, u.email, subject, wrappedHtml);
        if (r.ok) sent++; else failed++;
      } catch (e) { failed++; }
    }
    await logAdmin(env, guard.session.userId, 'email.broadcast', 'all', null, subject + ' (' + sent + '/' + failed + ')', request);
    return json({ ok: true, sent: sent, failed: failed });
  } catch (err) {
    return json({ ok: false, error: err.message }, 500);
  }
}

function wrapEmail(content) {
  return '<!DOCTYPE html><html><head><meta charset="UTF-8"></head><body style="margin:0;padding:0;background:#f0f0f0;font-family:Inter,system-ui,-apple-system,sans-serif"><table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f0f0;padding:32px 16px"><tr><td align="center"><table width="100%" cellpadding="0" cellspacing="0" style="max-width:540px;background:#fff;border:1px solid #d8d8d8;border-radius:10px;overflow:hidden"><tr><td style="padding:18px 32px;background:#080808"><img src="https://try.hairiamri.buzz/1792065698584-qrh6au.png" alt="HairiHosting" width="130" style="height:24px;display:block;border:0"></td></tr><tr><td style="padding:40px 32px">' + content + '</td></tr><tr><td style="padding:20px 32px;background:#f0f0f0;border-top:1px solid #d8d8d8"><p style="margin:0 0 8px;font-size:12px;color:#5a5a5a">Questions? Email <a href="mailto:feedback@hairiamri.buzz" style="color:#146ef5">feedback@hairiamri.buzz</a>.</p><p style="margin:0 0 8px;font-size:10px;color:#bdbdbd">This email was automatically generated.</p><p style="margin:0;font-size:11px;color:#5a5a5a">HairiHosting &middot; hairiamri.buzz</p></td></tr></table></td></tr></table></body></html>';
}
