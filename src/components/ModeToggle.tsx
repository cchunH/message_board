"use client";

import { Sun, Moon, Monitor } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

const themeMeta = [
  { key: "light", icon: Sun },
  { key: "dark", icon: Moon },
  { key: "system", icon: Monitor },
] as const;

export function ModeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return <div className="size-8" />;

  const current =
    themeMeta.find((t) => t.key === theme) ?? themeMeta[2];
  const CurrentIcon = current.icon;
  const next =
    themeMeta[(themeMeta.findIndex((t) => t.key === theme) + 1) % themeMeta.length];

  return (
    <button
      onClick={() => setTheme(next.key)}
      className="inline-flex items-center justify-center rounded-md size-8 text-muted-foreground transition-all duration-200 hover:bg-accent/10 hover:text-accent"
      title={`当前 ${current.key} · 点击切换至 ${next.key}`}
      aria-label="切换主题"
    >
      <CurrentIcon size={15} />
    </button>
  );
}