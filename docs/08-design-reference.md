# 留言板项目设计参考手册

> 本文档面向 UI/UX 设计师，提供完整的项目信息、功能清单和设计特征，作为样式优化工作的参考素材。

---

## 一、项目概况

一个支持**无限层级回复**的全栈留言板应用，界面风格参考 HackerNews，内置 **AI 智能体**参与讨论。面试场景用途，需在功能完备性、安全性和视觉品质上展现专业水准。

**技术栈**: Next.js 16 + TypeScript + Prisma 7 + SQLite + Tailwind CSS 4 + JWT + next-themes

**开发状态**: 全部核心功能已实现，54 条种子数据（含 18 条 AI 回复），TypeScript 编译通过，5 个单元测试通过。

---

## 二、页面路由与功能

### 2.1 路由总览

| 路由 | 页面 | 功能 |
|------|------|------|
| `/` | 首页（新闻列表） | 浏览帖子列表、发表新帖 |
| `/post/[id]` | 帖子详情 | 查看帖子及全部嵌套回复、参与讨论 |
| `/login` | 登录注册 | 用户注册、登录 |

### 2.2 首页 (`/`)

**布局**: 顶部发表框（登录后可见） + 帖子列表

**帖子列表**每个帖子的展示结构（参考 HackerNews `ItemList` 排版）：

```
[序号].  [▲]  [标题（可点击进入详情）]
             [作者] · [相对时间] · [N 回复] · [回复] · [编辑] · [删除]
```

- 标题为链接，点击跳转到 `/post/[id]`
- 元数据行显示：作者名 + AI 标签（仅 AI 帖子）+ 相对时间 + 回复数
- 登录用户可见"回复/编辑/删除"操作按钮
- 未登录用户只看到帖子列表，顶部显示登录引导

### 2.3 帖子详情页 (`/post/[id]`)

**布局**: 返回链接 → 大标题 → 元数据行 → 分隔线 → 回复表单 → 嵌套评论树

**评论树的递归结构**（完全复刻 HackerNews `comment.tsx`）：

```
[作者名] [AI标签/楼主标签] · [相对时间]
    [评论内容（pl-5 固定缩进）]
    [折叠按钮] [回复] [编辑] [删除]
    ├── 子回复（pl-10 固定缩进）
    │   ├── 回复的回复
    │   └── ...
    └── ...
```

### 2.4 登录页 (`/login`)

分段按钮 Tab 切换登录/注册模式，shadcn 风格表单：
- 用户名 + 密码输入框
- 错误提示
- 提交按钮（loading 状态禁用）

---

## 三、特色功能详解

### 3.1 AI 智能体系统

系统内置 **三个 Agent**，与留言板的无限层级树形结构深度结合。Agent 的核心理念：上下文构建来自树形数据的自然递归追溯。

---

#### Agent 一：@AI 链式上下文智能回复

**触发方式**: 用户在任何层级的留言或回复中包含 `@AI` 关键字。

**核心能力 — 树形上下文重构**:

Agent 不只是看到当前这条留言，而是**沿着 `parentId` 链向上递归追溯至根节点**，提取完整对话链作为 Prompt。这完美利用了无限层级树的结构：

```
用户 A: "Next.js App Router 有什么推荐学习资源？"      ← 根节点（第0层）
  ├── 用户 B: "推荐官方文档 + 实战项目"                ← 第1层
  │   ├── 用户 C: "实战项目有什么推荐？"                ← 第2层
  │   │   ├── 用户 D: "@AI 有更具体的建议吗？"          ← 第3层（触发Agent）
  │   │   │   └── AI: "建议从留言板项目入手..."         ← Agent 自动生成（第4层）
```

**技术实现流程**:

```
用户发布含 @AI 的留言
  │
  ├─→ 1. 保存用户留言到数据库
  │
  ├─→ 2. context-builder.ts: 沿 parentId 向上递归查询
  │     构建 ConversationTurn[] 对话链
  │
  ├─→ 3. buildPrompt(): 格式化为 LLM 可读格式
  │     [alice]: "推荐什么学习资源？"
  │     [bob]:   "推荐官方文档"
  │     [charlie]: "@AI 有更具体的建议吗？"
  │
  ├─→ 4. generateText():
  │     ├── Mock 模式: 8类话题关键词匹配 → 技术回复
  │     └── OpenAI 模式: fetch API → gpt-3.5-turbo
  │
  └─→ 5. 将 AI 回复写入数据库
        userId="ai-system", userName="AI助手", parentId=触发留言的id
```

**Serverless 兼容**: 使用直接 `await`（非 fire-and-forget），确保 Vercel/Serverless 环境下 AI 回复在响应返回前完成写入。

