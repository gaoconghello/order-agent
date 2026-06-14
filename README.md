# Order Agent (批发业务订单智能处理系统)

Order Agent 是一个基于 **TypeScript + Bun** 构建的智能 AI 代理（AI Agent）系统。它的核心目标是读取并分析微信群组聊天记录，使用大模型自动提取和转化出清晰的业务数据（如：**下单、转账、退货、价格变更、订单查询**等），并将其无缝存入本地 SQLite 数据库中。

系统基于极简的三层架构设计：**网关接入层（Gateway） -> 核心引擎层（Core） -> 业务能力层（Capabilities）**，具备高度的灵活性和可扩展性。

## 🌟 核心特性

- **🚀 极速运行时**：基于 [Bun](https://bun.sh/) 原生运行，零编译负担，原生支持 `.env` 与 TypeScript。
- **🤖 强力大脑**：接入兼容 OpenAI 格式的大语言模型（支持 GPT-4o、Qwen、DeepSeek 等）。
- **📦 本地化强类型数据库**：使用 Bun 内置的高性能 `bun:sqlite`，结合 TypeScript 领域最强的轻量级 ORM 框架 [Drizzle ORM](https://orm.drizzle.team/)。
- **🧩 插件化工具注册（Tool Registry）**：新增一种聊天意图（例如“投诉”、“催促”），只需在 `tools` 目录新建一个文件并注册即可，符合开闭原则（OCP）。
- **🧠 上下文分离策略**：使用独立 Markdown 文件分离“角色设定”、“行业常识”和“各微信群独立画像”，利用大模型长文本及 KV Cache，降低提示词维护成本。

## 📁 目录结构

```text
order-agent/
├── index.ts                # 项目启动主入口
├── .env                    # API 密钥配置 (需从 .env.example 复制)
├── drizzle.config.ts       # Drizzle ORM 配置文件
├── src/
│   ├── core/               # 🚀 核心逻辑引擎层
│   │   ├── agent.ts        # Agent 决策流 (大模型轮询处理)
│   │   ├── llm.ts          # LLM 适配器封装 (目前对接 OpenAI SDK)
│   │   ├── registry.ts     # 工具链注册表
│   │   ├── event-bus.ts    # 内部解耦的事件总线
│   │   └── types.ts        # 全局类型定义
│   │
│   ├── capabilities/       # 💼 业务能力与工具层 (按需插拔)
│   │   ├── store/          # 数据库 schema 与连接
│   │   └── tools/          # 下单、退货、转账等具体动作封装
│   │
│   └── context/            # 📝 Prompt 资产管理层
│       ├── prompt-builder.ts # Prompt 组装器
│       ├── business.md     # 行业共性知识库
│       ├── role.md         # AI 角色设定
│       └── groups/         # 独立群组画像/特殊约定记忆
└── drizzle/                # 数据库自动生成的迁移文件存放处
```

## ⚙️ 环境配置与安装

1. **安装依赖**
   ```bash
   bun install
   ```

2. **配置环境变量**
   在根目录下将 `.env.example` 复制为 `.env`，并填入你的配置信息：
   ```bash
   cp .env.example .env
   ```
   *修改 `.env` 填入 `OPENAI_API_KEY`（也支持配置 `OPENAI_BASE_URL` 代理）。*

3. **初始化数据库**
   推送 Drizzle Schema 到本地 SQLite 数据库文件（文件会自动生成）：
   ```bash
   bunx drizzle-kit push
   ```

## 🚀 启动项目

```bash
bun run index.ts
```

启动后，系统将读取 `index.ts` 中模拟的 `rawMessagesFromGateway` 微信群消息，调用配置的大模型进行意图推理，并将结果写入 `wholesale_business.sqlite` 数据库中。

## 🛠️ 扩展指南

**如果你想让 Agent 支持一种新指令（比如：“开具发票”）**：
1. 在 `src/capabilities/tools/` 目录下新建 `invoice-tool.ts`。
2. 按照其他 Tool 的模板，调用 `ToolRegistry.register(...)` 编写工具名、参数验证和执行逻辑。
3. 在 `index.ts` 开头 `import "./src/capabilities/tools/invoice-tool";` 即可完成全自动扩展。
