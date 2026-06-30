# 纳磁科技留言板 (NACi Message Board)

**Ink & Ash** 暗黑粗野主义设计 | 无限层级嵌套回复 | AI 智能体 · 星穹背景 · 侧边栏线程聚焦

## 快速启动

```bash
npm install                # 安装依赖
npm run db:setup           # 初始化 SQLite + 写入 9 帖 60+ 条种子数据
npm run dev                # 启动 → http://localhost:3000
```

部署/分享打包：

```bash
npm run build              # 生产构建验证
npm start                  # 生产模式启动（需先 build）
```

首次进入默认深色模式 + 星穹动效背景。访客可浏览，注册后发帖/回复/@AI。

## 测试账号

| 用户名 | 密码 |
|--------|------|
| alice | test123 |
| bob | test456 |
| charlie | test789 |

## 页面路由

| 路由 | 说明 |
|------|------|
| `/` | 品牌 Landing 页 — NaciLogo 磁极首屏 + CTA 进入讨论 |
| `/board` | 讨论场 — 列表/时光流双视图 |
| `/board/post/[id]` | 帖子详情 — 树形/分组时间流 + 侧边栏线程聚焦 |
| `/login` | 注册/登录 |

## 核心交互

### 帖子详情页三重视图
- **树形** — 递归嵌套评论，hover 祖先路径高亮 + 非相关节点半透明淡出
- **分组时间流** — 按根回复分组，组内按时间正序 + 可选展开/折叠
- **侧边栏线程聚焦** — 点击回复数按钮，右滑抽屉展示该分支完整讨论 + 底部直接回复

### AI 智能体
- **@ai小纳** — 输入框键入 `@ai` 弹出助手面板 → 可选 "总结最近讨论" 或 "帮助构思回复"; 结果可填入草稿或复制
- **@提及** — 输入 `@` 弹出提及候选栏（楼主/最近评论者/AI小纳），点击自动插入
- **@AI 智能回复** — 帖子中提到 `@AI` 触发链式上下文 AI 回复（未配 OpenAI Key 时 Mock 降级，含 8 类话题匹配）
- **DFS 线程摘要** — 帖子详情中 AI 深度遍历讨论树生成结构化摘要 + 情感标签 + 话题标签
- **内容审核** — 发帖时后端自动检测违规内容

### 设计系统
- **Ink & Ash** 暗黑粗野主义 — 硬黑边框 + 偏移实体阴影 + 电光青单色 accent
- **念珠链 + 级联条带** — 已移除，恢复简洁缩进 + hover 路径高亮
- **星穹背景** — 深色模式下 3 层星辰漂移动效（Uiverse.io 改编），浅色自动隐藏
- **NaciLogo** — 纯几何手绘 SVG，`currentColor` 自适应主题颜色
- **默认深色模式** — `next-themes` 配合 CSS 变量切换，全局 `dark` class

## 技术栈

- **全栈**: Next.js 16 (App Router) · TypeScript · Tailwind CSS v4
- **ORM**: Prisma 7 · SQLite（零安装）
- **鉴权**: JWT (jose) + bcrypt
- **AI**: OpenAI API（可选，未配 → Mock 降级）
- **测试**: Vitest

## 项目结构

```
src/
├── app/
│   ├── api/
│   │   ├── agent/assist/       # @ai小纳 助手路由
│   │   ├── agent/status/       # Agent 模式查询
│   │   ├── auth/               # 注册/登录
│   │   └── comments/           # CRUD + 线程摘要
│   ├── board/                  # 讨论场 + 帖子详情
│   ├── login/
│   └── page.tsx                # Landing 首页
├── components/
│   ├── CommentItem.tsx         # 嵌套评论（hover 高亮 + drawer 触发）
│   ├── CommentForm.tsx         # 回复表单（@提及 + @ai小纳 助手）
│   ├── GroupedTimeline.tsx     # 分组时间流视图
│   ├── ThreadDrawer.tsx        # 右侧侧边栏线程聚焦
│   ├── HoverContext.tsx        # 全局 hover 路径高亮状态
│   ├── AssistantBubble.tsx     # @ai小纳 助手气泡面板
│   ├── MentionPopup.tsx        # @提及 候选弹窗
│   ├── NaciLogo.tsx            # 品牌 Logo SVG
│   ├── Starfield.tsx           # 星穹背景组件
│   ├── Navbar.tsx              # 导航栏
│   ├── PostItem.tsx            # 列表行组件
│   ├── TimelineView.tsx        # 首页时光流
│   ├── AuthContext.tsx         # 认证状态管理
│   └── AuthForm.tsx            # 登录注册表单
├── lib/
│   ├── agent/                  # Agent 模块（LLM/Mock/审核/摘要/上下文构建）
│   ├── auth.ts                 # JWT 签发/验证
│   ├── api.ts                  # 前端 API 封装
│   ├── db.ts                   # Prisma 单例
│   └── tree.ts                 # DFS 树构建算法
├── styles/
│   └── starfield.css           # 星穹 CSS（3 层星辰 + 循环动画）
└── types/
    └── index.ts
```

## 播种数据

种子生成 9 个主题帖、60+ 条留言（含 21 条 AI 回复），最深嵌套 7 层。话题涵盖 Next.js / Prisma / TypeScript / Tailwind v4 / Rust / AI / 微前端 / 前端测试。AI 自然参与各技术栈讨论，可直接验证所有功能。

## License

MIT