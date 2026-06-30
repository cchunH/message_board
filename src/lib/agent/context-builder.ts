import { prisma } from "@/lib/db";

interface ConversationTurn {
  role: "user" | "assistant";
  name: string;
  content: string;
}

export async function buildConversationChain(
  commentId: string,
  maxDepth: number = 20
): Promise<ConversationTurn[]> {
  const chain: ConversationTurn[] = [];
  let current = await prisma.comment.findUnique({
    where: { id: commentId },
    select: { id: true, parentId: true, userName: true, content: true, isDeleted: true },
  });

  while (current && chain.length < maxDepth) {
    const isAI = current.userName === "AI助手";
    chain.unshift({
      role: isAI ? "assistant" : "user",
      name: current.userName,
      content: current.isDeleted ? "[已删除]" : current.content,
    });
    if (!current.parentId) break;
    current = await prisma.comment.findUnique({
      where: { id: current.parentId },
      select: { id: true, parentId: true, userName: true, content: true, isDeleted: true },
    });
  }

  return chain;
}

export function buildPrompt(chain: ConversationTurn[]): string {
  const conversation = chain
    .map((turn) => `[${turn.name}]: ${turn.content}`)
    .join("\n");

  return `你是一个友好的社区助手。根据以下对话上下文，给出简洁有帮助的回复。

对话历史：
${conversation}

请以"AI助手"的身份回复，控制在 200 字以内。`;
}
