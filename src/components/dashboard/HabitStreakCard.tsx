import { Flame, Trophy, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface HabitStreakCardProps {
  streak: number;
  totalHabits: number;
  completedToday: number;
}

export function HabitStreakCard({ streak, totalHabits, completedToday }: HabitStreakCardProps) {
  const progress = totalHabits > 0 ? (completedToday / totalHabits) * 100 : 0;

  return (
    <div className="relative overflow-hidden rounded-2xl bg-card border border-border/50 shadow-card p-6">
      {/* Streak flame glow */}
      {streak > 0 && (
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-accent/20 rounded-full blur-3xl animate-pulse-soft" />
      )}

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={cn(
              "p-2 rounded-xl",
              streak > 0 ? "bg-accent/10" : "bg-muted"
            )}>
              <Flame className={cn(
                "w-5 h-5",
                streak > 0 ? "text-accent" : "text-muted-foreground"
              )} />
            </div>
            <div>
              <h3 className="font-display text-lg font-semibold text-foreground">Your Streak</h3>
              <p className="text-sm text-muted-foreground">Keep the flame alive!</p>
            </div>
          </div>
          {streak >= 7 && (
            <Trophy className="w-6 h-6 text-warning animate-float" />
          )}
        </div>

        <div className="flex items-end gap-2 mb-4">
          <span className="font-display text-5xl font-bold text-gradient">{streak}</span>
          <span className="text-muted-foreground mb-2">days</span>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Today's Progress</span>
            <span className="font-medium text-foreground">{completedToday}/{totalHabits}</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full gradient-primary rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
