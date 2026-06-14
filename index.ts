import "./src/capabilities/tools/order-tool";
import "./src/capabilities/tools/transfer-tool";
import "./src/capabilities/tools/return-tool";
import "./src/capabilities/tools/price-change-tool";
import "./src/capabilities/tools/query-tool";

import { buildSystemPrompt } from "./src/context/prompt-builder";
import { runAgentLoop } from "./src/core/agent";
import type { Message } from "./src/core/types";

// 模拟从 Gateway 拿到的一段群聊消息
const mockGroupId = "wechat_group_001";
const rawMessagesFromGateway = [
  { role: "user", content: "张老板：今天还是老规矩，先拉20件大白菜过来。" },
  { role: "user", content: "张老板：等等，改成15件吧，今天降温销路不好。" }
];

async function main() {
  const systemPrompt = await buildSystemPrompt(mockGroupId);
  
  const sessionHistory: Message[] = [
    { role: "system", content: systemPrompt },
    ...rawMessagesFromGateway as any
  ];

  console.log("🚀 Agent 启动处理消息...");
  const finalState = await runAgentLoop(sessionHistory);
  console.log("🏁 处理完成，最终对话状态总轮数:", finalState.length);
  
  const lastMsg = finalState[finalState.length - 1];
  console.log("\n💬 Agent 回复:");
  console.log(lastMsg?.content || "(无内容)");
}

main();