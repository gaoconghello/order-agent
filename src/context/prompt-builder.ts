import { file } from 'bun';

export async function buildSystemPrompt(groupId: string): Promise<string> {
  const businessMd = await file("src/context/business.md").text().catch(() => "行业知识为空。");
  const roleMd = await file("src/context/role.md").text().catch(() => "角色设定为空。");
  
  let groupMemory = "";
  try {
    groupMemory = await file(`src/context/groups/${groupId}.md`).text();
  } catch {
    groupMemory = "该群无特殊策略，按行业常识处理。";
  }

  return `
${businessMd}

${roleMd}

### 当前群组上下文及画像历史
${groupMemory}
`;
}
