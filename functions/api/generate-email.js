export async function onRequestPost({ request, env }) {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json'
  };

  try {
    const token = request.headers.get('X-Admin-Token');
    if (!env.ADMIN_EMAIL_TOKEN || token !== env.ADMIN_EMAIL_TOKEN) {
      return new Response(JSON.stringify({ ok: false, error: 'Unauthorized' }), {
        status: 401, headers: corsHeaders
      });
    }

    const { prompt, tone } = await request.json();
    if (!prompt) {
      return new Response(JSON.stringify({ ok: false, error: 'Prompt required' }), {
        status: 400, headers: corsHeaders
      });
    }

    const toneLabel = tone || 'friendly, professional, warm';

    const systemPrompt = `You are a professional email copywriter for a Malaysian business.

TONE: ${toneLabel}
LANGUAGE: Auto-detect from user prompt (English or Bahasa Melayu)

Generate email content with this EXACT JSON structure:
{
  "subject": "Short catchy subject line (max 60 chars)",
  "headline": "Big greeting headline (max 8 words) e.g. 'Terima kasih, Ahmad!'",
  "subheadline": "Small subtitle under headline (max 12 words)",
  "greeting": "1 sentence personal greeting",
  "paragraphs": ["Paragraph 1 text", "Paragraph 2 text"],
  "highlight_label": "Label for highlight box e.g. 'Pakej' or 'Order'",
  "highlight_value": "Value for highlight box e.g. 'RM99' or '{harga}'",
  "cta_text": "Button text (max 5 words)",
  "cta_url": "https://wa.me/60172131814",
  "closing": "Friendly closing sentence"
}

RULES:
- Reply ONLY with valid JSON, no other text
- paragraphs: 2-3 short paragraphs, plain text only (no HTML, no markdown)
- Use {nama} for name placeholder, {harga} for price placeholder
- Keep sentences short and warm
- Use max 2 emoji total

Example output:
{
  "subject": "Terima kasih, {nama}! 🌸",
  "headline": "Terima kasih, {nama}!",
  "subheadline": "Kami amat menghargai kepercayaan anda",
  "greeting": "Hai {nama}, terima kasih kerana memilih kami.",
  "paragraphs": ["Kami teruja untuk mula bekerja pada projek anda.", "Pasukan kami akan menghubungi anda dalam masa 1-2 hari bekerja."],
  "highlight_label": "Pakej",
  "highlight_value": "{harga}",
  "cta_text": "Hubungi Kami",
  "cta_url": "https://wa.me/60172131814",
  "closing": "Kalau ada apa-apa soalan, jangan segan hubungi kami."
}`;

    const response = await env.AI.run('@cf/meta/llama-3.1-8b-instruct-fast', {
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt }
      ],
      max_tokens: 800,
      temperature: 0.7
    });

    const rawText = (response.response || '').trim();

    // Robust JSON parsing
    let parsed = null;
    try {
      parsed = JSON.parse(rawText);
    } catch (e) {
      const match = rawText.match(/\{[\s\S]*\}/);
      if (match) {
        try { parsed = JSON.parse(match[0]); } catch (e2) {}
      }
    }

    if (!parsed || !parsed.subject || !parsed.headline) {
      return new Response(JSON.stringify({
        ok: false,
        error: 'AI output tak lengkap',
        raw: rawText.slice(0, 300)
      }), { status: 500, headers: corsHeaders });
    }

    // Build HTML template dengan content dari AI
    const html = buildEmailHTML(parsed);

    return new Response(JSON.stringify({
      ok: true,
      subject: parsed.subject,
      body: html
    }), { headers: corsHeaders });

  } catch (err) {
    return new Response(JSON.stringify({
      ok: false,
      error: err.message
    }), { status: 500, headers: corsHeaders });
  }
}

