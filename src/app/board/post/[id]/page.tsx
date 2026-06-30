"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, UserRound, Clock, MessageCircleIcon, GitBranch, ListOrdered } from "lucide-react";
import { CommentProvider, useComments } from "@/components/CommentContext";
import { CommentItem } from "@/components/CommentItem";
import { CommentForm } from "@/components/CommentForm";
import { AIBadge } from "@/components/AIBadge";
import { AISummaryCard } from "@/components/AISummaryCard";
import { Skeleton } from "@/components/ui/skeleton";
import { RelativeTime } from "@/components/RelativeTime";
import { GroupedTimeline } from "@/components/GroupedTimeline";
import { ThreadDrawer } from "@/components/ThreadDrawer";
import { HoverProvider } from "@/components/HoverContext";
import { useAuth } from "@/components/AuthContext";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import type { Comment } from "@/types";

function PostDetailContent() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { rootPost, loading, getReplies, fetchComments, comments, createLocalComment } = useComments();
  const [refreshKey, setRefreshKey] = useState(0);
  const [viewMode, setViewMode] = useState<"tree" | "timeline">("tree");
  const [drawerId, setDrawerId] = useState<string | null>(null);

  if (loading) {
    return (
      <div className="flex-1 space-y-4 py-4">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-7 w-4/5" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="mt-6 h-[72px] w-full" />
        {[...Array(3)].map((_, i) => (
          <div key={i} className="space-y-1.5 pl-6">
            <Skeleton className="h-3 w-32" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        ))}
      </div>
    );
  }

  if (!rootPost) {
    return <div className="py-20 text-center text-sm text-muted-foreground">帖子不存在或已被删除</div>;
  }

  const directReplies = getReplies(rootPost.id);
  const replyCount = directReplies.length;
  const isAI = rootPost.userName === "AI助手";

  const mentionCandidates = [
    rootPost.userName,
    ...new Set(directReplies.slice(0, 5).map((r) => r.userName)),
    "AI小纳",
  ];

  const handleReply = async (content: string, parentId?: string) => {
    const nc = await api.createComment(content, parentId || id);
    createLocalComment(nc);
    await fetchComments();
    setRefreshKey((k) => k + 1);
  };

  return (
    <div className="flex-1 w-full">
      <div className="mb-4">
        <Link href="/board" prefetch={false}
          className="inline-flex items-center text-sm text-muted-foreground transition-colors hover:text-accent">
          <ArrowLeft size={14} className="mr-1.5" /> 返回讨论流
        </Link>
      </div>

      {/* Post header */}
      <div className={cn("rounded-xl border bg-card/50 p-4", isAI ? "border-accent/25" : "border-border/60")}>
        <h1 className="text-xl font-semibold leading-snug break-words">{rootPost.content}</h1>
        <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground/80">
          <span className="flex items-center gap-1"><UserRound size={13} /><span className="text-foreground/70">{rootPost.userName}</span></span>
          {isAI && <AIBadge />}
          <span className="flex items-center gap-1"><Clock size={13} /><RelativeTime date={rootPost.createdAt} /></span>
          <span className="flex items-center gap-1"><MessageCircleIcon size={13} /><span>{replyCount} 回复</span></span>
        </div>
      </div>

      {/* AI Thread Summary */}
      <div className="mt-4"><AISummaryCard postId={rootPost.id} /></div>

      {/* Reply form */}
      {user ? (
        <CommentForm parentId={rootPost.id}
          placeholder={`回复 ${rootPost.userName}…`}
          onSubmit={handleReply}
          mentionCandidates={mentionCandidates}
        />
      ) : (
        <div className="mb-4 rounded-md border border-dashed border-border bg-muted/30 p-3 text-center text-xs text-muted-foreground">
          <Link href="/login" className="text-accent underline underline-offset-2">登录</Link>{" "}后参与讨论
        </div>
      )}

      {/* View toggle */}
      {replyCount > 0 && (
        <div className="mb-4 flex items-center gap-2">
          <span className="text-xs text-muted-foreground">{replyCount} 条回复</span>
          <div className="ml-auto flex rounded-md border border-border bg-muted/40 p-0.5">
            <button type="button" onClick={() => setViewMode("tree")}
              className={cn("flex items-center gap-1 rounded px-2.5 py-1 text-xs font-medium transition-all",
                viewMode === "tree" ? "bg-background text-foreground shadow-[1px_1px_0_hsl(var(--foreground)/0.5)] border border-foreground/30" : "text-muted-foreground hover:text-foreground")}>
              <GitBranch size={12} /> 树形
            </button>
            <button type="button" onClick={() => setViewMode("timeline")}
              className={cn("flex items-center gap-1 rounded px-2.5 py-1 text-xs font-medium transition-all",
                viewMode === "timeline" ? "bg-background text-foreground shadow-[1px_1px_0_hsl(var(--foreground)/0.5)] border border-foreground/30" : "text-muted-foreground hover:text-foreground")}>
              <ListOrdered size={12} /> 时间流
            </button>
          </div>
        </div>
      )}

      {/* Thread content */}
      {viewMode === "tree" ? (
        replyCount > 0 ? (
          <CommentItem key={`${rootPost.id}-${refreshKey}`} comment={rootPost} depth={0} variant="detail"
            onOpenDrawer={setDrawerId} />
        ) : (
          <p className="py-10 text-center text-sm text-muted-foreground">暂无回复</p>
        )
      ) : (
        <GroupedTimeline comments={comments} rootPostId={rootPost.id} onOpenDrawer={setDrawerId} />
      )}

      {/* Side-Thread Drawer */}
      <ThreadDrawer threadId={drawerId} onClose={() => setDrawerId(null)} />
    </div>
  );
}

export default function PostPage() {
  const { id } = useParams<{ id: string }>();
  return (
    <CommentProvider rootPostId={id}>
      <HoverProvider>
        <PostDetailContent />
      </HoverProvider>
    </CommentProvider>
  );
}