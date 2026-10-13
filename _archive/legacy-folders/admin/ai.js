// ============================================
// ADMIN — AI Helper Functions
// ============================================

const AI_WORKER_URL = 'https://hairiamri-ai.hairigm8k.workers.dev';

export async function aiGenerate({ prompt, system, model, max_tokens, temperature }) {
  const res = await fetch(AI_WORKER_URL + '/ai/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, system, model, max_tokens, temperature })
  });

  const data = await res.json();
  if (!data.ok) throw new Error(data.error || 'AI error');
  return data.text;
}

// ============================================
// ARTICLE WRITER
// ============================================
export async function generateArticle({ topic, lang = 'bm', tone = 'professional' }) {
  const systemPrompt = lang === 'en'
    ? `You are a professional content writer for hairiamri.buzz, a Malaysian landing page service. Write in English. Style: ${tone}, clear, helpful, SEO-friendly. Output only HTML (use <p>, <h2>, <h3>, <ul>, <li>, <strong>). No markdown, no code fences.`
    : `Anda penulis kandungan profesional untuk hairiamri.buzz, servis landing page Malaysia. Tulis dalam Bahasa Melayu. Gaya: ${tone}, jelas, membantu, mesra SEO. Output HTML sahaja (guna <p>, <h2>, <h3>, <ul>, <li>, <strong>). Jangan guna markdown atau code fence.`;

  const userPrompt = lang === 'en'
    ? `Write a blog article about: "${topic}".

Structure:
- Opening paragraph (relatable hook)
- 3-4 H2 sections with helpful content
- Conclusion with call-to-action (WhatsApp RM99 landing page)

Target: 800-1200 words. Output only the HTML body content (no <html>, <head>, <body> tags).`
    : `Tulis artikel blog tentang: "${topic}".

Struktur:
- Perenggan pembuka (hook relatable)
- 3-4 bahagian H2 dengan kandungan membantu
- Kesimpulan dengan call-to-action (WhatsApp landing page RM99)

Sasaran: 800-1200 patah perkataan. Output kandungan HTML body sahaja (tanpa tag <html>, <head>, <body>).`;

  return await aiGenerate({
    prompt: userPrompt,
    system: systemPrompt,
    max_tokens: 3000,
    temperature: 0.7
  });
}

// ============================================
// SEO HELPER
// ============================================
export async function generateSEO({ title, content, lang = 'bm' }) {
  const systemPrompt = lang === 'en'
    ? 'You are an SEO expert. Output only JSON, no markdown.'
    : 'Anda pakar SEO. Output JSON sahaja, tiada markdown.';

  const userPrompt = lang === 'en'
    ? `Based on this article, generate SEO metadata.

Title: ${title}
Content: ${content.substring(0, 2000)}

Output JSON format:
{
  "metaDescription": "150-160 chars description",
  "keywords": "comma, separated, keywords",
  "slug": "url-friendly-slug"
}`
    : `Berdasarkan artikel ini, jana metadata SEO.

Tajuk: ${title}
Kandungan: ${content.substring(0, 2000)}

Output format JSON:
{
  "metaDescription": "Description 150-160 aksara",
  "keywords": "kata kunci, dipisah, koma",
  "slug": "slug-mesra-url"
}`;

  const raw = await aiGenerate({
    prompt: userPrompt,
    system: systemPrompt,
    max_tokens: 500,
    temperature: 0.5
  });

  // Clean JSON (buang ```json ... ``` kalau ada)
  const cleaned = raw.replace(/```json\s*|\s*```/g, '').trim();
  return JSON.parse(cleaned);
}

// ============================================
// IMPROVE TEXT
// ============================================
export async function improveText({ text, lang = 'bm', instruction = 'improve' }) {
  const systemPrompt = lang === 'en'
    ? 'You are an editor. Improve text clarity, grammar, and flow. Keep same meaning and HTML tags. Output only the improved HTML.'
    : 'Anda editor. Baiki kejelasan, tatabahasa dan aliran teks. Kekalkan makna dan tag HTML. Output HTML yang dibaiki sahaja.';

  const inst = instruction === 'shorten'
    ? (lang === 'en' ? 'Make it shorter and punchier.' : 'Pendekkan dan jadikan lebih padat.')
    : instruction === 'expand'
    ? (lang === 'en' ? 'Expand with more details and examples.' : 'Panjangkan dengan lebih banyak detail dan contoh.')
    : (lang === 'en' ? 'Improve overall quality.' : 'Baiki kualiti keseluruhan.');

  return await aiGenerate({
    prompt: `${inst}\n\nText:\n${text}`,
    system: systemPrompt,
    max_tokens: 3000,
    temperature: 0.6
  });
}

// ============================================
// SUGGEST TITLES
// ============================================
export async function suggestTitles({ topic, lang = 'bm' }) {
  const systemPrompt = lang === 'en'
    ? 'Output only a numbered list of 5 titles. No extra text.'
    : 'Output senarai bernombor 5 tajuk sahaja. Tiada teks tambahan.';

  const userPrompt = lang === 'en'
    ? `Suggest 5 catchy SEO blog titles about: "${topic}"`
    : `Cadang 5 tajuk blog SEO menarik tentang: "${topic}"`;

  const raw = await aiGenerate({
    prompt: userPrompt,
    system: systemPrompt,
    max_tokens: 400,
    temperature: 0.8
  });

  return raw.split('\n').map(l => l.replace(/^\d+[\.\)]\s*/, '').trim()).filter(Boolean).slice(0, 5);
}
