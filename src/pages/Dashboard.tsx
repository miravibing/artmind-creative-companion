import { DailyPromptCard } from "@/components/dashboard/DailyPromptCard";
import { LoginStreakCard } from "@/components/dashboard/LoginStreakCard";
import { MoodOverviewCard } from "@/components/dashboard/MoodOverviewCard";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { useLoginStreak } from "@/hooks/useLoginStreak";

export default function Dashboard() {
  const { currentStreak, longestStreak, loading: streakLoading } = useLoginStreak();

  return (
    <div className="min-h-screen gradient-hero pb-24 md:pb-8 md:pt-24">
      <div className="container mx-auto px-4 py-6 md:py-8">
        <div className="mb-8 animate-fade-in">
          <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-2">
            Good morning, Artist ✨
          </h1>
          <p className="text-muted-foreground text-lg">
            Ready to create something beautiful today?
          </p>
        </div>

        <div className="mb-8 animate-slide-up" style={{ animationDelay: "0.1s" }}>
          <QuickActions />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="animate-slide-up" style={{ animationDelay: "0.2s" }}>
            <DailyPromptCard />
          </div>

          <div className="space-y-6">
            <div className="animate-slide-up" style={{ animationDelay: "0.3s" }}>
              <LoginStreakCard
                currentStreak={currentStreak}
                longestStreak={longestStreak}
                loading={streakLoading}
              />
            </div>
            <div className="animate-slide-up" style={{ animationDelay: "0.4s" }}>
              <MoodOverviewCard />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
