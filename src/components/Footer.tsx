import Link from "next/link";
import { NaciLogo } from "@/components/NaciLogo";

export function Footer() {
  return (
    <footer className="w-full border-t border-border/40 mt-auto">
      <div className="mx-auto flex max-w-4xl flex-col items-center gap-3 px-4 py-7 text-center text-xs text-muted-foreground sm:flex-row sm:justify-between sm:text-left">
        <div className="flex items-center gap-2.5">
          <NaciLogo className="h-4 w-auto opacity-70" />
          <span className="text-muted-foreground/70">纳磁科技 · 智能讨论场</span>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1">
          <Link
            href="https://nextjs.org"
            target="_blank"
            className="underline underline-offset-4 transition-colors hover:text-accent"
          >
            Next.js
          </Link>
          <span className="text-muted-foreground/30">+</span>
          <Link
            href="https://www.prisma.io"
            target="_blank"
            className="underline underline-offset-4 transition-colors hover:text-accent"
          >
            Prisma
          </Link>
          <span className="text-muted-foreground/30">+</span>
          <Link
            href="https://tailwindcss.com"
            target="_blank"
            className="underline underline-offset-4 transition-colors hover:text-accent"
          >
            Tailwind
          </Link>
        </div>
      </div>
    </footer>
  );
}