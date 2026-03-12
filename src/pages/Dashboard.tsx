import { useState } from "react";
import { DailyPromptCard } from "@/components/dashboard/DailyPromptCard";
import { LoginStreakCard } from "@/components/dashboard/LoginStreakCard";
import { MoodOverviewCard } from "@/components/dashboard/MoodOverviewCard";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { useLoginStreak } from "@/hooks/useLoginStreak";

export default function Dashboard() {
  const { currentStreak, longestStreak, loading: streakLoading } = useLoginStreak();

  const [recentMoods] = useState([
    { date: "2024-01-01", mood: 4 },
    { date: "2024-01-02", mood: 3 },
    { date: "2024-01-03", mood: 5 },
    { date: "2024-01-04", mood: 4 },
    { date: "2024-01-05", mood: 4 },
    { date: "2024-01-06", mood: 5 },
    { date: "2024-01-07", mood: 4 },
  ]);

  const averageMood = recentMoods.reduce((acc, m) => acc + m.mood, 0) / recentMoods.length;

  return (
    <div className="min-h-screen gradient-hero pb-24 md:pb-8 md:pt-24">
      <div className="container mx-auto px-4 py-6 md:py-8">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-2">
            Good morning, Artist ✨
          </h1>
          <p className="text-muted-foreground text-lg">
            Ready to create something beautiful today?
          </p>
        </div>

        {/* Quick Actions */}
        <div className="mb-8 animate-slide-up" style={{ animationDelay: "0.1s" }}>
          <QuickActions />
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Daily Prompt - Full width on mobile, half on desktop */}
          <div className="animate-slide-up" style={{ animationDelay: "0.2s" }}>
            <DailyPromptCard />
          </div>

          {/* Stats Column */}
          <div className="space-y-6">
            <div className="animate-slide-up" style={{ animationDelay: "0.3s" }}>
              <HabitStreakCard
                streak={streak}
                totalHabits={habits.length}
                completedToday={completedToday}
              />
            </div>
            <div className="animate-slide-up" style={{ animationDelay: "0.4s" }}>
              <MoodOverviewCard recentMoods={recentMoods} averageMood={averageMood} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
