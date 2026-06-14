import type { Message, ToolCall } from './types';
import { ToolRegistry } from './registry';
import { callLLM } from './llm';
import { EventBus } from './event-bus';

export async function runAgentLoop(sessionHistory: Message[]): Promise<Message[]> {
  let loopCount = 0;
  const maxLoops = 5;

  while (loopCount < maxLoops) {
    loopCount++;
    
    // 1. 请求大模型
    const response = await callLLM(sessionHistory, ToolRegistry.getAllDefinitions());
    
    // 如果模型返回了 tool_calls，清空 content 防止死循环
    if (response.tool_calls && response.tool_calls.length > 0) {
      response.content = ""; 
    }

    sessionHistory.push(response);

    // 2. 无需调用工具，结束对话
    if (!response.tool_calls || response.tool_calls.length === 0) {
      break;
    }

    // 3. 并行执行调用的工具
    for (const toolCall of response.tool_calls) {
      const tool = ToolRegistry.getTool(toolCall.function.name);
      let toolResult: any;

      if (!tool) {
        toolResult = { error: `Tool ${toolCall.function.name} not found` };
      } else {
        try {
          const args = JSON.parse(toolCall.function.arguments);
          toolResult = await tool.execute(args);
          
          if (toolResult.status === 'success') {
            EventBus.emit(`${toolCall.function.name}_success`, { args, result: toolResult });
          }
        } catch (err: any) {
          toolResult = { error: `Execution failed: ${err.message}` };
        }
      }

      // 4. 将工具结果喂回
      sessionHistory.push({
        role: 'tool',
        tool_call_id: toolCall.id,
        content: JSON.stringify(toolResult)
      });
    }
  }

  return sessionHistory;
}
