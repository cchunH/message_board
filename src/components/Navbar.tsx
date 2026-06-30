"use client";

import Link from "next/link";
import { useAuth } from "@/components/AuthContext";
import { ModeToggle } from "@/components/ModeToggle";
import { Button } from "@/components/ui/button";
import { NaciLogo } from "@/components/NaciLogo";

export function Navbar() {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-50 border-b border-border/55 bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/65">
      <div className="mx-auto flex h-14 max-w-4xl items-center justify-between gap-2 px-4">
        <Link href="/" prefetch={false} className="group flex items-center gap-2.5">
          <NaciLogo className="h-6 w-auto transition-colors duration-200 group-hover:text-accent" />
          <span className="font-mono text-[10px] tracking-wide text-muted-foreground/70 transition-colors group-hover:text-accent/80">
            /Discussion
          </span>
        </Link>

        <nav className="flex items-center gap-2 text-sm">
          <Link
            href="/board"
            prefetch={false}
            className="hidden text-xs text-muted-foreground transition-colors hover:text-accent sm:inline"
          >
            讨论场
          </Link>
          <span className="hidden h-3 w-px bg-border sm:inline-block" />
          {user ? (
            <>
              <span className="hidden text-xs text-muted-foreground sm:inline">
                {user.username}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={logout}
                className="h-8 px-3 text-xs"
              >
                登出
              </Button>
            </>
          ) : (
            <Link href="/login" prefetch={false}>
              <Button variant="outline" size="sm" className="h-8 px-3 text-xs">
                登录
              </Button>
            </Link>
          )}
          <ModeToggle />
        </nav>
      </div>
    </header>
  );
}