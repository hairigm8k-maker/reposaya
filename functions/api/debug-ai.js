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

    const systemPrompt = `Kau adalah AI Debug Assistant untuk projek hairiamri.buzz.

PROJECT:
- Cloudflare Pages + Functions
- Frontend: HTML + vanilla JS + CSS
- Backend: Cloudflare Workers AI (binding: AI)
- Model: @cf/meta/llama-3.1-8b-instruct-fast
- Email: Resend API (feedback@hairiamri.buzz)
- Hosting: Cloudflare Pages (auto-deploy from GitHub main)
- Dev: Termux on Android (wrangler TAK jalan)

FILES UTAMA:
- functions/api/chat.js - AI CS backend (Herry)
- functions/api/send-email.js - single email
- functions/api/generate-email.js - AI generate email
- functions/api/feedback.js - feedback form
- assets/ai-chat.js - CS widget frontend
- assets/ai-chat.css - CS widget styles
- index.html - main website
- h/a/i/r/i/index.html - mailer tool
- _headers - security headers

COMMON BUGS:
1. env.AI undefined - binding AI tak setup
2. Model deprecated - guna llama-3.1-8b-instruct-fast
3. JSON parse fail - robust parsing
4. Keyboard auto-naik - input.focus() mobile
5. CORS error - header tak complete
6. 401 Unauthorized - token salah
7. Resend 403 - domain tak verified
8. Function tak deploy - git push, tunggu 1-2 min
9. Cache issue - hard refresh / incognito
10. Button tak function - JS error (check console)

CARA JAWAB:
1. Tanya soalan diagnostic kalau info kurang
2. Terangkan apa jadi & kenapa
3. Bagi fix step-by-step dengan command copy-paste
4. Bagi cara verify fix berjaya

STYLE:
- Bahasa Melayu santai tapi tepat
- Command dalam code block
- Kalau tak tahu, cakap tak tahu

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
      messages, max_tokens: 1200, temperature: 0.5
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
