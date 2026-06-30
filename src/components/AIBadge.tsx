import { cn } from "@/lib/utils";

export function AIBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5",
        "text-[10px] font-mono font-medium tracking-wide",
        "border-accent/40 bg-accent/[0.08] text-accent",
        className
      )}
    >
      <span className="relative flex h-1.5 w-1.5" aria-hidden>
        <span className="absolute inline-flex h-full w-full rounded-full bg-brand-primary opacity-70 [animation:ai-pulse_1.6s_ease-in-out_infinite]" />
        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-brand-primary" />
      </span>
      AI
    </span>
  );
}