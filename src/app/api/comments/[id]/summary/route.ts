import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { buildCommentTree } from "@/lib/tree";
import { summarizeThread } from "@/lib/agent/summarizer";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const root = await prisma.comment.findUnique({
      where: { id },
      include: { children: true },
    });

    if (!root) {
      return NextResponse.json({ error: "留言不存在" }, { status: 404 });
    }

    // 获取该根留言的所有子孙回复
    const allComments = await prisma.comment.findMany({
      orderBy: { createdAt: "asc" },
    });

    // 构建树并找到对应子树
    const fullTree = buildCommentTree(
      allComments.map((c) => ({ ...c, createdAt: c.createdAt.toISOString() }))
    );
    const targetTree = fullTree.find((n) => n.id === id);
    if (!targetTree) {
      return NextResponse.json({ error: "无法构建摘要" }, { status: 400 });
    }

    const summary = await summarizeThread(targetTree);
    return NextResponse.json(summary);
  } catch {
    return NextResponse.json({ error: "服务器错误" }, { status: 500 });
  }
}
