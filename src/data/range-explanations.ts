import type { Position } from "./ranges";

export type HandExplanation = {
  position: Position;
  hand: string;
  action: string;
  sizing: string;
  why: string;
  mistakes: string[];
};

const SIZINGS: Record<string, string> = {
  raise: "$12–$15 (3–4bb) from any position",
  call: "Call the open. Don't 3-bet light out of position.",
  fold: "Fold. Below your opening threshold from this position.",
  mixed: "Raise or fold depending on table dynamics. Avoid calling.",
};

type ExplanationMap = Partial<Record<string, Pick<HandExplanation, "why" | "mistakes">>>;

// Shared explanations reused across positions
const EXPLANATIONS: ExplanationMap = {
  AA: {
    why: "The nuts preflop. Always raise. The only question is how much to re-raise when there's action.",
    mistakes: ["Slow-playing and letting multiple players in cheap", "Not 4-betting when you face a 3-bet"],
  },
  KK: {
    why: "Second nuts. Raise and re-raise. You lose to AA but beat everything else.",
    mistakes: ["Folding to a single 3-bet", "Not continuing vs aggression on A-high boards"],
  },
  QQ: {
    why: "Strong pair — raise and 3-bet. Be prepared for an overcard on the flop.",
    mistakes: ["Over-folding on A/K flops when villain is a calling station", "Folding to a 4-bet without history"],
  },
  JJ: {
    why: "Raise and generally 3-bet. It's a strong hand but you'll often face difficult spots postflop.",
    mistakes: ["Over-continuing when the board is AKQ and villain shows aggression", "Not folding to triple-barrel on coordinated boards"],
  },
  TT: {
    why: "Raise. Strong hand that plays well in position, more cautiously from early position.",
    mistakes: ["Calling a 4-bet without strong reads", "Check-folding flops you should be betting"],
  },
  "AKs": {
    why: "Premium hand. Raise always. Has top-pair top-kicker and nut-flush potential.",
    mistakes: ["Check-folding the flop after missing", "Not semi-bluffing aggressively on flush draws"],
  },
  "AKo": {
    why: "Raise always. Still the 3rd best unpaired hand despite being offsuit.",
    mistakes: ["Giving up after missing the flop on dry boards", "Not c-betting against calling stations"],
  },
  "AQs": {
    why: "Raise. Strong Broadway hand with nut-flush equity. Dominates many hands.",
    mistakes: ["Calling 3-bets OOP with AQs vs tight 3-bettors", "Not folding to 4-bets from nits"],
  },
  "AQo": {
    why: "Raise from most positions. Slightly weaker than AQs but still strong.",
    mistakes: ["Open limping AQo in early position", "Over-defending vs a 3-bet in bad position"],
  },
  "AJs": {
    why: "Raise. Suited broadways have great playability — nut flush draws, top pair top kicker.",
    mistakes: ["Playing passively with top pair vs calling stations", "Bluffing into players who never fold"],
  },
  "KQs": {
    why: "Premium hand. Raise. Has all the equity you want — two overcards, nut draws, straight outs.",
    mistakes: ["Folding on KQ9 type boards when continuation betting is clearly +EV"],
  },
  "22": {
    why: "Small pair with set-mining value. Raise from late position/CO+; fold from early.",
    mistakes: ["Continuing past the flop without a set", "Open-limping then calling a raise"],
  },
  "54s": {
    why: "Suited connector — raise from late position only. Has straight and flush draw equity in multiway pots.",
    mistakes: ["Playing from UTG or MP", "Calling a raise out of position"],
  },
  "A5s": {
    why: "Nut-low flush draw blocker. Has both nut-flush equity and the wheel (A-2-3-4-5) straight.",
    mistakes: ["Playing passively when you hit top pair", "Not semi-bluffing the nut flush draw aggressively"],
  },
};

export function getHandExplanation(
  position: Position,
  hand: string,
  action: string
): HandExplanation {
  const specific = EXPLANATIONS[hand];

  const positionContext: Record<Position, string> = {
    UTG: "UTG is first to act — tightest position. Only open premium hands.",
    UTG1: "UTG+1 — still early position. Open strong hands that play well multiway.",
    MP: "Middle position — slightly looser. You'll be out of position to CO, BTN, and blinds.",
    HJ: "Hijack — becoming late position. Open wider to steal the dead money.",
    CO: "Cutoff — excellent position. Only BTN/SB/BB to act. Open wide.",
    BTN: "Button — best position at the table. You act last every single street. Open very wide.",
    SB: "Small blind — worst position. Raise or fold vs folds-to-you. Avoid cold-calling.",
    BB: "Big blind — you have pot odds to defend wide. Call more, 3-bet premiums.",
  };

  return {
    position,
    hand,
    action,
    sizing: SIZINGS[action] ?? "$12–$15",
    why:
      specific?.why ??
      `${action === "raise" ? "Within your opening range from this position." : action === "call" ? "Playable but not strong enough to raise — call or limp." : action === "mixed" ? "Marginal hand here — raise against passive tables, fold vs tighter games." : "Outside your opening range from this position."} ${positionContext[position]}`,
    mistakes: specific?.mistakes ?? (
      action === "fold"
        ? ["Open-limping hoping to see a cheap flop", "Calling a raise with this hand out of position"]
        : ["Playing too passively postflop", "Not adjusting to villain tendencies"]
    ),
  };
}
