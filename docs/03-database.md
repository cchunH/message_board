# 数据库设计

## Prisma Schema

```prisma
model User {
  id        String    @id @default(uuid())
  username  String    @unique
  password  String    // bcrypt 哈希
  createdAt DateTime  @default(now())
  comments  Comment[]
}

model Comment {
  id        String    @id @default(uuid())
  parentId  String?   // null = 顶级留言
  userId    String
  userName  String    // 冗余，避免 N+1 查询
  content   String
  isDeleted Boolean   @default(false)
  createdAt DateTime  @default(now())

  user      User      @relation(fields: [userId], references: [id])
  parent    Comment?  @relation("CommentReplies", fields: [parentId], references: [id])
  children  Comment[] @relation("CommentReplies")

  @@index([parentId])
  @@index([createdAt])
  @@index([userId, createdAt])
}
```

## 查询策略

- **首页列表**: `findMany` 全部留言，按 createdAt desc 排序，应用层 HashMap 分组建树
- **子回复**: `commentsByParentId[parentId]` O(1) 查询，上下文驱动
- **软删除**: `update({ isDeleted: true })`，不物理删除

## 种子数据

54 条留言，7 个主题帖，最深 7 层嵌套，含 18 条 AI 回复和 1 条已删除留言。
测试账号：alice/test123、bob/test456、charlie/test789
