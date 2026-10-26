import { requireAdmin } from '../../_admin.js';
import { json } from '../../_utils.js';

export async function onRequestPost({ request, env }) {
  const guard = await requireAdmin(request, env);
  if (guard.error) return guard.error;

  try {
    const body = await request.json();
    const userMessage = body.message;
    if (!userMessage) return json({ ok: false, error: 'Message required' }, 400);

    // 1. Daftarkan SEMUA tools yang ada dalam MCP Server kau
    const tools = [
      {
        type: "function",
        function: {
          name: "toggle_maintenance",
          description: "Turn HairiHosting maintenance mode ON or OFF",
          parameters: {
            type: "object",
            properties: { status: { type: "string", enum: ["on", "off"] } },
            required: ["status"]
          }
        }
      },
      {
        type: "function",
        function: {
          name: "list_sites",
          description: "List all websites hosted on HairiHosting",
          parameters: { type: "object", properties: {} }
        }
      },
      {
        type: "function",
        function: {
          name: "count_users",
          description: "Get the total number of registered users",
          parameters: { type: "object", properties: {} }
        }
      },
      {
        type: "function",
        function: {
          name: "generate_and_deploy_site",
          description: "Deploy a brand new HTML site",
          parameters: {
            type: "object",
            properties: {
              subdomain: { type: "string" },
              name: { type: "string" },
              html: { type: "string" }
            },
            required: ["subdomain", "name", "html"]
          }
        }
      }
    ];

    // 2. Panggil Llama 3 dengan semua tools
    const aiResponse = await env.AI.run('@cf/meta/llama-3.1-8b-instruct-fast', {
      messages: [
        { 
          role: 'system', 
          content: 'You are a helpful AI assistant for HairiHosting. If the user asks a general question, answer normally. If the user asks to manage the platform, use the provided tools. Be concise.' 
        },
        { role: 'user', content: userMessage }
      ],
      tools: tools
    });

    let reply = aiResponse.response || "";

    // 3. Kalau AI panggil tool, kita hantar ke MCP Server
    if (aiResponse.tool_calls && aiResponse.tool_calls.length > 0) {
      const toolCall = aiResponse.tool_calls[0];
      const functionName = toolCall.function ? toolCall.function.name : toolCall.name;
      const rawArgs = toolCall.function ? toolCall.function.arguments : toolCall.arguments;
      
      let args = {};
      try { args = typeof rawArgs === 'string' ? JSON.parse(rawArgs) : rawArgs; } catch (e) {}

      // Masukkan secret_key untuk tool yang memerlukannya
      args.secret_key = env.MCP_SECRET_KEY;

      // Panggil MCP Server
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
            name: functionName,
            arguments: args
          }
        })
      });

      // Baca respons (JSON atau SSE)
      const rawText = await mcpRes.text();
      let mcpData = null;
      try { mcpData = JSON.parse(rawText); } 
      catch (e) {
        const dataLine = rawText.split('\n').find(line => line.startsWith('data: '));
        if (dataLine) { try { mcpData = JSON.parse(dataLine.replace('data: ', '')); } catch (err) {} }
      }

      if (!mcpData) reply = `⚠️ Gagal parse respons MCP.`;
      else if (mcpData.error) reply = `❌ Ralat MCP: ${mcpData.error.message}`;
      else if (mcpData.result && mcpData.result.content) reply = `✅ ${mcpData.result.content[0].text}`;
      else reply = `⚠️ Respons tidak diketahui: ${JSON.stringify(mcpData)}`;
    } 
    // Kalau AI tak panggil tool dan tak jawab apa-apa
    else if (!reply) {
      reply = "Maaf, saya tidak faham arahan anda.";
    }

    return json({ ok: true, reply: reply });
  } catch (err) {
    return json({ ok: false, error: err.message }, 500);
  }
}
