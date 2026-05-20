import Link from "next/link";
import { ChevronLeft } from "lucide-react";

import { HandForm } from "@/components/features/hands/HandForm";
import { Button } from "@/components/ui/button";

export default function NewHandPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button asChild variant="ghost" size="sm" className="-ml-2">
          <Link href="/hands">
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back
          </Link>
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">Log a Hand</h1>
      </div>

      <HandForm />
    </div>
  );
}
