"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/components/AuthContext";
import { Button } from "@/components/ui/button";
import { NaciLogo } from "@/components/NaciLogo";
import { cn } from "@/lib/utils";

export function AuthForm() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login, register } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!username.trim() || !password.trim()) {
      setError("用户名和密码不能为空");
      return;
    }

    setLoading(true);
    try {
      if (mode === "login") {
        await login(username, password);
      } else {
        await register(username, password);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "操作失败");
    } finally {
      setLoading(false);
    }
  };

  const inputCls =
    "flex w-full rounded-md border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground/70 transition-all duration-200 focus-visible:outline-none focus-visible:border-accent/40 focus-visible:ring-2 focus-visible:ring-ring/25";

  return (
    <div className="mx-auto mt-14 max-w-sm">
      <div className="overflow-hidden rounded-2xl border border-border/70 bg-card/85 p-7 shadow-[0_2px_28px_-12px_hsl(var(--foreground)/0.25)] backdrop-blur-md">
        {/* Brand header */}
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="relative mb-3">
            <div className="logo-halo absolute -inset-3 rounded-xl opacity-50" aria-hidden />
            <Link href="/" prefetch={false}>
              <NaciLogo className="relative h-9 w-auto text-foreground transition-colors hover:text-accent" />
            </Link>
          </div>
          <p className="text-xs text-muted-foreground">
            {mode === "login" ? "欢迎回到纳磁讨论场" : "注册加入纳磁讨论场"}
          </p>
        </div>

        {/* tab toggle */}
        <div className="mb-6 flex rounded-lg border border-border bg-muted/60 p-0.5">
          <button
            type="button"
            onClick={() => { setMode("login"); setError(""); }}
            className={cn(
              "flex-1 rounded-md py-1.5 text-sm font-medium transition-all duration-200",
              mode === "login"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            登录
          </button>
          <button
            type="button"
            onClick={() => { setMode("register"); setError(""); }}
            className={cn(
              "flex-1 rounded-md py-1.5 text-sm font-medium transition-all duration-200",
              mode === "register"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            注册
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-medium tracking-wide text-muted-foreground">
              用户名
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className={inputCls}
              placeholder="alice"
              autoComplete="username"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-medium tracking-wide text-muted-foreground">
              密码
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputCls}
              placeholder="••••••••"
              autoComplete={mode === "login" ? "current-password" : "new-password"}
            />
          </div>

          {error && (
            <p className="rounded-md border border-red-500/20 bg-red-500/5 px-2.5 py-1.5 text-xs text-red-500">
              {error}
            </p>
          )}

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "处理中…" : mode === "login" ? "登录" : "注册"}
          </Button>
        </form>

        <p className="mt-5 flex items-center justify-between font-mono text-[10px] text-muted-foreground/55">
          <span>NACi · 纳磁科技</span>
          <Link
            href="/board"
            prefetch={false}
            className="transition-colors hover:text-accent"
          >
            ← 以游客身份浏览
          </Link>
        </p>
      </div>
    </div>
  );
}