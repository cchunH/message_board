# API 设计

## 接口总览

| 方法 | 路径 | 鉴权 | 描述 |
|------|------|------|------|
| POST | `/api/auth/register` | 否 | 注册 |
| POST | `/api/auth/login` | 否 | 登录 |
| GET | `/api/comments` | 否 | 获取全部留言 |
| POST | `/api/comments` | 是 | 发表/回复留言 |
| DELETE | `/api/comments/:id` | 是 | 删除留言（软删除） |
| PATCH | `/api/comments/:id` | 是 | 编辑留言 |
| GET | `/api/comments/:id/summary` | 否 | AI 摘要 |
| GET | `/api/agent/status` | 否 | Agent 模式查询 |

## 关键实现细节

- **XSS 防护**: POST/PATCH 时 `escapeHtml()` 实体编码 `<` `>` `&` `"` `'`
- **越权**: DELETE/PATCH 校验 `comment.userId !== userId` → 403
- **@AI 检测**: POST 中检测 content 包含 `@AI` 则调用 Agent 生成回复
- **内容审核**: POST 中 `moderateContent()` 关键词过滤
- **Middleware**: JWT 验证后通过克隆 `new Headers(request.headers)` 传递 `x-user-id`/`x-user-name`

## 错误码

200/201/400/401/403/404/429/500
