import { requireAdmin } from '../../_admin.js';
import { json } from '../../_utils.js';

export async function onRequestPost({ request, env }) {
  const guard = await requireAdmin(request, env);
  if (guard.error) return guard.error;

  try {
    const body = await request.json();
    const userMessage = body.message;
    if (!userMessage) return json({ ok: false, error: 'Message required' }, 400);

    // 1. Definisikan Tools untuk Llama 3
    const tools = [
      {
        type: "function",
        function: {
          name: "toggle_maintenance",
          description: "Turn HairiHosting maintenance mode ON or OFF",
          parameters: {
            type: "object",
            properties: {
              status: { type: "string", enum: ["on", "off"], description: "Turn maintenance on or off" }
            },
            required: ["status"]
          }
        }
      }
    ];

    // 2. Panggil Llama 3 dengan Tools
    const aiResponse = await env.AI.run('@cf/meta/llama-3.1-8b-instruct-fast', {
      messages: [
        { role: 'system', content: 'You are a helpful assistant for HairiHosting. Use the provided tools to fulfill the user request.' },
        { role: 'user', content: userMessage }
      ],
      tools: tools
    });

    let reply = aiResponse.response || "";

    // 3. Semak kalau Llama 3 nak guna Tool
    if (aiResponse.tool_calls && aiResponse.tool_calls.length > 0) {
      const toolCall = aiResponse.tool_calls[0];
      
      if (toolCall.function.name === 'toggle_maintenance') {
        const args = JSON.parse(toolCall.function.arguments);
        
        // Panggil MCP Server
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
              name: 'toggle_maintenance',
              arguments: {
                status: args.status,
                secret_key: env.MCP_SECRET_KEY
              }
            }
          })
        });

        const mcpData = await mcpRes.json();

        if (mcpData.error) {
          reply = `❌ Ralat MCP: ${mcpData.error.message}`;
        } else if (mcpData.result && mcpData.result.content) {
          reply = `✅ ${mcpData.result.content[0].text}`;
        } else {
          reply = `⚠️ Respons MCP tidak diketahui: ${JSON.stringify(mcpData)}`;
        }
      }
    } 
    // Kalau AI tak panggil tool, dan reply kosong, kita paksa default
    else if (!reply) {
      reply = "Maaf, saya tidak faham arahan anda. Sila cuba lagi.";
    }

    return json({ ok: true, reply: reply });
  } catch (err) {
    return json({ ok: false, error: err.message }, 500);
  }
}
