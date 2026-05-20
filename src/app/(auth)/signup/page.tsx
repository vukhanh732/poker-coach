import type { Metadata } from "next";
import Link from "next/link";
import { signUp, signInWithGoogle } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const metadata: Metadata = { title: "Create Account" };

interface SignUpPageProps {
  searchParams: Promise<{ error?: string }>;
}

export default async function SignUpPage({ searchParams }: SignUpPageProps) {
  const { error } = await searchParams;

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="text-xl font-bold text-foreground">Create account</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Start studying in under 2 minutes
        </p>
      </div>

      {error && (
        <div className="rounded-lg bg-destructive/10 border border-destructive/30 px-3 py-2.5">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {/* Google OAuth */}
      <form action={signInWithGoogle}>
        <Button type="submit" variant="outline" className="w-full gap-2">
          <svg className="h-4 w-4" viewBox="0 0 24 24">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          Continue with Google
        </Button>
      </form>

      <div className="flex items-center gap-3">
        <Separator className="flex-1" />
        <span className="text-xs text-muted-foreground">or</span>
        <Separator className="flex-1" />
      </div>

      <form action={signUp} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="fullName">Name</Label>
          <Input
            id="fullName"
            name="fullName"
            type="text"
            placeholder="Your name"
            autoComplete="name"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            required
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            placeholder="Min. 8 characters"
            autoComplete="new-password"
            minLength={8}
            required
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="stakeLevel">Primary stake</Label>
          <Select name="stakeLevel" defaultValue="1_2">
            <SelectTrigger id="stakeLevel">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1_2">$1/$2 No-Limit Hold&apos;em</SelectItem>
              <SelectItem value="2_3">$2/$3 No-Limit Hold&apos;em</SelectItem>
              <SelectItem value="5_10">$5/$10 No-Limit Hold&apos;em</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button type="submit" variant="gold" className="mt-1 w-full">
          Create account
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-medium text-primary underline-offset-4 hover:underline"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
