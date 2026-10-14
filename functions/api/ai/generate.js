import { authenticate, json } from '../../_utils.js';

export async function onRequestPost({ request, env }) {
  const session = await authenticate(request, env);
  if (!session) return json({ ok: false, error: 'Unauthorized' }, 401);

  if (!env.AI) return json({ ok: false, error: 'AI binding not configured' }, 500);

  try {
    const body = await request.json();
    const topic = (body.topic || '').trim();
    const style = (body.style || 'modern').trim();
    const language = (body.language || 'en').trim();

    if (!topic) return json({ ok: false, error: 'Topic required' }, 400);
    if (topic.length > 300) return json({ ok: false, error: 'Topic too long (max 300)' }, 400);

    const langName = language === 'ms' ? 'Bahasa Melayu' : 'English';

    const systemPrompt = 'You are an expert web designer. Output ONLY valid, complete HTML code. Include inline CSS in a <style> tag. No explanations, no markdown, no code fences. Start with <!DOCTYPE html>. The HTML must be fully self-contained and mobile-responsive.';

    const userPrompt = 'Create a complete single-page website for: ' + topic + '. Style: ' + style + '. Language: ' + langName + '. Include a hero section, features/benefits, and a footer. Use modern typography (Inter or system fonts), smooth spacing, and a cohesive color palette. Return ONLY the full HTML document starting with <!DOCTYPE html>.';

    let result;
    try {
      result = await env.AI.run('@cf/meta/llama-3.1-8b-instruct', {
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: 4096,
        temperature: 0.7
      });
    } catch (e1) {
      // Fallback ke Mistral kalau Llama fail
      result = await env.AI.run('@cf/mistral/mistral-7b-instruct-v0.2', {
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: 4096,
        temperature: 0.7
      });
    }

    let html = (result && (result.response || result.output_text || '')) + '';
    html = html.trim();

    // Bersihkan markdown fences kalau ada
    html = html.replace(/^```html\s*/i, '').replace(/^```\s*/, '').replace(/```\s*$/, '').trim();

    // Kalau takde DOCTYPE, prepend
    if (html && html.indexOf('<!DOCTYPE') < 0 && html.indexOf('<html') < 0) {
      html = '<!DOCTYPE html>\n<html lang="' + language + '">\n<head>\n<meta charset="UTF-8">\n<meta name="viewport" content="width=device-width,initial-scale=1.0">\n</head>\n<body>\n' + html + '\n</body>\n</html>';
    }

    if (!html) return json({ ok: false, error: 'AI returned empty response. Try again.' }, 500);

    return json({ ok: true, html: html });
  } catch (err) {
    return json({ ok: false, error: err.message || 'AI generation failed' }, 500);
  }
}
