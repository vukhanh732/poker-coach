import { writeFileSync, mkdirSync } from "fs";
import { join } from "path";

// Build the ranked list of 169 hands (rank 1 = strongest, 169 = weakest)
// Order follows standard GTO hand rankings

const RANKS = ["A", "K", "Q", "J", "T", "9", "8", "7", "6", "5", "4", "3", "2"];

// Build all 169 hands in rank order
const rankedHands: string[] = [
  // Pocket pairs (AA=1 down to 22=13)
  "AA", "KK", "QQ", "JJ", "TT", "99", "88", "77", "66", "55", "44", "33", "22",

  // Premium suited broadways (14-21)
  "AKs", "AQs", "AJs", "KQs", "ATs", "KJs", "QJs", "KTs",

  // More suited broadway / strong suited hands (22-32)
  "AKo", "QTs", "A9s", "JTs", "A8s", "KQo", "A7s", "A6s", "A5s",

  // Suited connectors and medium suited (33-44)
  "A4s", "AQo", "A3s", "T9s", "A2s", "KJo", "K9s", "QJo", "J9s",
  "AJo", "K8s", "Q9s",

  // More suited connectors and offsuit broadways (45-60)
  "T8s", "KTo", "K7s", "98s", "QTo", "J8s", "K6s", "ATo", "87s",
  "Q8s", "K5s", "T7s", "97s", "JTo", "K4s",

  // Medium suited and offsuit combos (61-80)
  "K3s", "86s", "J9o", "K2s", "76s", "Q7s", "T9o", "96s", "K9o",
  "65s", "J7s", "Q6s", "A9o", "87o", "85s", "75s", "T8o",

  // Weaker suited / mixed offsuit (81-100)
  "Q5s", "54s", "64s", "J8o", "Q4s", "98o", "95s", "K8o", "Q3s",
  "74s", "J6s", "Q8o", "A8o", "Q2s", "63s", "53s", "86o", "J5s",
  "97o", "K7o",

  // Further down (101-120)
  "84s", "J4s", "76o", "T7o", "A7o", "43s", "J3s", "65o", "Q7o",
  "J2s", "96o", "73s", "K6o", "A6o", "T6s", "85o", "52s", "75o",
  "94s", "Q6o",

  // Weaker hands (121-140)
  "A5o", "64o", "T5s", "J7o", "62s", "K5o", "A4o", "93s", "95o",
  "T4s", "54o", "Q5o", "74o", "T3s", "K4o", "A3o", "92s", "84o",
  "T2s", "63o",

  // Near-bottom (141-155)
  "Q4o", "53o", "K3o", "A2o", "83s", "J6o", "43o", "Q3o", "73o",
  "K2o", "82s", "52o", "Q2o", "93o", "T6o",

  // Bottom (156-169)
  "J5o", "62o", "92o", "J4o", "83o", "T5o", "J3o", "94o", "T4o",
  "J2o", "T3o", "82o", "Q9o", "72s", "42s", "42o", "32s", "32o",
  "T2o", "72o",
];

// Verify we have 169 hands
if (rankedHands.length !== 169) {
  console.error(`ERROR: Expected 169 hands, got ${rankedHands.length}`);
  // Find duplicates
  const seen = new Set<string>();
  const dupes: string[] = [];
  for (const h of rankedHands) {
    if (seen.has(h)) dupes.push(h);
    seen.add(h);
  }
  if (dupes.length > 0) console.error("Duplicates:", dupes);
  process.exit(1);
}

console.log(`Total hands: ${rankedHands.length}`);

// Position configs: { name, pureRaisePct, mixedZonePct, isSB?, isBB? }
const positions = [
  { name: "utg",  pureRaisePct: 0.09, mixedZonePct: 0.03, isSB: false, isBB: false },
  { name: "utg1", pureRaisePct: 0.11, mixedZonePct: 0.03, isSB: false, isBB: false },
  { name: "mp",   pureRaisePct: 0.14, mixedZonePct: 0.04, isSB: false, isBB: false },
  { name: "hj",   pureRaisePct: 0.19, mixedZonePct: 0.04, isSB: false, isBB: false },
  { name: "co",   pureRaisePct: 0.26, mixedZonePct: 0.05, isSB: false, isBB: false },
  { name: "btn",  pureRaisePct: 0.44, mixedZonePct: 0.06, isSB: false, isBB: false },
  { name: "sb",   pureRaisePct: 0.32, mixedZonePct: 0.06, isSB: true,  isBB: false },
  { name: "bb",   pureRaisePct: 0.10, mixedZonePct: 0.05, isSB: false, isBB: true  },
];

const outDir = join(import.meta.dir, "..", "public", "solver", "preflop");
mkdirSync(outDir, { recursive: true });

for (const pos of positions) {
  const totalHands = 169;
  const pureRaiseCount = Math.round(pos.pureRaisePct * totalHands);
  const mixedZoneCount = Math.round(pos.mixedZonePct * totalHands);

  const result: Record<string, { raise: number; call: number; fold: number }> = {};

  for (let i = 0; i < rankedHands.length; i++) {
    const hand = rankedHands[i];
    const rank = i + 1; // 1-indexed rank (1 = best)

    if (rank <= pureRaiseCount) {
      // Pure raise zone
      result[hand] = { raise: 1.0, call: 0.0, fold: 0.0 };
    } else if (rank <= pureRaiseCount + mixedZoneCount) {
      // Mixed zone
      if (pos.isSB) {
        result[hand] = { raise: 0.5, call: 0.2, fold: 0.3 };
      } else {
        result[hand] = { raise: 0.6, call: 0.0, fold: 0.4 };
      }
    } else {
      // Fold zone (default)
      if (pos.isSB) {
        // SB: hands near the threshold in the fold range get some calling frequency
        // Hands just outside mixed zone (next ~8%) get a small call frequency
        const nearThresholdCount = Math.round(0.08 * totalHands);
        if (rank <= pureRaiseCount + mixedZoneCount + nearThresholdCount) {
          result[hand] = { raise: 0.0, call: 0.3, fold: 0.7 };
        } else {
          result[hand] = { raise: 0.0, call: 0.0, fold: 1.0 };
        }
      } else {
        result[hand] = { raise: 0.0, call: 0.0, fold: 1.0 };
      }
    }
  }

  const outPath = join(outDir, `${pos.name}.json`);
  writeFileSync(outPath, JSON.stringify(result, null, 2));
  console.log(`Wrote ${outPath} (${Object.keys(result).length} hands)`);
}

console.log("Done!");
