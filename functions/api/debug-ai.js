export async function onRequestPost({ request, env }) {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json'
  };

  try {
    const { message, context, history } = await request.json();
    if (!message) {
      return new Response(JSON.stringify({ ok: false, error: 'Message required' }), { status: 400, headers: corsHeaders });
    }

    const systemPrompt = `Kau adalah Debug AI untuk projek hairiamri.buzz (Cloudflare Pages + Workers AI + Resend).

PROJECT CONTEXT:
- Cloudflare Pages + Functions
- AI model: @cf/meta/llama-3.1-8b-instruct-fast (binding: AI)
- Email: Resend API (feedback@hairiamri.buzz)
- Files: functions/api/chat.js, send-email.js, generate-email.js, feedback.js
- Frontend: assets/ai-chat.js, index.html, h/a/i/r/i/index.html
- Dev: Termux on Android (wrangler TAK jalan)

BUG PALING KERAP:
1. env.AI undefined → binding tak setup
2. Model deprecated → guna llama-3.1-8b-instruct-fast
3. JSON parse fail → robust parsing
4. Keyboard auto-naik mobile → buang input.focus()
5. CORS → check headers
6. 401 → token salah
7. Resend 403 → domain tak verified
8. Tak deploy → git push + tunggu 1-2 min
9. Cache stale → hard refresh / incognito
10. Button tak function → JS error (check console)

STYLE JAWAPAN (PENTING):
- Mesra, santai, macam kawan yang tolong debug
- PENDEK — max 4-6 baris per reply
- JANGAN dump semua kemungkinan — tanya SATU soalan diagnostic dulu
- Tunggu user jawab, baru bagi fix specific
- Kalau bagi command, letak dalam code block
- Guna emoji sesekali (🔍 ✅ ❌)

ALURAN:
1. User describe bug → tanya 1-2 soalan diagnostic
2. Dapat jawapan → bagi root cause + 1 fix
3. User test → kalau ok, selesai. Kalau tak, next fix

${context ? '\nCONTEXT USER:\n' + context : ''}`;

    const messages = [
      { role: 'system', content: systemPrompt },
      ...(Array.isArray(history) ? history.slice(-6).map(h => ({
        role: h.role === 'assistant' ? 'assistant' : 'user',
        content: String(h.content || '').slice(0, 800)
      })) : []),
      { role: 'user', content: message }
    ];

    const response = await env.AI.run('@cf/meta/llama-3.1-8b-instruct-fast', {
      messages, max_tokens: 400, temperature: 0.5
    });

    let reply = '';
    if (typeof response === 'string') reply = response;
    else if (response && response.response) reply = String(response.response);
    else reply = JSON.stringify(response);

    return new Response(JSON.stringify({ ok: true, reply: reply.trim() }), { headers: corsHeaders });
  } catch (err) {
    return new Response(JSON.stringify({ ok: false, error: err.message }), { status: 500, headers: corsHeaders });
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
