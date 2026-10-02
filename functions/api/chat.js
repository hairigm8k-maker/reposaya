import { business } from './_data.js';

const MODEL = '@cf/meta/llama-3.1-8b-instruct';

function buildSystemPrompt(lang) {
  const b = business;
  const pkg = b.package;
  const includesList = pkg.includes.map(x => `- ${x}`).join('\n');
  const faqList = b.faq.map(f => `Q: ${f.q}\nA: ${f.a}`).join('\n\n');
  const processList = b.process.map((s, i) => `${i + 1}. ${s}`).join('\n');
  const reqList = b.requirements.map(x => `- ${x}`).join('\n');

  if (lang === 'en') {
    return `You are the AI customer service for ${b.name}, a ${b.service} based in ${b.region}.

RESPONSE STYLE:
- Friendly, professional, casual but not slangy
- Keep replies SHORT — 1-3 sentences max
- Use English (user wrote in English)
- No markdown headers; plain conversational text
- If user asks price, always mention RM99 and what's included briefly
- If user wants to order or asks custom questions, guide them to WhatsApp: ${b.whatsappLink}

BUSINESS INFO:
Package: ${pkg.name}
Price: ${pkg.price}
Delivery: ${pkg.delivery}
Includes:
${includesList}
Note: ${pkg.note}

Process:
${processList}

Client needs to provide:
${reqList}

FAQ:
${faqList}

HANDOFF:
- For orders, custom quotes, or complex requests → send to WhatsApp: ${b.whatsappLink}
- Contact: WhatsApp ${b.whatsapp} | Email: ${b.email}
- If you don't know, say so politely and redirect to WhatsApp.
Never invent prices, features, or promises not listed above.`;
  }

  return `Kau adalah AI customer service untuk ${b.name}, iaitu ${b.service} di ${b.region}.

GAYA JAWAPAN:
- Mesra, profesional, santai tapi bukan slanga
- Jawapan PENDEK — 1-3 ayat max
- Guna Bahasa Melayu
- Jangan guna markdown header; plain text perbualan
- Kalau user tanya harga, sebut RM99 dan ringkasan apa included
- Kalau user nak order atau tanya custom, arahkan ke WhatsApp: ${b.whatsappLink}

MAKLUMAT BISNES:
Pakej: ${pkg.name}
Harga: ${pkg.price}
Tempoh siap: ${pkg.delivery}
Termasuk:
${includesList}
Nota: ${pkg.note}

Proses:
${processList}

Client perlu beri:
${reqList}

FAQ:
${faqList}

HANDOFF:
- Untuk order, quote custom, atau pertanyaan kompleks → arah ke WhatsApp: ${b.whatsappLink}
- Contact: WhatsApp ${b.whatsapp} | Email: ${b.email}
- Kalau tak tahu jawapan, cakap sopan dan arahkan ke WhatsApp.
Jangan reka harga, servis, atau janji yang tak dinyatakan.`;
}

export async function onRequestPost(context) {
  const { request, env } = context;
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };

  try {
    const body = await request.json();
    const message = (body.message || '').toString().trim().slice(0, 1000);
    const history = Array.isArray(body.history) ? body.history.slice(-6) : [];
    const lang = body.lang === 'en' ? 'en' : 'bm';

    if (!message) {
      return new Response(JSON.stringify({ error: 'Message required' }), {
        status: 400, headers: corsHeaders
      });
    }

    const detectedLang = /^(hi|hello|hey|how|what|can|do|is|are|i want|i need|price|cost)/i.test(message)
      ? 'en' : lang;

    const messages = [
      { role: 'system', content: buildSystemPrompt(detectedLang) },
      ...history.filter(h => h && h.role && h.content).map(h => ({
        role: h.role === 'assistant' ? 'assistant' : 'user',
        content: String(h.content).slice(0, 500)
      })),
      { role: 'user', content: message }
    ];

    const aiResponse = await env.AI.run(MODEL, {
      messages,
      max_tokens: 300,
      temperature: 0.6
    });

    const reply = (aiResponse.response || '').trim() ||
      (detectedLang === 'en'
        ? `Sorry, I couldn't respond right now. Please WhatsApp us at ${business.whatsappLink}`
        : `Maaf, saya tak dapat respond sekarang. Sila WhatsApp kami di ${business.whatsappLink}`);

    return new Response(JSON.stringify({ reply, lang: detectedLang }), {
      headers: corsHeaders
    });
  } catch (err) {
    return new Response(JSON.stringify({
      reply: `Maaf, ada masalah teknikal. Sila WhatsApp kami di ${business.whatsappLink}`,
      error: err.message
    }), { status: 200, headers: corsHeaders });
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
