"use client";

import { cn } from "@/lib/utils";
import { AtSign } from "lucide-react";

interface MentionPopupProps {
  candidates: string[];
  visible: boolean;
  onSelect: (name: string) => void;
  onClose: () => void;
}

export function MentionPopup({ candidates, visible, onSelect, onClose }: MentionPopupProps) {
  if (!visible || candidates.length === 0) return null;

  return (
    <div className="mb-1.5">
      <div className="flex flex-wrap items-center gap-1 rounded-md border-2 border-brand-primary/60 bg-card p-1.5 shadow-[2px_2px_0_hsl(var(--brand-primary)/0.5)]">
        <AtSign size={12} className="ml-0.5 text-brand-primary" />
        <span className="mr-1 text-[10px] font-mono text-muted-foreground/80">提及</span>
        {candidates.map((name) => (
          <button
            key={name}
            type="button"
            onClick={() => onSelect(name)}
            className={cn(
              "rounded border border-border px-2 py-0.5 text-xs font-medium transition-all",
              "hover:border-foreground hover:bg-foreground hover:text-background hover:shadow-[1px_1px_0_hsl(var(--foreground))]",
              name === "AI小纳"
                ? "border-brand-primary/40 text-brand-primary"
                : "text-foreground/75"
            )}
          >
            @{name}
          </button>
        ))}
        <button
          type="button"
          onClick={onClose}
          className="ml-auto mr-0.5 rounded p-0.5 text-[10px] text-muted-foreground hover:text-foreground"
        >
          Esc
        </button>
      </div>
    </div>
  );
}