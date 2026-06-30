# 开发任务分解

## 已完成阶段

### 阶段 1：项目初始化
- Next.js + TypeScript + Tailwind 脚手架
- Prisma Schema + 迁移 + 全局单例 db.ts
- .env 配置 + npm scripts (db:setup, test)

### 阶段 2：后端 API
- JWT 鉴权 (auth.ts + middleware.ts)
- 注册/登录 API (bcrypt)
- 留言 CRUD API (含 escapeHtml + 内容审核 + @AI 检测)
- AI 摘要 API (DFS 扁平化)
- 单元测试 (tree.test.ts, 5 tests)

### 阶段 3：前端组件
- AuthContext + AuthForm (分段按钮 Tab)
- Navbar (毛玻璃 + 主题切换)
- CommentContext (扁平数组 + HashMap)
- CommentItem (PostCard + NestedComment 双模式)
- PostItem (HN 风格列表项)

### 阶段 4：Agent 系统
- 智能 Mock：8 类话题关键词匹配，上下文感知回复
- 内容审核：关键词过滤
- 线程摘要：DFS 扁平化 + 结构化输出
- 种子数据中预置 18 条 AI 回复

### 阶段 5：UI 复刻
- shadcn Button/Badge/Separator 原语
- next-themes 暗色模式
- grid-rows 折叠动画
- Footer + Inter 字体

### 阶段 6：Docker
- Dockerfile (多阶段构建)
- docker-compose.yml (Volume 挂载 SQLite)
- entrypoint.sh (migrate + seed + start)
