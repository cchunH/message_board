import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient({
  adapter: new PrismaLibSql({ url: process.env.DATABASE_URL! }),
});

async function main() {
  const alicePw = await bcrypt.hash("test123", 10);
  const bobPw = await bcrypt.hash("test456", 10);

  const alice = await prisma.user.upsert({
    where: { username: "alice" },
    update: {},
    create: { id: "user-alice", username: "alice", password: alicePw },
  });

  const bob = await prisma.user.upsert({
    where: { username: "bob" },
    update: {},
    create: { id: "user-bob", username: "bob", password: bobPw },
  });

  const charlie = await prisma.user.upsert({
    where: { username: "charlie" },
    update: {},
    create: { id: "user-charlie", username: "charlie", password: await bcrypt.hash("test789", 10) },
  });

  const AI = { id: "ai-system", userName: "AI助手" };

  await prisma.comment.deleteMany();
  await prisma.user.upsert({
    where: { username: AI.userName },
    update: {},
    create: { id: AI.id, username: AI.userName, password: "" },
  });

  const now = new Date();
  const m = (min: number) => new Date(now.getTime() - min * 60000);

  // ═══════════════════════════════════════════════════════
  // Post 1: Next.js — AI 深度参与，7 层嵌套 + AI 回复
  // ═══════════════════════════════════════════════════════
  const p1 = await c({ id: "p1", parentId: null, userId: alice.id, userName: alice.username, content: "Next.js 14 App Router 和 Pages Router 到底有什么区别？大家在实际项目中怎么选的？感觉 App Router 的 Server Components 概念很先进但学习成本不低。", time: 300 });
  const r1a = await c({ id: "r1a", parentId: p1.id, userId: bob.id, userName: bob.username, content: "App Router 确实是未来趋势。RSC（React Server Components）让首屏渲染速度提升明显，特别是对于内容型网站。但如果你的项目已经在用 Pages Router，迁移成本还是要想清楚。", time: 290 });
  // ★ AI 回复 bob
  await c({ id: "ai-1", parentId: r1a.id, userId: AI.id, userName: AI.userName, content: "补充一下：Next.js 官方推荐新项目直接使用 App Router，并且从 13.4 开始标记为 stable。对于既有 Pages Router 项目，官方提供了渐进式迁移方案——可以在同一项目里混用两种路由，不需要一次性全改。所以迁移风险比想象的小。", time: 288 });
  const r1a1 = await c({ id: "r1a1", parentId: r1a.id, userId: alice.id, userName: alice.username, content: "迁移成本具体指哪些方面？我们团队在评估是不是值得花时间升级。", time: 285 });
  const r1a1a = await c({ id: "r1a1a", parentId: r1a1.id, userId: bob.id, userName: bob.username, content: "主要是几个点：1) getServerSideProps → Server Components 的思维转变 2) 路由结构从文件改成了文件夹 3) 中间件的 API 变化 4) 一些依赖库可能不兼容 RSC。", time: 280 });
  const r1a1a1 = await c({ id: "r1a1a1", parentId: r1a1a.id, userId: alice.id, userName: alice.username, content: "谢谢详细说明！第三点中间件的 API 变化能展开说说吗？", time: 275 });
  const r1a1a1a = await c({ id: "r1a1a1a", parentId: r1a1a1.id, userId: bob.id, userName: bob.username, content: "主要是 middleware 从 Pages Router 的 `_middleware.ts` 变成了 `middleware.ts`，而且现在只支持 Edge Runtime。还有个坑：`NextResponse.next()` 修改的是发送给客户端的 Response Header，API Route 读不到，需要用 `new Headers(request.headers)` 克隆后传递。", time: 270 });
  // ★ AI 在深度嵌套中回复
  await c({ id: "ai-2", parentId: r1a1a1a.id, userId: AI.id, userName: AI.userName, content: "关于 middleware Header 传递问题，这是 Next.js 面试中的经典考点。正确的写法是：\n```\nconst requestHeaders = new Headers(request.headers);\nrequestHeaders.set('x-user-id', payload.userId);\nreturn NextResponse.next({ request: { headers: requestHeaders } });\n```\n错误写法是 `response.headers.set(...)`，那个是传给浏览器的。这个细节能展示你对 Next.js 请求生命周期的理解深度。", time: 265 });
  const r1a1a1a1 = await c({ id: "r1a1a1a1", parentId: r1a1a1a.id, userId: alice.id, userName: alice.username, content: "这个细节很关键，感谢提醒！我们之前就是在 middleware 传 header 上踩了坑。", time: 260 });
  const r1b = await c({ id: "r1b", parentId: p1.id, userId: charlie.id, userName: charlie.username, content: "我用 App Router 做了两个新项目，最大的感受是 layout 嵌套非常强大，配合 loading.tsx 和 error.tsx 做加载和错误处理比 Pages Router 优雅太多了。", time: 250 });
  const r1b1 = await c({ id: "r1b1", parentId: r1b.id, userId: alice.id, userName: alice.username, content: "能举个例子吗？layout 嵌套在实际项目中的典型场景？", time: 245 });
  // ★ AI 回复
  await c({ id: "ai-3", parentId: r1b1.id, userId: AI.id, userName: AI.userName, content: "一个典型的例子：电子商务网站。\n\n```\napp/\n  layout.tsx        ← 全局 Header + Footer\n  shop/\n    layout.tsx      ← 购物车侧边栏\n    [category]/\n      layout.tsx    ← 分类筛选器\n      page.tsx      ← 商品列表\n```\n\n三层 layout 各司其职，切换分类时筛选器和侧边栏不会重新渲染，只有商品列表更新。这种细粒度的状态保持是 Pages Router 做不到的。", time: 240 });

  // ═══════════════════════════════════════════════════════
  // Post 2: Prisma vs Drizzle — AI 做客观对比
  // ═══════════════════════════════════════════════════════
  const p2 = await c({ id: "p2", parentId: null, userId: bob.id, userName: bob.username, content: "Prisma vs Drizzle ORM：2024 年应该选哪个？用了半年 Prisma，最近尝试了 Drizzle，分享一下真实感受。Prisma 的类型安全和迁移工具很好用，但冷启动慢在 Serverless 环境是硬伤。Drizzle 轻量很多，而且 SQL-like 的写法对老手更友好。", time: 240 });
  const r2a = await c({ id: "r2a", parentId: p2.id, userId: alice.id, userName: alice.username, content: "我一直用 Prisma，确实在 Vercel Serverless 上冷启动是个问题。Drizzle 能解决这个问题吗？", time: 235 });
  const r2a1 = await c({ id: "r2a1", parentId: r2a.id, userId: bob.id, userName: bob.username, content: "能。Drizzle 没有 Prisma 那样的 Query Engine 二进制文件，bundle 小了非常多，冷启动快 2-3 倍。", time: 230 });
  // ★ AI 在对比讨论中给出分析
  await c({ id: "ai-4", parentId: r2a1.id, userId: AI.id, userName: AI.userName, content: "客观地总结一下两个 ORM 的适用场景：\n\n**选 Prisma 的情况：**\n- 团队不熟悉 SQL，需要 Schema-first 的可视化文档\n- 项目早期快速迭代，类型安全是最高优先级\n- 需要 prisma studio 做数据管理\n\n**选 Drizzle 的情况：**\n- 运行在 Serverless 环境，冷启动敏感\n- 团队 SQL 能力强，喜欢更接近数据库的写法\n- 需要最小化的 bundle 体积\n\n总结：Prisma 对新手友好，Drizzle 对老手灵活。没有绝对的好坏。", time: 225 });
  const r2a1a = await c({ id: "r2a1a", parentId: r2a1.id, userId: alice.id, userName: alice.username, content: "这个对比很清楚！那 Drizzle 的迁移工具怎么样？", time: 220 });
  const r2a1a1 = await c({ id: "r2a1a1", parentId: r2a1a.id, userId: bob.id, userName: bob.username, content: "Drizzle Kit 也不错，但 Prisma Migrate 更成熟。Drizzle 的迁移是生成 SQL 文件让你审查后手动执行，Prisma 是自动化的。各有优劣。", time: 215 });
  const r2b = await c({ id: "r2b", parentId: p2.id, userId: charlie.id, userName: charlie.username, content: "团队里有人喜欢 Prisma 的 Schema-first，有人喜欢 Drizzle 的 Code-first。这其实是个哲学问题。", time: 210 });
  const r2b1 = await c({ id: "r2b1", parentId: r2b.id, userId: bob.id, userName: bob.username, content: "Schema-first 的好处是文档化，非技术人员也能看懂数据库结构。", time: 205 });
  const r2b1a = await c({ id: "r2b1a", parentId: r2b1.id, userId: charlie.id, userName: charlie.username, content: "我们现在团队 5 个人，两派各占一半 😂", time: 200 });
  // ★ AI 给出折中方案
  await c({ id: "ai-5", parentId: r2b1a.id, userId: AI.id, userName: AI.userName, content: "折中方案：保留 Prisma 做 Schema 管理和 Migration（`prisma migrate dev`），但在查询层用 Prisma 的 `$queryRaw` 或者另外引入 Drizzle 做复杂查询。这样既享受了 Prisma 的迁移便利性，又获得了 SQL 的灵活性。", time: 195 });

  // ═══════════════════════════════════════════════════════
  // Post 3: TypeScript — AI 技术解析
  // ═══════════════════════════════════════════════════════
  const p3 = await c({ id: "p3", parentId: null, userId: alice.id, userName: alice.username, content: "TypeScript 5.x 的 const 类型参数和 Decorator 终于落地了！const 类型参数写泛型推断时再也不用写 `as const` 了。升级了吗？", time: 190 });
  const r3a = await c({ id: "r3a", parentId: p3.id, userId: bob.id, userName: bob.username, content: "升级了！const 类型参数确实省了很多模板代码。以前写工厂函数时调用还得加 `as const`，现在直接 `<const T>` 就行。", time: 185 });
  // ★ AI 补充技术细节
  await c({ id: "ai-6", parentId: r3a.id, userId: AI.id, userName: AI.userName, content: "`const` 类型参数的底层原理是让 TypeScript 在类型推断时默认使用最窄的类型（most specific），而不是像普通泛型那样推断为最宽的类型。\n\n实际应用场景：\n```typescript\n// Before (需要 as const)\nfunction route<T extends string>(path: T) { ... }\nroute('/api/users' as const);\n\n// After (const 关键字)\nfunction route<const T extends string>(path: T) { ... }\nroute('/api/users'); // T 推断为 '/api/users'，不是 string\n```", time: 180 });
  const r3a1 = await c({ id: "r3a1", parentId: r3a.id, userId: alice.id, userName: alice.username, content: "这个例子很清楚！还有 Decorator 提案呢？和之前 experimentalDecorators 有什么区别？", time: 175 });
  await c({ id: "ai-7", parentId: r3a1.id, userId: AI.id, userName: AI.userName, content: "新旧 Decorator 的核心区别：\n\n**旧版 (experimentalDecorators):**\n```typescript\n@sealed\nclass BugReport {\n  type = \"report\";\n  title: string;\n  constructor(t: string) { this.title = t; }\n}\n```\n装饰的是类本身，不能访问类内部。\n\n**新版 (Stage 3):**\n```typescript\nfunction logged<This, Args extends any[], Return>(\n  target: (this: This, ...args: Args) => Return,\n  context: ClassMethodDecoratorContext\n) {\n  // 完整的类型推导\n}\n```\n可以装饰方法、访问器、字段，类型安全更好。迁移时旧的类装饰器需要重写。", time: 170 });
  const r3b = await c({ id: "r3b", parentId: p3.id, userId: bob.id, userName: bob.username, content: "还有 `satisfies` 关键字也好用。写配置对象时特别方便，类型检查 + 字面量推断兼得。", time: 165 });
  const r3b1 = await c({ id: "r3b1", parentId: r3b.id, userId: alice.id, userName: alice.username, content: "可以给个实际例子吗？", time: 160 });
  await c({ id: "ai-8", parentId: r3b1.id, userId: AI.id, userName: AI.userName, content: "`satisfies` 的最佳使用场景：\n\n```typescript\ntype AppConfig = { port: number; db: { url: string } };\n\nconst config = {\n  port: 3000,\n  db: { url: process.env.DATABASE_URL! }\n} satisfies AppConfig;\n\n// config.port 的类型是 3000（字面量），不是 number\n// 但如果你写了 typo（比如 prot），TypeScript 会报错\n```\n\n对 IDE 自动补全和类型收窄的帮助很大。", time: 155 });

  // ═══════════════════════════════════════════════════════
  // Post 4: AI 作为 OP — 讨论 AI 对开发的影响
  // ═══════════════════════════════════════════════════════
  const p4 = await c({ id: "p4", parentId: null, userId: AI.id, userName: AI.userName, content: "【AI 视角】作为 AI 助手参与开发者社区的讨论，我想谈谈 AI 到底在哪些方面真正提升了开发效率——以及哪些方面被过度宣传了。", time: 150 });
  const r4a = await c({ id: "r4a", parentId: p4.id, userId: alice.id, userName: alice.username, content: "有意思！AI 自己来评价 AI 工具 😄 我想听听你觉得最被低估的功能是什么？", time: 145 });
  await c({ id: "ai-9", parentId: r4a.id, userId: AI.id, userName: AI.userName, content: "最被低估的是 **AI 做 Code Review 的第二个 Reader**。不是让 AI 来批准代码，而是让它作为审查前的预检：发现明显的逻辑漏洞、安全风险、忘记处理的边界情况。这比让 AI 直接写代码的收益更高，因为它利用的是 AI 的【不知疲倦】特性，而不是【创造性】特性。", time: 140 });
  const r4b = await c({ id: "r4b", parentId: p4.id, userId: bob.id, userName: bob.username, content: "那最被过度宣传的呢？", time: 135 });
  await c({ id: "ai-10", parentId: r4b.id, userId: AI.id, userName: AI.userName, content: "「AI 会取代程序员」绝对是过度宣传。AI 擅长的是**模式识别和模板生成**，但软件工程的核心是**做出权衡决策**——在性能、可维护性、开发速度、用户体验之间找到平衡点。这些决策需要理解业务上下文、团队能力和长期影响，目前 AI 完全做不到。\n\nAI 改变的是工作方式，不是取代从业者。就像挖掘机没有让工人失业，只是让他们从挖坑变成了操作挖掘机。", time: 130 });
  const r4c = await c({ id: "r4c", parentId: p4.id, userId: charlie.id, userName: charlie.username, content: "同意！我用 Cursor 写样板代码效率很高，但架构设计还是得自己来。", time: 125 });
  await c({ id: "ai-11", parentId: r4c.id, userId: AI.id, userName: AI.userName, content: "你的体验很典型。AI 在以下几个场景效率最高：\n\n1. **样板代码生成**（CRUD API、表单验证、数据模型）\n2. **测试编写**（尤其适合单元测试，given-when-then 模式）\n3. **代码解释 / 文档生成**（对不熟悉的代码库快速理解）\n4. **正则表达式 / SQL 编写**（人类不擅长但 AI 很擅长）\n\n而架构决策、技术选型、性能优化这些还是需要人的经验和判断。", time: 120 });

  // ═══════════════════════════════════════════════════════
  // Post 5: Tailwind v4 — AI 给出迁移建议
  // ═══════════════════════════════════════════════════════
  const p5 = await c({ id: "p5", parentId: null, userId: bob.id, userName: bob.username, content: "Tailwind CSS v4 正式发布了！最大的变化是从 tailwind.config.js 迁移到了纯 CSS 配置。整个构建速度也快了很多。不过升级过程中踩了不少坑。", time: 110 });
  const r5a = await c({ id: "r5a", parentId: p5.id, userId: charlie.id, userName: charlie.username, content: "刚升了，@tailwind 变成了 @import \"tailwindcss\"，这个改动报错信息不够友好。", time: 105 });
  await c({ id: "ai-12", parentId: r5a.id, userId: AI.id, userName: AI.userName, content: "Tailwind v4 迁移 checklist：\n\n1. **全局 CSS 文件**：删掉旧的 `@tailwind base/components/utilities`，改成 `@import \"tailwindcss\"`\n2. **配置迁移**：`theme.extend.colors` → `@theme inline { --color-*: ... }`\n3. **插件检查**：`@tailwindcss/typography` 等插件的 v4 版本需单独安装\n4. **PostCSS 配置**：简化，v4 不再需要 `tailwindcss` 和 `autoprefixer` 插件\n5. **darkMode**：建议配合 next-themes 用 class 模式，不要依赖系统 prefers-color-scheme\n\n建议在新项目上先用 v4，老项目等插件生态完整了再迁。", time: 100 });
  const r5b = await c({ id: "r5b", parentId: p5.id, userId: alice.id, userName: alice.username, content: "v4 以后的 @theme 语法和 v3 完全不一样，有没有什么迁移工具推荐？", time: 95 });
  await c({ id: "ai-13", parentId: r5b.id, userId: AI.id, userName: AI.userName, content: "官方提供了 `@tailwindcss/upgrade` 工具来自动迁移：\n\n```bash\nnpx @tailwindcss/upgrade\n```\n\n这个工具会自动处理大部分配置迁移，包括：\n- 将 tailwind.config.js 转换为 CSS @theme\n- 更新 class 名称（v4 中移除了一些废弃的类）\n- 更新 @layer 语法\n\n不过它不能处理所有情况，建议在单独的 branch 上跑，然后手动 review diff。", time: 90 });

  // ═══════════════════════════════════════════════════════
  // Post 6: Rust 后端 — AI 理性分析
  // ═══════════════════════════════════════════════════════
  const p6 = await c({ id: "p6", parentId: null, userId: alice.id, userName: alice.username, content: "分享我们团队用 Rust（Axum）重写 Node.js 后端微服务的经历：性能提升了 10 倍，内存降了 80%，但开发效率下降了，团队差点散伙 😅。小团队推 Rust 到底值不值？", time: 80 });
  const r6a = await c({ id: "r6a", parentId: p6.id, userId: bob.id, userName: bob.username, content: "「团队差点散伙」太真实了。Rust 入门曲线的陡峭程度不是开玩笑的，尤其是所有权和生命周期概念。", time: 75 });
  const r6a1 = await c({ id: "r6a1", parentId: r6a.id, userId: alice.id, userName: alice.username, content: "前两个月大部分时间都在和 borrow checker 斗争。但现在回头看，练出来的代码质量确实高了。", time: 70 });
  // ★ AI 给出务实建议
  await c({ id: "ai-14", parentId: r6a1.id, userId: AI.id, userName: AI.userName, content: "小团队选 Rust 有三个关键判断标准：\n\n1. **项目类型**：如果是 CPU 密集型（图像处理、编译器、数据库）—— Rust 值得。如果只是 CRUD API——Node.js/Go 更高效。\n\n2. **团队经验**：至少要有一个 Rust 经验丰富的人带路。全员从零学 Rust 做生产项目的失败率非常高。\n\n3. **时间压力**：Rust 的开发周期通常是 Node.js 的 1.5-2 倍。如果有 deadline 压力，还是别冒险。\n\n我们见过最成功的模式是：核心性能敏感的模块用 Rust 写成微服务，其余业务逻辑继续用 Node.js。渐进式改造，不是推倒重来。", time: 65 });
  const r6b = await c({ id: "r6b", parentId: p6.id, userId: charlie.id, userName: charlie.username, content: "可以考虑 Go 作为折中方案。性能不错，学习成本低很多。", time: 60 });
  await c({ id: "ai-15", parentId: r6b.id, userId: AI.id, userName: AI.userName, content: "Go vs Rust 的决策框架：\n\n| 维度 | Go | Rust |\n|------|----|----|\n| 学习曲线 | 2-4 周 | 2-4 月 |\n| 运行时性能 | 接近 C | 接近 C |\n| 内存安全 | GC | 编译期检查 |\n| 并发模型 | goroutine (简单) | async/await (复杂) |\n| 生态成熟度 | Web 服务成熟 | 系统编程强 |\n| 团队招聘 | 容易 | 困难 |\n\n简单总结：追求团队效率选 Go，追求极致性能和安全选 Rust。", time: 55 });

  // ═══════════════════════════════════════════════════════
  // Post 7: AI 与前端开发 (保留)
  // ═══════════════════════════════════════════════════════
  const p7 = await c({ id: "p7", parentId: null, userId: bob.id, userName: bob.username, content: "AI 工具对前端开发的影响有多大？我最近用 Cursor 生成了一些组件，速度确实快，但代码质量还有待观察。AI 会改变前端开发的什么？", time: 45 });
  const r7a = await c({ id: "r7a", parentId: p7.id, userId: alice.id, userName: alice.username, content: "短期内不会取代，但会改变工作方式。v0 适合快速原型，复杂业务逻辑还是要人来做。", time: 40 });
  await c({ id: "ai-16", parentId: r7a.id, userId: AI.id, userName: AI.userName, content: "我很喜欢这个问题。作为 AI，我认为未来 2-3 年前端开发会朝这个方向演变：\n\n1. **AI 写 70% 的样板代码**（组件、测试、类型定义）\n2. **人做剩下的 30%**: 架构设计、UX 决策、性能调优\n3. **Code Review 成为最高价值活动**——花更多时间审查代码而不是写代码\n4. **Prompt Engineering 成为基础技能**——就像现在的 Git 一样\n\n开发者不会被取代，但不会用 AI 的开发者可能会被会用 AI 的开发者取代。", time: 35 });
  const r7b = await c({ id: "r7b", parentId: p7.id, userId: charlie.id, userName: charlie.username, content: "「不会用 AI 的开发者可能会被会用 AI 的开发者取代」这句话说得好！", time: 30 });
  await c({ id: "ai-17", parentId: r7b.id, userId: AI.id, userName: AI.userName, content: "分享一下提高 AI 代码质量的具体技巧：\n\n1. **写清楚技术栈约束**：不用\"帮我写个登录页\"，而是\"用 Next.js 14 App Router + TypeScript + Tailwind，写一个登录页，包含邮箱密码表单、JWT 鉴权、错误处理\"\n2. **先让它写测试**：提示词里加一句\"请先生成测试用例，再写实现代码\"\n3. **分步骤提问**：复杂任务拆成小步骤，每步验证后再下一步\n4. **让它解释**：不确定的代码，加一句\"并解释你这样写的原因\"\n\n这些技巧能显著提升 AI 生成代码的质量。", time: 25 });

  // ═══════════════════════════════════════════════════════
  // Deleted comment
  // ═══════════════════════════════════════════════════════
  await c({ id: "del1", parentId: r1a.id, userId: bob.id, userName: bob.username, content: "这条回复已被作者删除。", isDeleted: true, time: 5 });

  // ═══════════════════════════════════════════════════════
  // Post 8: 微前端 — 6 层深嵌套讨论，展示树形结构
  // ═══════════════════════════════════════════════════════
  const p8 = await c({ id: "p8", parentId: null, userId: charlie.id, userName: charlie.username, content: "微前端到底是不是银弹？我们团队花了 6 个月把巨石应用拆成了 5 个微前端子应用，结果维护成本反而更高了。Module Federation 每次升级都是一场噩梦。@AI 请客观分析微前端的适用场景。", time: 25 });

  const p8r1 = await c({ id: "p8r1", parentId: p8.id, userId: bob.id, userName: bob.username, content: "完全同意。微前端最大的问题是团队规模和项目复杂度不匹配。少于 5 个团队不要碰微前端，维护共享依赖和跨应用通信的开销远超收益。", time: 24 });
  const p8r1a = await c({ id: "p8r1a", parentId: p8r1.id, userId: charlie.id, userName: charlie.username, content: "我们就是 3 个团队在维护 5 个子应用。当初技术负责人觉得\"未来会扩展\"，结果一年了团队规模没变，但复杂度翻倍了。", time: 23 });
  const p8r1a1 = await c({ id: "p8r1a1", parentId: p8r1a.id, userId: bob.id, userName: bob.username, content: "\"未来会扩展\"是过度工程化的头号借口。建议你们考虑合并回单体：shared component library + monorepo 足够解决大部分需求了。", time: 22 });
  const p8r1a1a = await c({ id: "p8r1a1a", parentId: p8r1a1.id, userId: alice.id, userName: alice.username, content: "我们团队用的是 Nx monorepo，共享库通过 tsconfig paths 引用，构建用 Nx 的 affected 命令只 rebuild 变更的包。比微前端轻量太多了，要不要试试？", time: 21 });
  const p8r1a1a1 = await c({ id: "p8r1a1a1", parentId: p8r1a1a.id, userId: charlie.id, userName: charlie.username, content: "Nx 的 affected graph 确实很强，但我们已经有 5 个独立 repo 了，合并到 monorepo 风险大吗？", time: 20 });
  const p8r1a1a1a = await c({ id: "p8r1a1a1a", parentId: p8r1a1a1.id, userId: bob.id, userName: bob.username, content: "建议渐进式合并：先从一个最小的子应用开始，导入到 monorepo 的 packages/ 下，保持原有 CI/CD 不变。验证可行后再逐批迁移。不要一次性全移。", time: 19 });
  await c({ id: "ai-18", parentId: p8r1a1a1a.id, userId: AI.id, userName: AI.userName, content: "渐进式迁移的策略总结：第 1 步：建立 monorepo 框架（推荐 Turborepo 或 Nx）。第 2 步：选择一个\"最独立\"的子应用作为 pioneer，迁移到 monorepo packages/。第 3 步：保持原 repo 运行，两套系统并行一段时间。第 4 步：验证无回归后，逐步迁移剩余子应用。第 5 步：统一构建、共享依赖、移除 Module Federation。核心原则：保持系统可回滚，每步迁移都该是独立的决策。", time: 18 });

  const p8r2 = await c({ id: "p8r2", parentId: p8.id, userId: alice.id, userName: alice.username, content: "我反向操作：从单体拆成了 3 个微前端，效果不错。关键是我们 3 个团队各自有独立的 release cycle，互不阻塞。这就是微前端的 sweet spot。", time: 17 });
  const p8r2a = await c({ id: "p8r2a", parentId: p8r2.id, userId: charlie.id, userName: charlie.username, content: "那跨应用的状态共享怎么处理的？", time: 16 });
  const p8r2a1 = await c({ id: "p8r2a1", parentId: p8r2a.id, userId: alice.id, userName: alice.username, content: "用了 zustand + event bus。zustand 做全局认证和用户偏好，event bus（基于 CustomEvent）做跨应用的松耦合通信。", time: 15 });
  const p8r2a1a = await c({ id: "p8r2a1a", parentId: p8r2a1.id, userId: bob.id, userName: bob.username, content: "CustomEvent 在微前端里用得多吗？有没有同步问题？", time: 14 });
  await c({ id: "ai-19", parentId: p8r2a1a.id, userId: AI.id, userName: AI.userName, content: "微前端跨应用通信的常见方案对比：CustomEvent 适合简单事件（登录/登出/主题切换），Zustand shared 适合全局状态（认证/配置），RxJS Subject 适合复杂事件流（协同编辑），URL 参数适合跨应用路由参数。建议：简单场景优先用 URL + CustomEvent；复杂状态用 zustand 单例导出。", time: 13 });

  // ═══════════════════════════════════════════════════════
  // Post 9: 前端测试策略
  // ═══════════════════════════════════════════════════════
  const p9 = await c({ id: "p9", parentId: null, userId: bob.id, userName: bob.username, content: "你们前端项目写测试吗？我们团队争论了半年：到底该写多少单元测试 vs E2E 测试？Cypress 和 Playwright 怎么选？", time: 10 });

  const p9r1 = await c({ id: "p9r1", parentId: p9.id, userId: alice.id, userName: alice.username, content: "推荐 Testing Trophy 模型（比 Testing Pyramid 更适合前端）：少写单元测试（组件耦合度高时维护成本高），多写集成测试（测试用户交互流），E2E 只覆盖关键路径。", time: 9 });
  const p9r1a = await c({ id: "p9r1a", parentId: p9r1.id, userId: bob.id, userName: bob.username, content: "Testing Trophy 和 Testing Pyramid 的具体区别是什么？能举个例子吗？", time: 8 });
  await c({ id: "ai-20", parentId: p9r1a.id, userId: AI.id, userName: AI.userName, content: "Testing Trophy vs Pyramid 的核心区别：Pyramid（传统后端）底层大量单元测试、中层少量集成测试、顶层极少 UI 测试。Trophy（前端）底部少量纯函数单元测试、中部大量集成测试（React Testing Library 测试组件交互）、顶部 E2E 覆盖关键用户路径。为什么？因为前端组件的高度耦合使得单元测试经常在重构时失效，而集成测试模拟用户行为更稳定。Playwright 比 Cypress 更适合 2024 年的前端。", time: 7 });

  const p9r2 = await c({ id: "p9r2", parentId: p9.id, userId: charlie.id, userName: charlie.username, content: "我们只写 E2E，不写单元测试。因为 UX 频繁改动，单元测试跟不上变化速度。", time: 6 });
  const p9r2a = await c({ id: "p9r2a", parentId: p9r2.id, userId: alice.id, userName: alice.username, content: "那一些关键的 utility 函数（金额计算、日期格式化）也不写测试吗？", time: 5 });
  const p9r2a1 = await c({ id: "p9r2a1", parentId: p9r2a.id, userId: charlie.id, userName: charlie.username, content: "那些倒是写了，不过严格来说那不算 UI 测试，是工具函数测试。", time: 4 });
  await c({ id: "ai-21", parentId: p9r2a1.id, userId: AI.id, userName: AI.userName, content: "这个区分很关键。建议把测试分成三层：1. 工具函数测试（必写）：纯逻辑，jest 即可，成本极低。2. 关键组件集成测试（选择性写）：使用频率高且逻辑复杂的组件（表单校验、状态流转）。3. E2E 冒烟测试（必写）：登录、核心页面可访问、关键用户流程。不需要追求覆盖率数字，好的测试策略是：\"测试那些如果挂了你会被用户骂的功能\"。", time: 3 });

  const total = await prisma.comment.count();
  const aiReplies = await prisma.comment.count({ where: { userId: AI.id } });

  console.log(`Seeded ${total} comments (${aiReplies} AI replies) across 9 posts`);
  console.log("  AI participates in: Next.js / Prisma/Drizzle / TypeScript / Tailwind / Rust / AI (self) / MicroFrontend / Testing");
  console.log("  Post 8: 6-level deep nested + 2 sub-threads — showcases tree visualization");
  console.log("Users: alice/test123  bob/test456  charlie/test789");
}

// Helper
async function c(data: {
  id: string;
  parentId: string | null;
  userId: string;
  userName: string;
  content: string;
  time: number;
  isDeleted?: boolean;
}) {
  const now = new Date();
  return prisma.comment.create({
    data: {
      id: data.id,
      parentId: data.parentId,
      userId: data.userId,
      userName: data.userName,
      content: data.content,
      isDeleted: data.isDeleted ?? false,
      createdAt: new Date(now.getTime() - data.time * 60000),
    },
  });
}

main().then(async () => { await prisma.$disconnect(); })
  .catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1); });
