export async function onRequestGet(context) {
  const { env } = context;
  const result = {
    timestamp: new Date().toISOString(),
    hasAI: !!env.AI,
    aiType: typeof env.AI,
    aiHasRun: env.AI ? typeof env.AI.run : 'n/a',
    tests: []
  };

  if (!env.AI) {
    return new Response(JSON.stringify(result, null, 2), {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const models = [
    '@cf/meta/llama-3.1-8b-instruct-fast',
    '@cf/meta/llama-3.3-70b-instruct-fp8-fast',
    '@cf/meta/llama-3.1-8b-instruct'
  ];

  for (const model of models) {
    const start = Date.now();
    try {
      const res = await env.AI.run(model, {
        messages: [{ role: 'user', content: 'Say "ok" only' }],
        max_tokens: 10
      });
      result.tests.push({
        model,
        ok: true,
        ms: Date.now() - start,
        response: res?.response || JSON.stringify(res).slice(0, 100)
      });
    } catch (err) {
      result.tests.push({
        model,
        ok: false,
        ms: Date.now() - start,
        error: err.message
      });
    }
  }

  return new Response(JSON.stringify(result, null, 2), {
    headers: { 'Content-Type': 'application/json' }
  });
}
