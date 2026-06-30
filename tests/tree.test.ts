/// <reference types="vitest" />
import { describe, it, expect } from "vitest";
import { buildCommentTree } from "@/lib/tree";
import type { Comment } from "@/types";

function makeComment(overrides: Partial<Comment> = {}): Comment {
  return {
    id: "c1",
    parentId: null,
    userId: "u1",
    userName: "test",
    content: "test",
    isDeleted: false,
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}

describe("buildCommentTree", () => {
  it("空数组返回空数组", () => {
    expect(buildCommentTree([])).toEqual([]);
  });

  it("扁平数组转换为正确的树形结构", () => {
    const comments: Comment[] = [
      makeComment({ id: "1", parentId: null, createdAt: "2026-01-01T00:00:00Z" }),
      makeComment({ id: "2", parentId: "1", createdAt: "2026-01-02T00:00:00Z" }),
    ];

    const tree = buildCommentTree(comments);
    expect(tree).toHaveLength(1);
    expect(tree[0].id).toBe("1");
    expect(tree[0].children).toHaveLength(1);
    expect(tree[0].children[0].id).toBe("2");
  });

  it("多级嵌套正确构建", () => {
    const comments: Comment[] = [
      makeComment({ id: "1", parentId: null, createdAt: "2026-01-01T00:00:00Z" }),
      makeComment({ id: "2", parentId: "1", createdAt: "2026-01-02T00:00:00Z" }),
      makeComment({ id: "3", parentId: "2", createdAt: "2026-01-03T00:00:00Z" }),
    ];

    const tree = buildCommentTree(comments);
    expect(tree[0].children[0].children).toHaveLength(1);
    expect(tree[0].children[0].children[0].id).toBe("3");
  });

  it("孤儿节点（parentId 指向不存在的节点）作为根节点", () => {
    const comments: Comment[] = [
      makeComment({ id: "1", parentId: "nonexistent", createdAt: "2026-01-01T00:00:00Z" }),
    ];

    const tree = buildCommentTree(comments);
    expect(tree).toHaveLength(1);
    expect(tree[0].id).toBe("1");
  });

  it("顶级留言按时间倒序排列", () => {
    const comments: Comment[] = [
      makeComment({ id: "1", parentId: null, createdAt: "2026-01-01T00:00:00Z" }),
      makeComment({ id: "2", parentId: null, createdAt: "2026-01-03T00:00:00Z" }),
      makeComment({ id: "3", parentId: null, createdAt: "2026-01-02T00:00:00Z" }),
    ];

    const tree = buildCommentTree(comments);
    expect(tree.map((c) => c.id)).toEqual(["2", "3", "1"]);
  });
});
