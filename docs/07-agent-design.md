# Agent 智能体设计

## 设计概述

三个 Agent 设计模式，与留言板的无限层级树形结构深度结合。核心理念：Agent 的上下文构建来自树形数据的自然递归追溯。

## Agent 一：@AI 链式上下文回复

**触发**: 用户发言包含 `@AI` 关键字

**核心能力**: 沿 `parentId` 链向上递归追溯至根节点，提取完整对话链作为 LLM Prompt：

```
用户 A: "Next.js App Router 怎么学？"           ← 根节点
  ├── 用户 B: "推荐官方文档"                    ← 第 1 层
  │   ├── 用户 C: "@AI 有更具体的建议吗？"       ← 第 2 层（触发）
  │   │   └── AI: "建议配合实战项目..."         ← Agent 自动生成
```

**技术实现**:
- `context-builder.ts`: `buildConversationChain()` 向上递归查询 parentId
- `buildPrompt()`: 格式化为 LLM 对话格式
- `generateAIReply()`: 直接 `await`（非 fire-and-forget），确保 Serverless 写入可靠

## Agent 二：主题摘要（结构化输出）

**触发**: 点击根留言"AI 摘要"按钮

**核心能力**: DFS 扁平化讨论树 → LLM 生成结构化 JSON：

```json
{
  "summary": "讨论集中于 Next.js 与 Prisma 的选型权衡...",
  "sentiment": "positive",
  "tags": ["技术选型", "前端框架", "ORM"]
}
```

**技术实现**:
- `summarizer.ts`: `flattenTreeDFS()` 深度优先遍历，确保上下文连续
- `generateStructured()`: 从 LLM 输出中提取 JSON

## Agent 三：内容审核

**触发**: 留言提交时自动执行

**Mock 实现**: 关键词正则匹配（广告、辱骂），拦截返回 400
**OpenAI 实现**: 调用 Moderations API

## Mock 降级机制

**8 类话题关键词匹配**，确保无 API Key 时仍能产生高质量上下文感知回复：

| 话题 | 关键词 |
|------|--------|
| Next.js | App Router, Server Component, RSC |
| Prisma | Drizzle, ORM, 数据库, migrate |
| TypeScript | 类型, 泛型, Decorator, const |
| Tailwind | CSS, 样式, 暗色, 主题 |
| Rust/Go | 后端, 性能, 微服务, 并发 |
| AI | ChatGPT, v0, Cursor, 大模型 |
| 编辑器 | Vim, Neovim, VSCode, IDE |
| 前端框架 | React, Vue, Svelte |

每条话题匹配 2-3 条高质量中文回复，包含具体的技术细节和使用建议。
