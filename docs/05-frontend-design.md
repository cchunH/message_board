# 前端设计

## 页面结构

| 路由 | 功能 |
|------|------|
| `/` | HN 风格新闻列表（PostCard 排行） |
| `/login` | 登录/注册 |
| `/post/[id]` | 帖子详情 + 递归评论树 |

## 核心架构：CommentContext

采用"扁平数组 + HashMap 分组"模式（借鉴 nested-comments 项目）：

```typescript
// commentsByParentId: 将 parentId 作为 key 分组
// rootComments = commentsByParentId["__root__"]
// getReplies(id) = commentsByParentId[id]
```

- 一次 fetch 全部留言，前端 O(1) 查询子回复
- 乐观更新：`createLocalComment` / `deleteLocalComment` 立即可见
- `rootPostId` prop 支持单个帖子详情视图

## 组件层次

```
page.tsx (首页)
├── Navbar (毛玻璃 sticky header + 主题切换)
├── CommentForm (发表框)
└── PostItem[] (序号 · ▲ · 标题 · 元数据行)
    └── Link → /post/[id]

post/[id]/page.tsx (详情)
├── CommentProvider(rootPostId)
├── PostHeader (大标题 + 元数据)
├── CommentForm (回复框)
└── NestedComment[] (递归渲染)
    ├── Header (作者 · 时间)
    ├── Content (固定 pl-5 缩进)
    ├── Actions (折叠 · 回复 · 编辑 · 删除)
    └── Children (固定 pl-10 + grid 动画)
```

## CommentItem 双模式

| variant | 场景 | 渲染 |
|---------|------|------|
| `list` | 首页列表 | PostCard：标题 + 元数据行 + 折叠箭头 |
| `detail` | 帖子详情 | 直接渲染子回复，跳过重复卡片 |

## 关键细节

- **折叠动画**: `grid-rows-[1fr/0fr]` + `duration-300` (复刻 hackernews)
- **固定缩进**: 内容 `pl-5`，子回复 `pl-10`（不随深度递增）
- **防 hydration**: RelativeTime 首屏绝对时间 → useEffect 切换相对时间
- **深色模式**: next-themes + CSS 变量 HSL 系统
