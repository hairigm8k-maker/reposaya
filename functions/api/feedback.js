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

    // Email ke admin
    const emailRes = await fetch('https://api.resend.com/emails', {
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
        html: `<h2>Feedback Baru</h2><p><b>Nama:</b> ${esc(name)}</p><p><b>Email:</b> ${esc(email)}</p><p><b>Mesej:</b></p><p style="white-space:pre-wrap">${esc(message)}</p>`
      })
    });

    if (!emailRes.ok) {
      const errData = await emailRes.json();
      console.error('Resend error:', errData);
      return new Response(JSON.stringify({ ok: false, message: 'Gagal hantar email' }), { status: 500, headers: corsHeaders });
    }

    // Auto-reply ke user
    fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [email],
        subject: 'Terima kasih atas feedback anda 🌸',
        html: `<p>Terima kasih, ${esc(name)}! 🌸</p><p>Kami telah menerima feedback anda dan amat menghargainya.</p><p>Salam mesra,<br><b>hairiamri.buzz</b></p>`
      })
    }).catch(e => console.error('Auto-reply failed:', e));

    return new Response(JSON.stringify({ ok: true, message: 'Feedback dihantar' }), { headers: corsHeaders });

  } catch (err) {
    console.error('Feedback error:', err);
    return new Response(JSON.stringify({ ok: false, message: 'Ralat sambungan. Cuba lagi.' }), { status: 500, headers: corsHeaders });
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
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
