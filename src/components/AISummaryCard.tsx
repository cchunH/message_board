"use client";

import { useState } from "react";
import { Loader2, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";

type Sentiment = "positive" | "mixed" | "negative" | "neutral";

interface SummaryData {
  summary: string;
  sentiment: string;
  tags: string[];
}

const sentimentConfig: Record<string, { label: string; cls: string; dot: string }> = {
  positive: {
    label: "积极共识",
    cls: "border-emerald-600/25 bg-emerald-600/[0.07] text-emerald-700 dark:text-emerald-400",
    dot: "bg-emerald-600",
  },
  mixed: {
    label: "多维辩证",
    cls: "border-accent/25 bg-accent/[0.06] text-accent",
    dot: "bg-accent",
  },
  negative: {
    label: "争议较多",
    cls: "border-amber-600/25 bg-amber-600/[0.07] text-amber-700 dark:text-amber-400",
    dot: "bg-amber-600",
  },
  neutral: {
    label: "中性概述",
    cls: "border-border bg-muted text-muted-foreground",
    dot: "bg-muted-foreground",
  },
};

export function AISummaryCard({ postId }: { postId: string }) {
  const [data, setData] = useState<SummaryData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.getThreadSummary(postId);
      setData(res);
    } catch (e) {
      setError(e instanceof Error ? e.message : "生成摘要失败");
    } finally {
      setLoading(false);
    }
  };

  /* loading skeleton */
  if (loading) {
    return (
      <div className="mb-5 rounded-xl border border-accent/15 bg-card/60 p-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 size={15} className="animate-spin text-accent" />
          <span>纳磁 DFS 引擎正在遍历讨论树…</span>
        </div>
        <div className="skeleton mt-3 h-3.5 w-11/12" />
        <div className="skeleton mt-2 h-3.5 w-8/12" />
        <div className="skeleton mt-3 h-5 w-2/5 rounded-full" />
      </div>
    );
  }

  /* loaded summary */
  if (data) {
    const cfg = sentimentConfig[data.sentiment as Sentiment] ?? sentimentConfig.neutral;
    return (
      <div className="mb-5 overflow-hidden rounded-xl border border-accent/20 bg-card/70 p-4 shadow-[0_2px_14px_-8px_hsl(var(--brand-primary)/0.3)] backdrop-blur-sm">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-sm font-medium">
            <FileText size={15} className="text-accent" />
            <span>AI 线程深度摘要</span>
            <span className="ml-1 text-[11px] font-normal text-muted-foreground">
              by 纳磁 DFS 引擎
            </span>
          </div>
          <span
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-medium",
              cfg.cls
            )}
          >
            <span className={cn("h-1.5 w-1.5 rounded-full", cfg.dot)} />
            情感 · {cfg.label}
          </span>
        </div>

        <p className="mt-3 text-sm leading-relaxed text-foreground/90">{data.summary}</p>

        {data.tags?.length > 0 && (
          <div className="mt-3.5 flex flex-wrap gap-1.5">
            {data.tags.map((t) => (
              <span
                key={t}
                className="rounded-md border border-border bg-muted/50 px-2.5 py-1 text-xs text-muted-foreground transition-colors hover:border-accent/50 hover:text-accent"
              >
                #{t}
              </span>
            ))}
          </div>
        )}

        <div className="mt-3 flex items-center justify-between">
          <button
            type="button"
            onClick={load}
            className="text-[11px] text-muted-foreground/70 underline-offset-2 transition-colors hover:text-accent hover:underline"
          >
            重新生成
          </button>
          <span className="font-mono text-[10px] text-muted-foreground/40">DFS · sentiment</span>
        </div>
      </div>
    );
  }

  /* empty / prompt */
  return (
    <button
      type="button"
      onClick={load}
      disabled={loading}
      className="mb-5 flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-accent/30 bg-accent/[0.03] px-4 py-3 text-sm text-muted-foreground transition-all duration-200 hover:border-accent/55 hover:bg-accent/[0.06] hover:text-accent"
    >
      {error ? (
        <span className="text-red-500/80">{error} · 点击重试</span>
      ) : (
        <>
          <FileText size={14} />
          <span>由 AI 生成线程深度摘要</span>
        </>
      )}
    </button>
  );
}