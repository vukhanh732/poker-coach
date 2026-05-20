"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { ChevronDown, ChevronUp, Plus } from "lucide-react";

import { handLogSchema, type HandLogFormValues, POSITIONS, TAGS } from "@/lib/validators/hand-log";
import { createHandLog } from "@/app/actions/hand-logs";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";

const TAG_LABELS: Record<string, string> = {
  mistake: "Mistake",
  tough_spot: "Tough Spot",
  bluff_caught: "Bluff Caught",
  hero_call: "Hero Call",
  value_bet: "Value Bet",
};

const RESULT_OPTIONS = [
  { value: "won" as const, label: "Won" },
  { value: "lost" as const, label: "Lost" },
  { value: "split" as const, label: "Split" },
];

const PREFLOP_ACTIONS = ["Raise", "3-bet", "Call", "Limp", "Fold"];
const SIZING_PRESETS = [
  { label: "2bb", dollars: 4 },
  { label: "2.5bb", dollars: 5 },
  { label: "3bb", dollars: 6 },
  { label: "4bb", dollars: 8 },
];

interface HandFormProps {
  onSuccess?: () => void;
  defaultValues?: Partial<HandLogFormValues>;
}

export function HandForm({ onSuccess, defaultValues }: HandFormProps) {
  const router = useRouter();
  const [showFull, setShowFull] = useState(false);
  const [sawFlop, setSawFlop] = useState(false);
  const [sawTurn, setSawTurn] = useState(false);
  const [sawRiver, setSawRiver] = useState(false);
  const [preflopAction, setPreflopAction] = useState<string | null>(null);
  const [preflopSizing, setPreflopSizing] = useState<number | null>(null);

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
      gameType: "cash",
      ...defaultValues,
    },
  });

  const selectedTags = watch("tags") ?? [];
  const selectedResult = watch("result");
  const selectedPosition = watch("position");
  const preflopText = watch("streets.preflop");

  // Build preflop text from 3-tap selections
  function applyPreflopTap(action: string, sizing?: number) {
    const pos = selectedPosition ?? "Hero";
    let text = "";
    if (action === "Raise" || action === "3-bet") {
      const amt = sizing ?? 6;
      text = `${pos} ${action.toLowerCase()}s to $${amt}`;
    } else if (action === "Call") {
      text = `${pos} calls`;
    } else if (action === "Limp") {
      text = `${pos} limps`;
    } else {
      text = `${pos} folds`;
    }
    setValue("streets.preflop", text);
  }

  function handlePreflopAction(action: string) {
    setPreflopAction(action);
    if (action === "Call" || action === "Limp" || action === "Fold") {
      applyPreflopTap(action);
    }
  }

  function handlePreflopSizing(dollars: number) {
    setPreflopSizing(dollars);
    if (preflopAction) applyPreflopTap(preflopAction, dollars);
  }

  const onSubmit: SubmitHandler<HandLogFormValues> = async (data) => {
    // Quick log: synthesize a minimal preflop string if blank
    if (!data.streets.preflop) {
      data.streets.preflop = `${data.position} hand played`;
    }
    const result = await createHandLog(data);
    if ("error" in result) {
      toast.error(result.error);
    } else {
      toast.success("Hand logged!");
      if (onSuccess) onSuccess();
      else router.push("/hands");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit as SubmitHandler<HandLogFormValues>)} className="space-y-4">

      {/* ── Quick Log fields ─────────────────────────────────────────── */}
      <Card>
        <CardContent className="pt-4 space-y-4">
          {/* Hand */}
          <div className="space-y-1.5">
            <Label htmlFor="hand">Hand <span className="text-destructive">*</span></Label>
            <Input
              id="hand"
              placeholder="e.g. AKs, AsKh"
              className={cn("font-mono", errors.hand && "border-destructive")}
              {...register("hand")}
            />
            {errors.hand && <p className="text-xs text-destructive">{errors.hand.message}</p>}
          </div>

          {/* Position — chip row */}
          <div className="space-y-1.5">
            <Label>Position <span className="text-destructive">*</span></Label>
            <Controller
              name="position"
              control={control}
              render={({ field }) => (
                <div className="flex flex-wrap gap-1.5">
                  {POSITIONS.map((pos) => (
                    <button
                      key={pos}
                      type="button"
                      onClick={() => field.onChange(pos)}
                      className={cn(
                        "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors min-h-[44px] flex items-center justify-center",
                        field.value === pos
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border bg-card text-muted-foreground hover:border-primary/50"
                      )}
                    >
                      {pos}
                    </button>
                  ))}
                </div>
              )}
            />
            {errors.position && <p className="text-xs text-destructive">{errors.position.message}</p>}
          </div>

          {/* Result */}
          <div className="space-y-1.5">
            <Label>Result</Label>
            <div className="flex gap-2">
              {RESULT_OPTIONS.map(({ value, label }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setValue("result", selectedResult === value ? undefined : value)}
                  className={cn(
                    "flex-1 rounded-md border py-3 text-sm font-medium transition-colors min-h-[44px]",
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

          {/* P&L */}
          <div className="space-y-1.5">
            <Label htmlFor="pnlDollars">P&amp;L ($)</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">$</span>
              <Input
                id="pnlDollars"
                type="number"
                step="0.01"
                placeholder="0.00"
                className="pl-7 font-mono"
                {...register("pnlDollars", { valueAsNumber: true })}
              />
            </div>
          </div>

          {/* Expand toggle */}
          <button
            type="button"
            onClick={() => setShowFull((v) => !v)}
            className="flex w-full items-center justify-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors py-1"
          >
            {showFull ? (
              <><ChevronUp className="h-4 w-4" />Hide details</>
            ) : (
              <><ChevronDown className="h-4 w-4" /><Plus className="h-3 w-3" />Add streets & details</>
            )}
          </button>
        </CardContent>
      </Card>

      {/* ── Full Log expansion ───────────────────────────────────────── */}
      {showFull && (
        <>
          {/* Preflop 3-tap builder */}
          <Card>
            <CardContent className="pt-4 space-y-3">
              <Label>Preflop</Label>

              {/* Tap 2: action */}
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Your action</p>
                <div className="flex flex-wrap gap-1.5">
                  {PREFLOP_ACTIONS.map((a) => (
                    <button
                      key={a}
                      type="button"
                      onClick={() => handlePreflopAction(a)}
                      className={cn(
                        "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors min-h-[44px] flex items-center",
                        preflopAction === a
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border bg-card text-muted-foreground hover:border-primary/50"
                      )}
                    >
                      {a}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tap 3: sizing (only for raise / 3-bet) */}
              {(preflopAction === "Raise" || preflopAction === "3-bet") && (
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Sizing</p>
                  <div className="flex gap-1.5 flex-wrap">
                    {SIZING_PRESETS.map(({ label, dollars }) => (
                      <button
                        key={label}
                        type="button"
                        onClick={() => handlePreflopSizing(dollars)}
                        className={cn(
                          "rounded-full border px-3 py-1.5 text-xs font-mono font-medium transition-colors min-h-[44px] flex items-center",
                          preflopSizing === dollars
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border bg-card text-muted-foreground hover:border-primary/50"
                        )}
                      >
                        {label} · ${dollars}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Editable result or free-text override */}
              <Textarea
                placeholder="Preflop action description..."
                rows={2}
                value={preflopText ?? ""}
                onChange={(e) => setValue("streets.preflop", e.target.value)}
                className={cn(errors.streets?.preflop && "border-destructive")}
              />
              {errors.streets?.preflop && (
                <p className="text-xs text-destructive">{errors.streets.preflop.message}</p>
              )}
            </CardContent>
          </Card>

          {/* Board */}
          <Card>
            <CardContent className="pt-4 space-y-1.5">
              <Label htmlFor="board">Board</Label>
              <Input id="board" placeholder="e.g. Ah 7d 2c Ks 3h" {...register("streets.board")} />
            </CardContent>
          </Card>

          {/* Postflop streets — progressive disclosure */}
          {(["flop", "turn", "river"] as const).map((street, idx) => {
            const visible =
              street === "flop" ? sawFlop :
              street === "turn" ? (sawFlop && sawTurn) :
              (sawFlop && sawTurn && sawRiver);
            const prevSeen =
              street === "flop" ? true :
              street === "turn" ? sawFlop :
              sawFlop && sawTurn;

            if (!prevSeen) return null;

            return (
              <Card key={street}>
                <CardContent className="pt-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="capitalize">{street}</Label>
                    <button
                      type="button"
                      onClick={() => {
                        if (street === "flop") setSawFlop((v) => !v);
                        if (street === "turn") setSawTurn((v) => !v);
                        if (street === "river") setSawRiver((v) => !v);
                      }}
                      className={cn(
                        "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                        visible
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border bg-card text-muted-foreground"
                      )}
                    >
                      {visible ? `Saw ${street}` : `Saw ${street}?`}
                    </button>
                  </div>
                  {visible && (
                    <Textarea
                      placeholder={`${street.charAt(0).toUpperCase() + street.slice(1)} action...`}
                      rows={2}
                      {...register(`streets.${street}`)}
                    />
                  )}
                </CardContent>
              </Card>
            );
          })}

          {/* Flop toggle if not yet shown */}
          {!sawFlop && (
            <button
              type="button"
              onClick={() => setSawFlop(true)}
              className="w-full rounded-lg border border-dashed border-border py-3 text-sm text-muted-foreground hover:text-foreground hover:border-primary/50 transition-colors"
            >
              + Saw the flop
            </button>
          )}
          {sawFlop && !sawTurn && (
            <button
              type="button"
              onClick={() => setSawTurn(true)}
              className="w-full rounded-lg border border-dashed border-border py-3 text-sm text-muted-foreground hover:text-foreground hover:border-primary/50 transition-colors"
            >
              + Saw the turn
            </button>
          )}
          {sawFlop && sawTurn && !sawRiver && (
            <button
              type="button"
              onClick={() => setSawRiver(true)}
              className="w-full rounded-lg border border-dashed border-border py-3 text-sm text-muted-foreground hover:text-foreground hover:border-primary/50 transition-colors"
            >
              + Saw the river
            </button>
          )}

          {/* Tags */}
          <Card>
            <CardContent className="pt-4 space-y-2">
              <Label>Tags</Label>
              <Controller
                name="tags"
                control={control}
                render={({ field }) => (
                  <div className="flex flex-wrap gap-2">
                    {TAGS.map((tag) => {
                      const active = (field.value ?? []).includes(tag);
                      return (
                        <button
                          key={tag}
                          type="button"
                          onClick={() =>
                            field.onChange(
                              active
                                ? (field.value ?? []).filter((t) => t !== tag)
                                : [...(field.value ?? []), tag]
                            )
                          }
                          className={cn(
                            "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors min-h-[44px] flex items-center",
                            active
                              ? "border-primary bg-primary text-primary-foreground"
                              : "border-border bg-card text-muted-foreground hover:border-primary/50"
                          )}
                        >
                          {TAG_LABELS[tag]}
                        </button>
                      );
                    })}
                  </div>
                )}
              />
            </CardContent>
          </Card>

          {/* Stack sizes */}
          <Card>
            <CardContent className="pt-4 grid grid-cols-2 gap-4">
              {[
                { id: "effectiveStackDollars" as const, label: "Effective Stack ($)" },
                { id: "potSizeDollars" as const, label: "Final Pot ($)" },
              ].map(({ id, label }) => (
                <div key={id} className="space-y-1.5">
                  <Label htmlFor={id}>{label}</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">$</span>
                    <Input
                      id={id}
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      className="pl-7 font-mono"
                      {...register(id, { valueAsNumber: true })}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Notes */}
          <Card>
            <CardContent className="pt-4 space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="villainNotes">Villain Notes</Label>
                <Textarea id="villainNotes" placeholder="Villain tendencies..." rows={2} {...register("villainNotes")} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="notes">Notes</Label>
                <Textarea id="notes" placeholder="Thoughts, analysis..." rows={3} {...register("notes")} />
              </div>
            </CardContent>
          </Card>
        </>
      )}

      <Button type="submit" disabled={isSubmitting} className="w-full" size="lg">
        {isSubmitting ? "Saving..." : "Log Hand"}
      </Button>
    </form>
  );
}
