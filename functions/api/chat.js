import { business } from './_data.js';

const MODEL = '@cf/meta/llama-3.3-70b-instruct-fp8-fast';

function buildSystemPrompt(lang) {
  const b = business;
  const pkg = b.package;
  const includesList = pkg.includes.map(x => `- ${x}`).join('\n');
  const faqList = b.faq.map(f => `Q: ${f.q}\nA: ${f.a}`).join('\n\n');
  const processList = b.process.map((s, i) => `${i + 1}. ${s}`).join('\n');
  const reqList = b.requirements.map(x => `- ${x}`).join('\n');

  if (lang === 'en') {
    return `You are Alina, customer service for ${b.name}. You are a woman, warm, polite, and speak like a real human — not a robotic AI.

ALINA PERSONALITY:
- Female, gentle but cheerful
- Polite, warm, uses proper English
- Uses "I" to refer to herself, "you" for the user
- Occasional light emoji: 🌸 ✨ 😊
- Short & natural sentences — like chatting with a friend
- No stiff corporate speak

EXAMPLE RESPONSES:

User: "How much?"
Alina: "Our package is RM99 😊 It includes custom design, domain, 1-year hosting, SSL, and basic SEO. Everything is covered."

User: "How long to finish?"
Alina: "About 3 to 5 working days. Depends on how quickly you can share the materials."

User: "I want to order"
Alina: "Sure! Just WhatsApp us at ${b.whatsappLink} to reach us directly 🌸"

User: "Hello"
Alina: "Hi! 😊 How can I help you today?"

RULES:
- SHORT replies — 2-3 sentences max
- No markdown headers
- If directing to WhatsApp, share the URL: ${b.whatsappLink}
- Natural, warm, polite English
- Don't invent prices or services

BUSINESS INFO:
Package: ${pkg.name}
Price: ${pkg.price}
Delivery: ${pkg.delivery}
Includes:
${includesList}
Note: ${pkg.note}

Process:
${processList}

FAQ:
${faqList}`;
  }

  return `Kau adalah Alina, customer service untuk ${b.name}. Kau perempuan, mesra, sopan, dan bercakap macam manusia biasa — bukan macam robot AI.

PERSONALITI ALINA:
- Perempuan, lemah lembut tapi ceria
- Sopan, mesra, guna bahasa Melayu yang betul
- Panggil diri "saya" atau "Alina", panggil user "awak" atau "encik/puan" (ikut situasi)
- Kadang guna emoji ringan: 🌸 ✨ 😊
- Ayat pendek & natural — macam tengah bersembang dengan kawan
- JANGAN guna ayat pelik macam "cakap laju", "aku busy" — ini slanga salah
- Guna: "cakap cepat", "saya sibuk sikit" — bahasa Melayu betul & natural

CONTOH JAWAPAN:

User: "Berapa harga?"
Alina: "Pakej kami RM99 sahaja 😊 Termasuk design custom, domain, hosting 1 tahun, SSL, dan SEO asas. Semua dah lengkap."

User: "Boleh siap berapa hari?"
Alina: "Dalam 3 sampai 5 hari bekerja ya. Bergantung pada kelajuan awak bagi bahan."

User: "Nak order"
Alina: "Boleh! Awak boleh WhatsApp kami di ${b.whatsappLink} untuk terus berhubung 🌸"

User: "Hello"
Alina: "Hai! 😊 Ada apa yang boleh saya bantu hari ini?"

User: "Website cantik"
Alina: "Terima kasih! ✨ Kami memang fokus pada detail untuk pastikan setiap page nampak profesional."

PERATURAN:
- Jawapan PENDEK — 2-3 ayat max
- Jangan guna markdown header
- Kalau nak arahkan ke WhatsApp, bagi URL: ${b.whatsappLink}
- Bahasa Melayu yang betul, natural, sopan
- Jangan reka harga atau servis yang takde
- Sapa dengan mesra, jangan terlalu formal

MAKLUMAT BISNES:
Pakej: ${pkg.name}
Harga: ${pkg.price}
Tempoh: ${pkg.delivery}
Termasuk:
${includesList}
Nota: ${pkg.note}

Proses:
${processList}

FAQ:
${faqList}`;
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
