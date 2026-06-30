"use client";

import { useEffect } from "react";
import { useComments } from "@/components/CommentContext";
import { CommentItem } from "@/components/CommentItem";
import { Separator } from "@/components/ui/separator";

export function CommentList() {
  const { rootComments, loading, fetchComments } = useComments();

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  if (loading) {
    return (
      <div className="text-center text-muted-foreground py-20 text-sm">
        加载中...
      </div>
    );
  }

  if (rootComments.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-20 text-sm">
        暂无留言，快来发表第一条吧
      </div>
    );
  }

  return (
    <div className="border-t border-border">
      {rootComments.map((comment) => (
        <CommentItem key={comment.id} comment={comment} depth={0} />
      ))}
    </div>
  );
}
