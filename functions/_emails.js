export async function sendEmail(env, to, subject, html) {
  if (!env.RESEND_API_KEY) return { ok: false, error: 'No API key' };
  try {
    const from = env.RESEND_FROM || 'HairiHosting <feedback@hairiamri.buzz>';
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + env.RESEND_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ from: from, to: [to], subject: subject, html: html })
    });
    const d = await r.json();
    return { ok: r.ok, data: d };
  } catch (e) {
    return { ok: false, error: e.message };
  }
}

function wrap(title, body) {
  return '<!DOCTYPE html><html><head><meta charset="UTF-8"></head><body style="margin:0;padding:0;background:#08080a;font-family:-apple-system,Inter,sans-serif;color:#e2e3e9"><table width="100%" cellpadding="0" cellspacing="0" style="background:#08080a;padding:40px 20px"><tr><td align="center"><table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#040406;border:1px solid #1c1d22;border-radius:12px"><tr><td style="padding:28px 32px;border-bottom:1px solid #1c1d22"><div style="font-size:18px;font-weight:600;color:#fff">HairiHosting</div></td></tr><tr><td style="padding:32px"><h1 style="margin:0 0 16px;font-family:Georgia,serif;font-weight:400;font-size:26px;color:#fff;line-height:1.3">' + title + '</h1>' + body + '</td></tr><tr><td style="padding:20px 32px;border-top:1px solid #1c1d22;font-size:12px;color:#5e616e;text-align:center">HairiHosting · hairiamri.buzz</td></tr></table></td></tr></table></body></html>';
}

export function welcomeEmail(name) {
  return wrap('Welcome to HairiHosting',
    '<p style="margin:0 0 16px;color:#e2e3e9;font-size:15px;line-height:1.6">Hi ' + name + ',</p>' +
    '<p style="margin:0 0 20px;color:#9194a1;font-size:15px;line-height:1.6">Your account is ready. Start building your first website now.</p>' +
    '<a href="https://hairiamri.buzz/dashboard/" style="display:inline-block;background:#cc9166;color:#000;text-decoration:none;padding:12px 28px;border-radius:9999px;font-weight:600;font-size:14px">Open Dashboard</a>');
}

export function loginAlertEmail(name, ip, browser, time) {
  return wrap('New sign-in to your account',
    '<p style="margin:0 0 16px;color:#e2e3e9;font-size:15px;line-height:1.6">Hi ' + name + ',</p>' +
    '<p style="margin:0 0 20px;color:#9194a1;font-size:15px;line-height:1.6">We noticed a new sign-in to your account.</p>' +
    '<table cellpadding="0" cellspacing="0" style="width:100%;background:#121317;border:1px solid #1c1d22;border-radius:10px;margin-bottom:20px"><tr><td style="padding:14px 18px;font-size:13px;color:#9194a1;border-bottom:1px solid #1c1d22">Browser: ' + browser + '</td></tr><tr><td style="padding:14px 18px;font-size:13px;color:#9194a1;border-bottom:1px solid #1c1d22">IP: ' + (ip || 'Unknown') + '</td></tr><tr><td style="padding:14px 18px;font-size:13px;color:#9194a1">Time: ' + time + '</td></tr></table>' +
    '<p style="margin:0;color:#9194a1;font-size:13px;line-height:1.6">If this was you, no action needed. If not, change your password immediately.</p>');
}

export function publishEmail(name, siteName, url) {
  return wrap('Your site is live!',
    '<p style="margin:0 0 16px;color:#e2e3e9;font-size:15px;line-height:1.6">Hi ' + name + ',</p>' +
    '<p style="margin:0 0 16px;color:#9194a1;font-size:15px;line-height:1.6">Your website <strong style="color:#fff">' + siteName + '</strong> is now live.</p>' +
    '<div style="background:#121317;border:1px solid #1c1d22;border-radius:10px;padding:16px 18px;margin-bottom:20px;font-family:monospace;font-size:13px;color:#cc9166;word-break:break-all">' + url + '</div>' +
    '<a href="' + url + '" style="display:inline-block;background:#cc9166;color:#000;text-decoration:none;padding:12px 28px;border-radius:9999px;font-weight:600;font-size:14px">Visit Site</a>');
}

export function testEmail() {
  return wrap('Test Email', '<p style="margin:0;color:#9194a1;font-size:15px;line-height:1.6">This is a test email from HairiHosting. Email delivery is working correctly.</p>');
}


export function resetPasswordEmail(name, resetUrl, expiresMinutes) {
  return wrap('Reset your password',
    '<p style="margin:0 0 16px;color:#e2e3e9;font-size:15px;line-height:1.6">Hi ' + name + ',</p>' +
    '<p style="margin:0 0 20px;color:#9194a1;font-size:15px;line-height:1.6">We received a request to reset your HairiHosting password. Click the button below to set a new password.</p>' +
    '<a href="' + resetUrl + '" style="display:inline-block;background:#cc9166;color:#000;text-decoration:none;padding:12px 28px;border-radius:9999px;font-weight:600;font-size:14px;margin-bottom:20px">Reset Password</a>' +
    '<p style="margin:20px 0 12px;color:#9194a1;font-size:13px;line-height:1.6">Or copy this link:</p>' +
    '<div style="background:#121317;border:1px solid #1c1d22;border-radius:8px;padding:12px 16px;font-family:monospace;font-size:12px;color:#cc9166;word-break:break-all;margin-bottom:20px">' + resetUrl + '</div>' +
    '<p style="margin:0 0 8px;color:#5e616e;font-size:12px;line-height:1.6">This link expires in ' + expiresMinutes + ' minutes and can only be used once.</p>' +
    '<p style="margin:0;color:#5e616e;font-size:12px;line-height:1.6">If you did not request this, you can safely ignore this email.</p>');
}
