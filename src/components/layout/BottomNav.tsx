"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Grid3X3,
  Calculator,
  BookOpen,
  Brain,
  Swords,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/trainer", icon: Grid3X3, label: "Trainer" },
  { href: "/calculator", icon: Calculator, label: "Odds" },
  { href: "/hands", icon: BookOpen, label: "Hands" },
  { href: "/quiz", icon: Brain, label: "Quiz" },
  { href: "/simulate", icon: Swords, label: "Simulate" },
] as const;

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-card/95 backdrop-blur-sm md:hidden safe-area-inset-bottom">
      <div className="flex items-center justify-around px-2 py-2">
        {navItems.map(({ href, icon: Icon, label }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex min-w-0 flex-1 flex-col items-center gap-1 rounded-lg px-1 py-1.5 text-xs transition-colors",
                active
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon
                className={cn(
                  "h-5 w-5 transition-transform",
                  active && "scale-110"
                )}
                strokeWidth={active ? 2.5 : 2}
              />
              <span className="truncate font-medium">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
