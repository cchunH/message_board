"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Workflow,
  Sparkles,
  ShieldCheck,
  FileText,
  MessagesSquare,
} from "lucide-react";
import { useAuth } from "@/components/AuthContext";
import { api } from "@/lib/api";
import type { Comment } from "@/types";
import { NaciLogo } from "@/components/NaciLogo";

/* ── sections ─────────────────────────────────────────────────────── */

function HeroSection({ ctaLabel, onCta }: { ctaLabel: string; onCta: () => void }) {
  return (
    <section className="relative flex flex-col items-center px-2 pb-6 pt-10 text-center sm:px-6 sm:pb-12 sm:pt-16">
      {/* ambient ink halo backgrounds */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-72 opacity-70"
        style={{
          background:
            "radial-gradient(50% 100% at 50% 0%, hsl(var(--brand-primary) / 0.10), transparent 70%)",
        }}
        aria-hidden
      />

      {/* logo with magnetic halo */}
      <div className="relative mb-8">
        <span className="logo-halo absolute -inset-6 rounded-3xl opacity-50" aria-hidden />
        <NaciLogo className="relative h-14 w-auto text-foreground transition-all duration-300 hover:scale-[1.03] hover:text-accent sm:h-16" />
      </div>

      <p className="font-mono text-xs tracking-[0.32em] text-muted-foreground/70">
        NACI · 纳磁科技
      </p>

      <h1 className="mt-3 max-w-2xl text-4xl font-semibold leading-[1.1] tracking-tight sm:text-5xl">
        把无限层级讨论，
        <br className="hidden sm:block" />聚合成一个<span className="text-ink-gradient">智能场</span>
      </h1>

      <p className="mt-4 max-w-md text-sm leading-relaxed text-muted-foreground sm:text-base">
        HackerNews 风的极客骨架，叠加纳磁链式上下文路由、DFS
        线程摘要与端到端内容净化。每一层回复都@AI 可激活智能体。
      </p>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={onCta}
          className="group inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-[0_1px_0_0_hsl(var(--foreground)/0.16),0_8px_26px_-8px_hsl(var(--foreground)/0.4)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_4px_18px_-6px_hsl(var(--foreground)/0.5)]"
        >
          {ctaLabel}
          <ArrowRight
            size={16}
            className="transition-transform duration-200 group-hover:translate-x-0.5"
          />
        </button>
        <Link
          href="/board"
          prefetch={false}
          className="inline-flex items-center gap-2 rounded-lg border border-border px-5 py-2.5 text-sm font-medium transition-all duration-200 hover:border-foreground/25 hover:bg-muted/40"
        >
          以游客身份浏览
        </Link>
      </div>
    </section>
  );
}

/* two-row capability grid */
const features = [
  {
    icon: Workflow,
    title: "链式上下文路由",
    desc: "递归追溯树形 parentId，重构多轮对话 Prompt 喂给大模型。",
    tag: "递归 · Prompt",
  },
  {
    icon: FileText,
    title: "DFS 线程摘要",
    desc: "深度优先打平混乱讨论树，结构化输出 JSON 摘要与情感标签。",
    tag: "DFS · 情感",
  },
  {
    icon: ShieldCheck,
    title: "端到端内容净化",
    desc: "大模型网关与规则双层拦截，毫秒级净化让讨论场始终清朗。",
    tag: "Moderation",
  },
];

function FeaturesSection() {
  return (
    <section className="relative px-2 py-12 sm:px-6 sm:py-16">
      <div className="mb-10">
        <p className="font-mono text-xs tracking-wide text-accent/70">/ capabilities</p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
          引擎三层，闭环讨论
        </h2>
        <p className="mt-2 max-w-md text-sm text-muted-foreground">
          每一环都被设计成可独立验证的技术模块。
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {features.map((f, i) => (
          <article
            key={f.title}
            className="group relative flex flex-col gap-3 rounded-2xl border border-border/70 bg-card/50 p-5 transition-all duration-200 hover:-translate-y-1 hover:border-foreground/15 hover:shadow-[0_8px_30px_-14px_hsl(var(--foreground)/0.4)]"
          >
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-muted/40 text-foreground/70 transition-colors duration-200 group-hover:border-accent/40 group-hover:text-accent">
                <f.icon size={17} />
              </span>
              <span className="font-mono text-[10px] text-muted-foreground/70">
                0{i + 1}
              </span>
            </div>
            <h3 className="text-base font-medium leading-tight">{f.title}</h3>
            <p className="text-sm leading-relaxed text-muted-foreground">{f.desc}</p>
            <div className="mt-auto">
              <span className="rounded-md border border-border bg-muted/40 px-2 py-0.5 font-mono text-[10px] text-muted-foreground transition-colors group-hover:border-accent/40 group-hover:text-accent">
                {f.tag}
              </span>
            </div>
            <span className="absolute inset-x-5 bottom-3 h-px bg-gradient-to-r from-transparent via-accent/30 to-transparent opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
          </article>
        ))}
      </div>
    </section>
  );
}

/* live preview - latest 3 root posts */
function PreviewSection({ posts, loaded }: { posts: Comment[]; loaded: boolean }) {
  if (!loaded) {
    return (
      <section className="px-2 py-6 sm:px-6">
        <div className="space-y-2.5">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="skeleton h-14 w-full rounded-xl" />
          ))}
        </div>
      </section>
    );
  }
  return (
    <section className="relative px-2 py-12 sm:px-6 sm:py-16">
      <div className="mb-8 flex items-end justify-between gap-3">
        <div>
          <p className="font-mono text-xs tracking-wide text-accent/70">/ live</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
            此刻正在讨论
          </h2>
        </div>
        <Link
          href="/board"
          prefetch={false}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-accent"
        >
          查看全部 <ArrowRight size={14} />
        </Link>
      </div>

      {posts.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border py-10 text-center text-sm text-muted-foreground">
          还没有讨论，成为第一条的人
        </div>
      ) : (
        <div className="grid gap-3">
          {posts.slice(0, 3).map((p, i) => (
            <Link
              key={p.id}
              href={`/board/post/${p.id}`}
              prefetch={false}
              className="group relative flex items-start gap-3 overflow-hidden rounded-xl border border-border/65 bg-card/50 p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-foreground/15"
            >
              {/* side stripe */}
              <span className="absolute inset-y-0 left-0 w-[3px] bg-foreground/10 transition-colors duration-200 group-hover:bg-accent" />
              <span className="ml-1 mt-0.5 font-mono text-xs text-muted-foreground/55">
                0{i + 1}
              </span>
              <div className="min-w-0 flex-1">
                <p className="line-clamp-1 text-sm font-medium leading-snug transition-colors group-hover:text-accent">
                  {p.content}
                </p>
                <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-muted-foreground/70">
                  <span>{p.userName}</span>
                  <span className="text-muted-foreground/30">·</span>
                  <span className="font-mono">thread</span>
                </div>
              </div>
              <ArrowRight
                size={15}
                className="mt-1 shrink-0 text-muted-foreground/35 transition-all duration-200 group-hover:translate-x-0.5 group-hover:text-accent"
              />
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}

function CtaSection({ onCta }: { onCta: () => void }) {
  return (
    <section className="relative my-10 overflow-hidden rounded-2xl border border-border bg-card/60 p-8 sm:my-14 sm:p-12">
      <div
        className="pointer-events-none absolute -right-12 -top-12 h-48 w-48 opacity-40 [filter:blur(36px)]"
        style={{ background: "hsl(var(--brand-primary) / 0.32)" }}
        aria-hidden
      />
      <div className="relative max-w-lg">
        <MessagesSquare className="text-accent" size={22} />
        <h2 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">
          一步开启你的智能讨论场
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          注册即用，发帖 @AI 即可触发链式上下文响应。无需配置，纳磁网关自动接管。
        </p>
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={onCta}
            className="group inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-[0_8px_24px_-10px_hsl(var(--foreground)/0.55)] transition-all duration-200 hover:-translate-y-0.5"
          >
            立即进入
            <ArrowRight size={16} className="transition-transform duration-200 group-hover:translate-x-0.5" />
          </button>
          <Link
            href="/login"
            prefetch={false}
            className="text-sm text-muted-foreground underline-offset-4 transition-colors hover:text-accent hover:underline"
          >
            或登录已有账号
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ── root ──────────────────────────────────────────────────────── */

export default function LandingPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [posts, setPosts] = useState<Comment[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    api
      .getComments()
      .then((d) => {
        setPosts(
          d.comments
            .filter((c) => !c.parentId)
            .sort(
              (a, b) =>
                new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            )
        );
      })
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

  const handleEnter = () => router.push(user ? "/board" : "/login");
  const ctaLabel = user ? "进入讨论场" : "立即注册进入";

  return (
    <div className="flex-1">
      <HeroSection ctaLabel={ctaLabel} onCta={handleEnter} />
      <FeaturesSection />
      <PreviewSection posts={posts} loaded={loaded} />
      <CtaSection onCta={handleEnter} />
    </div>
  );
}