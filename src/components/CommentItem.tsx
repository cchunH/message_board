"use client";

import { useState } from "react";
import Link from "next/link";
import {
  MinusCircleIcon,
  PlusCircleIcon,
  Reply,
  MessageSquare,
} from "lucide-react";
import { useComments } from "@/components/CommentContext";
import { useAuth } from "@/components/AuthContext";
import { CommentForm } from "@/components/CommentForm";
import { RelativeTime } from "@/components/RelativeTime";
import { AIBadge } from "@/components/AIBadge";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import { useHoverComment } from "@/components/HoverContext";
import type { Comment } from "@/types";

function PostCard({ comment, children }: { comment: Comment; children: React.ReactNode }) {
  const { user } = useAuth();
  const { getReplies, deleteLocalComment, fetchComments, createLocalComment } = useComments();
  const [isReplying, setIsReplying] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [deleted, setDeleted] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const replyCount = getReplies(comment.id).length;
  const isAI = comment.userName === "AI助手";

  if (comment.isDeleted || deleted) return null;

  const handleDelete = async () => {
    setDeleted(true);
    try { await api.deleteComment(comment.id); deleteLocalComment(comment.id); }
    catch { setDeleted(false); }
  };

  return (
    <article
      className={cn(
        "group relative overflow-hidden rounded-md border-2 border-foreground/85 bg-card",
        isAI ? "bs-hard-ai border-brand-primary" : "bs-hard hover:border-foreground"
      )}
    >
      <div className="px-4 py-3">
        <Link href={`/board/post/${comment.id}`} prefetch={false}
          className="block text-[15px] font-medium leading-snug break-words transition-colors hover:text-accent">
          {comment.content}
        </Link>
        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground/85">
          <span className="font-medium text-foreground/75">{comment.userName}</span>
          {isAI && <AIBadge />}
          <span className="text-muted-foreground/40">·</span>
          <RelativeTime date={comment.createdAt} />
          <Link href={`/board/post/${comment.id}`} prefetch={false} className="transition-colors hover:text-accent">
            {replyCount} 回复
          </Link>
          {user && (
            <button onClick={() => setIsReplying(r => !r)} className={cn("btn-brut", isReplying && "btn-brut--accent")}>
              <Reply size={11} /> {isReplying ? "取消" : "回复"}
            </button>
          )}
          {user?.id === comment.userId && (
            <>
              <button onClick={() => setIsEditing(e => !e)} className={cn("btn-brut", isEditing && "btn-brut--solid")}>编辑</button>
              <button onClick={handleDelete} className="btn-brut btn-brut--danger">删除</button>
            </>
          )}
          {replyCount > 0 && (
            <button onClick={() => setCollapsed(c => !c)} className="btn-brut btn-brut--accent">
              {collapsed ? <PlusCircleIcon size={11} /> : <MinusCircleIcon size={11} />}
              {collapsed ? `展开 +${replyCount}` : "折叠"}
            </button>
          )}
        </div>
        {isEditing && (
          <div className="mt-3"><CommentForm initialValue={comment.content} autoFocus
            onSubmit={async (c) => { await api.updateComment(comment.id, c); setIsEditing(false); fetchComments(); }}
            onCancel={() => setIsEditing(false)} submitLabel="保存" /></div>
        )}
        {isReplying && (
          <div className="mt-3"><CommentForm autoFocus parentId={comment.id}
            placeholder={`回复 ${comment.userName}…`}
            onSubmit={async (c, p) => { const nc = await api.createComment(c, p); setIsReplying(false); setCollapsed(false); createLocalComment(nc); fetchComments(); }}
            onCancel={() => setIsReplying(false)} /></div>
        )}
      </div>
      {!collapsed && children}
    </article>
  );
}

/* ── NestedComment ───────────────────────────────────────────── */

