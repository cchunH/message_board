"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { Comment } from "@/types";

export function useAIPolling(commentId: string | null) {
  const [aiReply, setAiReply] = useState<Comment | null>(null);

  useEffect(() => {
    if (!commentId) return;

    let attempts = 0;
    const maxAttempts = 10;

    const timer = setInterval(async () => {
      attempts++;
      try {
        const data = await api.getComments();
        const found = data.comments.find(
          (c) => c.parentId === commentId && c.userName === "AI助手"
        );
        if (found) {
          setAiReply(found);
          clearInterval(timer);
        }
      } catch {
        // ignore network errors, keep polling
      }
      if (attempts >= maxAttempts) {
        clearInterval(timer);
      }
    }, 2000);

    return () => clearInterval(timer);
  }, [commentId]);

  return aiReply;
}
