import { requireAdmin } from '../../_admin.js';
import { json } from '../../_utils.js';

export async function onRequestPost({ request, env }) {
  const guard = await requireAdmin(request, env);
  if (guard.error) return guard.error;

  try {
    const body = await request.json();
    const userMessage = body.message;
    if (!userMessage) return json({ ok: false, error: 'Message required' }, 400);

    // 1. Panggil Llama 3 untuk detect niat (Intent)
    const systemPrompt = `You are an AI assistant for HairiHosting. 
    Your job is to help the admin manage the platform. 
    If the user wants to deploy a site, ask for the subdomain, name, and HTML content.
    If the user wants to turn on/off maintenance, confirm the status.
    Always be concise.`;
    
    const aiResponse = await env.AI.run('@cf/meta/llama-3.1-8b-instruct', {
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage }
      ]
    });

    let reply = aiResponse.response;

    // Logik mudah: Kalau AI cakap pasal deploy, kita panggil MCP Server
    // (Untuk sistem yang lebih kompleks, kita guna Function Calling / Tool Calling)
    if (userMessage.toLowerCase().includes('deploy') || userMessage.toLowerCase().includes('maintenance')) {
      // Panggil MCP Server kau
      const mcpRes = await fetch('https://hairi-mcp.hairigm8k.workers.dev/mcp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${env.MCP_SECRET_KEY}`
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'tools/call',
          params: {
            name: userMessage.toLowerCase().includes('maintenance') ? 'toggle_maintenance' : 'generate_and_deploy_site',
            arguments: {
              // Ini adalah hardcode untuk demo. Untuk production, guna LLM tool calling untuk extract arguments.
              status: 'on',
              subdomain: 'test-ai',
              name: 'Test AI Site',
              html: '<h1>Deployed via Admin Chat</h1>',
              secret_key: env.MCP_SECRET_KEY
            }
          }
        })
      });

      const mcpData = await mcpRes.json();
      if (mcpData.result && mcpData.result.content) {
        reply += `\n\n✅ **Action taken:** ${mcpData.result.content[0].text}`;
      }
    }

    return json({ ok: true, reply: reply });
  } catch (err) {
    return json({ ok: false, error: err.message }, 500);
  }
}
