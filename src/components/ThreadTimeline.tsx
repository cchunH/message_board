"use client";

import Link from "next/link";
import { UserRound, Clock } from "lucide-react";
import { RelativeTime } from "@/components/RelativeTime";
import { cn } from "@/lib/utils";
import type { Comment } from "@/types";

function getDescendantIds(comments: Comment[], rootId: string): Set<string> {
  const ids = new Set<string>();
  const walk = (pid: string) => {
    for (const c of comments) {
      if (c.parentId === pid && !ids.has(c.id)) { ids.add(c.id); walk(c.id); }
    }
  };
  walk(rootId);
  return ids;
}

export function ThreadTimeline({ comments, rootPostId }: { comments: Comment[]; rootPostId: string }) {
  const descIds = getDescendantIds(comments, rootPostId);
  const sorted = comments
    .filter((c) => c.parentId === rootPostId || descIds.has(c.id))
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  if (sorted.length === 0) return <p className="py-14 text-center text-sm text-muted-foreground">暂时还没有回复</p>;

  return (
    <div className="relative">
      <span className="absolute left-[11px] top-3 bottom-0 w-px bg-foreground/20" aria-hidden />
      <div className="space-y-3">
        {sorted.map((c) => (
          <div key={c.id} className="relative pl-6">
            <span className="absolute left-[7px] top-2.5 h-2.5 w-2.5 rounded-full border-2 border-foreground/85 bg-card" aria-hidden />
            <article className="rounded-md border-2 border-foreground/80 bg-card p-3 transition-all duration-150 hover:-translate-x-0.5 hover:shadow-[2px_2px_0_hsl(var(--foreground)/0.5)]">
              <p className="text-sm leading-relaxed text-foreground/90">{c.content}</p>
              <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
                <span className="flex items-center gap-1 font-medium text-foreground/70"><UserRound size={11} />{c.userName}</span>
                <span className="flex items-center gap-1"><Clock size={11} /><RelativeTime date={c.createdAt} /></span>
              </div>
            </article>
          </div>
        ))}
      </div>
    </div>
  );
}