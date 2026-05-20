"use client";

import { useRouter } from "next/navigation";
import { LogOut, Settings, User, Spade } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

interface HeaderProps {
  title: string;
  userName?: string;
  userEmail?: string;
}

export function Header({ title, userName, userEmail }: HeaderProps) {
  const router = useRouter();
  const supabase = createClient();

  const initials = userName
    ? userName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : userEmail?.[0]?.toUpperCase() ?? "U";

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="flex h-14 items-center justify-between border-b border-border bg-card/80 px-4 backdrop-blur-sm md:hidden">
      {/* Mobile logo + title */}
      <div className="flex items-center gap-2">
        <Link href="/trainer" className="flex items-center gap-1.5">
          <div className="flex h-6 w-6 items-center justify-center rounded bg-primary">
            <Spade className="h-3 w-3 text-primary-foreground" />
          </div>
        </Link>
        <h1 className="text-sm font-semibold text-foreground">{title}</h1>
      </div>

      {/* User menu */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex items-center rounded-full focus:outline-none focus:ring-2 focus:ring-ring">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="text-xs">{initials}</AvatarFallback>
            </Avatar>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuLabel className="font-normal">
            <p className="text-sm font-medium">{userName ?? "Player"}</p>
            <p className="text-xs text-muted-foreground truncate">{userEmail}</p>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href="/settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Settings
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={handleSignOut}
            className="text-destructive focus:text-destructive"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
