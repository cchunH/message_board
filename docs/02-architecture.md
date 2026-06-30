# 架构设计

## 技术选型

| 层 | 技术 | 理由 |
|---|------|------|
| 全栈框架 | Next.js 16 (App Router) | 前后端一体，`npm run dev` 一键启动 |
| 语言 | TypeScript | 类型安全 |
| ORM | Prisma 7 | 类型安全、迁移方便 |
| 数据库 | SQLite | 零安装依赖 |
| 样式 | Tailwind CSS 4 | 原子化 CSS |
| 鉴权 | JWT (jose) + bcrypt | 无状态认证 |
| AI | Mock 降级 + OpenAI 可选 | 无 API Key 也能体验 |

## 项目结构

```
src/
├── app/
│   ├── api/              # API Routes (auth, comments, agent)
│   ├── login/            # 登录页
│   ├── post/[id]/        # 帖子详情页
│   ├── layout.tsx        # 根布局 (ThemeProvider + AuthProvider)
│   └── page.tsx          # 首页（HN 风格新闻列表）
├── components/
│   ├── ui/               # shadcn 风格原语 (Button, Badge, Separator)
│   ├── CommentItem.tsx   # 评论递归组件 (PostCard + NestedComment)
│   ├── CommentContext.tsx # 扁平数组 + HashMap 状态管理
│   ├── PostItem.tsx      # 首页帖子卡片
│   └── ...               # Auth/Navbar/Footer/ThemeToggle
├── lib/
│   ├── agent/            # Agent 模块 (client, context-builder, summarizer, moderation)
│   ├── api.ts            # 前端 API 封装
│   ├── auth.ts           # JWT 签发/验证
│   ├── db.ts             # Prisma 全局单例
│   └── tree.ts           # 扁平数组转树算法
├── middleware.ts          # JWT 鉴权中间件
└── types/index.ts        # 共享类型
```

## ADR 记录

- **ADR-001**: 邻接表（parent_id）+ 应用层 buildCommentTree → O(n) 高效
- **ADR-002**: 软删除（isDeleted 标记）→ 保留后代回复上下文
- **ADR-003**: Next.js App Router → 单代码库一键启动
- **ADR-004**: SQLite → 零安装依赖

## 开发环境注意事项

- Prisma 使用 `globalThis` 全局单例，防止热更新创建多余连接锁死 SQLite
- RelativeTime 使用 `useEffect` + `mounted` 状态，防止 SSR 水合报错
- Next.js Middleware 通过克隆 `new Headers(request.headers)` 传递鉴权信息到 Route Handler
