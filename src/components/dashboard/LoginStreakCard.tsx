import { Flame, Trophy, Award } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoginStreakCardProps {
  currentStreak: number;
  longestStreak: number;
  loading: boolean;
}

export function LoginStreakCard({ currentStreak, longestStreak, loading }: LoginStreakCardProps) {
  if (loading) {
    return (
      <div className="rounded-2xl bg-card border border-border/50 shadow-card p-6 animate-pulse">
        <div className="h-6 bg-muted rounded w-1/3 mb-4" />
        <div className="h-12 bg-muted rounded w-1/4 mb-4" />
        <div className="h-4 bg-muted rounded w-1/2" />
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-2xl bg-card border border-border/50 shadow-card p-6">
      {currentStreak > 0 && (
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-accent/20 rounded-full blur-3xl animate-pulse-soft" />
      )}

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={cn("p-2 rounded-xl", currentStreak > 0 ? "bg-accent/10" : "bg-muted")}>
              <Flame className={cn("w-5 h-5", currentStreak > 0 ? "text-accent" : "text-muted-foreground")} />
            </div>
            <div>
              <h3 className="font-display text-lg font-semibold text-foreground">Login Streak</h3>
              <p className="text-sm text-muted-foreground">Log in daily to keep it going!</p>
            </div>
          </div>
          {currentStreak >= 7 && <Trophy className="w-6 h-6 text-warning animate-float" />}
        </div>

        <div className="flex items-end gap-2 mb-4">
          <span className="font-display text-5xl font-bold text-gradient">{currentStreak}</span>
          <span className="text-muted-foreground mb-2">{currentStreak === 1 ? "day" : "days"}</span>
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Award className="w-4 h-4" />
          <span>Best streak: <span className="font-medium text-foreground">{longestStreak} days</span></span>
        </div>
      </div>
    </div>
  );
}
