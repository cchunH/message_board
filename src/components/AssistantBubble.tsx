"use client";

import { useState } from "react";
import { Loader2, Sparkles, PencilLine, X, ChevronDown, Copy } from "lucide-react";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";

interface AssistantBubbleProps {
  draft: string;
  visible: boolean;
  onClose: () => void;
  onInsertResult: (text: string) => void;
}

export function AssistantBubble({ draft, visible, onClose, onInsertResult }: AssistantBubbleProps) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ kind: string; text: string; meta?: string } | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const runSummary = async () => {
    setLoading(true);
    setResult(null);
    try {
      const res = await api.assist("summary");
      setResult({
        kind: "summary",
        text: res.result,
        meta: res.threadTitle ? `关于《${res.threadTitle}》` : undefined,
      });
      setExpanded(true);
    } catch {
      setResult({ kind: "summary", text: "小纳暂时无法总结，请稍后再试" });
    } finally {
      setLoading(false);
    }
  };

  const runDraft = async () => {
    setLoading(true);
    setResult(null);
    try {
      const res = await api.assist("draft", draft);
      setResult({ kind: "draft", text: res.result });
      setExpanded(true);
    } catch {
      setResult({ kind: "draft", text: "小纳暂时无法构思，请稍后再试" });
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(result?.text ?? "").catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  if (!visible) return null;

  return (
    <div className="relative mb-2">
      <div className="overflow-hidden rounded-md border-2 border-brand-primary/60 bg-card shadow-[3px_3px_0_hsl(var(--brand-primary)/0.6)]">
        {/* header */}
        <div className="flex items-center justify-between gap-2 bg-brand-primary/10 px-3 py-2">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-primary text-[10px] font-bold text-accent-foreground">
              N
            </span>
            <span className="text-sm font-semibold text-brand-primary">AI 小纳</span>
            <span className="text-[10px] font-mono text-muted-foreground">为你服务</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded p-0.5 text-muted-foreground transition-colors hover:text-foreground"
            aria-label="关闭小纳"
          >
            <X size={14} />
          </button>
        </div>

        {/* actions */}
        <div className="flex gap-2 px-3 py-2.5">
          <button
            type="button"
            onClick={runSummary}
            disabled={loading}
            className={cn(
              "flex flex-1 items-center justify-center gap-1.5 rounded border-2 border-border bg-muted/40 py-2 text-xs font-medium text-foreground/80 transition-all duration-150 hover:-translate-y-0.5 hover:border-brand-primary hover:shadow-[2px_2px_0_hsl(var(--brand-primary))] disabled:opacity-50"
            )}
          >
            <Sparkles size={13} className="text-brand-primary" />
            总结最近讨论
          </button>
          <button
            type="button"
            onClick={runDraft}
            disabled={loading}
            className={cn(
              "flex flex-1 items-center justify-center gap-1.5 rounded border-2 border-border bg-muted/40 py-2 text-xs font-medium text-foreground/80 transition-all duration-150 hover:-translate-y-0.5 hover:border-brand-primary hover:shadow-[2px_2px_0_hsl(var(--brand-primary))] disabled:opacity-50"
            )}
          >
            <PencilLine size={13} className="text-brand-primary" />
            帮助构思回复
          </button>
        </div>

        {/* loading */}
        {loading && (
          <div className="flex items-center gap-2 border-t border-border px-3 py-3 text-xs text-muted-foreground">
            <Loader2 size={13} className="animate-spin text-brand-primary" />
            小纳正在 {draft ? "构思回复思路…" : "扫描讨论树…"}
          </div>
        )}

        {/* result */}
        {result && !loading && (
          <div className="border-t border-border">
            <div className="flex items-center justify-between gap-2 px-3 py-1.5">
              <span className="text-[10px] font-mono text-muted-foreground/70">
                {result.kind === "summary" ? "summary" : "draft"} {result.meta && `· ${result.meta}`}
              </span>
              <button
                type="button"
                onClick={() => setExpanded((e) => !e)}
                className="rounded p-0.5 text-muted-foreground transition-all hover:text-foreground"
              >
                <ChevronDown size={12} className={cn("transition-transform", expanded && "rotate-180")} />
              </button>
            </div>
            {expanded && (
              <div className="px-3 pb-3">
                <div className="rounded border border-border/60 bg-muted/30 p-2.5 text-xs leading-relaxed text-foreground/90">
                  {result.text}
                </div>
                <div className="mt-2 flex gap-1.5">
                  <button
                    type="button"
                    onClick={() => onInsertResult(result.text)}
                    className="btn-brut btn-brut--accent text-[10px]"
                  >
                    {result.kind === "draft" ? "填入回复框" : "插入草稿"}
                  </button>
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="btn-brut text-[10px]"
                  >
                    {copied ? "已复制" : "复制"}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}