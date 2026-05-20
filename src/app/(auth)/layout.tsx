import { Spade } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-felt-900 px-4 py-12">
      {/* Brand mark */}
      <div className="mb-8 flex flex-col items-center gap-3">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary shadow-lg shadow-primary/20">
          <Spade className="h-7 w-7 text-primary-foreground" />
        </div>
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground">Poker Coach</h1>
          <p className="text-sm text-muted-foreground">
            Study like the regulars at the table do
          </p>
        </div>
      </div>

      {/* Auth card */}
      <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-xl">
        {children}
      </div>

      <p className="mt-6 text-center text-xs text-muted-foreground">
        Built for $1/$2 and $2/$3 live NLHE
      </p>
    </div>
  );
}
