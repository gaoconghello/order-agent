import type { ToolDefinition } from './types';

export class ToolRegistry {
  private static tools = new Map<string, ToolDefinition>();

  public static register(tool: ToolDefinition) {
    this.tools.set(tool.name, tool);
    console.log(`[Registry] Tool 注册成功: ${tool.name}`);
  }

  public static getTool(name: string): ToolDefinition | undefined {
    return this.tools.get(name);
  }

  public static getAllDefinitions() {
    return Array.from(this.tools.values()).map(t => ({
      name: t.name,
      description: t.description,
      parameters: t.parameters
    }));
  }
}