function buildEmailHTML(d) {
  const paragraphs = (d.paragraphs || []).map(p => 
    `<p style="margin:0 0 16px;color:#3d3d3a;font-size:15px;line-height:1.7;">${escapeHtml(p)}</p>`
  ).join('');

  const highlightBox = d.highlight_label && d.highlight_value ? `
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#faf9f5;border-radius:12px;border:1px solid #e6dfd8;margin:24px 0;">
      <tr>
        <td style="padding:20px;">
          <table width="100%">
            <tr>
              <td style="color:#6c6a64;font-size:11px;font-weight:600;letter-spacing:1.5px;text-transform:uppercase;">${escapeHtml(d.highlight_label)}</td>
              <td align="right" style="color:#141413;font-size:16px;font-weight:700;">${escapeHtml(d.highlight_value)}</td>
            </tr>
          </table>
        </td>
      </tr>
    </table>` : '';

  const ctaBox = d.cta_text ? `
    <table width="100%" cellpadding="0" cellspacing="0" style="margin:28px 0 24px;">
      <tr>
        <td align="center">
          <a href="${escapeAttr(d.cta_url || 'https://hairiamri.buzz')}" style="display:inline-block;background:#cc785c;color:#ffffff;padding:15px 36px;border-radius:10px;text-decoration:none;font-weight:600;font-size:14px;letter-spacing:.3px;">${escapeHtml(d.cta_text)}</a>
        </td>
      </tr>
    </table>` : '';

  const closing = d.closing ? `
    <p style="margin:0;color:#8e8b82;font-size:13px;line-height:1.6;text-align:center;">${escapeHtml(d.closing)}</p>` : '';

  return `<table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f0e8;padding:40px 16px;font-family:-apple-system,'Segoe UI',Roboto,sans-serif;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

  <tr>
    <td style="background:#faf9f5;border-radius:20px 20px 0 0;padding:48px 40px 40px;text-align:center;border-bottom:1px solid #e6dfd8;">
      <img src="https://hairiamri.buzz/assets/logoUtama/logoUtama.png" alt="" width="52" height="52" style="border-radius:14px;display:block;margin:0 auto 24px;background:#fff;padding:4px;box-shadow:0 4px 12px rgba(204,120,92,0.15);">
      <h1 style="margin:0 0 12px;color:#141413;font-family:'Cormorant Garamond',Georgia,serif;font-size:32px;font-weight:500;letter-spacing:-0.5px;line-height:1.2;">${escapeHtml(d.headline)}</h1>
      <p style="margin:0;color:#6c6a64;font-size:14px;line-height:1.6;">${escapeHtml(d.subheadline || '')}</p>
    </td>
  </tr>

  <tr>
    <td style="background:#ffffff;padding:40px;">
      <p style="margin:0 0 20px;color:#3d3d3a;font-size:15px;line-height:1.7;">${escapeHtml(d.greeting || '')}</p>
      ${paragraphs}
      ${highlightBox}
      ${ctaBox}
      ${closing}
    </td>
  </tr>

  <tr>
    <td style="background:#faf9f5;border-radius:0 0 20px 20px;padding:32px 40px;text-align:center;border-top:1px solid #e6dfd8;">
      <p style="margin:0 0 6px;color:#141413;font-family:'Cormorant Garamond',Georgia,serif;font-size:20px;font-weight:500;letter-spacing:-0.3px;">hairiamri.buzz</p>
      <p style="margin:0 0 20px;color:#8e8b82;font-size:12px;line-height:1.5;">Servis buat landing page murah untuk bisnes kecil</p>
      <p style="margin:0 0 20px;">
        <a href="https://hairiamri.buzz" style="color:#cc785c;text-decoration:none;font-size:12px;font-weight:500;margin:0 10px;">Website</a>
        <span style="color:#e6dfd8;">·</span>
        <a href="https://wa.me/60172131814" style="color:#cc785c;text-decoration:none;font-size:12px;font-weight:500;margin:0 10px;">WhatsApp</a>
      </p>
      <p style="margin:0;color:#8e8b82;font-size:11px;line-height:1.5;">{tarikh}, {masa}</p>
    </td>
  </tr>

</table>
</td></tr>
</table>`;
}

function escapeHtml(s) {
  return String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
function escapeAttr(s) {
  return String(s || '').replace(/"/g, '&quot;');
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
