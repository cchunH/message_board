import type { Comment, CommentNode } from "@/types";

export function buildCommentTree(comments: Comment[]): CommentNode[] {
  const map: Record<string, CommentNode> = {};
  const roots: CommentNode[] = [];

  for (const c of comments) {
    map[c.id] = { ...c, children: [] };
  }

  for (const c of comments) {
    const node = map[c.id];
    if (c.parentId && map[c.parentId]) {
      map[c.parentId].children.push(node);
    } else {
      roots.push(node);
    }
  }

  roots.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return roots;
}
