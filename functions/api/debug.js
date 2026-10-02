export async function onRequestGet(context) {
  const { env } = context;
  return new Response(JSON.stringify({
    hasAI: !!env.AI,
    aiType: typeof env.AI,
    aiHasRun: env.AI ? typeof env.AI.run : 'n/a'
  }, null, 2), {
    headers: { 'Content-Type': 'application/json' }
  });
}
