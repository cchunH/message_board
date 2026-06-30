"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { MessageCircleIcon, Clock, UserRound, FileText } from "lucide-react";
import type { Comment } from "@/types";
import { RelativeTime } from "@/components/RelativeTime";
import { AIBadge } from "@/components/AIBadge";
import { cn } from "@/lib/utils";

export function PostItem({ post, rank }: { post: Comment; rank: number }) {
  const [replyCount, setReplyCount] = useState(0);
  const [voted, setVoted] = useState(false);

  useEffect(() => {
    fetch(`/api/comments`)
      .then((r) => r.json())
      .then((d) => {
        const count = d.comments.filter(
          (c: Comment) => c.parentId === post.id
        ).length;
        setReplyCount(count);
      })
      .catch(() => {});
  }, [post.id]);

  const isAI = post.userName === "AI助手";

  return (
    <div className="group relative flex items-start gap-2.5 rounded-md py-1.5 transition-[background,box-shadow] duration-150 hover:bg-muted/30 -mx-1.5 px-1.5">
      {/* left hairline lit on hover/vote */}
      <span
        className={cn(
          "absolute left-0 top-1.5 bottom-1.5 w-[2px] rounded transition-colors duration-200",
          voted
            ? "bg-accent"
            : "bg-transparent group-hover:bg-foreground/30"
        )}
        aria-hidden
      />

      <span className="min-w-6 pt-0.5 pl-1 text-center font-mono text-sm tabular-nums font-bold text-muted-foreground/70">
        {rank}
      </span>

      <button
        type="button"
        onClick={() => setVoted(true)}
        className={cn(
          "shrink-0 w-4 pt-1 select-none leading-none transition-transform duration-200",
          voted ? "bounce-once" : "hover:-translate-y-0.5"
        )}
        aria-label="投票"
      >
        <span
          className={cn(
            "block text-[13px] font-bold transition-colors",
            voted
              ? "text-accent [text-shadow:0_0_8px_hsl(var(--brand-primary)/0.6)]"
              : "text-muted-foreground/50 group-hover:text-foreground/80"
          )}
        >
          ▲
        </span>
      </button>

      <div className="min-w-0 flex-1">
        <Link
          href={`/board/post/${post.id}`}
          prefetch={false}
          className="text-[15px] font-semibold leading-snug break-words line-clamp-2 transition-colors hover:text-accent"
        >
          {post.content}
        </Link>

        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground/85">
          <span className="flex items-center gap-1">
            {isAI ? <FileText size={11} /> : <UserRound size={11} />}
            <span className="font-medium text-foreground/80">{post.userName}</span>
          </span>
          {isAI && <AIBadge />}
          <span className="flex items-center gap-1">
            <Clock size={11} />
            <RelativeTime date={post.createdAt} />
          </span>
          <Link
            href={`/board/post/${post.id}`}
            prefetch={false}
            className="flex items-center gap-1 transition-colors hover:text-accent"
          >
            <MessageCircleIcon size={11} />
            <span className="font-mono">{replyCount > 0 ? `${replyCount}` : "—"}</span>
          </Link>
        </div>
      </div>
    </div>
  );
}