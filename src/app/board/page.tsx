"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, List, Clock } from "lucide-react";
import { CommentForm } from "@/components/CommentForm";
import { useAuth } from "@/components/AuthContext";
import { PostItem } from "@/components/PostItem";
import { TimelineView } from "@/components/TimelineView";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import type { Comment } from "@/types";

const SAMPLE_HINTS = [
  "输入 @AI 即可体验智能上下文回复",
  "输入 @AI 如何优化 Tailwind 深色模式？",
  "输入 @AI 帮我对比 ORM 方案",
];

export default function BoardPage() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const [view, setView] = useState<"list" | "timeline">("list");

  useEffect(() => {
    setLoading(true);
    api
      .getComments()
      .then((d) => {
        const rootPosts = d.comments
          .filter((c) => !c.parentId)
          .sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        setPosts(rootPosts);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [refreshKey]);

  const handleCreate = async (content: string) => {
    await api.createComment(content);
    setRefreshKey((k) => k + 1);
  };

  return (
    <div className="flex-1 w-full">
      {/* Header */}
      <div className="mb-5 flex items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">讨论场</h1>
          <p className="mt-0.5 text-xs text-muted-foreground">
            无限层级嵌套回复 · 输入 @AI 开启智能助手
          </p>
        </div>
        <Link
          href="/"
          prefetch={false}
          className="hidden text-xs text-muted-foreground transition-colors hover:text-accent sm:inline"
        >
          返回首页 ↗
        </Link>
      </div>

      {/* Post form */}
      {user ? (
        <CommentForm
          onSubmit={handleCreate}
          placeholder={SAMPLE_HINTS[Math.floor(Math.random() * SAMPLE_HINTS.length)]}
        />
      ) : (
        <div className="mb-6 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-dashed border-border bg-muted/30 p-4">
          <p className="text-sm text-muted-foreground">
            登录后即可发布讨论、回复与 @AI 智能体
          </p>
          <Link href="/login">
            <Button size="sm" variant="outline" className="h-8 gap-1 text-xs">
              去登录 <ArrowRight size={13} />
            </Button>
          </Link>
        </div>
      )}

      {/* View switcher */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex rounded-md border border-border bg-muted/40 p-0.5">
          <button
            type="button"
            onClick={() => setView("list")}
            className={cn(
              "flex items-center gap-1.5 rounded px-3 py-1.5 text-xs font-medium transition-all",
              view === "list"
                ? "bg-background text-foreground shadow-[1px_1px_0_hsl(var(--foreground)/0.6)] border border-foreground/40"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <List size={13} /> 列表
          </button>
          <button
            type="button"
            onClick={() => setView("timeline")}
            className={cn(
              "flex items-center gap-1.5 rounded px-3 py-1.5 text-xs font-medium transition-all",
              view === "timeline"
                ? "bg-background text-foreground shadow-[1px_1px_0_hsl(var(--foreground)/0.6)] border border-foreground/40"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Clock size={13} /> 时光流
          </button>
        </div>
        <span className="font-mono text-[10px] text-muted-foreground/60">
          {posts.length} 条 · newest
        </span>
      </div>

      {/* Content */}
      {loading ? (
        <div className="space-y-3 py-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex gap-2 py-1.5">
              <Skeleton className="h-4 w-7" />
              <Skeleton className="h-4 w-5" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-4 w-11/12" />
                <Skeleton className="h-3 w-2/5" />
              </div>
            </div>
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border py-16 text-center">
          <p className="text-sm text-muted-foreground">暂无讨论</p>
          <p className="mt-1 text-xs text-muted-foreground/60">
            发布第一条，开启纳磁智能场
          </p>
        </div>
      ) : view === "list" ? (
        <div className="overflow-hidden rounded-xl border-2 border-foreground/85">
          <div className="divide-y divide-border/40 px-2">
            {posts.map((post, i) => (
              <PostItem key={post.id} post={post} rank={i + 1} />
            ))}
          </div>
        </div>
      ) : (
        <TimelineView posts={posts} />
      )}
    </div>
  );
}