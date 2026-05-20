"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Grid3X3,
  Calculator,
  BookOpen,
  Brain,
  Trophy,
  Users,
  Zap,
  Settings,
  LogOut,
  Spade,
  Swords,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

const primaryNav = [
  { href: "/trainer", icon: Grid3X3, label: "Range Trainer" },
  { href: "/calculator", icon: Calculator, label: "Pot Odds" },
  { href: "/hands", icon: BookOpen, label: "Hand Log" },
  { href: "/quiz", icon: Brain, label: "Quiz Engine" },
  { href: "/analyzer", icon: Zap, label: "Analyzer" },
  { href: "/simulate", icon: Swords, label: "Simulate" },
] as const;

const secondaryNav = [
  { href: "/exploits", icon: Users, label: "Exploit Library" },
  { href: "/progress", icon: Trophy, label: "Progress" },
  { href: "/settings", icon: Settings, label: "Settings" },
] as const;

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <aside className="hidden md:flex w-60 flex-col border-r border-border bg-card">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 py-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
          <Spade className="h-4 w-4 text-primary-foreground" />
        </div>
        <div>
          <p className="text-sm font-bold leading-none text-foreground">
            Poker Coach
          </p>
          <p className="text-xs text-muted-foreground">$1/$2 · $2/$3</p>
        </div>
      </div>

      <Separator />

      {/* Primary navigation */}
      <nav className="flex flex-1 flex-col gap-1 p-3">
        {primaryNav.map(({ href, icon: Icon, label }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" strokeWidth={active ? 2.5 : 2} />
              {label}
            </Link>
          );
        })}

        <Separator className="my-2" />

        {secondaryNav.map(({ href, icon: Icon, label }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" strokeWidth={active ? 2.5 : 2} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Sign out */}
      <div className="p-3">
        <Separator className="mb-3" />
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start gap-3 text-muted-foreground hover:text-foreground"
          onClick={handleSignOut}
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </Button>
      </div>
    </aside>
  );
}
