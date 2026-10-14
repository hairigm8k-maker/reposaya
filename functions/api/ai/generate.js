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

    const system = `You are a senior UI designer who writes production-quality HTML+CSS. You output ONLY raw HTML (no markdown, no code fences, no explanation). Start with <!DOCTYPE html>.

DESIGN SYSTEM — follow exactly:
- Fonts: Use system font stack: font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Inter, Roboto, sans-serif
- Headings: font-weight 700-800, tight letter-spacing (-0.02em), large sizes (48-72px hero, 32-40px section, 20-24px card)
- Body: 16-17px, line-height 1.6, color #4b5563 on light bg
- Layout: Use CSS Grid and Flexbox. Never use tables for layout.
- Spacing: Generous. Sections min padding 80px top/bottom. Cards padding 32px.
- Border radius: Cards 16px, buttons 9999px (pill), inputs 10px
- Shadows: Soft. box-shadow: 0 4px 20px rgba(0,0,0,0.08)
- Responsive: Mobile-first with @media queries at 768px
- Container: max-width 1200px, margin auto, padding 0 24px

STYLE GUIDE for "${style}":
${style.includes('dark') ? '- Dark theme: bg #0a0a0a, cards #141414, text #f5f5f5, muted #9ca3af, accent should pop' : ''}
${style.includes('bold') || style.includes('colorful') ? '- Vibrant: bold color blocks, gradient hero, playful shapes, thick borders' : ''}
${style.includes('elegant') || style.includes('editorial') ? '- Editorial: serif headings (Georgia or Playfair Display), high contrast, refined spacing' : ''}
${style.includes('minimal') ? '- Minimalist: lots of whitespace, monochrome + 1 accent color, thin borders, no gradients' : ''}
${style.includes('playful') ? '- Playful: rounded shapes, warm colors, friendly emoji-friendly, bouncy interactions' : ''}
${style.includes('corporate') ? '- Corporate: trust-building blues, structured grid, professional, credible' : ''}

STRUCTURE — build these sections:
1. Sticky nav bar (logo left, 3-5 menu links center/right, CTA button right)
2. Hero section (big headline, subtext, 2 CTA buttons, visual element on side or below)
3. Features / benefits (3-4 cards in grid with icon, title, description)
4. Social proof or stats section
5. Call-to-action section (bold, centered, with button)
6. Footer (3-4 columns: brand, links, social, copyright)

ICONS: Use inline SVG (stroke-based, 1.5-2 stroke-width, currentColor). No external icon libraries, no emoji in production sections.

INTERACTIONS: Add hover states (transform, color shift, shadow) and smooth transitions (transition: all 0.2s).

OUTPUT: Complete HTML document. All CSS inline in <style> tag in head. No external resources. Language: ${langName}.`;

    const user = `Create a beautiful, production-quality single-page website for: ${topic}

Return ONLY the complete HTML document starting with <!DOCTYPE html>. No explanations. No markdown fences. Just raw HTML.`;

    let result;
    try {
      result = await env.AI.run('@cf/meta/llama-3.3-70b-instruct-fp8-fast', {
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: user }
        ],
        max_tokens: 4096,
        temperature: 0.6
      });
    } catch (e1) {
      result = await env.AI.run('@cf/meta/llama-3.1-8b-instruct', {
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: user }
        ],
        max_tokens: 4096,
        temperature: 0.6
      });
    }

    let html = (result && (result.response || result.output_text || '')) + '';
    html = html.trim();
    html = html.replace(/^```html\s*/i, '').replace(/^```\s*/, '').replace(/```\s*$/, '').trim();

    const doctypeIdx = html.indexOf('<!DOCTYPE');
    const htmlIdx = html.indexOf('<html');
    if (doctypeIdx > 0) html = html.slice(doctypeIdx);
    else if (htmlIdx > 0) html = html.slice(htmlIdx);

    if (html && html.indexOf('<html') < 0) {
      html = '<!DOCTYPE html>\n<html lang="' + language + '">\n<head>\n<meta charset="UTF-8">\n<meta name="viewport" content="width=device-width,initial-scale=1.0">\n</head>\n<body>\n' + html + '\n</body>\n</html>';
    }

    if (!html) return json({ ok: false, error: 'AI returned empty response. Try again.' }, 500);

    return json({ ok: true, html: html });
  } catch (err) {
    return json({ ok: false, error: err.message || 'AI generation failed' }, 500);
  }
}
