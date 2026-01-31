import { Heart, TrendingUp, Smile, Frown, Meh } from "lucide-react";
import { cn } from "@/lib/utils";

interface MoodEntry {
  date: string;
  mood: number; // 1-5
}

interface MoodOverviewCardProps {
  recentMoods: MoodEntry[];
  averageMood: number;
}

const moodEmojis = ["😢", "😔", "😐", "😊", "😄"];
const moodColors = [
  "bg-destructive/20 text-destructive",
  "bg-warning/20 text-warning",
  "bg-muted text-muted-foreground",
  "bg-success/20 text-success",
  "bg-primary/20 text-primary",
];

export function MoodOverviewCard({ recentMoods, averageMood }: MoodOverviewCardProps) {
  const getMoodIcon = (mood: number) => {
    if (mood >= 4) return <Smile className="w-5 h-5" />;
    if (mood >= 3) return <Meh className="w-5 h-5" />;
    return <Frown className="w-5 h-5" />;
  };

  const getMoodLabel = (mood: number) => {
    if (mood >= 4.5) return "Fantastic";
    if (mood >= 3.5) return "Good";
    if (mood >= 2.5) return "Okay";
    if (mood >= 1.5) return "Low";
    return "Struggling";
  };

  return (
    <div className="relative overflow-hidden rounded-2xl bg-card border border-border/50 shadow-card p-6">
      <div className="absolute bottom-0 right-0 w-24 h-24 bg-success/10 rounded-full blur-2xl" />

      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-xl bg-success/10">
            <Heart className="w-5 h-5 text-success" />
          </div>
          <div>
            <h3 className="font-display text-lg font-semibold text-foreground">Mood Tracker</h3>
            <p className="text-sm text-muted-foreground">Your emotional wellness</p>
          </div>
        </div>

        <div className="flex items-center gap-4 mb-5">
          <span className="text-4xl">{moodEmojis[Math.round(averageMood) - 1] || "😐"}</span>
          <div>
            <p className="font-display text-2xl font-semibold text-foreground">
              {getMoodLabel(averageMood)}
            </p>
            <p className="text-sm text-muted-foreground">Average this week</p>
          </div>
        </div>

        <div className="flex gap-2">
          {recentMoods.slice(-7).map((entry, i) => (
            <div
              key={i}
              className={cn(
                "flex-1 aspect-square rounded-lg flex items-center justify-center text-lg transition-all duration-300 hover:scale-110",
                moodColors[entry.mood - 1]
              )}
            >
              {moodEmojis[entry.mood - 1]}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
