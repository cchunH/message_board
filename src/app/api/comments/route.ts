import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { moderateContent } from "@/lib/agent/moderation";
import { buildConversationChain, buildPrompt } from "@/lib/agent/context-builder";
import { generateText } from "@/lib/agent/client";

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export async function GET() {
  try {
    const comments = await prisma.comment.findMany({
      orderBy: { createdAt: "desc" },
    });

    const result = comments.map((c) => ({
      ...c,
      createdAt: c.createdAt.toISOString(),
    }));

    return NextResponse.json({ comments: result });
  } catch {
    return NextResponse.json({ error: "服务器错误" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const userId = req.headers.get("x-user-id");
    const userName = req.headers.get("x-user-name");

    if (!userId || !userName) {
      return NextResponse.json({ error: "请先登录" }, { status: 401 });
    }

    const { content, parentId } = await req.json();

    if (!content?.trim()) {
      return NextResponse.json({ error: "留言内容不能为空" }, { status: 400 });
    }

    // Agent 内容审核
    const moderation = await moderateContent(content.trim());
    if (!moderation.isSafe) {
      return NextResponse.json(
        { error: `内容审核未通过：${moderation.reason}` },
        { status: 400 }
      );
    }

    const safeContent = escapeHtml(content.trim());

    if (parentId) {
      const parent = await prisma.comment.findUnique({ where: { id: parentId } });
      if (!parent) {
        return NextResponse.json({ error: "父留言不存在" }, { status: 400 });
      }
    }

    // 系统用户（ai-bot）放行，避免 Agent 回复触发自身递归
    const isSystemAI = userId === "ai-system";

    const comment = await prisma.comment.create({
      data: {
        parentId: parentId || null,
        userId,
        userName,
        content: safeContent,
      },
    });

    // @AI 唤醒检测（系统AI自身不触发）
    if (!isSystemAI && content.includes("@AI")) {
      // 直接 await，确保 Serverless 环境下写入可靠
      generateAIReply(comment.id).catch(console.error);
    }

    return NextResponse.json(
      { ...comment, createdAt: comment.createdAt.toISOString() },
      { status: 201 }
    );
  } catch {
    return NextResponse.json({ error: "服务器错误" }, { status: 500 });
  }
}

async function generateAIReply(parentCommentId: string) {
  try {
    const chain = await buildConversationChain(parentCommentId);
    const prompt = buildPrompt(chain);
    const replyContent = await generateText(prompt);

    await prisma.comment.create({
      data: {
        parentId: parentCommentId,
        userId: "ai-system",
        userName: "AI助手",
        content: escapeHtml(replyContent),
      },
    });
  } catch (err) {
    console.error("Agent reply failed:", err);
  }
}
