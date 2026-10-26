import { requireAdmin } from '../../_admin.js';
import { json } from '../../_utils.js';

export async function onRequestPost({ request, env }) {
  const guard = await requireAdmin(request, env);
  if (guard.error) return guard.error;

  try {
    const body = await request.json();
    const userMessage = body.message;
    if (!userMessage) return json({ ok: false, error: 'Message required' }, 400);

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

    const aiResponse = await env.AI.run('@cf/meta/llama-3.1-8b-instruct-fast', {
      messages: [
        { role: 'system', content: 'You are a helpful assistant for HairiHosting. Use the provided tools to fulfill the user request.' },
        { role: 'user', content: userMessage }
      ],
      tools: tools
    });

    let reply = aiResponse.response || "";

    if (aiResponse.tool_calls && aiResponse.tool_calls.length > 0) {
      const toolCall = aiResponse.tool_calls[0];
      const functionName = toolCall.function ? toolCall.function.name : toolCall.name;
      const rawArgs = toolCall.function ? toolCall.function.arguments : toolCall.arguments;
      
      let args = {};
      try {
        args = typeof rawArgs === 'string' ? JSON.parse(rawArgs) : rawArgs;
      } catch (e) {}

      if (functionName === 'toggle_maintenance' && args.status) {
        const mcpRes = await fetch('https://hairi-mcp.hairigm8k.workers.dev/mcp', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json, text/event-stream',
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

        // --- FIX: Baca respons mentah dan handle SSE ---
        const rawText = await mcpRes.text();
        let mcpData = null;

        try {
          // Cuba parse JSON biasa dulu
          mcpData = JSON.parse(rawText);
        } catch (e) {
          // Kalau gagal, maknanya ia SSE. Cari baris yang mula dengan "data: "
          const dataLine = rawText.split('\n').find(line => line.startsWith('data: '));
          if (dataLine) {
            try {
              mcpData = JSON.parse(dataLine.replace('data: ', ''));
            } catch (err) {}
          }
        }

        if (!mcpData) {
          reply = `⚠️ Gagal parse respons MCP:\n${rawText.substring(0, 100)}...`;
        } else if (mcpData.error) {
          reply = `❌ Ralat MCP: ${mcpData.error.message}`;
        } else if (mcpData.result && mcpData.result.content) {
          reply = `✅ ${mcpData.result.content[0].text}`;
        } else {
          reply = `⚠️ Respons tidak diketahui: ${JSON.stringify(mcpData)}`;
        }
      } else {
        reply += `\n\n[Debug: ${functionName}]`;
      }
    } 
    else if (!reply) {
      reply = "Maaf, saya tidak faham arahan anda.";
    }

    return json({ ok: true, reply: reply });
  } catch (err) {
    return json({ ok: false, error: err.message }, 500);
  }
}
