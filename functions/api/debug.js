export async function onRequestGet(context) {
  const { env } = context;
  const result = {
    hasAI: !!env.AI,
    attempts: []
  };

  const models = [
    '@cf/meta/llama-3.1-8b-instruct',
    '@cf/meta/llama-3.1-8b-instruct-fast',
    '@cf/meta/llama-3.3-70b-instruct-fp8-fast',
    '@cf/meta/llama-3-8b-instruct'
  ];

  for (const model of models) {
    try {
      const res = await env.AI.run(model, {
        messages: [
          { role: 'user', content: 'Say hi in 1 word' }
        ],
        max_tokens: 20
      });
      result.attempts.push({
        model,
        ok: true,
        keys: Object.keys(res || {}),
        response: res?.response || res?.result || JSON.stringify(res).slice(0, 200)
      });
    } catch (err) {
      result.attempts.push({
        model,
        ok: false,
        error: err.message,
        stack: String(err.stack || '').slice(0, 300)
      });
    }
  }

  return new Response(JSON.stringify(result, null, 2), {
    headers: { 'Content-Type': 'application/json' }
  });
}
