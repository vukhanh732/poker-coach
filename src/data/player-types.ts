export type PlayerType =
  | "calling_station"
  | "nit"
  | "maniac"
  | "tag"
  | "lag"
  | "fish";

export type PlayerTypeProfile = {
  id: PlayerType;
  name: string;
  tagline: string;
  vpip: string; // voluntarily put money in pot %
  pfr: string;  // preflop raise %
  tells: string[];
  counterStrategy: string[];
  doNot: string[];
  sampleHand: {
    setup: string;
    theirAction: string;
    optimalResponse: string;
  };
};

export const PLAYER_TYPES: PlayerTypeProfile[] = [
  {
    id: "calling_station",
    name: "Calling Station",
    tagline: "They call everything. Make them pay.",
    vpip: "50–70%",
    pfr: "5–15%",
    tells: [
      "Calls preflop raises with any two cards",
      "Never folds to c-bets without reason",
      "Says 'I had to see the flop' frequently",
      "Calls river bets with medium-strength hands",
      "Rarely bluffs — bets only mean value",
    ],
    counterStrategy: [
      "Value bet relentlessly — thin value that most players wouldn't bet, they'll call",
      "Bet 3 streets with top pair top kicker on dry boards",
      "Make larger sizings than usual — they're calling regardless",
      "Don't bluff — bluffing has 0 EV vs stations, pure negative EV",
      "Chase down draws with confidence — when you hit, extract maximum",
      "Remove auto-bluffs from your playbook: turn barrel bluffs, river bluffs are all losing",
    ],
    doNot: [
      "Bluff. Ever. This is the #1 mistake vs calling stations.",
      "Check-call with medium hands hoping they'll 'check it down'",
      "Slow-play — they'll catch up or check behind the whole way",
      "Use fancy bet sizes to 'balance' — they don't think in those terms",
    ],
    sampleHand: {
      setup: "You have A♦Q♣. Board is Q♠8♦3♥. Calling station is in BB.",
      theirAction: "Villain check-calls your $15 c-bet on the flop.",
      optimalResponse: "Bet again on the turn regardless of turn card. They likely have Qx, 8x, or a draw. Your TPTK is far ahead. Bet $30 on the turn, $60 on a blank river. Extract 3 streets.",
    },
  },
  {
    id: "nit",
    name: "The Nit",
    tagline: "They only play premium hands. Steal their blinds constantly.",
    vpip: "10–18%",
    pfr: "8–15%",
    tells: [
      "Sits for 30+ minutes without playing a hand",
      "Only raises with AA/KK/QQ/AK",
      "Folds blind immediately in obvious spots",
      "Shows only premium hands at showdown",
      "Limps or folds 90% of the time preflop",
    ],
    counterStrategy: [
      "Steal their blinds every single time they're folded to",
      "Respect their raises — they almost always have it",
      "Fold to their 3-bets unless you have the top of your range",
      "Float their c-bets on boards that miss their range (low boards)",
      "When they show weakness (check-check), they're often giving up",
    ],
    doNot: [
      "Call their shoves without the very top of your range",
      "Bluff them off strong hands — nits call with anything good",
      "Open limp when they're in the blinds — they'll trap you",
      "Overvalue your hand — if they 3-bet, they have it",
    ],
    sampleHand: {
      setup: "Nit is in the SB. You're on the BTN with K♠9♣. Everyone folds to you.",
      theirAction: "Nit has been folding their SB every orbit for 2 hours.",
      optimalResponse: "Raise to $12–$15. They will fold 85%+ of the time. When they flat, they have a hand but your position makes up for it. When they 3-bet, fold your K9o easily.",
    },
  },
  {
    id: "maniac",
    name: "The Maniac",
    tagline: "They bluff everything. Trap them with strong hands.",
    vpip: "60–80%",
    pfr: "40–60%",
    tells: [
      "Raises preflop with wide range including trash hands",
      "C-bets nearly 100% of the time",
      "Makes large overbets as bluffs",
      "Gets out of line on multiple streets",
      "Talks a lot, is animated, tries to intimidate",
    ],
    counterStrategy: [
      "Trap with strong hands — let them bluff into you",
      "Call down lighter than usual — they're often bluffing",
      "Slow-play big hands preflop to keep them in",
      "Call 3-bets with a wider range when they're being a maniac",
      "Use check-raises to punish their c-betting frequency",
    ],
    doNot: [
      "Fold medium-strength hands — call down more",
      "Try to outbluff a maniac — they call everything",
      "Isolate them with weak hands just because you can — you need showdown equity",
      "Give up on the flop — they read weakness and pounce",
    ],
    sampleHand: {
      setup: "Maniac opens to $15. You have A♠A♦ in the BB.",
      theirAction: "Maniac has 3-bet 5 times in the last hour.",
      optimalResponse: "Flat call (don't 3-bet). They'll often 4-bet/shove or build a pot postflop. On A-high board, check and let them barrel. On low boards, lead small to keep them involved.",
    },
  },
  {
    id: "tag",
    name: "TAG (Tight-Aggressive)",
    tagline: "Solid regular. Respect their lines — don't run big bluffs.",
    vpip: "20–28%",
    pfr: "16–22%",
    tells: [
      "Opens a reasonable range and 3-bets selectively",
      "Has a balanced c-betting range",
      "Checks back some strong hands on the flop",
      "Can lay down one-pair hands to aggression",
      "Pays attention to board texture and position",
    ],
    counterStrategy: [
      "Play straightforward — they read fancy lines well",
      "Attack their c-bets on boards that miss their range",
      "Apply pressure on the turn when they check flop",
      "3-bet them wider from position — they can fold one-pair",
      "Bet-fold more vs TAGs (they can make correct folds)",
    ],
    doNot: [
      "Run multi-street bluffs unless you have a strong range advantage",
      "Pay off their river bets without strong evidence — they bet for value",
      "Open-limp to trap — they raise and you lose position",
      "Fight for small pots out of position",
    ],
    sampleHand: {
      setup: "TAG opens UTG, you 3-bet from CO with A♣K♦. TAG calls.",
      theirAction: "Flop is J♠T♥4♦. TAG checks.",
      optimalResponse: "C-bet 40–50% pot with your whole range. When they check-call, reevaluate turn — bet again on blank turns, check back on T/J/4 (their calling range hits hard here).",
    },
  },
  {
    id: "lag",
    name: "LAG (Loose-Aggressive)",
    tagline: "Tough player — wide range, lots of aggression. Pick spots carefully.",
    vpip: "30–45%",
    pfr: "25–35%",
    tells: [
      "Opens many hands from any position",
      "3-bets frequently including as bluffs",
      "Floats in position and attacks weakness",
      "Fires multiple streets with air when sensing weakness",
      "Adjusts to opponents — the best LAGs are dangerous",
    ],
    counterStrategy: [
      "4-bet more frequently vs their 3-bets",
      "Check-raise strong hands on the flop instead of leading",
      "Call down vs their turn bluffs with medium hands",
      "Don't fold equity draws to their aggression",
      "Look for exploitative spots — great LAGs have leaks when they overdo it",
    ],
    doNot: [
      "Get into big pots with marginal hands — they play those pots well",
      "Try to bluff them off of draws — they understand equity",
      "Be predictable — they'll exploit your tendencies",
      "Fold to every 3-bet — they're doing it too much",
    ],
    sampleHand: {
      setup: "LAG 3-bets your BTN open from the BB. You have K♣J♦.",
      theirAction: "LAG 3-bets to $45 — they've done this 4 times in the session.",
      optimalResponse: "4-bet bluff/fold: 4-bet to $105 and fold to a 5-bet. KJo has decent blockers. Or call in position and use your positional advantage on every street. Don't just fold — that rewards the 3-bet.",
    },
  },
  {
    id: "fish",
    name: "Recreational Fish",
    tagline: "Here to gamble and have fun. Be friendly — extract value, not ego.",
    vpip: "45–65%",
    pfr: "5–15%",
    tells: [
      "Plays almost every hand",
      "Limps frequently or calls any open",
      "Doesn't understand position or fold equity",
      "Chases draws without thinking about odds",
      "Shows cards enthusiastically, enjoys the game",
    ],
    counterStrategy: [
      "Isolate them in heads-up pots — raise to $15–20 to push out others",
      "Value bet extremely thin — they call with any pair",
      "Don't bluff multi-street — they'll look you up",
      "Be in position against them as much as possible",
      "Extract maximum on rivers when you're ahead",
    ],
    doNot: [
      "Bluff or make moves — they won't fold",
      "Be condescending or rude — they'll leave the game",
      "Slowplay to 'set a trap' — just bet your strong hands",
      "Give them free cards with draws — they'll hit more often than you think",
    ],
    sampleHand: {
      setup: "Fish limps UTG. Three players call. You're in the CO with K♦K♣.",
      theirAction: "Fish has been calling all opens and limping everything.",
      optimalResponse: "Raise to $20–25 (larger than normal — punish the limpers). Get it to heads up if possible. C-bet any flop. Bet 3 streets vs their pair or draw. Don't slow play — a fish hitting two pair on you is a bad beat, not bad poker.",
    },
  },
];
