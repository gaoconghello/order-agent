export interface Message {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string;
  tool_calls?: ToolCall[];
  tool_call_id?: string; // 当 role 为 tool 时，关联的调用 ID
}

export interface ToolCall {
  id: string;
  type: 'function';
  function: {
    name: string;
    arguments: string; // JSON 字符串
  };
}

export interface ToolDefinition {
  name: string;
  description: string;
  parameters: object; // JSON Schema
  execute: (args: any) => Promise<any>;
}
