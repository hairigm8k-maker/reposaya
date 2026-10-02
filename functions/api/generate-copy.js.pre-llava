export async function onRequestPost({ request, env }) {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };

  try {
    const { imageBase64, lang, productType, tone } = await request.json();

    if (!imageBase64) {
      return new Response(JSON.stringify({ ok: false, error: 'Image required' }), {
        status: 400, headers: corsHeaders
      });
    }

    // Strip data URL prefix
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');

    // Base64 → Uint8Array
    const binaryString = atob(base64Data);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    const langLabel = lang === 'en' ? 'English' : 'Bahasa Melayu';
    const toneLabel = tone || 'friendly, professional';
    const type = productType || 'general product';

    const prompt = `You are a professional copywriter for a Malaysian business.
Analyze this ${type} image and generate marketing content.

IMPORTANT: Reply ONLY with valid JSON, no other text, no markdown code blocks.

Generate this JSON structure:
{
  "title": "catchy product/service name (5-10 words)",
  "description": "engaging description, 2-3 short paragraphs, benefits-focused",
  "tags": ["tag1", "tag2", "tag3", "tag4", "tag5"],
  "promo": "short social media caption with 1-2 emojis, ready to post",
  "price_suggestion": "suggested price range in Malaysian Ringgit (RM)",
  "target_audience": "who this is for (1 sentence)"
}

Language: ${langLabel}
Tone: ${toneLabel}
Context: ${type}

Reply with JSON only.`;

    const response = await env.AI.run(
      '@cf/llava-hf/llava-1.5-7b-hf',
      {
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: prompt },
              { type: 'image', image: Array.from(bytes) }
            ]
          }
        ],
        max_tokens: 900,
        temperature: 0.7
      }
    );

    const rawText = (response.response || '').trim();

    // Robust JSON parsing
    let parsed = null;
    try {
      // Try direct parse
      parsed = JSON.parse(rawText);
    } catch (e) {
      // Try extract JSON from text
      const jsonMatch = rawText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          parsed = JSON.parse(jsonMatch[0]);
        } catch (e2) {
          parsed = null;
        }
      }
    }

    return new Response(JSON.stringify({
      ok: true,
      data: parsed || { raw: rawText },
      parsed_success: !!parsed
    }), { headers: corsHeaders });

  } catch (err) {
    return new Response(JSON.stringify({
      ok: false,
      error: err.message,
      stack: String(err.stack || '').slice(0, 300)
    }), { status: 500, headers: corsHeaders });
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
