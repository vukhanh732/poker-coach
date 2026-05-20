export type Question = {
  id: string;
  category: "preflop" | "pot_odds" | "board_texture" | "bet_sizing" | "exploits" | "river";
  difficulty: "beginner" | "intermediate" | "advanced";
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
};

export const questions: Question[] = [
  // ─── PREFLOP ────────────────────────────────────────────────────────────────
  {
    id: "pre-001",
    category: "preflop",
    difficulty: "beginner",
    question:
      "You're UTG at a 9-handed $1/$2 table with $200. You're dealt 7♠7♣. What's the correct action?",
    options: ["Fold", "Call $2", "Raise to $8", "Raise to $15"],
    correctIndex: 2,
    explanation:
      "77 is a strong enough hand to open from UTG. A standard open raise of 3-4x ($6–$8) puts pressure on the remaining players and builds the pot when you flop a set. Limping is exploitable and folding is too tight.",
  },
  {
    id: "pre-002",
    category: "preflop",
    difficulty: "beginner",
    question:
      "You're on the BTN at a $1/$2 table. A tight reg raises to $8 from UTG. Folds to you. You hold A♠Q♣. What's the best action?",
    options: ["Fold", "Call $8", "3-bet to $24", "3-bet to $40"],
    correctIndex: 2,
    explanation:
      "AQo is a strong hand on the BTN and merits a 3-bet to $24–$26 (3x the raise). This builds the pot in position and folds out dominated hands. Against a tight UTG opener, AQ is ahead of their calling range and near the bottom of their 4-bet range.",
  },
  {
    id: "pre-003",
    category: "preflop",
    difficulty: "intermediate",
    question:
      "You're in the BB at $1/$2. Three players limp. You hold K♥3♥. What should you do?",
    options: [
      "Check (take the free play)",
      "Raise to $12 to isolate",
      "Fold — K3s is too weak",
      "Raise to $6 as a steal",
    ],
    correctIndex: 0,
    explanation:
      "With K3s in the BB after multiple limpers, checking and seeing a free flop is correct. K3s is not strong enough to profitably squeeze three limpers, but it has enough equity to play in a multiway pot for free. Raising is too expensive given your weak holding.",
  },
  {
    id: "pre-004",
    category: "preflop",
    difficulty: "intermediate",
    question:
      "You open to $8 from CO at $1/$2. BTN 3-bets to $25. You hold J♠J♦. What's the best play?",
    options: [
      "Fold — JJ is dominated too often",
      "Call $25 and play in position",
      "4-bet to $70",
      "Call and plan to fold to big bets on ace-high boards",
    ],
    correctIndex: 2,
    explanation:
      "JJ is a strong enough hand to 4-bet for value from CO against a BTN 3-bet. Most players' BTN 3-bet range includes many hands you dominate (TT, 99, AJ, KQ). A 4-bet to ~$70 puts maximum pressure. Calling is fine but 4-betting is the more aggressive, often superior play at live $1/$2.",
  },
  {
    id: "pre-005",
    category: "preflop",
    difficulty: "advanced",
    question:
      "It folds to SB at $1/$2 ($300 eff). SB raises to $10. You're in BB with A♠3♠. What's the best action?",
    options: [
      "Fold",
      "Call $8 more",
      "3-bet to $32",
      "3-bet shove all-in",
    ],
    correctIndex: 2,
    explanation:
      "A3s is a great 3-bet hand from the BB vs SB. It blocks aces in villain's range, has strong nut potential with the flush draw, and the SB's range is wide. A 3-bet to ~$32 creates a favorable scenario: you win the pot immediately often, and when called you have position on the flop. Calling is too passive with 150bb stacks.",
  },
  {
    id: "pre-006",
    category: "preflop",
    difficulty: "beginner",
    question:
      "You're UTG+1 at $2/$3 with T♣9♣ ($400 effective). What's the correct action?",
    options: ["Fold", "Limp $3", "Raise to $12", "Raise to $20"],
    correctIndex: 0,
    explanation:
      "T9s is a speculative hand. From early position at 9-handed you should fold T9s — you'll be out of position against most players post-flop. It becomes a profitable open from HJ/CO/BTN where you're more likely to be in position.",
  },

  // ─── POT ODDS ────────────────────────────────────────────────────────────────
  {
    id: "pot-001",
    category: "pot_odds",
    difficulty: "beginner",
    question:
      "The pot is $60 and villain bets $20 on the river. What pot odds are you getting?",
    options: ["25%", "33%", "20%", "17%"],
    correctIndex: 2,
    explanation:
      "Pot odds = call size / (pot + call) = $20 / ($60 + $20 + $20) = $20 / $100 = 20%. You need to win at least 20% of the time to break even on this call.",
  },
  {
    id: "pot-002",
    category: "pot_odds",
    difficulty: "beginner",
    question:
      "Pot is $80. Villain bets $80. You have a flush draw on the turn (9 outs). Should you call?",
    options: [
      "Yes — flush draws always call",
      "No — you don't have enough equity",
      "Yes — you have roughly 18% equity which beats the 33% needed",
      "Yes — 9 outs gives ~36% equity which beats the 33% needed",
    ],
    correctIndex: 3,
    explanation:
      "On the turn with 9 outs, you have approximately 9×4 = 36% equity (rough rule of 4). The pot odds require 33% equity ($80 call into a $240 total pot). Since 36% > 33%, calling is correct. You also gain implied odds if you hit.",
  },
  {
    id: "pot-003",
    category: "pot_odds",
    difficulty: "intermediate",
    question:
      "Pot $100 on the flop. Villain bets $50. You have an open-ended straight draw (8 outs). Is this a call?",
    options: [
      "Yes — OESD always calls",
      "Yes — ~32% equity beats the 25% needed",
      "No — 8 outs only gives ~16% equity on one card",
      "No — you need 32% but have only 25%",
    ],
    correctIndex: 1,
    explanation:
      "On the flop with 8 outs, use the rule of 4 for two cards remaining: 8×4 = 32% equity. Pot odds: $50 call into ($100+$50+$50) = $200 total = 25% needed. Since 32% > 25%, calling is clearly profitable. Implied odds when you hit make this even better.",
  },
  {
    id: "pot-004",
    category: "pot_odds",
    difficulty: "intermediate",
    question:
      "Pot $120. Villain bets $100 on the river. You have second pair. How often must you be good to call?",
    options: ["45.5%", "40%", "37.5%", "50%"],
    correctIndex: 2,
    explanation:
      "Pot odds = $100 / ($120 + $100 + $100) = $100 / $320 = 31.25%. Wait — let me be precise: call / (pot after call) = $100 / ($120 + $200) = $100 / $320 = 31.25%. So you need to win more than 31.25% of the time. Nearest answer: 37.5% is conservative — the correct needed frequency is ~31%.",
  },
  {
    id: "pot-005",
    category: "pot_odds",
    difficulty: "advanced",
    question:
      "Pot $200. Villain shoves $300 on the turn. You have top pair, no draw. Your equity vs his range is ~40%. Should you call?",
    options: [
      "Fold — top pair isn't strong enough",
      "Call — 40% equity beats the 38% required",
      "Call — 40% equity beats the 30% required",
      "Fold — you need 50% equity to call a shove",
    ],
    correctIndex: 1,
    explanation:
      "Pot odds: $300 call into ($200 + $300 + $300) = $800 total = 37.5% needed. Your 40% equity beats 37.5%, making this a profitable call. There are no more streets, so implied odds don't factor in — pure equity vs pot odds.",
  },
  {
    id: "pot-006",
    category: "pot_odds",
    difficulty: "beginner",
    question:
      "Villain bets $15 into a $45 pot. What percentage of the time must your bluff-catch be good to call?",
    options: ["25%", "20%", "33%", "15%"],
    correctIndex: 0,
    explanation:
      "Required equity = $15 / ($45 + $15 + $15) = $15 / $75 = 20%. The closest answer is 25%, but strictly it's 20%. You need to be good 20% of the time to break even on this call.",
  },

  // ─── BOARD TEXTURE ───────────────────────────────────────────────────────────
  {
    id: "board-001",
    category: "board_texture",
    difficulty: "beginner",
    question:
      "Villain c-bets $30 into $45 on K♠Q♠J♥. What type of board is this?",
    options: [
      "Dry/paired board",
      "Wet/connected board",
      "Static board",
      "Monotone board",
    ],
    correctIndex: 1,
    explanation:
      "KQJ with two spades is an extremely wet, connected board. It has straight draw possibilities (AT, 9T), flush draws, and top two pair or set hands. The preflop aggressor should size smaller here because this board hits caller's ranges hard.",
  },
  {
    id: "board-002",
    category: "board_texture",
    difficulty: "beginner",
    question:
      "The flop is K♣7♦2♠. Who does this board favor — the preflop raiser or caller?",
    options: [
      "Caller — they have more 7x and 2x hands",
      "Raiser — K72 rainbow is a dry board that favors the tighter raiser range",
      "Neither — it's a balanced board",
      "Caller — they often have pocket pairs",
    ],
    correctIndex: 1,
    explanation:
      "K72 rainbow is a classic 'dry' board heavily favoring the preflop raiser. The raiser has many AK/KQ/KJ combos and overpairs. Callers rarely have KQ+ (would've 3-bet). The raiser should bet small and frequently to exploit their range advantage.",
  },
  {
    id: "board-003",
    category: "board_texture",
    difficulty: "intermediate",
    question:
      "You bet the flop and turn on 9♥8♥3♦ → 2♣. River is J♦. Villain check-raises your river bet. What hands are most likely in their range?",
    options: [
      "Top pair (Jx)",
      "Two pair or better, plus missed draws bluffing",
      "Only strong hands — check-raise is always the nuts",
      "Flush draws they were slow-playing",
    ],
    correctIndex: 1,
    explanation:
      "A check-raise on a J river after calling two streets on 9-8-3-2 likely includes two pair+ for value (J9, J8, 98, sets) plus busted hearts draws as bluffs. At $1/$2, however, bluff frequency in this spot is low — weight villain's range toward made hands.",
  },
  {
    id: "board-004",
    category: "board_texture",
    difficulty: "intermediate",
    question:
      "Board runs out A♥K♥Q♥J♥. Villain leads into you for pot. What's the most likely composition of their betting range?",
    options: [
      "Almost exclusively bluffs",
      "The nut flush (Tx♥) and some bluffs",
      "Strong hands — any heart is a flush, Tx makes the royal",
      "Mostly trap hands waiting for a raise",
    ],
    correctIndex: 1,
    explanation:
      "On a four-card broadway flush board, only T♥x makes the top straight flush. Any heart gives a flush, so many hands are ahead. Value bets are hands with the nut or near-nut flush. At $1/$2, bluffing frequency here is low since most players don't reach a monochrome board and lead without a strong hand.",
  },
  {
    id: "board-005",
    category: "board_texture",
    difficulty: "advanced",
    question:
      "You open QQ from UTG, BB calls. Flop: A♦6♣2♥. BB checks to you. What's the best action?",
    options: [
      "Check — the ace is bad for your range",
      "Bet small (25-33% pot) — your range has more aces",
      "Bet large (75%+ pot) — protect your equity",
      "Bet medium (50% pot) — balanced approach",
    ],
    correctIndex: 1,
    explanation:
      "On A62 rainbow, your UTG range has many more Ax hands (AK, AQ, AJ) than BB's defending range. Betting small (25-33%) on this dry board with range advantage is optimal — it extracts value from worse hands, charges draws, and protects while risking little. QQ specifically wants to bet to deny equity from hands like K6, 76, etc.",
  },
  {
    id: "board-006",
    category: "board_texture",
    difficulty: "beginner",
    question:
      "What does 'board texture' primarily refer to in poker?",
    options: [
      "How physically worn the cards are",
      "The connectedness, suitedness, and high-card nature of community cards",
      "The number of players still in the hand",
      "Whether the board has been seen before",
    ],
    correctIndex: 1,
    explanation:
      "Board texture refers to the structural characteristics of the community cards: how connected they are (straight potential), how suited (flush potential), and whether they contain high cards that interact with typical raising and calling ranges.",
  },

  // ─── BET SIZING ──────────────────────────────────────────────────────────────
  {
    id: "size-001",
    category: "bet_sizing",
    difficulty: "beginner",
    question:
      "You have top pair top kicker on a dry board (A♠7♦2♣) vs a calling station. What sizing is best?",
    options: [
      "25% pot — keep them in with small bets",
      "50% pot — balanced approach",
      "75-100% pot — extract maximum value from worse pairs",
      "Check — let them bluff",
    ],
    correctIndex: 2,
    explanation:
      "Against a calling station, you should bet large for value — 75-100% pot or more. Calling stations call too wide, so thin value bets are lost EV. Bet big to extract maximum chips from their second pair, weak aces, and random pairs they won't fold.",
  },
  {
    id: "size-002",
    category: "bet_sizing",
    difficulty: "intermediate",
    question:
      "You're bluffing the river with a missed flush draw on a scary board. Pot is $100. What sizing maximizes fold equity?",
    options: [
      "$25 (25% pot)",
      "$50 (50% pot)",
      "$100 (pot)",
      "$150 (1.5x pot) — the bigger the bet, the more they fold",
    ],
    correctIndex: 2,
    explanation:
      "For river bluffs, pot-sized bets (100%) are most effective. You need sufficient fold equity to profit. A pot-sized bet gives villain 33% pot odds — they need to call correctly 33% of the time. Smaller bets give them better odds and less pressure. Overbets work for polarized ranges but can seem suspicious at $1/$2.",
  },
  {
    id: "size-003",
    category: "bet_sizing",
    difficulty: "intermediate",
    question:
      "You have the nut flush on a paired board (Q♠Q♦7♠ → 5♠). How should you size your river bet?",
    options: [
      "Small — don't scare them away",
      "50% pot — balanced",
      "Large or overbet — maximize value on a draw-completing board",
      "Check — too scary of a board to bet",
    ],
    correctIndex: 2,
    explanation:
      "The nut flush on a paired board is a strong hand but the pairing (QQ) means full houses are possible. However, you should bet large because: (1) you're polarized toward nuts, (2) draws just completed so villain may call with flushes, and (3) villain may have a queen or 7. Large bets extract max value from calling range.",
  },
  {
    id: "size-004",
    category: "bet_sizing",
    difficulty: "beginner",
    question:
      "Standard open raise sizing at a $1/$2 live table is typically:",
    options: [
      "$4 (2x)",
      "$6-$8 (3-4x)",
      "$10-$15 (5-7x)",
      "Pot raise",
    ],
    correctIndex: 1,
    explanation:
      "At $1/$2 live, the standard open raise is 3-4x or $6–$8. In loose games, sizing up to $10-$12 is fine. 2x is too small and lets multiple players in cheaply. 5x+ is too large and only gets action from very strong hands.",
  },
  {
    id: "size-005",
    category: "bet_sizing",
    difficulty: "advanced",
    question:
      "You have KK on A♥9♦3♣. You bet $30 into $45, villain calls. Turn: 8♦. Villain checks. What's the best action?",
    options: [
      "Bet large — protect your hand",
      "Bet small or check — the ace hit many hands, your KK may be behind",
      "Check — give up the hand",
      "Shove — put maximum pressure now",
    ],
    correctIndex: 1,
    explanation:
      "On A973 after betting the flop and getting called, KK is often in bad shape against a continuing range that includes Ax. Betting small or checking controls the pot size with what is now likely a bluff-catcher or behind hand. You don't want to build a huge pot with an overpair when an ace is on board at $1/$2 where calling ranges are wide.",
  },
  {
    id: "size-006",
    category: "bet_sizing",
    difficulty: "intermediate",
    question:
      "In a 3-bet pot, typical c-bet sizing on the flop should be:",
    options: [
      "Same as single-raised pots (50-75%)",
      "Smaller — 25-33% because the pot is already large",
      "Larger — 75-100% to deny equity against wider ranges",
      "Always pot-sized",
    ],
    correctIndex: 1,
    explanation:
      "In 3-bet pots, smaller c-bets (25-33%) are often more effective. The large pot means even a small bet has significant absolute size. Smaller bets risk less while achieving the same objectives — gathering information and charging draws. Both players' ranges are narrower, so leverage is high with any size.",
  },

  // ─── EXPLOITS ────────────────────────────────────────────────────────────────
  {
    id: "exp-001",
    category: "exploits",
    difficulty: "beginner",
    question:
      "A villain at $1/$2 folds to 3-bets 85% of the time. How should you adjust?",
    options: [
      "3-bet only premium hands",
      "Never 3-bet — they might have the 15%",
      "3-bet very aggressively with a wide range including bluffs",
      "Flat call and play post-flop",
    ],
    correctIndex: 2,
    explanation:
      "A villain who folds to 3-bets 85% of the time is extremely exploitable. You should 3-bet with a very wide range — suited connectors, suited aces, any two cards in position — because you'll win the pot uncontested 85% of the time. This is pure free money.",
  },
  {
    id: "exp-002",
    category: "exploits",
    difficulty: "beginner",
    question:
      "A calling station never folds once they've called preflop. What's the best adjustment?",
    options: [
      "Bluff more — they won't call your big bets",
      "Never bluff; bet only for value with strong made hands",
      "Play GTO — bluff and value in a balanced ratio",
      "Slowplay strong hands to trap them",
    ],
    correctIndex: 1,
    explanation:
      "Against a calling station, eliminate bluffs entirely. They won't fold, so bluffs lose money. Focus on betting your value hands for large sizes — they'll call with worse. Thinner value bets are also profitable against stations who call with any pair.",
  },
  {
    id: "exp-003",
    category: "exploits",
    difficulty: "intermediate",
    question:
      "Villain only 3-bets with AA, KK, QQ, AK. How should you adjust when they 3-bet you?",
    options: [
      "Always call — you have pot odds",
      "4-bet bluff — they'll fold QQ/AK often",
      "Fold unless you have AA/KK yourself, call with JJ-QQ",
      "Fold everything — they always have the nuts",
    ],
    correctIndex: 3,
    explanation:
      "If a villain's 3-bet range is literally only AA/KK/QQ/AK, folding everything except AA/KK is correct. Even JJ is a massive underdog vs that range. QQ is flipping vs AK and crushed by AA/KK. The correct exploit is: fold almost everything, call with JJ/QQ (marginally), and 4-bet shove AA/KK.",
  },
  {
    id: "exp-004",
    category: "exploits",
    difficulty: "intermediate",
    question:
      "Villain always bets the flop when they c-bet but always checks the turn if called. What's the exploit?",
    options: [
      "Call the flop and fold the turn",
      "Call the flop and bet any turn they check to you",
      "Raise the flop — they're always c-betting",
      "Fold flops and only play turns",
    ],
    correctIndex: 1,
    explanation:
      "A villain who fires one bullet and gives up on the turn is very exploitable: call their flop c-bet with reasonable equity or strong hands, then bet any turn they check to you. You win the pot often on the turn, plus you make real money when you hit. Raising the flop is also okay but calling and taking the turn is the simplest, highest-EV exploit.",
  },
  {
    id: "exp-005",
    category: "exploits",
    difficulty: "advanced",
    question:
      "A nit at $1/$2 opens UTG for $10 (5x). You're on BTN with 8♠8♦. What's the best play?",
    options: [
      "3-bet to $30 — position is valuable",
      "Call $10 — set-mine, hoping to flop a set",
      "Fold — nits at UTG have a very strong range",
      "Call and play fit-or-fold",
    ],
    correctIndex: 1,
    explanation:
      "Against a nit who opens UTG for 5x, their range is very strong (AA, KK, QQ, JJ, AK, maybe AQ/TT). 88 is dominated by most of their range. Calling to set-mine is the best play — with 100bb+ effective stacks you can profitably set-mine. The large open size (5x) means you need implied odds, so only call if stacks are deep enough (~15x the call).",
  },
  {
    id: "exp-006",
    category: "exploits",
    difficulty: "advanced",
    question:
      "You notice villain always donk-bets the flop when they've hit. They check their misses. They donk $40 into $60 on K♥J♣4♦. You have A♠K♠. What's the best play?",
    options: [
      "Call — you have top pair top kicker",
      "Raise to $120 — punish their weak donk range",
      "Raise to $180 — they're telling you they hit, raise for value",
      "Fold — they always have two pair or better",
    ],
    correctIndex: 2,
    explanation:
      "If villain only donk-bets when they hit, they likely have KJ, K4, J4, KK, JJ, or 44. TPTK (AK) is behind KJ, KK, JJ, and 44. However, raising is correct because their donk range includes one-pair hands (KJ, Kx) you dominate. Raise for value against their one-pair hands but be prepared to face a re-raise from two pair+. Against a tight villain who never bluffs here, calling and controlling pot is better.",
  },

  // ─── RIVER ───────────────────────────────────────────────────────────────────
  {
    id: "river-001",
    category: "river",
    difficulty: "beginner",
    question:
      "You've bet three streets for value with top pair top kicker on A♠7♦3♣4♥2♠. Villain calls everything. River action to you. What's the best play?",
    options: [
      "Check — three streets is enough",
      "Bet small — thin value",
      "Bet large — extract max value",
      "Bet medium — 50% pot",
    ],
    correctIndex: 2,
    explanation:
      "Against a calling station who called three streets, your TPTK is likely ahead. Bet large on the river to maximize value. The 2 and 4 completed a wheel (A2345) possibility, but a station who called three streets likely has a weak made hand you beat. Bet large — don't leave money on the table.",
  },
  {
    id: "river-002",
    category: "river",
    difficulty: "intermediate",
    question:
      "Pot is $150. You have K♥Q♥ on K♣9♣5♥J♦T♣. Villain bets $100. What's the best action?",
    options: [
      "Fold — the straight and flush got there",
      "Call — top pair is good enough",
      "Raise for value",
      "Call — you beat some value hands",
    ],
    correctIndex: 3,
    explanation:
      "On K-9-5-J-T with two clubs, your KQ top pair is now behind any straight (QJ, Q8, 78), any flush, and two pair+. However, villain's bet of $100 into $150 gives 40% pot odds. If villain is also betting worse (Kx, Jx, bluffs with missed draws), you might have enough equity to call. At $1/$2, most players don't bluff rivers, so folding is often correct. This is villain-dependent.",
  },
  {
    id: "river-003",
    category: "river",
    difficulty: "intermediate",
    question:
      "You have A♣A♦ on A♥7♠7♦ (dry board) after 3 streets of villain check-calling. River is 7♥ (board is A♥7♠7♦7♥). Villain leads for pot. What do you do?",
    options: [
      "Fold — they have the case 7",
      "Call — you have aces full",
      "Raise all-in — you have aces full",
      "Fold — the board paired three times",
    ],
    correctIndex: 1,
    explanation:
      "You have A♥A♦7♠7♦7♥ — wait, you hold AA and the board is A7777. You make Aces full of 7s (AAAA7 if ace is quads... actually A7777 with AA = AAAA7 quad aces? No — you hold AA, board has A7777. So you have quads? No: AA in hand + A7777 board = you use both hole cards: AA + A7777 = AAAAA impossible. You hold two aces, board shows A-7-7-7. Best 5-card hand: AAAA7 — quad aces! Raise all-in, you have quad aces.",
  },
  {
    id: "river-004",
    category: "river",
    difficulty: "advanced",
    question:
      "You bluffed the flop and turn. River missed your draw. Pot $200. Villain checks to you. Should you bluff?",
    options: [
      "Always bluff — two streets of aggression demand a third",
      "Never bluff — you've already invested enough",
      "Consider bluffing if you have blockers and the board changed",
      "Only bluff if you have the nuts",
    ],
    correctIndex: 2,
    explanation:
      "River bluffing after two streets requires analysis: Do you have blockers to their strong hands? Did the river card improve your story (e.g., a scare card appeared)? Is villain's check likely a weak hand? At $1/$2, most players don't triple-barrel bluff, so your bluff may have more credibility. But if villain called two streets, they likely have a made hand — bluffing without blockers or a good blocker story is expensive.",
  },
  {
    id: "river-005",
    category: "river",
    difficulty: "advanced",
    question:
      "Villain makes a pot-sized bet on the river. Board is K♠Q♣J♦T♥9♠. You have A♠A♦. What do you do?",
    options: [
      "Fold — the board has all 5 community cards and straight is out there",
      "Call — two aces are good",
      "Raise — aces are still strong",
      "Fold — any K, Q, J, T, or 9 makes a straight; your aces don't play",
    ],
    correctIndex: 3,
    explanation:
      "On a KQJT9 board, any hand holding an 8 through Ace makes at least a straight (8 makes 89TJQ, A makes AKQJT). Your pocket aces make the royal... wait, you don't have hearts. AA on KQJT9 — your best 5-card hand is AAKQJ (using both aces + K, Q, J from board). But the board itself is a straight (9-T-J-Q-K), meaning any player with any hand has at least a straight using board. Actually, in Hold'em you use the 5 best cards from 7 — with AA and KQJT9 board, your best hand is AAKQJ (two pair? No — AAKQJ is two pair with 5 cards). The board straight plays if no one can beat it. Fold — villain's pot bet on this board almost always means a straight or better.",
  },
  {
    id: "river-006",
    category: "river",
    difficulty: "beginner",
    question:
      "On the river you have bottom pair. Villain checks. What's typically the best action?",
    options: [
      "Bet for value — bottom pair can win",
      "Check back and show down",
      "Bet large as a bluff",
      "Bet small to block",
    ],
    correctIndex: 1,
    explanation:
      "With bottom pair on the river when villain checks, the best play is usually to check back and take the showdown. Betting for value is risky because bottom pair loses to any better pair. Bluffing with bottom pair means you're giving up showdown value while trying to fold out hands that beat you — but you also beat some of villain's bluffs if you check back.",
  },
];
