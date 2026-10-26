import { requireAdmin } from '../../_admin.js';
import { json } from '../../_utils.js';

export async function onRequestPost({ request, env }) {
  const guard = await requireAdmin(request, env);
  if (guard.error) return guard.error;

  try {
    const body = await request.json();
    const userMessage = body.message;
    if (!userMessage) return json({ ok: false, error: 'Message required' }, 400);

    // 1. Dapatkan jawapan asas dari Llama 3
    const systemPrompt = `You are an AI assistant for HairiHosting. Reply briefly to the user's request.`;
    
    const aiResponse = await env.AI.run('@cf/meta/llama-3.1-8b-instruct-fast', {
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage }
      ]
    });

    let reply = aiResponse.response;
    const lowerMsg = userMessage.toLowerCase();

    // 2. Logik MCP (Hantar argument yang betul sahaja)
    let toolName = '';
    let toolArgs = { secret_key: env.MCP_SECRET_KEY };

    if (lowerMsg.includes('maintenance')) {
      toolName = 'toggle_maintenance';
      // Cari perkataan 'on' atau 'off' dalam ayat user
      toolArgs.status = (lowerMsg.includes('off') || lowerMsg.includes('tutup')) ? 'off' : 'on';
    } 
    else if (lowerMsg.includes('deploy')) {
      // (Untuk masa ni, kita test maintenance dulu. Deploy kita buat nanti)
      toolName = 'generate_and_deploy_site';
      toolArgs.subdomain = 'test-ai-' + Date.now().toString().slice(-4); // Random subdomain
      toolArgs.name = 'Test AI Site';
      toolArgs.html = '<h1>Deployed via Admin Chat</h1>';
    }

    // 3. Panggil MCP Server
    if (toolName) {
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
            name: toolName,
            arguments: toolArgs
          }
        })
      });

      const mcpData = await mcpRes.json();

      // 4. Semak kalau MCP ada bagi ERROR (Zod validation, dll)
      if (mcpData.error) {
        reply += `\n\n❌ **MCP Server Error:**\n${mcpData.error.message}`;
      } else if (mcpData.result && mcpData.result.content) {
        reply += `\n\n✅ **Action taken:**\n${mcpData.result.content[0].text}`;
      } else {
        reply += `\n\n⚠️ **Unknown MCP Response:**\n${JSON.stringify(mcpData)}`;
      }
    }

    return json({ ok: true, reply: reply });
  } catch (err) {
    return json({ ok: false, error: err.message }, 500);
  }
}
