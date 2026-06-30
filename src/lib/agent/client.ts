type Provider = "openai" | "mock";

let _provider: Provider | null = null;

function detectProvider(): Provider {
  if (_provider !== null) return _provider;
  _provider = process.env.OPENAI_API_KEY ? "openai" : "mock";
  return _provider;
}

export function getAgentMode(): { enabled: true; mode: Provider; features: string[] } {
  return {
    enabled: true,
    mode: detectProvider(),
    features: ["reply", "summary", "moderation"],
  };
}

// ───── Smart Mock: parse conversation context for relevant replies ─────

interface MockRule {
  keywords: RegExp;
  replies: string[];
}

const MOCK_RULES: MockRule[] = [
  {
    keywords: /Next\.js|App Router|Server Component|RSC|Pages Router/i,
    replies: [
      "根据 Next.js 官方的建议，App Router 是推荐的默认路由方案。Server Components 默认在服务端渲染，能显著减少客户端 JavaScript 体积。不过迁移时要注意：middleware 现在运行在 Edge Runtime，只支持有限的 Node.js API。",
      "补充一点：如果你在用 Next.js 14+，建议看看 `generateStaticParams` 和 `revalidate` 的配合，做 ISR 非常方便。相比 Pages Router 的 `getStaticPaths`，写法更直观。",
      "关于 Server Components 和 Client Components 的边界：一个简单的判断标准是——只要组件里用了 `useState`、`useEffect` 或者浏览器的 API，就加 `\"use client\"` 标记。其他情况默认都当 Server Component 用。",
    ],
  },
  {
    keywords: /Prisma|Drizzle|ORM|数据库|SQLite|Postgres|迁移|migrate/i,
    replies: [
      "Prisma 和 Drizzle 的取舍其实取决于项目阶段。早期快速迭代选 Prisma（Schema-first，自动生成类型）；后期追求性能和可控性迁移到 Drizzle（Code-first，SQL 透明）。不少团队是 Prisma 起步 + Drizzle 做优化路径。",
      "还有个被低估的选项：Prisma 的 `prisma.$queryRaw` 和 `prisma.$executeRaw` 可以直接写原生 SQL。遇到复杂查询时不用被 Prisma Client 的 API 限制住，直接在性能瓶颈处用原生 SQL 就行。",
    ],
  },
  {
    keywords: /TypeScript|类型|泛型|Decorator|const.*参数|satisfies/i,
    replies: [
      "TypeScript 5.x 的 const 类型参数确实是个大提升。这里有个实际场景：写 `createRoute` 这样的工厂函数时，用 `<const T extends string>` 可以让返回的路由对象类型保持字面量推断，IDE 自动补全体验直接上一个档次。",
      "关于 `satisfies`，除了配置对象，还有个高级用法：配合 `as const satisfies` 做两层校验。先用 `satisfies` 检查类型符合预期，同时保留 `as const` 的字面量推断。这在写 enum-like 对象时很有用。",
    ],
  },
  {
    keywords: /Tailwind|CSS|样式|响应式|暗色|主题/i,
    replies: [
      "Tailwind v4 的最大变化是配置方式从 JS 迁移到了 CSS。`@theme` 块替代了 `theme.extend`，`@import \"tailwindcss\"` 替代了 `@tailwind` 指令。迁移时最关键的一点：全局样式文件的结构变了，建议重新生成再迁移。",
      "如果项目用 next-themes 配合 Tailwind 做暗色模式，v4 的推荐做法是在 CSS 中用 `:root` 和 `.dark` 类定义变量，然后用 `hsl(var(--xxx))` 引用。这样切换 class 就能实现主题切换，不需要 `dark:` 前缀。",
    ],
  },
  {
    keywords: /Rust|Go|后端|性能|微服务|Axum|并发/i,
    replies: [
      "Rust 的性能优势在 IO 密集型场景其实没那么明显，真正的优势在 CPU 密集计算（比如图像处理、加密）。对于大多数 CRUD 服务，Node.js + TypeScript 配合 Prisma 已经足够快，不值得为了性能牺牲开发效率。",
      "如果团队规模小（<5人），Go 是比 Rust 更务实的选择。学习曲线平缓，goroutine 的并发模型简单强大，编译速度和运行时性能都不错。Rust 更适合对内存安全和性能有极致要求的场景（如数据库引擎、操作系统组件）。",
    ],
  },
  {
    keywords: /AI|ChatGPT|v0|Cursor|Copilot|大模型/i,
    replies: [
      "AI 工具确实在改变开发流程，但有个关键认知：AI 不是替代开发者，而是改变开发者的时间分配。以前 70% 时间写样板代码，现在降到 30%，更多时间花在设计架构和需求分析上。这个趋势对初级开发者影响更大，反而更需要经验和判断力。",
      "关于 AI 代码质量：建议在 prompt 里加上具体的技术栈约束（比如【用 TypeScript，遵循 Airbnb 风格指南】），这样生成的代码质量会高很多。另外，让 AI 先生成测试再生成实现，效果出奇地好。",
    ],
  },
  {
    keywords: /Vim|Neovim|VSCode|编辑器|IDE/i,
    replies: [
      "Neovim + LazyVim 的组合确实很强大。对于 VSCode 用户想过渡，建议先装 VSCode-Neovim 插件用一个月，熟悉基本的 Vim motion（hjkl、w/b、ciw、dd 这些），然后再切到纯 Neovim。直接一步到位容易劝退。",
    ],
  },
  {
    keywords: /JavaScript|React|Vue|框架|前端/i,
    replies: [
      "2024 年前端框架的格局基本稳定了：React 主导企业级应用（生态最丰富），Vue 在中小项目和亚洲市场很强，Svelte 在性能和 DX 方面有亮点但生态还不够。选框架的关键不是技术上谁更好，而是团队熟悉度和社区第三方库的支持情况。",
    ],
  },
];

const FALLBACK_REPLIES = [
  "这是一个很好的问题！基于目前的上下文，我觉得关键在于找到适合自己团队和项目阶段的方案。没有银弹，只有权衡。",
  "感谢你提出这个讨论点。让我从工程实践的角度补充几句：在选型时，除了技术指标，更需要考虑团队能力、维护成本和社区生态的成熟度。",
  "综合前面的讨论，我觉得大家的观点都很有价值。实际操作中建议先做一个小范围的 PoC（概念验证），用数据说话，而不是凭感觉选型。",
];

function matchMockReply(prompt: string): string {
  for (const rule of MOCK_RULES) {
    if (rule.keywords.test(prompt)) {
      return rule.replies[Math.floor(Math.random() * rule.replies.length)];
    }
  }
  return FALLBACK_REPLIES[Math.floor(Math.random() * FALLBACK_REPLIES.length)];
}

// ───── Text Generation ─────

export async function generateText(prompt: string): Promise<string> {
  const provider = detectProvider();

  if (provider === "mock") {
    await new Promise((r) => setTimeout(r, 800 + Math.random() * 1500));
    return matchMockReply(prompt);
  }

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL || "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      max_tokens: parseInt(process.env.AI_MAX_TOKENS || "500"),
    }),
  });

  const data = await response.json();
  return data.choices[0].message.content;
}

// ───── Structured Generation ─────

export async function generateStructured<T>(prompt: string): Promise<T> {
  const text = await generateText(prompt);
  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) return JSON.parse(jsonMatch[0]);
  } catch {}
  return { summary: text.slice(0, 100), sentiment: "neutral", tags: ["讨论"] } as unknown as T;
}
