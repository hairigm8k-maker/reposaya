import { authenticate, json } from '../../_utils.js';

export async function onRequestPost({ request, env }) {
  const session = await authenticate(request, env);
  if (!session) return json({ ok: false, error: 'Unauthorized' }, 401);
  if (!env.AI) return json({ ok: false, error: 'AI binding not configured' }, 500);

  try {
    const body = await request.json();
    const topic = (body.topic || '').trim();
    const style = (body.style || 'modern minimalist').trim();
    const language = (body.language || 'en').trim();

    if (!topic) return json({ ok: false, error: 'Topic required' }, 400);
    if (topic.length > 300) return json({ ok: false, error: 'Topic too long (max 300)' }, 400);

    const langName = language === 'ms' ? 'Bahasa Melayu' : 'English';

    const system = `You are a copywriter. Output ONLY valid JSON. No markdown, no explanation, no code fences.

Produce content for a one-page website based on the user's topic. Language: ${langName}. Tone: ${style}.

Return JSON with EXACTLY this structure:
{
  "brand": "Brand or business name (2-3 words max)",
  "nav": ["Link 1", "Link 2", "Link 3", "Link 4"],
  "hero": {
    "eyebrow": "Small tagline above headline (3-6 words)",
    "headline": "Big bold headline (6-10 words, punchy)",
    "subheadline": "Supporting sentence (15-25 words)",
    "cta_primary": "Primary button text (2-3 words)",
    "cta_secondary": "Secondary button text (2-3 words)"
  },
  "features": [
    { "icon": "one-word-icon-name", "title": "Feature title (2-4 words)", "description": "Feature description (12-18 words)" },
    { "icon": "one-word-icon-name", "title": "Feature title (2-4 words)", "description": "Feature description (12-18 words)" },
    { "icon": "one-word-icon-name", "title": "Feature title (2-4 words)", "description": "Feature description (12-18 words)" }
  ],
  "stats": [
    { "value": "50+", "label": "Short label (2-3 words)" },
    { "value": "10k", "label": "Short label (2-3 words)" },
    { "value": "99%", "label": "Short label (2-3 words)" }
  ],
  "cta_section": {
    "headline": "Closing CTA headline (5-8 words)",
    "subheadline": "Supporting sentence (12-18 words)",
    "button": "Button text (2-3 words)"
  },
  "footer": {
    "tagline": "Short brand tagline (8-12 words)",
    "links": ["Link 1", "Link 2", "Link 3"],
    "copyright": "Copyright text"
  }
}

Icon names — pick from: "star", "zap", "heart", "shield", "rocket", "sparkles", "globe", "clock", "users", "award", "leaf", "coffee", "camera", "code", "book".

Output JSON only. No prefix, no suffix, no code fences.`;

    const user = `Topic: ${topic}

Generate content JSON.`;

    let result;
    try {
      result = await env.AI.run('@cf/meta/llama-3.3-70b-instruct-fp8-fast', {
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: user }
        ],
        max_tokens: 2000,
        temperature: 0.7
      });
    } catch (e1) {
      result = await env.AI.run('@cf/meta/llama-3.1-8b-instruct', {
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: user }
        ],
        max_tokens: 2000,
        temperature: 0.7
      });
    }

    let raw = (result && (result.response || result.output_text || '')) + '';
    raw = raw.trim();

    // Strip markdown fences
    raw = raw.replace(/^```json\s*/i, '').replace(/^```\s*/, '').replace(/```\s*$/, '').trim();

    // Find JSON object
    const start = raw.indexOf('{');
    const end = raw.lastIndexOf('}');
    if (start < 0 || end < 0) return json({ ok: false, error: 'AI returned invalid response. Try again.' }, 500);
    raw = raw.slice(start, end + 1);

    let data;
    try {
      data = JSON.parse(raw);
    } catch (e) {
      return json({ ok: false, error: 'AI returned invalid JSON. Try again.' }, 500);
    }

    // Validate structure
    if (!data.hero || !data.hero.headline) {
      return json({ ok: false, error: 'AI content incomplete. Try again.' }, 500);
    }

    return json({ ok: true, content: data });
  } catch (err) {
    return json({ ok: false, error: err.message || 'AI generation failed' }, 500);
  }
}