export function NestedComment({
  comment,
  depth,
  variant = "detail",
  ancestors = [],
  onOpenDrawer,
}: {
  comment: Comment;
  depth: number;
  variant?: "list" | "detail";
  ancestors?: string[];
  onOpenDrawer?: (id: string) => void;
}) {
  const { user } = useAuth();
  const { getReplies, deleteLocalComment, fetchComments, createLocalComment } = useComments();
  const { hoveredId, activePathIds, onHover, onLeave } = useHoverComment();
  const [isReplying, setIsReplying] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [deleted, setDeleted] = useState(false);
  const [open, setOpen] = useState(true);
  const childComments = getReplies(comment.id);
  const hasChildren = childComments.length > 0;
  const isDisabled = comment.isDeleted || deleted;
  const isAI = comment.userName === "AI助手";
  const id = comment.id;

  const isActive = activePathIds.has(id);
  const isDimmed = hoveredId !== null && !isActive;

  const handleDelete = async () => {
    setDeleted(true);
    try { await api.deleteComment(comment.id); deleteLocalComment(comment.id); }
    catch { setDeleted(false); }
  };

  /* mention candidates for nested reply */
  const mentionCands = [comment.userName, ...new Set(childComments.slice(0, 3).map(c => c.userName)), "AI小纳"];

  if (isDisabled && !hasChildren) return null;

  return (
    <div className="relative">
      <article
        onMouseEnter={() => onHover(id, ancestors)}
        onMouseLeave={onLeave}
        className={cn(
          "group relative overflow-hidden rounded-md border-2 bg-card",
          "transition-all duration-300",
          isAI ? "border-brand-primary/70 bs-hard-ai" : "border-foreground/85 bs-hard hover:border-foreground",
          isActive && "border-accent glow-ring scale-[1.005] -translate-x-0.5",
          isDimmed && "opacity-35 saturate-[0.6]",
          isReplying && !isDimmed && "glow-ring border-brand-primary"
        )}
      >
        <div className="px-3.5 py-2.5">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-sm">
            <span className="font-bold tracking-tight text-foreground">{isDisabled ? "已注销用户" : comment.userName}</span>
            {!isDisabled && isAI && <AIBadge />}
            <span className="text-muted-foreground/40">·</span>
            <span className="text-xs text-muted-foreground/85"><RelativeTime date={comment.createdAt} /></span>
            <span className="ml-auto font-mono text-[10px] text-muted-foreground/40">#{depth}</span>
          </div>

          {!isDisabled && (
            <div className="mt-1.5">
              {isEditing ? (
                <div className="mt-1"><CommentForm initialValue={comment.content} autoFocus
                  onSubmit={async c => { await api.updateComment(comment.id, c); setIsEditing(false); fetchComments(); }}
                  onCancel={() => setIsEditing(false)} submitLabel="保存" /></div>
              ) : (
                <div className="text-sm leading-relaxed break-words text-foreground/95">{comment.content}</div>
              )}

              <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                {hasChildren && (
                  <>
                    <button onClick={() => setOpen(o => !o)} className="btn-brut btn-brut--accent" aria-label={open ? "折叠" : "展开"}>
                      {open ? <MinusCircleIcon size={11} /> : <PlusCircleIcon size={11} />}
                      {open ? "折叠" : `展开${childComments.length > 1 ? ` (${childComments.length})` : ""}`}
                    </button>
                    {variant === "detail" && onOpenDrawer && (
                      <button onClick={() => onOpenDrawer(id)} className="btn-brut btn-brut--accent" title="在侧边栏聚焦该线程">
                        <MessageSquare size={11} /> {childComments.length}
                      </button>
                    )}
                  </>
                )}
                {user && (
                  <button onClick={() => setIsReplying(r => !r)} className={cn("btn-brut", isReplying && "btn-brut--accent")}>
                    <Reply size={11} /> {isReplying ? "取消回复" : "回复"}
                  </button>
                )}
                {user?.id === comment.userId && (
                  <>
                    <button onClick={() => setIsEditing(e => !e)} className={cn("btn-brut", isEditing && "btn-brut--solid")}>
                      {isEditing ? "取消编辑" : "编辑"}
                    </button>
                    <button onClick={handleDelete} className="btn-brut btn-brut--danger">删除</button>
                  </>
                )}
              </div>
            </div>
          )}
          {isDisabled && hasChildren && (
            <div className="mt-1 text-xs italic text-muted-foreground/55">该留言已被删除</div>
          )}
        </div>
      </article>

      {isReplying && (
        <div className="mt-2 ml-5 rounded-md border-2 border-brand-primary/60 bg-card p-2.5 shadow-[2px_2px_0_hsl(var(--brand-primary))]">
          <CommentForm autoFocus parentId={comment.id}
            placeholder={`回复 ${comment.userName}…`}
            onSubmit={async (c, p) => { const nc = await api.createComment(c, p); setIsReplying(false); setOpen(true); createLocalComment(nc); fetchComments(); }}
            onCancel={() => setIsReplying(false)}
            mentionCandidates={mentionCands} />
        </div>
      )}

      {hasChildren && (
        <div className={cn("grid overflow-hidden transition-all duration-300 ease-in-out", open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0")}>
          <div className="overflow-hidden">
            <div className="relative mt-2 pl-6 md:pl-7">
              <span role="button" tabIndex={0}
                aria-label={open ? "折叠该分支" : "展开该分支"}
                onClick={() => setOpen(o => !o)}
                onKeyDown={e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setOpen(o => !o); } }}
                className="absolute left-2 top-1 bottom-0 w-px cursor-pointer bg-border/70 transition-all duration-200 hover:w-0.5 hover:bg-accent"
              />
              <div className="space-y-2.5">
                {childComments.map(child => (
                  <NestedComment key={child.id} comment={child} depth={depth + 1}
                    variant={variant}
                    ancestors={[...ancestors, id]}
                    onOpenDrawer={onOpenDrawer} />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── CommentItem entry ─────────────────────────────────────── */

export function CommentItem({
  comment, depth, variant = "detail",
  ancestors = [],
  onOpenDrawer,
}: { comment: Comment; depth: number; variant?: "list" | "detail"; ancestors?: string[]; onOpenDrawer?: (id: string) => void }) {
  const { getReplies } = useComments();
  const children = getReplies(comment.id);

  if (depth === 0 && variant === "list") {
    return (
      <PostCard comment={comment}>
        <div className="mt-3 space-y-2.5 pl-6">
          {children.map(c => <NestedComment key={c.id} comment={c} depth={0} variant="list" ancestors={[comment.id]} />)}
        </div>
      </PostCard>
    );
  }

  if (depth === 0 && variant === "detail") {
    return (
      <div className="space-y-2.5">
        {children.map(c => (
          <NestedComment key={c.id} comment={c} depth={0} variant="detail"
            ancestors={[comment.id]}
            onOpenDrawer={onOpenDrawer} />
        ))}
      </div>
    );
  }

  return (
    <NestedComment comment={comment} depth={depth} variant={variant}
      ancestors={ancestors}
      onOpenDrawer={onOpenDrawer} />
  );
}