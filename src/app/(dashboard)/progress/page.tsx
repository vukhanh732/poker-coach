import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { studyStreaks, quizAttempts } from "@/lib/db/schema";
import { eq, count, sql } from "drizzle-orm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";

const CATEGORIES = [
  { key: "preflop", label: "Preflop" },
  { key: "pot_odds", label: "Pot Odds" },
  { key: "board_texture", label: "Board Texture" },
  { key: "bet_sizing", label: "Bet Sizing" },
  { key: "exploits", label: "Exploits" },
  { key: "river", label: "River" },
] as const;

type CategoryKey = (typeof CATEGORIES)[number]["key"];

interface CategoryStat {
  category: string;
  total: number;
  correct: number;
  accuracy: number;
}

interface AchievementDef {
  id: string;
  emoji: string;
  name: string;
  description: string;
}

const ACHIEVEMENTS: AchievementDef[] = [
  {
    id: "first_hand",
    emoji: "🃏",
    name: "First Hand",
    description: "Completed your first quiz question.",
  },
  {
    id: "sharp_shooter",
    emoji: "🎯",
    name: "Sharp Shooter",
    description: "Achieved 80%+ accuracy in a category with 10+ attempts.",
  },
  {
    id: "on_a_roll",
    emoji: "🔥",
    name: "On a Roll",
    description: "Maintained a 3-day study streak.",
  },
  {
    id: "grinder",
    emoji: "💪",
    name: "Grinder",
    description: "Logged 60+ total study minutes.",
  },
];

export default async function ProgressPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-muted-foreground">Please sign in to view your progress.</p>
      </div>
    );
  }

  // Fetch streak data
  const [streakRow] = await db
    .select()
    .from(studyStreaks)
    .where(eq(studyStreaks.userId, user.id))
    .limit(1);

  // Fetch total quiz attempts and correct count
  const [totalsRow] = await db
    .select({
      total: count(),
      correct: sql<number>`sum(case when ${quizAttempts.correct} then 1 else 0 end)`,
    })
    .from(quizAttempts)
    .where(eq(quizAttempts.userId, user.id));

  const totalAttempts = totalsRow?.total ?? 0;
  const totalCorrect = Number(totalsRow?.correct ?? 0);
  const overallAccuracy =
    totalAttempts > 0 ? Math.round((totalCorrect / totalAttempts) * 100) : 0;

  // Per-category breakdown
  const categoryRows = await db
    .select({
      category: quizAttempts.category,
      total: count(),
      correct: sql<number>`sum(case when ${quizAttempts.correct} then 1 else 0 end)`,
    })
    .from(quizAttempts)
    .where(eq(quizAttempts.userId, user.id))
    .groupBy(quizAttempts.category);

  const categoryMap: Record<string, CategoryStat> = {};
  for (const row of categoryRows) {
    const total = row.total;
    const correct = Number(row.correct ?? 0);
    categoryMap[row.category] = {
      category: row.category,
      total,
      correct,
      accuracy: total > 0 ? Math.round((correct / total) * 100) : 0,
    };
  }

  // Determine earned achievements
  const currentStreak = streakRow?.currentStreak ?? 0;
  const longestStreak = streakRow?.longestStreak ?? 0;
  const totalStudyMinutes = streakRow?.totalStudyMinutes ?? 0;

  const hasSharpShooter = Object.values(categoryMap).some(
    (cat) => cat.total >= 10 && cat.accuracy > 80
  );

  const earnedIds = new Set<string>();
  if (totalAttempts > 0) earnedIds.add("first_hand");
  if (hasSharpShooter) earnedIds.add("sharp_shooter");
  if (currentStreak >= 3) earnedIds.add("on_a_roll");
  if (totalStudyMinutes >= 60) earnedIds.add("grinder");

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6 max-w-2xl mx-auto w-full">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Progress</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Track your study streaks, quiz performance, and milestones.
        </p>
      </div>

      {/* Streak card */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Study Streak</CardTitle>
        </CardHeader>
        <CardContent>
          {!streakRow ? (
            <p className="text-sm text-muted-foreground">
              No streak data yet. Start studying to build your streak!
            </p>
          ) : (
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="space-y-1">
                <div className="text-3xl font-bold">
                  🔥 {currentStreak}
                </div>
                <p className="text-xs text-muted-foreground">Current Streak</p>
              </div>
              <div className="space-y-1">
                <div className="text-3xl font-bold">{longestStreak}</div>
                <p className="text-xs text-muted-foreground">Longest Streak</p>
              </div>
              <div className="space-y-1">
                <div className="text-3xl font-bold">{totalStudyMinutes}</div>
                <p className="text-xs text-muted-foreground">Total Minutes</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quiz stats */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Quiz Performance</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {totalAttempts === 0 ? (
            <p className="text-sm text-muted-foreground">
              No quiz attempts yet. Head to the Trainer to start practicing!
            </p>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <p className="text-sm font-medium">Overall Accuracy</p>
                  <p className="text-xs text-muted-foreground">
                    {totalCorrect} / {totalAttempts} correct
                  </p>
                </div>
                <Badge
                  variant={overallAccuracy >= 70 ? "default" : "secondary"}
                  className="text-sm px-2.5"
                >
                  {overallAccuracy}%
                </Badge>
              </div>

              <Separator />

              <div className="space-y-3">
                <p className="text-sm font-medium">By Category</p>
                {CATEGORIES.map(({ key, label }) => {
                  const stat = categoryMap[key];
                  if (!stat || stat.total === 0) {
                    return (
                      <div key={key} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">{label}</span>
                          <span className="text-muted-foreground text-xs">No attempts</span>
                        </div>
                        <Progress value={0} className="h-1.5" />
                      </div>
                    );
                  }
                  return (
                    <div key={key} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>{label}</span>
                        <span className="text-muted-foreground text-xs">
                          {stat.accuracy}% ({stat.correct}/{stat.total})
                        </span>
                      </div>
                      <Progress value={stat.accuracy} className="h-1.5" />
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Achievements */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Achievements</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            {ACHIEVEMENTS.map((achievement) => {
              const earned = earnedIds.has(achievement.id);
              return (
                <div
                  key={achievement.id}
                  className={`rounded-lg border p-3 space-y-1 transition-colors ${
                    earned
                      ? "border-border bg-card"
                      : "border-border/50 bg-muted/30 opacity-50"
                  }`}
                >
                  <div className="text-2xl">{achievement.emoji}</div>
                  <p className="text-sm font-semibold leading-tight">
                    {achievement.name}
                  </p>
                  <p className="text-xs text-muted-foreground leading-snug">
                    {achievement.description}
                  </p>
                  {earned && (
                    <Badge variant="secondary" className="text-xs mt-1">
                      Earned
                    </Badge>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
