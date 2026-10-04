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

    const { prompt, tone, type } = await request.json();

    if (!prompt) {
      return new Response(JSON.stringify({ ok: false, error: 'Prompt required' }), {
        status: 400, headers: corsHeaders
      });
    }

    const toneLabel = tone || 'friendly, professional, warm';
    const typeLabel = type || 'customer email';

    const systemPrompt = `Kau adalah copywriter profesional untuk bisnes Malaysia. Kau tulis email marketing yang convert + personal.

GAYA:
- ${toneLabel}
- Bahasa Melayu (kecuali diminta English)
- Sopan, mesra, tapi tak berlebihan
- Emoji sesekali (max 2-3 per email)
- Panjang sederhana (3-5 paragraph)

FORMAT OUTPUT (WAJIB JSON):
{
  "subject": "Subject line email (max 60 karakter)",
  "body": "Full HTML email body menggunakan table layout, inline CSS, max-width 600px, font-family system, warna clean (background putih, text #222, CTA hitam #111 atau coral #cc785c). Guna placeholder {nama} dan {harga} bila sesuai."
}

ATURAN HTML:
- WAJIB guna <table> untuk layout (email-safe)
- Inline CSS sahaja (jangan guna <style> tag)
- Max-width 600px
- Font: -apple-system, 'Segoe UI', Roboto, sans-serif
- Background page: #f4f4f5
- Card putih dengan border-radius 12-16px
- Padding generous (32px)
- Button CTA dengan background color + border-radius + text putih
- Jangan guna flexbox/grid (tak support dalam email)

Jenis email: ${typeLabel}
Prompt user: ${prompt}

Reply dengan JSON sahaja. Jangan ada text lain.`;

    const response = await env.AI.run('@cf/meta/llama-3.1-8b-instruct-fast', {
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Generate email: ${prompt}` }
      ],
      max_tokens: 1500,
      temperature: 0.7
    });

    const rawText = (response.response || '').trim();

    // Parse JSON
    let parsed = null;
    try {
      parsed = JSON.parse(rawText);
    } catch (e) {
      const match = rawText.match(/\{[\s\S]*\}/);
      if (match) {
        try { parsed = JSON.parse(match[0]); } catch (e2) {}
      }
    }

    if (!parsed || !parsed.body) {
      return new Response(JSON.stringify({
        ok: false,
        error: 'AI gagal generate format betul',
        raw: rawText.slice(0, 500)
      }), { status: 500, headers: corsHeaders });
    }

    return new Response(JSON.stringify({
      ok: true,
      subject: parsed.subject || '',
      body: parsed.body || ''
    }), { headers: corsHeaders });

  } catch (err) {
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
