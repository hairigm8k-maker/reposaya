export async function onRequestPost({ request, env }) {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json'
  };

  try {
    const { name, email, message } = await request.json();

    if (!name || !email || !message) {
      return new Response(JSON.stringify({ ok: false, message: 'Sila isi semua ruangan' }), { status: 400, headers: corsHeaders });
    }

    if (!env.RESEND_API_KEY) {
      return new Response(JSON.stringify({ ok: false, message: 'Email service belum setup' }), { status: 500, headers: corsHeaders });
    }

    const fromEmail = env.RESEND_FROM || 'onboarding@resend.dev';
    const adminEmail = env.ADMIN_EMAIL || 'hairigm8k@gmail.com';
    const logoUrl = 'https://hairiamri.buzz/assets/logoUtama/logoUtama.png';

    // ===== EMAIL KE ADMIN =====
    const adminRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [adminEmail],
        reply_to: email,
        subject: `💬 Feedback baru dari ${name}`,
        html: `
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<style>
  @media (prefers-color-scheme: dark) {
    .email-body { background: #1a1a1a !important; }
    .email-card { background: #222 !important; }
    .text-dark { color: #f0f0f0 !important; }
    .text-muted { color: #999 !important; }
    .box-inner { background: #2a2a2a !important; }
  }
</style>
</head>
<body class="email-body" style="margin:0; padding:0; background:#f4f4f5; font-family:-apple-system,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5; padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px; width:100%;">

          <!-- HEADER -->
          <tr>
            <td class="email-card" style="background:#ffffff; border-radius:16px 16px 0 0; padding:32px 32px 20px; text-align:center; border-bottom:1px solid #f0f0f0;">
              <img src="${logoUrl}" alt="hairiamri.buzz" width="56" height="56" style="border-radius:14px; display:block; margin:0 auto 16px;">
              <h1 class="text-dark" style="margin:0; color:#111; font-size:20px; font-weight:700; letter-spacing:-0.02em;">💬 Feedback Baru</h1>
              <p class="text-muted" style="margin:6px 0 0; color:#888; font-size:13px;">Dari laman web hairiamri.buzz</p>
            </td>
          </tr>

          <!-- CONTENT -->
          <tr>
            <td class="email-card" style="background:#ffffff; padding:0 32px 32px; border-radius:0 0 16px 16px;">

              <!-- INFO PENGIRIM -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb; border-radius:12px; margin-bottom:20px;">
                <tr>
                  <td style="padding:20px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding-bottom:10px;">
                          <span class="text-muted" style="color:#666; font-size:12px; text-transform:uppercase; letter-spacing:0.05em; font-weight:600;">👤 Nama</span><br>
                          <span class="text-dark" style="color:#111; font-size:15px; font-weight:600;">${esc(name)}</span>
                        </td>
                      </tr>
                      <tr>
                        <td>
                          <span class="text-muted" style="color:#666; font-size:12px; text-transform:uppercase; letter-spacing:0.05em; font-weight:600;">✉️ Email</span><br>
                          <a href="mailto:${esc(email)}" style="color:#0a7cff; font-size:15px; font-weight:500; text-decoration:none;">${esc(email)}</a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- MESEJ -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb; border-left:4px solid #111; border-radius:8px;">
                <tr>
                  <td style="padding:20px;">
                    <p class="text-muted" style="margin:0 0 10px; color:#666; font-size:12px; text-transform:uppercase; letter-spacing:0.05em; font-weight:600;">💬 Mesej</p>
                    <p class="text-dark" style="margin:0; color:#222; font-size:15px; line-height:1.6; white-space:pre-wrap;">${esc(message)}</p>
                  </td>
                </tr>
              </table>

              <!-- CTA -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:24px;">
                <tr>
                  <td align="center">
                    <a href="mailto:${esc(email)}" style="display:inline-block; background:#111; color:#ffffff; padding:12px 28px; border-radius:10px; text-decoration:none; font-weight:600; font-size:14px;">
                      ↩️ Balas Feedback
                    </a>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td style="padding:24px 16px 0; text-align:center;">
              <p class="text-muted" style="color:#999; font-size:12px; margin:0; line-height:1.5;">
                Dihantar dari <a href="https://hairiamri.buzz" style="color:#0a7cff; text-decoration:none;">hairiamri.buzz</a><br>
                ${new Date().toLocaleString('ms-MY', { timeZone: 'Asia/Kuala_Lumpur', dateStyle: 'medium', timeStyle: 'short' })}
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
      })
    });

    if (!adminRes.ok) {
      const errData = await adminRes.json();
      console.error('Resend admin error:', errData);
      return new Response(JSON.stringify({ ok: false, message: 'Gagal hantar email' }), { status: 500, headers: corsHeaders });
    }

    // ===== AUTO-REPLY KE USER =====
    const userRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [email],
        reply_to: adminEmail,
        subject: 'Terima kasih atas maklum balas anda 🌸',
        html: `
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Terima kasih!</title>
<style>
  @media (prefers-color-scheme: dark) {
    .email-body { background: #1a1a1a !important; }
    .email-card { background: #222 !important; }
    .text-dark { color: #f0f0f0 !important; }
    .text-muted { color: #999 !important; }
    .box-inner { background: #2a2a2a !important; }
    .border-top { border-color: #333 !important; }
  }
</style>
</head>
<body class="email-body" style="margin:0; padding:0; background:#f4f4f5; font-family:-apple-system,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5; padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px; width:100%;">

          <!-- HEADER dengan gradient hero -->
          <tr>
            <td class="email-card" style="background:#111; border-radius:16px 16px 0 0; padding:40px 32px 32px; text-align:center;">
              <img src="${logoUrl}" alt="hairiamri.buzz" width="64" height="64" style="border-radius:16px; display:block; margin:0 auto 20px; background:#fff; padding:4px;">
              <h1 style="margin:0; color:#ffffff; font-size:26px; font-weight:700; letter-spacing:-0.02em; line-height:1.3;">
                Terima kasih,<br>${esc(name)}! 🌸
              </h1>
              <p style="margin:12px 0 0; color:#a1a1aa; font-size:14px;">
                Maklum balas anda telah kami terima
              </p>
            </td>
          </tr>

          <!-- CONTENT -->
          <tr>
            <td class="email-card" style="background:#ffffff; padding:32px; border-radius:0 0 16px 16px;">

              <p class="text-dark" style="margin:0 0 16px; color:#222; font-size:15px; line-height:1.7;">
                Hai <b>${esc(name)}</b>,
              </p>

              <p class="text-dark" style="margin:0 0 16px; color:#444; font-size:15px; line-height:1.7;">
                Kami amat menghargai masa anda untuk berkongsi maklum balas. Setiap pendapat anda membantu kami <b>memperbaiki</b> dan <b>meningkatkan kualiti</b> perkhidmatan.
              </p>

              <!-- INFO BOX -->
              <table class="box-inner" width="100%" cellpadding="0" cellspacing="0" style="background:#f0f9ff; border-radius:12px; margin:24px 0;">
                <tr>
                  <td style="padding:20px;">
                    <p class="text-dark" style="margin:0; color:#0c4a6e; font-size:14px; line-height:1.6;">
                      ⏱️ Kami akan hubungi anda semula dalam masa <b>1-2 hari bekerja</b> jika perlu.
                    </p>
                  </td>
                </tr>
              </table>

              <!-- CTA BUTTON -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin:32px 0 24px;">
                <tr>
                  <td align="center">
                    <a href="https://wa.me/60172131814" style="display:inline-block; background:#111; color:#ffffff; padding:14px 32px; border-radius:12px; text-decoration:none; font-weight:700; font-size:15px;">
                      💬 Hubungi Kami di WhatsApp
                    </a>
                  </td>
                </tr>
              </table>

              <!-- DIVIDER -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:32px;">
                <tr>
                  <td class="border-top" style="border-top:1px solid #eee; padding-top:24px; text-align:center;">
                    <p class="text-muted" style="margin:0 0 8px; color:#888; font-size:13px; line-height:1.6;">
                      Salam mesra,<br>
                      <b class="text-dark" style="color:#111;">Pasukan hairiamri.buzz</b>
                    </p>
                    <p style="margin:16px 0 0;">
                      <a href="https://hairiamri.buzz" style="color:#0a7cff; text-decoration:none; font-size:12px; margin:0 8px;">🌐 Website</a>
                      <a href="https://wa.me/60172131814" style="color:#0a7cff; text-decoration:none; font-size:12px; margin:0 8px;">💬 WhatsApp</a>
                      <a href="https://www.facebook.com/share/1B1gC444z6/" style="color:#0a7cff; text-decoration:none; font-size:12px; margin:0 8px;">📘 Facebook</a>
                    </p>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- BOTTOM NOTE -->
          <tr>
            <td style="padding:24px 16px 0; text-align:center;">
              <p class="text-muted" style="color:#999; font-size:11px; margin:0; line-height:1.6;">
                Email ini dihantar secara automatik. Sila jangan balas terus ke email ini.<br>
                Untuk pertanyaan, hubungi kami di <a href="https://wa.me/60172131814" style="color:#0a7cff; text-decoration:none;">WhatsApp</a>.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
      })
    });

    if (!userRes.ok) {
      console.error('Resend auto-reply error:', await userRes.json());
    }

    return new Response(JSON.stringify({
      ok: true,
      message: 'Feedback dihantar'
    }), { headers: corsHeaders });

  } catch (err) {
    console.error('Feedback error:', err);
    return new Response(JSON.stringify({
      ok: false,
      message: 'Ralat sambungan. Cuba lagi.'
    }), { status: 500, headers: corsHeaders });
  }
}

export async function onRequestOptions() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  });
}

function esc(s) {
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}