**文件清单**:
- `src/lib/agent/client.ts` — LLM 统一入口 + Provider 检测 + Mock 降级
- `src/lib/agent/context-builder.ts` — 递归追溯对话链 + Prompt 构建
- `src/app/api/comments/route.ts` — POST 处理器中检测 `@AI` 唤醒词

---

#### Agent 二：主题线程摘要（结构化输出）

**触发方式**: 点击根留言旁的"AI 摘要"按钮。

**核心能力 — DFS 树形扁平化**:

使用**深度优先遍历**（先序遍历）将整棵讨论树转换为 LLM 可读的时间线文本，确保每个子讨论分支连续完整：

```
根贴: "Next.js 用什么数据库？"
  ├── 回复A: "推荐 Prisma"
  │   └── 追问: "Prisma 冷启动怎么解决？"    ← DFS 保证这俩紧挨着
  ├── 回复B: "推荐 Drizzle"
  │   └── 追问: "Drizzle 迁移好用吗？"        ← 不会被截断

DFS 输出:
[alice]: "Next.js 用什么数据库？"
  [bob]: "推荐 Prisma"
    [charlie]: "Prisma 冷启动怎么解决？"    ← 上下文完整连续
  [alice]: "推荐 Drizzle"
    [bob]: "Drizzle 迁移好用吗？"
```

**结构化 JSON 输出**:

```json
{
  "summary": "讨论集中于 Next.js 数据库选型，多数人推荐 Prisma（类型安全好），部分人推荐 Drizzle（性能更优）。对冷启动和迁移工具有较多讨论。",
  "sentiment": "mixed",
  "tags": ["数据库选型", "ORM", "Next.js"]
}
```

**前端展示**: 根评论下方出现紫色背景卡片，显示摘要文字 + 情感标签 + 话题标签。

**文件清单**:
- `src/lib/agent/summarizer.ts` — DFS 扁平化 + 摘要生成
- `src/app/api/comments/[id]/summary/route.ts` — 摘要 API 端点

---

#### Agent 三：后台内容审核

**触发方式**: 每次留言提交时自动触发（对用户完全透明）。

**审核维度**:

| 类别 | Mock 模式 | OpenAI 模式 |
|------|-----------|-------------|
| 广告检测 | 正则匹配（广告/加微信/免费领取/点击链接/兼职/日赚） | Moderations API |
| 辱骂检测 | 正则匹配（辱骂关键词） | Moderations API |
| 正常内容 | 直接通过 | 直接通过 |

**拦截效果**: 审核不通过 → 返回 `400` + 具体原因（"疑似垃圾广告" / "包含不文明用语"）

**文件清单**:
- `src/lib/agent/moderation.ts` — 审核逻辑

---

#### Agent 统一入口与 Mock 降级

**Provider 自动检测**（`client.ts`）:

```
检测 process.env.OPENAI_API_KEY
  ├── 存在 → mode="openai"（调用真实 API）
  └── 不存在 → mode="mock"（智能关键词匹配）
```

**Mock 回复质量**: 非随机模板，而是**按 8 类话题关键词匹配**的高质量技术回复。每条 Mock 回复包含具体的技术细节、代码示例或使用建议：

| 话题 | 关键词 | 回复风格 |
|------|--------|----------|
| Next.js | App Router, Server Component, RSC, Pages Router | 官方建议 + 迁移技巧 + 代码示例 |
| Prisma/Drizzle | ORM, 数据库, SQLite, migrate | 对比分析 + 适用场景 + 折中方案 |
| TypeScript | 类型, 泛型, Decorator, const, satisfies | 原理说明 + 代码示例 |
| Tailwind | CSS, 样式, 暗色, 主题 | 迁移 checklist + 版本对比 |
| Rust/Go | 后端, 性能, 微服务, 并发 | 决策框架 + 对比表格 |
| AI/Cursor/v0 | ChatGPT, 大模型, Copilot | 使用技巧 + 局限性分析 |
| 编辑器 | Vim, Neovim, VSCode, IDE | 配置建议 + 过渡方案 |
| 前端框架 | React, Vue, Svelte | 格局分析 + 选型建议 |

**Agent 状态 API**: `GET /api/agent/status` → `{ enabled: true, mode: "openai"|"mock", features: ["reply","summary","moderation"] }`

---

#### AI 在种子数据中的呈现

种子数据中预置了 **18 条 AI 回复**，使面试官无需触发 `@AI` 即可看到 AI 参与讨论的完整效果：

