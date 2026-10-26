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
      { type: "function", function: { name: "toggle_maintenance", description: "Turn maintenance ON or OFF", parameters: { type: "object", properties: { status: { type: "string", enum: ["on", "off"] } }, required: ["status"] } } },
      { type: "function", function: { name: "list_sites", description: "List all websites", parameters: { type: "object", properties: {} } } },
      { type: "function", function: { name: "count_users", description: "Count total users", parameters: { type: "object", properties: {} } } }
    ];

    // UPGRADE: Guna Llama 3.3 70B (Jauh lebih pandai dan patuh arahan)
    const aiResponse = await env.AI.run('@cf/meta/llama-3.3-70b-instruct-fp8-fast', {
      messages: [
        { 
          role: 'system', 
          content: 'You are Lana, a polite AI assistant for HairiHosting. If the user asks casual questions (like "What is your name?", "Hello", "Who are you?"), just reply normally. DO NOT use any tools for casual chat. ONLY use tools if the user explicitly asks to perform administrative tasks like listing sites, counting users, or toggling maintenance.' 
        },
        { role: 'user', content: userMessage }
      ],
      tools: tools
    });

    let reply = aiResponse.response || "";

    // Kalau AI betul-betul panggil tool
    if (aiResponse.tool_calls && aiResponse.tool_calls.length > 0) {
      const toolCall = aiResponse.tool_calls[0];
      const functionName = toolCall.function ? toolCall.function.name : toolCall.name;
      const rawArgs = toolCall.function ? toolCall.function.arguments : toolCall.arguments;
      let args = {};
      try { args = typeof rawArgs === 'string' ? JSON.parse(rawArgs) : rawArgs; } catch (e) {}
      args.secret_key = env.MCP_SECRET_KEY;

      const mcpRes = await fetch('https://hairi-mcp.hairigm8k.workers.dev/mcp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json, text/event-stream',
          'Authorization': `Bearer ${env.MCP_SECRET_KEY}`
        },
        body: JSON.stringify({
          jsonrpc: '2.0', id: 1, method: 'tools/call',
          params: { name: functionName, arguments: args }
        })
      });

      const rawText = await mcpRes.text();
      let mcpData = null;
      try { mcpData = JSON.parse(rawText); } 
      catch (e) {
        const dataLine = rawText.split('\n').find(line => line.startsWith('data: '));
        if (dataLine) { try { mcpData = JSON.parse(dataLine.replace('data: ', '')); } catch (err) {} }
      }

      if (!mcpData) reply = `⚠️ Gagal parse respons MCP.`;
      else if (mcpData.error) reply = `❌ MCP Error: ${mcpData.error.message}`;
      else if (mcpData.result && mcpData.result.content) {
        const resultText = mcpData.result.content[0].text;
        
        if (functionName === 'list_sites') {
          try {
            const sites = JSON.parse(resultText);
            reply = `Ini senarai website kau:\n\n` + sites.map(s => `• **${s.name}** (\`${s.subdomain}\`) - ${s.status.toUpperCase()}`).join('\n');
          } catch(e) {
            reply = `✅ ${resultText}`;
          }
        } else {
          reply = `✅ ${resultText}`;
        }
      }
    } 
    else if (!reply) {
      reply = "Maaf, saya tidak faham.";
    }

    return json({ ok: true, reply: reply });
  } catch (err) {
    return json({ ok: false, error: err.message }, 500);
  }
}
