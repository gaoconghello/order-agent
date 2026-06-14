import OpenAI from 'openai';
import type { Message } from './types';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'dummy_key',
  baseURL: process.env.OPENAI_BASE_URL // 支持兼容 API 转发
});

export async function callLLM(sessionHistory: Message[], tools: any[]): Promise<Message> {
  const messages = sessionHistory.map(msg => {
    const out: any = { role: msg.role };
    if (msg.content) out.content = msg.content;
    if (msg.tool_calls) out.tool_calls = msg.tool_calls;
    if (msg.tool_call_id) out.tool_call_id = msg.tool_call_id;
    return out;
  });

  const openaiTools = tools.length > 0 ? tools.map(t => ({
    type: 'function',
    function: {
      name: t.name,
      description: t.description,
      parameters: t.parameters
    }
  })) : undefined;

  try {
    const response = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o', 
      messages: messages as any,
      tools: openaiTools as any,
      temperature: 0.1,
    });

    const candidate = response.choices[0]?.message;

    if (!candidate) {
      throw new Error("No response from LLM");
    }

    if (candidate.tool_calls && candidate.tool_calls.length > 0) {
      return {
        role: 'assistant',
        content: candidate.content || "",
        tool_calls: candidate.tool_calls.map((tc: any) => ({
          id: tc.id,
          type: 'function',
          function: {
            name: tc.function.name,
            arguments: tc.function.arguments
          }
        }))
      };
    }

    return {
      role: 'assistant',
      content: candidate.content || ""
    };
  } catch (error) {
    console.error("[LLM] Call failed:", error);
    return {
      role: 'assistant',
      content: 'I encountered an error while processing your request.'
    };
  }
}
