"use client";

import { UserRound, Clock, ChevronDown, ChevronUp, MessageSquare } from "lucide-react";
import { useState } from "react";
import { RelativeTime } from "@/components/RelativeTime";
import type { Comment } from "@/types";

const T = {
  empty: "\u6682\u65F6\u8FD8\u6CA1\u6709\u56DE\u590D",
  dot: "\u00B7",
  rootReply: "root reply",
  collapse: "\u6536\u8D77\u5B50\u56DE\u590D",
  expand: "\u5C55\u5F00 ",
  expandSuffix: " \u6761\u5B50\u56DE\u590D",
};

interface Group { rootComment: Comment; replies: Comment[] }

function buildGroups(comments: Comment[], rootPostId: string): Group[] {
  const roots = comments.filter(c => c.parentId === rootPostId);
  return roots.map(root => {
    const replies: Comment[] = [];
    const walk = (pid: string) => {
      for (const c of comments) {
        if (c.parentId === pid) { replies.push(c); walk(c.id); }
      }
    };
    walk(root.id);
    replies.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    return { rootComment: root, replies };
  }).sort((a, b) => new Date(b.rootComment.createdAt).getTime() - new Date(a.rootComment.createdAt).getTime());
}

export function GroupedTimeline({ comments, rootPostId, onOpenDrawer }: {
  comments: Comment[]; rootPostId: string; onOpenDrawer: (id: string) => void;
}) {
  const groups = buildGroups(comments, rootPostId);

  if (groups.length === 0) {
    return <p className="py-14 text-center text-sm text-muted-foreground">{T.empty}</p>;
  }

  return (
    <div className="space-y-4">
      {groups.map((g) => (
        <GroupCard key={g.rootComment.id} group={g} onOpenDrawer={onOpenDrawer} />
      ))}
    </div>
  );
}

function GroupCard({ group, onOpenDrawer }: { group: Group; onOpenDrawer: (id: string) => void }) {
  const [open, setOpen] = useState(true);
  const hasReplies = group.replies.length > 0;

  return (
    <div className="overflow-hidden rounded-md border-2 border-foreground/85 bg-card">
      <div className="flex items-start justify-between gap-2 px-3.5 py-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-muted-foreground/80 mb-1">
            <span className="flex items-center gap-1 font-bold text-foreground text-xs">
              <UserRound size={11} />{group.rootComment.userName}
            </span>
            <span className="text-muted-foreground/40">{T.dot}</span>
            <span className="flex items-center gap-1">
              <Clock size={11} /><RelativeTime date={group.rootComment.createdAt} />
            </span>
            <span className="ml-auto font-mono text-[10px] text-muted-foreground/50">{T.rootReply}</span>
          </div>
          <p className="text-sm leading-relaxed text-foreground/90">{group.rootComment.content}</p>
        </div>
        {hasReplies && (
          <button onClick={() => onOpenDrawer(group.rootComment.id)}
            className="shrink-0 btn-brut btn-brut--accent text-[10px]">
            <MessageSquare size={11} /> {group.replies.length}
          </button>
        )}
      </div>

      {hasReplies && (
        <>
          <button onClick={() => setOpen(o => !o)}
            className="flex w-full items-center justify-center gap-1 border-t border-border/60 bg-muted/30 py-1 text-[10px] text-muted-foreground transition-colors hover:text-accent">
            {open ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
            {open ? T.collapse : T.expand + group.replies.length + T.expandSuffix}
          </button>
          {open && (
            <div className="border-t border-border/60">
              <div className="relative px-3.5 py-2">
                <span className="absolute left-[19px] top-2 bottom-2 w-px border-l border-dashed border-foreground/20" aria-hidden />
                <div className="space-y-2.5">
                  {group.replies.map((r) => (
                    <div key={r.id} className="relative pl-6">
                      <span className="absolute left-[7px] top-2.5 h-2 w-2 rounded-full border-2 border-foreground/50 bg-card" aria-hidden />
                      <div className="rounded-md border border-border/70 bg-background/50 p-2.5">
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-muted-foreground/80 mb-0.5">
                          <span className="font-bold text-foreground text-xs">{r.userName}</span>
                          <span className="text-muted-foreground/40">{T.dot}</span>
                          <RelativeTime date={r.createdAt} />
                        </div>
                        <p className="text-[13px] leading-relaxed text-foreground/85">{r.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}