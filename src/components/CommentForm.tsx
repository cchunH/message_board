"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { AssistantBubble } from "@/components/AssistantBubble";
import { MentionPopup } from "@/components/MentionPopup";

interface CommentFormProps {
  parentId?: string;
  placeholder?: string;
  initialValue?: string;
  autoFocus?: boolean;
  submitLabel?: string;
  onSubmit: (content: string, parentId?: string) => Promise<void>;
  onCancel?: () => void;
  mentionCandidates?: string[];
}

export function CommentForm({
  parentId,
  placeholder = "发表留言...",
  initialValue = "",
  autoFocus = false,
  submitLabel,
  onSubmit,
  onCancel,
  mentionCandidates,
}: CommentFormProps) {
  const [content, setContent] = useState(initialValue);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [assistantOpen, setAssistantOpen] = useState(false);
  const [mentionOpen, setMentionOpen] = useState(false);
  const [cursorPos, setCursorPos] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (autoFocus && textareaRef.current) {
      textareaRef.current.focus();
      const len = textareaRef.current.value.length;
      textareaRef.current.setSelectionRange(len, len);
    }
  }, [autoFocus]);

  /* detect @ patterns in content */
  useEffect(() => {
    /* @ai anywhere triggers assistant bubble */
    const hasAi = /@ai(?:\s|小纳|$)/i.test(content);
    if (hasAi && !assistantOpen) setAssistantOpen(true);

    /* any @ triggers mention popup when candidates exist */
    if (mentionCandidates && mentionCandidates.length > 0) {
      const textBeforeCursor = content.slice(0, cursorPos);
      const lastAt = textBeforeCursor.lastIndexOf("@");
      setMentionOpen(lastAt >= 0);
    }
  }, [content, cursorPos, mentionCandidates, assistantOpen]);

  const trackCursor = useCallback(() => {
    if (textareaRef.current) {
      setCursorPos(textareaRef.current.selectionStart);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) {
      setError("内容不能为空");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await onSubmit(content.trim(), parentId);
      setContent("");
      setAssistantOpen(false);
      setMentionOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "发表失败");
    } finally {
      setLoading(false);
    }
  };

  const handleInsertResult = useCallback((text: string) => {
    const cleaned = content.replace(/@ai(?:小纳)?\s*/gi, "").trim();
    const joined = cleaned ? `${cleaned}\n${text}` : text;
    setContent(joined);
    setAssistantOpen(false);
    requestAnimationFrame(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        const len = textareaRef.current.value.length;
        textareaRef.current.setSelectionRange(len, len);
      }
    });
  }, [content]);

  const handleMentionSelect = useCallback((name: string) => {
    /* find the last @ and replace with @name  */
    const textBeforeCursor = content.slice(0, cursorPos);
    const textAfterCursor = content.slice(cursorPos);
    const lastAt = textBeforeCursor.lastIndexOf("@");
    if (lastAt >= 0) {
      const before = content.slice(0, lastAt);
      const mention = `@${name} `;
      const newContent = before + mention + textAfterCursor;
      setContent(newContent);
      setMentionOpen(false);
      /* place cursor after the mention */
      const newPos = lastAt + mention.length;
      requestAnimationFrame(() => {
        if (textareaRef.current) {
          textareaRef.current.focus();
          textareaRef.current.setSelectionRange(newPos, newPos);
        }
      });
    }
  }, [content, cursorPos]);

  return (
    <form onSubmit={handleSubmit} className={parentId ? "" : "mb-6"}>
      {/* popover bar above textarea */}
      {assistantOpen && (
        <AssistantBubble
          draft={content}
          visible
          onClose={() => setAssistantOpen(false)}
          onInsertResult={handleInsertResult}
        />
      )}
      <MentionPopup
        candidates={mentionCandidates ?? []}
        visible={mentionOpen && !assistantOpen}
        onSelect={handleMentionSelect}
        onClose={() => setMentionOpen(false)}
      />
      <textarea
        ref={textareaRef}
        value={content}
        onChange={(e) => {
          setContent(e.target.value);
          setCursorPos(e.target.selectionStart);
        }}
        onClick={trackCursor}
        onKeyUp={trackCursor}
        className="flex w-full resize-none h-28 rounded-md border-2 border-foreground/85 bg-card px-3.5 py-3 text-sm leading-relaxed placeholder:text-muted-foreground/60 shadow-[3px_3px_0_hsl(var(--foreground)/0.7)] transition-all duration-150 focus-visible:outline-none focus-visible:border-accent focus-visible:shadow-[3px_3px_0_hsl(var(--brand-primary))] disabled:cursor-not-allowed disabled:opacity-50"
        placeholder={placeholder}
      />
      {error && (
        <p className="text-sm text-red-500 mt-1.5">{error}</p>
      )}
      <div className="flex items-center gap-2 mt-2.5">
        <Button type="submit" disabled={loading} size="sm">
          {loading ? "提交中…" : submitLabel || (parentId ? "回复" : "发表留言")}
        </Button>
        {onCancel && (
          <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
            取消
          </Button>
        )}
      </div>
    </form>
  );
}