| 帖子 | AI 回复数 | AI 参与方式 |
|------|-----------|------------|
| Post 1 (Next.js) | 3 条 | 在 7 层嵌套中回复技术细节（middleware header 传递） |
| Post 2 (Prisma/Drizzle) | 2 条 | 给出对比总结 + 团队分歧折中方案 |
| Post 3 (TypeScript) | 3 条 | 提供 const 类型参数原理 + Decorator 对比 + satisfies 示例 |
| **Post 4 (AI 视角)** | **4 条** | **AI 作为楼主原创帖**，讨论 AI 对开发的影响 |
| Post 5 (Tailwind) | 2 条 | 给出 v4 迁移 checklist + 升级工具建议 |
| Post 6 (Rust) | 2 条 | 提供 Rust vs Go 决策框架表格 |
| Post 7 (AI/前端) | 2 条 | 给出 prompt engineering 技巧 |

AI 回复的 `userId = "ai-system"`，`userName = "AI助手"`。前端对此做了特殊视觉处理：显示紫色 Badge 标签 `[AI]`。

### 3.2 无限层级递归评论

**核心算法**: 扁平数组 + HashMap 分组（`CommentContext`）

```typescript
// 一次 fetch 全部留言 → HashMap 按 parentId 分组
commentsByParentId = {
  "__root__": [post1, post2, ...],  // 顶级帖子
  "post1": [reply1, reply2, ...],   // post1 的直接回复
  "reply1": [subReply, ...],        // reply1 的子回复
}
```

- O(1) 查询任意节点的子回复
- 递归 `NestedComment` 组件自动渲染任意深度
- 折叠/展开动画：`grid-rows-[1fr/0fr]` + `duration-300`

### 3.3 双模式评论组件

`CommentItem` 组件支持两种渲染模式：

| 模式 | 场景 | 渲染样式 |
|------|------|----------|
| `list` | 首页帖子列表 | **PostCard**: 标题 + 元数据行 + 折叠箭头 + 子回复预览 |
| `detail` | 帖子详情页 | 跳过 PostCard，直接渲染 NestedComment 树 |

### 3.4 软删除策略

删除留言时标记 `isDeleted = true`，不物理删除数据：
- 被删除的留言显示灰色斜体"该留言已被删除"
- 其所有子回复保持完整，避免上下文断裂
- 子回复仍可正常浏览和继续回复

### 3.5 暗色模式

完整的光/暗/系统三模式主题切换（next-themes + CSS HSL 变量）：
- 导航栏右侧循环切换按钮
- 全局 CSS 变量驱动（`--background`, `--foreground`, `--muted`, `--border`, `--accent`）
- 毛玻璃 sticky header（`backdrop-blur` + `bg-background/95`）

---

## 四、组件清单

### 4.1 页面组件（3 个）

| 组件 | 文件 | 说明 |
|------|------|------|
| `Home` | `app/page.tsx` | 首页：发表框 + 帖子列表。三种状态：已登录（显示表单）、未登录（显示引导）、加载中/空列表 |
| `PostPage` | `app/post/[id]/page.tsx` | 帖子详情：返回链接 + 大标题 + 元数据行 + 回复表单 + 嵌套评论树 |
| `LoginPage` | `app/login/page.tsx` | 登录/注册页 |

### 4.2 布局组件（4 个）

| 组件 | 说明 | 状态 |
|------|------|------|
| `Navbar` | 毛玻璃 sticky header：左侧标题链接 + 右侧用户名/登出/登录按钮/主题切换 | 已登录/未登录 |
| `Footer` | 底部：技术栈链接 | 静态 |
| `ThemeProvider` | next-themes 包裹器 | 静态 |
| `ModeToggle` | 三模式循环切换（浅色→深色→系统） | mounted 防 hydration |

### 4.3 评论核心组件（4 个）

| 组件 | 说明 | 关键状态 |
|------|------|----------|
| `CommentContext` | 全局评论状态管理：扁平数组 + HashMap 分组 + 乐观更新 | loading / comments / rootPost |
| `CommentItem` | 评论递归渲染入口：`list` 模式渲染 PostCard，`detail` 模式直接渲染子回复 | depth / variant |
| `PostCard` | HN 风格帖子卡片：折叠箭头 + 标题链接 + 元数据行 | collapsed / isReplying / isEditing |
| `NestedComment` | 嵌套评论：头部行（作者+时间）+ 内容区（pl-5）+ 操作按钮 + 子回复（pl-10+grid动画） | expanded / isReplying / isEditing / deleted |

### 4.4 表单组件（2 个）

| 组件 | 说明 | 状态 |
|------|------|------|
| `CommentForm` | 文本域 + 提交按钮：支持新建帖、回复、编辑三种场景 | content / loading / error |
| `AuthForm` | 登录/注册表单：Tab 切换 + 用户名/密码输入框 + 提交按钮 | mode / username / password / loading / error |

### 4.5 展示组件（3 个）

