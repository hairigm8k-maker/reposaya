export async function onRequestPost({ request, env }) {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json'
  };

  try {
    // Auth check
    const token = request.headers.get('X-Admin-Token');
    if (!env.ADMIN_EMAIL_TOKEN || token !== env.ADMIN_EMAIL_TOKEN) {
      return new Response(JSON.stringify({ ok: false, error: 'Unauthorized' }), {
        status: 401, headers: corsHeaders
      });
    }

    const { to, subject, body, html, replyTo, cc } = await request.json();

    if (!to || !subject || !body) {
      return new Response(JSON.stringify({ ok: false, error: 'to, subject, body required' }), {
        status: 400, headers: corsHeaders
      });
    }

    if (!env.RESEND_API_KEY) {
      return new Response(JSON.stringify({ ok: false, error: 'RESEND_API_KEY not set' }), {
        status: 500, headers: corsHeaders
      });
    }

    const fromEmail = env.RESEND_FROM || 'feedback@hairiamri.buzz';
    const recipients = Array.isArray(to) ? to : to.split(',').map(s => s.trim()).filter(Boolean);

    const payload = {
      from: `hairiamri.buzz <${fromEmail}>`,
      to: recipients,
      subject: subject,
      reply_to: replyTo || undefined,
      cc: cc ? (Array.isArray(cc) ? cc : cc.split(',').map(s => s.trim()).filter(Boolean)) : undefined
    };

    // Kalau html mode, hantar as html + plain text fallback
    if (html) {
      payload.html = body;
      payload.text = body.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
    } else {
      payload.text = body;
      payload.html = body.split('\n').map(line =>
        line.trim() === '' ? '<br>' : `<p style="margin:0 0 8px;">${escapeHtml(line)}</p>`
      ).join('');
    }

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const data = await res.json();

    if (!res.ok) {
      console.error('Resend error:', data);
      return new Response(JSON.stringify({
        ok: false,
        error: data.message || 'Resend failed',
        details: data
      }), { status: 500, headers: corsHeaders });
    }

    return new Response(JSON.stringify({
      ok: true,
      id: data.id,
      message: `Email dihantar ke ${recipients.join(', ')}`
    }), { headers: corsHeaders });

  } catch (err) {
    console.error('Send email error:', err);
    return new Response(JSON.stringify({
      ok: false,
      error: err.message
    }), { status: 500, headers: corsHeaders });
  }
}

export async function onRequestOptions() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Token'
    }
  });
}

function escapeHtml(s) {
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
