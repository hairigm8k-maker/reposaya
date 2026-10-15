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
  return '<!DOCTYPE html><html><head><meta charset="UTF-8"></head><body style="margin:0;padding:0;background:#08080a;font-family:-apple-system,Inter,sans-serif;color:#e2e3e9"><table width="100%" cellpadding="0" cellspacing="0" style="background:#08080a;padding:40px 20px"><tr><td align="center"><table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#040406;border:1px solid #1c1d22;border-radius:12px"><tr><td style="padding:28px 32px;border-bottom:1px solid #1c1d22"><img src="https://hairiamri.buzz/assets/logoUtama/logoUtama-white.png" alt="HairiHosting" style="height:32px;width:auto;display:block;"></td></tr><tr><td style="padding:32px"><h1 style="margin:0 0 16px;font-family:Georgia,serif;font-weight:400;font-size:26px;color:#fff;line-height:1.3">' + title + '</h1>' + body + '</td></tr><tr><td style="padding:20px 32px;border-top:1px solid #1c1d22;font-size:12px;color:#5e616e;text-align:center">HairiHosting · hairiamri.buzz</td></tr></table></td></tr></table></body></html>';
}

export function welcomeEmail(name, email, tempPassword, plan) {
  const planLabel = plan === 'bisnes' ? 'Bisnes' : (plan === 'pro' ? 'Pro' : (plan === 'monthly' ? 'Monthly' : 'Free'));
  const dashUrl = 'https://hairiamri.buzz/dashboard/';

  const fontStack = "'WF Visual Sans Variable','Inter',ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif";
  const monoFont = "'WF Visual Sans Mono','JetBrains Mono',ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace";

  const iconPlus = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 5v14M5 12h14" stroke="#080808" stroke-width="1.8" stroke-linecap="round"/></svg>';
  const iconEdit = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 20h9M16.5 3.5a2.12 2.12 0 013 3L7 19l-4 1 1-4L16.5 3.5z" stroke="#080808" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  const iconRocket = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 00-2.91-.09zM12 15l-3-3a22 22 0 012-3.95A12.88 12.88 0 0122 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 01-4 2z" stroke="#080808" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  const iconLock = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="3" y="11" width="18" height="11" rx="2" stroke="#080808" stroke-width="1.8"/><path d="M7 11V7a5 5 0 0110 0v4" stroke="#080808" stroke-width="1.8" stroke-linecap="round"/></svg>';

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<meta name="color-scheme" content="light only">
<title>Welcome to HairiHosting</title>
</head>
<body style="margin:0;padding:0;background:#ffffff;font-family:${fontStack};-webkit-font-smoothing:antialiased">
<div style="display:none;max-height:0;overflow:hidden;opacity:0">Your HairiHosting account is ready. Sign in to get started.</div>
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#ffffff;padding:48px 20px">
<tr><td align="center">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;background:#ffffff;border:1px solid #d8d8d8;border-radius:8px">
<tr><td style="padding:20px 40px;background:#080808;border-radius:8px 8px 0 0">
<img src="https://hairiamri.buzz/assets/logoUtama/logoUtama-white.png" alt="HairiHosting" width="140" style="height:26px;width:auto;display:block;border:0">
</td></tr>
<tr><td style="padding:48px 40px 32px">
<p style="margin:0 0 16px;font-size:13px;font-weight:500;letter-spacing:0.1em;text-transform:uppercase;color:#5a5a5a">New Account</p>
<h1 style="margin:0 0 16px;font-size:40px;font-weight:600;line-height:1.04;letter-spacing:-0.4px;color:#080808">Welcome to HairiHosting</h1>
<p style="margin:0;font-size:16px;font-weight:400;line-height:1.6;color:#5a5a5a">Hi ${name}, your account is ready. Let&rsquo;s get your first website live.</p>
</td></tr>
<tr><td style="padding:0 40px 32px">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f0f0f0;border-radius:8px">
<tr><td style="padding:16px 20px;border-bottom:1px solid #d8d8d8">
<p style="margin:0 0 4px;font-size:11px;font-weight:500;letter-spacing:0.1em;text-transform:uppercase;color:#5a5a5a">Email</p>
<p style="margin:0;font-family:${monoFont};font-size:13px;color:#080808;word-break:break-all">${email}</p>
</td></tr>
<tr><td style="padding:16px 20px;border-bottom:1px solid #d8d8d8">
<p style="margin:0 0 4px;font-size:11px;font-weight:500;letter-spacing:0.1em;text-transform:uppercase;color:#5a5a5a">Temporary Password</p>
<p style="margin:0;font-family:${monoFont};font-size:16px;font-weight:500;letter-spacing:0.5px;color:#080808">${tempPassword}</p>
</td></tr>
<tr><td style="padding:16px 20px">
<p style="margin:0 0 4px;font-size:11px;font-weight:500;letter-spacing:0.1em;text-transform:uppercase;color:#5a5a5a">Plan</p>
<p style="margin:0;font-size:14px;font-weight:600;color:#080808">${planLabel}</p>
</td></tr>
</table>
</td></tr>
<tr><td style="padding:0 40px 48px">
<a href="${dashUrl}" style="display:inline-block;background:#146ef5;color:#ffffff;text-decoration:none;padding:12px 20px;border-radius:4px;font-family:${fontStack};font-size:14px;font-weight:500;letter-spacing:0">Open Dashboard</a>
</td></tr>
<tr><td style="padding:0 40px"><div style="border-top:1px solid #d8d8d8"></div></td></tr>
<tr><td style="padding:40px 40px 32px">
<p style="margin:0 0 24px;font-size:24px;font-weight:600;line-height:1.3;letter-spacing:-0.24px;color:#080808">Get started</p>
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:20px"><tr>
<td width="40" valign="top"><div style="width:36px;height:36px;border-radius:50%;background:#f0f0f0;text-align:center;line-height:36px">${iconPlus}</div></td>
<td style="padding-left:14px" valign="top">
<p style="margin:0 0 2px;font-size:16px;font-weight:600;color:#080808;line-height:1.4">Create your first site</p>
<p style="margin:0;font-size:14px;color:#5a5a5a;line-height:1.5">Click "Create New Site" and pick a template, or start from blank.</p>
</td></tr></table>
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:20px"><tr>
<td width="40" valign="top"><div style="width:36px;height:36px;border-radius:50%;background:#f0f0f0;text-align:center;line-height:36px">${iconEdit}</div></td>
<td style="padding-left:14px" valign="top">
<p style="margin:0 0 2px;font-size:16px;font-weight:600;color:#080808;line-height:1.4">Edit in the editor</p>
<p style="margin:0;font-size:14px;color:#5a5a5a;line-height:1.5">Write HTML, CSS, and JS directly, or upload your own files.</p>
</td></tr></table>
<table width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
<td width="40" valign="top"><div style="width:36px;height:36px;border-radius:50%;background:#f0f0f0;text-align:center;line-height:36px">${iconRocket}</div></td>
<td style="padding-left:14px" valign="top">
<p style="margin:0 0 2px;font-size:16px;font-weight:600;color:#080808;line-height:1.4">Publish and share</p>
<p style="margin:0;font-size:14px;color:#5a5a5a;line-height:1.5">Your site goes live at <span style="font-family:${monoFont};color:#080808">subdomain.hairiamri.buzz</span>.</p>
</td></tr></table>
</td></tr>
<tr><td style="padding:0 40px 40px">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f0f0f0;border-radius:8px"><tr><td style="padding:16px 18px">
<table cellpadding="0" cellspacing="0" border="0"><tr>
<td width="24" valign="top" style="padding-top:1px">${iconLock}</td>
<td style="padding-left:8px" valign="top">
<p style="margin:0 0 2px;font-size:13px;font-weight:600;color:#080808">Security tip</p>
<p style="margin:0;font-size:13px;color:#5a5a5a;line-height:1.5">Change your password after first login. Never share it with anyone.</p>
</td></tr></table>
</td></tr></table>
</td></tr>
<tr><td style="padding:24px 40px;background:#f0f0f0;border-top:1px solid #d8d8d8;border-radius:0 0 8px 8px">
<p style="margin:0 0 8px;font-size:13px;color:#5a5a5a;line-height:1.5">Questions? Reply to this email or reach us at <a href="mailto:feedback@hairiamri.buzz" style="color:#146ef5;text-decoration:none">feedback@hairiamri.buzz</a>.</p>
<p style="margin:0 0 8px;font-size:11px;color:#bdbdbd;line-height:1.5">This email was automatically generated. Please do not reply directly to this message.</p>
<p style="margin:0;font-size:12px;color:#5a5a5a">HairiHosting &middot; hairiamri.buzz</p>
</td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;
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
