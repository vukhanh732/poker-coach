"use client";

import { useRouter } from "next/navigation";
import { useForm, Controller, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { handLogSchema, type HandLogFormValues, POSITIONS, TAGS } from "@/lib/validators/hand-log";
import { createHandLog } from "@/app/actions/hand-logs";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

const TAG_LABELS: Record<string, string> = {
  mistake: "Mistake",
  tough_spot: "Tough Spot",
  bluff_caught: "Bluff Caught",
  hero_call: "Hero Call",
  value_bet: "Value Bet",
  bad_beat: "Bad Beat",
  cooler: "Cooler",
};

const RESULT_OPTIONS = [
  { value: "won" as const, label: "Won" },
  { value: "lost" as const, label: "Lost" },
  { value: "split" as const, label: "Split" },
];

interface HandFormProps {
  onSuccess?: () => void;
  defaultValues?: Partial<HandLogFormValues>;
}

export function HandForm({ onSuccess, defaultValues }: HandFormProps) {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<HandLogFormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(handLogSchema) as any,
    defaultValues: {
      hand: "",
      streets: { preflop: "" },
      tags: [],
      ...defaultValues,
    },
  });

  const selectedTags = watch("tags") ?? [];
  const selectedResult = watch("result");

  const onSubmit: SubmitHandler<HandLogFormValues> = async (data) => {
    const result = await createHandLog(data);
    if ("error" in result) {
      toast.error(result.error);
    } else {
      toast.success("Hand logged!");
      if (onSuccess) {
        onSuccess();
      } else {
        router.push("/hands");
      }
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit as SubmitHandler<HandLogFormValues>)} className="space-y-6">
      {/* Hand + Position */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Hand Info</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="hand">Hand</Label>
            <Input
              id="hand"
              placeholder="e.g. AKs, AsKh"
              {...register("hand")}
              className={cn(errors.hand && "border-destructive")}
            />
            {errors.hand && (
              <p className="text-xs text-destructive">{errors.hand.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label>Position</Label>
            <Controller
              name="position"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger className={cn(errors.position && "border-destructive")}>
                    <SelectValue placeholder="Select..." />
                  </SelectTrigger>
                  <SelectContent>
                    {POSITIONS.map((pos) => (
                      <SelectItem key={pos} value={pos}>{pos}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.position && (
              <p className="text-xs text-destructive">{errors.position.message}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Streets */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Streets</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="preflop">Preflop <span className="text-destructive">*</span></Label>
            <Textarea
              id="preflop"
              placeholder="UTG+1 opens $12, Hero 3-bets to $38 from BTN..."
              rows={3}
              {...register("streets.preflop")}
              className={cn(errors.streets?.preflop && "border-destructive")}
            />
            {errors.streets?.preflop && (
              <p className="text-xs text-destructive">{errors.streets.preflop.message}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="board">Board (optional)</Label>
            <Input id="board" placeholder="e.g. Ah 7d 2c Ks 3h" {...register("streets.board")} />
          </div>
          {["flop", "turn", "river"].map((street) => (
            <div key={street} className="space-y-1.5">
              <Label htmlFor={street}>{street.charAt(0).toUpperCase() + street.slice(1)} (optional)</Label>
              <Textarea
                id={street}
                placeholder={`${street.charAt(0).toUpperCase() + street.slice(1)} action...`}
                rows={2}
                {...register(`streets.${street}` as "streets.flop" | "streets.turn" | "streets.river")}
              />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Result + P&L */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Result</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Outcome</Label>
            <div className="flex gap-2">
              {RESULT_OPTIONS.map(({ value, label }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() =>
                    setValue("result", selectedResult === value ? undefined : value)
                  }
                  className={cn(
                    "flex-1 rounded-md border py-2 text-sm font-medium transition-colors",
                    selectedResult === value
                      ? value === "won"
                        ? "border-green-600 bg-green-700/20 text-green-400"
                        : value === "lost"
                        ? "border-red-600 bg-red-700/20 text-red-400"
                        : "border-primary bg-primary/10 text-primary"
                      : "border-border bg-card text-muted-foreground hover:bg-accent"
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="pnlDollars">P&amp;L ($)</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">$</span>
              <Input
                id="pnlDollars"
                type="number"
                step="0.01"
                placeholder="0.00"
                className="pl-7"
                {...register("pnlDollars", { valueAsNumber: true })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tags */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Tags</CardTitle>
        </CardHeader>
        <CardContent>
          <Controller
            name="tags"
            control={control}
            render={({ field }) => (
              <div className="flex flex-wrap gap-3">
                {TAGS.map((tag) => {
                  const checked = (field.value ?? []).includes(tag);
                  return (
                    <div key={tag} className="flex items-center gap-2">
                      <Checkbox
                        id={`tag-${tag}`}
                        checked={checked}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            field.onChange([...(field.value ?? []), tag]);
                          } else {
                            field.onChange((field.value ?? []).filter((t) => t !== tag));
                          }
                        }}
                      />
                      <Label htmlFor={`tag-${tag}`} className="cursor-pointer text-sm">
                        {TAG_LABELS[tag]}
                      </Label>
                    </div>
                  );
                })}
              </div>
            )}
          />
        </CardContent>
      </Card>

      {/* Stack sizes + notes */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Stack Sizes</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
          {[
            { id: "effectiveStackDollars", label: "Effective Stack" },
            { id: "potSizeDollars", label: "Final Pot" },
          ].map(({ id, label }) => (
            <div key={id} className="space-y-1.5">
              <Label htmlFor={id}>{label} ($)</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">$</span>
                <Input
                  id={id}
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  className="pl-7"
                  {...register(id as "effectiveStackDollars" | "potSizeDollars", { valueAsNumber: true })}
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Notes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="villainNotes">Villain Notes</Label>
            <Textarea id="villainNotes" placeholder="Villain tendencies..." rows={2} {...register("villainNotes")} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="notes">General Notes</Label>
            <Textarea id="notes" placeholder="Thoughts, analysis..." rows={3} {...register("notes")} />
          </div>
        </CardContent>
      </Card>

      <Button type="submit" disabled={isSubmitting} className="w-full" size="lg">
        {isSubmitting ? "Saving..." : "Log Hand"}
      </Button>
    </form>
  );
}
