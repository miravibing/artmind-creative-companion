import { useState, useEffect } from "react";
import { Heart, Smile, Frown, Meh, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const moodEmojis = ["😢", "😔", "😐", "😊", "😄"];
const moodColors = [
  "bg-destructive/20 text-destructive border-destructive/40",
  "bg-warning/20 text-warning border-warning/40",
  "bg-muted text-muted-foreground border-border",
  "bg-success/20 text-success border-success/40",
  "bg-primary/20 text-primary border-primary/40",
];

export function MoodOverviewCard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [recentMoods, setRecentMoods] = useState<{ date: string; mood: number }[]>([]);
  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const [todayLogged, setTodayLogged] = useState(false);
  const [saving, setSaving] = useState(false);

  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    if (!user) return;
    supabase
      .from("mood_entries")
      .select("entry_date, mood")
      .order("entry_date", { ascending: false })
      .limit(7)
      .then(({ data }) => {
        if (data) {
          setRecentMoods(data.map((d) => ({ date: d.entry_date, mood: d.mood })));
          const todayEntry = data.find((d) => d.entry_date === today);
          if (todayEntry) {
            setTodayLogged(true);
            setSelectedMood(todayEntry.mood);
          }
        }
      });
  }, [user, today]);

  const averageMood =
    recentMoods.length > 0
      ? recentMoods.reduce((acc, m) => acc + m.mood, 0) / recentMoods.length
      : 0;

  const getMoodLabel = (mood: number) => {
    if (mood >= 4.5) return "Fantastic";
    if (mood >= 3.5) return "Good";
    if (mood >= 2.5) return "Okay";
    if (mood >= 1.5) return "Low";
    return "Struggling";
  };

  const handleQuickMood = async (mood: number) => {
    if (!user || todayLogged) return;
    setSelectedMood(mood);
    setSaving(true);

    const { error } = await supabase
      .from("mood_entries")
      .insert({ user_id: user.id, mood, entry_date: today });

    setSaving(false);
    if (error) {
      toast({ title: "Error saving mood", variant: "destructive" });
      setSelectedMood(null);
      return;
    }
    setTodayLogged(true);
    toast({ title: "Mood saved! 💜" });
    setTimeout(() => navigate("/mood"), 800);
  };

  return (
    <div className="relative overflow-hidden rounded-2xl bg-card border border-border/50 shadow-card p-6">
      <div className="absolute bottom-0 right-0 w-24 h-24 bg-success/10 rounded-full blur-2xl" />

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-success/10">
              <Heart className="w-5 h-5 text-success" />
            </div>
            <div>
              <h3 className="font-display text-lg font-semibold text-foreground">Mood Tracker</h3>
              <p className="text-sm text-muted-foreground">
                {todayLogged ? "Today's mood logged" : "How are you feeling?"}
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate("/mood")}
            className="text-sm text-primary hover:underline flex items-center gap-1"
          >
            Details <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {/* Quick mood selector */}
        {!todayLogged ? (
          <div className="mb-4">
            <p className="text-xs text-muted-foreground mb-2">Tap to log today's mood:</p>
            <div className="flex gap-2">
              {moodEmojis.map((emoji, i) => (
                <button
                  key={i}
                  disabled={saving}
                  onClick={() => handleQuickMood(i + 1)}
                  className={cn(
                    "flex-1 aspect-square rounded-lg flex items-center justify-center text-lg border-2 transition-all duration-300 hover:scale-110",
                    selectedMood === i + 1
                      ? moodColors[i]
                      : "border-transparent bg-muted/50 hover:bg-muted"
                  )}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-4 mb-4">
            <span className="text-4xl">{moodEmojis[Math.round(averageMood) - 1] || "😐"}</span>
            <div>
              <p className="font-display text-2xl font-semibold text-foreground">
                {getMoodLabel(averageMood)}
              </p>
              <p className="text-sm text-muted-foreground">Average this week</p>
            </div>
          </div>
        )}

        {/* Recent moods strip */}
        {recentMoods.length > 0 && (
          <div className="flex gap-2">
            {recentMoods.slice(0, 7).map((entry, i) => (
              <div
                key={i}
                className={cn(
                  "flex-1 aspect-square rounded-lg flex items-center justify-center text-lg transition-all duration-300 hover:scale-110",
                  moodColors[entry.mood - 1]?.replace("border-", "")
                )}
                title={new Date(entry.date + "T12:00:00").toLocaleDateString("en-US", {
                  day: "numeric",
                  month: "short",
                })}
              >
                {moodEmojis[entry.mood - 1]}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