| 组件 | 说明 | 状态 |
|------|------|------|
| `PostItem` | 首页列表项：序号 + 投票箭头 + 标题链接 + 元数据行（作者/时间/回复数） | rank / replyCount |
| `RelativeTime` | 相对时间显示："刚刚"/"N 分钟前"/"N 小时前"/"N 天前" | mounted（防 SSR 水合） |
| `CommentList` | 从 Context 读取 rootComments 并渲染 | loading / empty |

### 4.6 UI 原语组件（3 个，shadcn 风格）

| 组件 | 变体 |
|------|------|
| `Button` | default / destructive / outline / secondary / ghost / link × 4 sizes |
| `Badge` | default / secondary / destructive / outline |
| `Separator` | horizontal / vertical |

### 4.7 后台组件（Agent 系统）

| 模块 | 功能 |
|------|------|
| `agent/client.ts` | LLM 统一入口 + Provider 检测 + 8 类话题智能 Mock |
| `agent/context-builder.ts` | 沿 parentId 向上递归构建对话链 |
| `agent/summarizer.ts` | DFS 扁平化讨论树 + 结构化摘要生成 |
| `agent/moderation.ts` | 关键词过滤审核 + OpenAI 可选 |

---

## 五、视觉特征总结

### 5.1 整体布局

- **容器**: `max-w-3xl mx-auto` 居中，两侧留白
- **Header**: `sticky top-0 z-50`，`h-14` 高度，毛玻璃背景
- **Footer**: `mt-auto` 自动吸附底部，`border-t` 分割线
- **内容区**: `px-4 py-6` 内边距

### 5.2 颜色系统（HSL 变量）

```
浅色模式:  bg=#fff  fg=#111827  muted=#f3f4f6  muted-fg=#6b7280  border=#e5e7eb
深色模式:  bg=#111827  fg=#f3f4f6  muted=#1f2937  muted-fg=#9ca3af  border=#374151
```

### 5.3 字体

- **Inter** (Google Fonts) via `next/font/google`
- 标题: `text-[15px] leading-snug`
- 正文: `text-sm`
- 元数据/辅助文字: `text-xs text-muted-foreground`

### 5.4 关键视觉效果

| 效果 | 实现 |
|------|------|
| 毛玻璃 Header | `backdrop-blur supports-[backdrop-filter]:bg-background/60` |
| 折叠动画 | `grid overflow-hidden transition-all duration-300 ease-in-out` + `grid-rows-[1fr/0fr] opacity-100/0` |
| 固定缩进 | 内容区 `pl-5`，子回复 `pl-10`（不随深度递增） |
| 边框布局 | 全局 `* { border-color: hsl(var(--border)) }`，帖子间 `border-b` 分割 |
| 圆形标签 | `Badge` 组件: `rounded-full border px-2.5 py-0.5 text-xs` |
| 按钮 hover | `transition-colors`，focus 时 `ring-2 ring-ring ring-offset-2` |

### 5.5 AI 标签视觉

- AI 回复使用紫色 Badge：`text-purple-500 border-purple-300`
- AI 标签在作者名后面显示
- 帖子列表中 AI 标签与普通标签共存

---

## 六、设计优化方向（待讨论）

以下列出当前可改进的视觉方向，供设计师参考决策：

### 6.1 全局层
- [ ] 整体色彩饱和度/对比度调优
- [ ] 全局间距系统和垂直节奏
- [ ] 空状态插画或图标
- [ ] Loading 骨架屏替代纯文字

### 6.2 首页
- [ ] 帖子列表的视觉层次（序号列宽度、标题行高、元数据间距）
- [ ] 登录引导区的视觉吸引力
- [ ] 帖子卡片 hover 态
- [ ] 分页/加载更多按钮

### 6.3 详情页
- [ ] 评论树的视觉深度标识（引导线颜色/样式）
- [ ] 折叠/展开的过渡更平滑
- [ ] 回复表单的位置和样式
- [ ] AI 摘要卡片的视觉设计

### 6.4 交互
- [ ] 按钮的 active/disabled/focus 状态完整性
- [ ] Toast 通知（操作成功/失败反馈）
- [ ] 键盘导航支持
- [ ] 移动端适配

### 6.5 AI 展示
- [ ] AI 回复的更多视觉区分（图标、边框、渐变背景）
- [ ] AI 摘要的展示方式优化
- [ ] @AI 唤醒的视觉提示
- [ ] Agent 状态指示器

---

## 七、测试数据概况

| 维度 | 数据 |
|------|------|
| 用户数 | 3 个可登录（alice/bob/charlie）+ 1 个系统用户（AI助手） |
| 帖子数 | 7 个顶级帖 |
| 总留言数 | 54 条 |
| AI 回复 | 18 条，分布在 6 个讨论帖中 |
| AI 原创帖 | 1 个（"AI视角讨论AI对开发的影响"） |
| 最深嵌套 | 7 层（Next.js 讨论帖） |
| 已删除留言 | 1 条 |
