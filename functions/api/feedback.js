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

    // ===== 1. EMAIL KE ADMIN (kau) =====
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
          <div style="font-family: -apple-system, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f7f7f8;">
            <div style="background: #fff; border-radius: 12px; padding: 24px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
              <div style="text-align: center; margin-bottom: 24px;">
                <img src="${logoUrl}" alt="hairiamri.buzz" style="width: 48px; height: 48px; border-radius: 12px;">
                <h2 style="margin: 12px 0 0; color: #111;">💬 Feedback Baru</h2>
              </div>
              <div style="background: #f7f7f8; padding: 16px; border-radius: 8px; margin-bottom: 16px;">
                <p style="margin: 0 0 8px; color: #333;"><b>Nama:</b> ${esc(name)}</p>
                <p style="margin: 0; color: #333;"><b>Email:</b> <a href="mailto:${esc(email)}" style="color: #0a7cff;">${esc(email)}</a></p>
              </div>
              <div style="background: #fafafa; border-left: 3px solid #111; padding: 16px; border-radius: 4px;">
                <p style="margin: 0 0 8px; color: #888; font-size: 12px; text-transform: uppercase; letter-spacing: .05em;"><b>Mesej:</b></p>
                <p style="margin: 0; color: #222; line-height: 1.6; white-space: pre-wrap;">${esc(message)}</p>
              </div>
              <p style="color: #999; font-size: 12px; margin-top: 24px; text-align: center;">
                Dihantar dari hairiamri.buzz pada ${new Date().toLocaleString('ms-MY', { timeZone: 'Asia/Kuala_Lumpur' })}
              </p>
            </div>
          </div>
        `
      })
    });

    if (!adminRes.ok) {
      const errData = await adminRes.json();
      console.error('Resend admin error:', errData);
      return new Response(JSON.stringify({ ok: false, message: 'Gagal hantar email' }), { status: 500, headers: corsHeaders });
    }

    // ===== 2. AUTO-REPLY KE USER (email dia dapat) =====
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
          <div style="font-family: -apple-system, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f7f7f8;">
            <div style="background: #fff; border-radius: 12px; padding: 32px 24px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
              <div style="text-align: center; margin-bottom: 24px;">
                <img src="${logoUrl}" alt="hairiamri.buzz" style="width: 56px; height: 56px; border-radius: 14px;">
              </div>
              <h1 style="text-align: center; color: #111; font-size: 22px; margin: 0 0 8px;">Terima kasih, ${esc(name)}! 🌸</h1>
              <p style="text-align: center; color: #666; font-size: 14px; margin: 0 0 24px;">Maklum balas anda telah kami terima</p>

              <div style="background: #f7f7f8; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
                <p style="margin: 0 0 12px; color: #333; line-height: 1.6;">
                  Kami amat menghargai masa anda untuk berkongsi maklum balas. Setiap pendapat anda membantu kami memperbaiki dan meningkatkan kualiti perkhidmatan.
                </p>
                <p style="margin: 0; color: #333; line-height: 1.6;">
                  Kami akan hubungi anda semula dalam masa <b>1-2 hari bekerja</b> jika perlu.
                </p>
              </div>

              <div style="text-align: center; margin-bottom: 24px;">
                <a href="https://wa.me/60172131814" style="display: inline-block; background: #111; color: #fff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px;">
                  💬 Hubungi Kami di WhatsApp
                </a>
              </div>

              <div style="border-top: 1px solid #eee; padding-top: 20px; text-align: center;">
                <p style="color: #999; font-size: 12px; margin: 0 0 8px;">
                  Salam mesra,<br>
                  <b style="color: #333;">Pasukan hairiamri.buzz</b>
                </p>
                <p style="color: #999; font-size: 11px; margin: 12px 0 0;">
                  <a href="https://hairiamri.buzz" style="color: #0a7cff; text-decoration: none;">hairiamri.buzz</a> ·
                  <a href="https://wa.me/60172131814" style="color: #0a7cff; text-decoration: none;">WhatsApp</a>
                </p>
              </div>
            </div>
            <p style="text-align: center; color: #aaa; font-size: 11px; margin-top: 16px;">
              Email ini dihantar secara automatik. Jangan balas terus ke email ini.
            </p>
          </div>
        `
      })
    });

    if (!userRes.ok) {
      // Auto-reply fail tak stop flow — admin email dah sampai
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
