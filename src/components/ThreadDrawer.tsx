"use client";

import { useState } from "react";
import { X, MessageSquare, UserRound, Clock } from "lucide-react";
import { CommentForm } from "@/components/CommentForm";
import { RelativeTime } from "@/components/RelativeTime";
import { AIBadge } from "@/components/AIBadge";
import { useAuth } from "@/components/AuthContext";
import { useComments } from "@/components/CommentContext";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import type { Comment } from "@/types";

const LABELS = {
  branch: "\u8BA8\u8BBA\u5206\u652F",
  items: "\u6761",
  close: "\u5173\u95ED",
  noReplies: "\u6682\u65E0\u56DE\u590D",
  reply: "\u56DE\u590D",
  send: "\u53D1\u9001",
  loginToReply: "\u767B\u5F55\u540E\u53EF\u56DE\u590D",
  aiHelper: "AI\u52A9\u624B",
  aiXiaona: "AI\u5C0F\u7EB3",
};

interface ThreadDrawerProps {
  threadId: string | null;
  onClose: () => void;
}

function getAllDescendants(comments: Comment[], rootId: string): Comment[] {
  const result: Comment[] = [];
  const walk = (pid: string) => {
    for (const c of comments) {
      if (c.parentId === pid) { result.push(c); walk(c.id); }
    }
  };
  walk(rootId);
  return result;
}

export function ThreadDrawer({ threadId, onClose }: ThreadDrawerProps) {
  const { user } = useAuth();
  const { comments, fetchComments, createLocalComment } = useComments();
  const [refresh, setRefresh] = useState(0);

  if (!threadId) return null;

  const thread = comments.find((c) => c.id === threadId);
  if (!thread) return null;

  const descendants = getAllDescendants(comments, threadId)
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  const handleReply = async (content: string) => {
    const nc = await api.createComment(content, threadId);
    createLocalComment(nc);
    await fetchComments();
    setRefresh((k) => k + 1);
  };

  const isAIHelper = (name: string) => name === LABELS.aiHelper;

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-foreground/30 backdrop-blur-sm transition-opacity sm:bg-foreground/10"
        onClick={onClose}
        aria-hidden
      />

      <aside className={cn(
        "fixed right-0 top-0 z-50 h-full w-full flex flex-col bg-background border-l-2 border-border",
        "shadow-[-4px_0_0_hsl(var(--foreground)/0.4)]",
        "sm:w-[480px]",
        "transition-transform duration-200"
      )}>
        <div className="flex items-center justify-between gap-2 border-b-2 border-border px-4 py-3">
          <div className="flex items-center gap-2">
            <MessageSquare size={16} className="text-brand-primary" />
            <span className="text-sm font-semibold">{LABELS.branch}</span>
            <span className="text-[10px] font-mono text-muted-foreground">{descendants.length + 1} {LABELS.items}</span>
          </div>
          <button onClick={onClose} className="btn-brut">
            <X size={13} /> {LABELS.close}
          </button>
        </div>

        <div className="border-b-2 border-border/60 px-4 py-3.5">
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1.5">
            <UserRound size={11} />
            <span className="font-bold text-foreground">{thread.userName}</span>
            {isAIHelper(thread.userName) && <AIBadge />}
            <span className="text-muted-foreground/40">{"\u00B7"}</span>
            <RelativeTime date={thread.createdAt} />
          </div>
          <p className="text-sm leading-relaxed text-foreground/90">{thread.content}</p>
        </div>

        <div className="relative flex-1 overflow-y-auto px-4 py-2">
          <span className="absolute left-[19px] top-4 bottom-4 w-px bg-foreground/15" aria-hidden />
          <div className="space-y-3">
            {descendants.length === 0 && (
              <p className="py-6 text-center text-xs text-muted-foreground">{LABELS.noReplies}</p>
            )}
            {descendants.map((d) => (
              <div key={d.id + refresh} className="relative pl-6">
                <span className="absolute left-[7px] top-2.5 h-2.5 w-2.5 rounded-full border-2 border-foreground/80 bg-card" aria-hidden />
                <div className="rounded-md border-2 border-foreground/85 bg-card p-3 bs-hard hover:border-foreground">
                  <div className="flex items-center gap-2 text-[11px] text-muted-foreground mb-1">
                    <span className="font-bold text-foreground">{d.userName}</span>
                    {isAIHelper(d.userName) && <AIBadge />}
                    <span className="text-muted-foreground/40">{"\u00B7"}</span>
                    <RelativeTime date={d.createdAt} />
                  </div>
                  <p className="text-sm leading-relaxed text-foreground/90">{d.content}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t-2 border-border px-4 py-3">
          {user ? (
            <CommentForm
              autoFocus
              parentId={threadId}
              placeholder={`${LABELS.reply} ${thread.userName}\u2026`}
              onSubmit={handleReply}
              submitLabel={LABELS.send}
              mentionCandidates={[
                thread.userName,
                ...new Set(descendants.slice(0, 3).map((d) => d.userName)),
                LABELS.aiXiaona,
              ]}
            />
          ) : (
            <p className="text-xs text-muted-foreground text-center py-2">{LABELS.loginToReply}</p>
          )}
        </div>
      </aside>
    </>
  );
}