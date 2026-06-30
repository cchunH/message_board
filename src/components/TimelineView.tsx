"use client";

import Link from "next/link";
import { Clock, UserRound, Hash, FileText } from "lucide-react";
import { RelativeTime } from "@/components/RelativeTime";
import { AIBadge } from "@/components/AIBadge";
import type { Comment } from "@/types";

export function TimelineView({ posts }: { posts: Comment[] }) {
  if (posts.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border py-16 text-center">
        <p className="text-sm text-muted-foreground">暂无讨论</p>
        <p className="mt-1 text-xs text-muted-foreground/60">
          发布第一条，开启纳磁智能场
        </p>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* vertical guide line */}
      <span className="absolute left-[19px] top-2 bottom-0 w-px bg-foreground/15" aria-hidden />
      <div className="space-y-4">
        {posts.map((post, i) => {
          const isAI = post.userName === "AI助手";
          return (
            <div key={post.id} className="group relative pl-10">
              {/* timeline dot */}
              <span
                className="absolute left-3 top-2 h-3.5 w-3.5 rounded-full border-2 bg-card transition-colors duration-200"
                style={{ borderColor: isAI ? "hsl(var(--brand-primary))" : "hsl(var(--foreground) / 0.85)" }}
              />

              <Link
                href={`/board/post/${post.id}`}
                prefetch={false}
                className="block rounded-md border-2 border-foreground/85 bg-card transition-all duration-150 hover:border-foreground hover:-translate-x-0.5 hover:shadow-[3px_3px_0_hsl(var(--foreground)/0.6)]"
              >
                <div className="p-3.5">
                  {/* content */}
                  <p className="text-sm font-semibold leading-snug text-foreground line-clamp-2">
                    {post.content}
                  </p>

                  {/* metadata row */}
                  <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground/85">
                    <span className="flex items-center gap-1 font-medium">
                      {isAI ? <FileText size={11} /> : <UserRound size={11} />}
                      <span className="text-foreground/75">{post.userName}</span>
                    </span>
                    {isAI && <AIBadge />}
                    <span className="flex items-center gap-1">
                      <Clock size={11} />
                      <RelativeTime date={post.createdAt} />
                    </span>
                    <span className="ml-auto flex items-center gap-1 font-mono text-[10px] opacity-60">
                      <Hash size={10} />
                      {post.id.slice(0, 8)}
                    </span>
                  </div>
                </div>
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}