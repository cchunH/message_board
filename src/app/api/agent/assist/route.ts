import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { buildCommentTree } from "@/lib/tree";
import { summarizeThread, flattenTree } from "@/lib/agent/summarizer";
import { generateText } from "@/lib/agent/client";

interface AssistBody {
  task: "summary" | "draft";
  draft?: string;
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as AssistBody;
    const task = body.task;

    // grab the latest ~14 root comments as discussion context
    const recent = await prisma.comment.findMany({
      orderBy: { createdAt: "desc" },
      take: 60,
    });
    const rootIds = new Set(
      recent.filter((c) => !c.parentId).slice(0, 14).map((c) => c.id)
    );
    const inScope = recent.filter((c) => rootIds.has(c.id) || c.parentId && rootIds.has(c.parentId));

    if (task === "summary") {
      // build a tree of the most recent root thread
      const trees = buildCommentTree(
        inScope.map((c) => ({ ...c, createdAt: c.createdAt.toISOString() }))
      );
      const biggest = trees
        .map((t) => ({ t, size: 1 + countDescendants(t) }))
        .sort((a, b) => b.size - a.size)[0];

      if (biggest) {
        try {
          const summary = await summarizeThread(biggest.t);
          return NextResponse.json({
            kind: "summary",
            result: summary.summary,
            sentiment: summary.sentiment,
            tags: summary.tags,
            threadId: biggest.t.id,
            threadTitle: biggest.t.content.slice(0, 60),
          });
        } catch {
          // fall through to text fallback
        }
      }

      const prompt = `请用 80 字以内总结下面这些讨论的核心观点，给出一个简洁的概括：\n${recent
        .slice(0, 20)
        .map((c) => `- ${c.userName}：${c.content}`)
        .join("\n")}`;
      const text = await generateText(prompt);
      return NextResponse.json({
        kind: "summary",
        result: text,
        threadTitle: recent.find((c) => !c.parentId)?.content.slice(0, 60) || "近期讨论",
      });
    }

    if (task === "draft") {
      const draft = (body.draft || "").trim();
      const sample = recent
        .slice(0, 10)
        .map((c) => `- ${c.userName}：${c.content}`)
        .join("\n");
      const prompt = `你是「纳磁小纳」助手。请根据用户当前正在编写的草稿以及讨论场上下文，帮他构思一段 60~120 字的回复。语气自然、克制，可直接发表。\n\n讨论上下文：\n${sample}\n\n用户草稿：\n${draft || "(空)"}\n\n请只输出回复正文，不要加引号或额外说明。`;
      const text = await generateText(prompt);
      return NextResponse.json({
        kind: "draft",
        result: text.trim(),
      });
    }

    return NextResponse.json({ error: "未知任务" }, { status: 400 });
  } catch {
    return NextResponse.json({ error: "小纳暂时离线" }, { status: 500 });
  }
}

function countDescendants(node: { children: any[] }): number {
  return node.children.reduce((n, c) => n + 1 + countDescendants(c), 0);
}