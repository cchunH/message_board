"use client";

import { createContext, useContext, useState, useMemo, useCallback, useEffect, type ReactNode } from "react";
import { api } from "@/lib/api";
import type { Comment } from "@/types";

interface CommentContextType {
  comments: Comment[];
  commentsByParentId: Record<string, Comment[]>;
  rootComments: Comment[];
  loading: boolean;
  rootPost: Comment | null;
  fetchComments: () => Promise<void>;
  createLocalComment: (comment: Comment) => void;
  deleteLocalComment: (id: string) => void;
  getReplies: (parentId: string) => Comment[];
}

const CommentContext = createContext<CommentContextType | null>(null);

export function CommentProvider({
  children,
  rootPostId,
}: {
  children: ReactNode;
  rootPostId?: string;
}) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchComments = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api.getComments();
      setComments(data.comments);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const commentsByParentId = useMemo(() => {
    const groups: Record<string, Comment[]> = {};
    for (const comment of comments) {
      const key = comment.parentId ?? "__root__";
      if (!groups[key]) groups[key] = [];
      groups[key].push(comment);
    }
    return groups;
  }, [comments]);

  const rootComments = useMemo(
    () => commentsByParentId["__root__"] || [],
    [commentsByParentId]
  );

  const rootPost = useMemo(
    () => (rootPostId ? comments.find((c) => c.id === rootPostId && !c.parentId) || null : null),
    [comments, rootPostId]
  );

  const getReplies = useCallback(
    (parentId: string) => commentsByParentId[parentId] || [],
    [commentsByParentId]
  );

  const createLocalComment = useCallback((comment: Comment) => {
    setComments((prev) => [comment, ...prev]);
  }, []);

  const deleteLocalComment = useCallback((id: string) => {
    setComments((prev) => prev.filter((c) => c.id !== id));
  }, []);

  return (
    <CommentContext.Provider
      value={{
        comments,
        commentsByParentId,
        rootComments,
        loading,
        rootPost,
        fetchComments,
        createLocalComment,
        deleteLocalComment,
        getReplies,
      }}
    >
      {children}
    </CommentContext.Provider>
  );
}

export function useComments() {
  const ctx = useContext(CommentContext);
  if (!ctx) throw new Error("useComments must be used within CommentProvider");
  return ctx;
}
