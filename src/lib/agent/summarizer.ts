import { generateStructured } from "@/lib/agent/client";
import type { CommentNode } from "@/types";

interface ThreadSummary {
  summary: string;
  sentiment: "positive" | "negative" | "neutral" | "mixed";
  tags: string[];
}

function flattenTreeDFS(node: CommentNode, depth: number, lines: string[]): void {
  if (node.isDeleted) return;
  const indent = "  ".repeat(Math.min(depth, 3));
  lines.push(`${indent}[${node.userName}]: ${node.content}`);

  const sortedChildren = [...node.children].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );
  for (const child of sortedChildren) {
    flattenTreeDFS(child, depth + 1, lines);
  }
}

export function flattenTree(root: CommentNode): string {
  const lines: string[] = [];
  flattenTreeDFS(root, 0, lines);
  return lines.join("\n");
}

export async function summarizeThread(root: CommentNode): Promise<ThreadSummary> {
  const threadText = flattenTree(root);

  const prompt = `分析以下讨论内容，返回 JSON 格式的摘要。

讨论内容：
${threadText}

请严格按以下 JSON Schema 返回（不要包含其他文字）：
{
  "summary": "100字以内的讨论摘要",
  "sentiment": "positive|negative|neutral|mixed",
  "tags": ["标签1", "标签2", "标签3"]
}`;

  return generateStructured<ThreadSummary>(prompt);
}
