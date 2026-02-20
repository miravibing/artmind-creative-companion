import { useState, useEffect } from "react";
import { Heart, Calendar, TrendingUp, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const moodOptions = [
  { value: 1, emoji: "😢", label: "Struggling", color: "bg-destructive/20 border-destructive/40" },
  { value: 2, emoji: "😔", label: "Low", color: "bg-warning/20 border-warning/40" },
  { value: 3, emoji: "😐", label: "Okay", color: "bg-muted border-border" },
  { value: 4, emoji: "😊", label: "Good", color: "bg-success/20 border-success/40" },
  { value: 5, emoji: "😄", label: "Amazing", color: "bg-primary/20 border-primary/40" },
];

interface MoodEntry {
  id: string;
  entry_date: string;
  mood: number;
  note: string | null;
}

const today = new Date().toISOString().split("T")[0];

export default function Mood() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const [note, setNote] = useState("");
  const [saved, setSaved] = useState(false);
  const [moodHistory, setMoodHistory] = useState<MoodEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [todayEntry, setTodayEntry] = useState<MoodEntry | null>(null);

  useEffect(() => {
    if (user) fetchMoodHistory();
  }, [user]);

  const fetchMoodHistory = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("mood_entries")
      .select("*")
      .order("entry_date", { ascending: false })
      .limit(10);

    if (error) { toast({ title: "Error loading moods", variant: "destructive" }); setLoading(false); return; }

    setMoodHistory(data ?? []);
    const existing = data?.find((e) => e.entry_date === today) ?? null;
    setTodayEntry(existing);
    if (existing) {
      setSelectedMood(existing.mood);
      setNote(existing.note ?? "");
    }
    setLoading(false);
  };

  const saveMood = async () => {
    if (selectedMood === null) return;

    if (todayEntry) {
      const { error } = await supabase
        .from("mood_entries")
        .update({ mood: selectedMood, note })
        .eq("id", todayEntry.id);
      if (error) { toast({ title: "Error saving mood", variant: "destructive" }); return; }
    } else {
      const { error } = await supabase
        .from("mood_entries")
        .insert({ user_id: user!.id, mood: selectedMood, note, entry_date: today });
      if (error) { toast({ title: "Error saving mood", variant: "destructive" }); return; }
    }

    setSaved(true);
    toast({ title: "Mood saved! 💜" });
    fetchMoodHistory();
    setTimeout(() => setSaved(false), 2000);
  };

  const todayFormatted = new Date().toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric",
  });

  return (
    <div className="min-h-screen gradient-hero pb-24 md:pb-8 md:pt-24">
      <div className="container mx-auto px-4 py-6 md:py-8 max-w-2xl">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <div className="flex items-center gap-3 mb-2">
            <Heart className="w-8 h-8 text-accent" />
            <h1 className="font-display text-3xl font-bold text-foreground">Mood Check-in</h1>
          </div>
          <p className="text-muted-foreground">How are you feeling today, creative soul?</p>
        </div>

        {/* Today's Date Card */}
        <div className="bg-card rounded-2xl border border-border/50 shadow-card p-6 mb-6 animate-slide-up">
          <div className="flex items-center gap-3 text-muted-foreground mb-4">
            <Calendar className="w-5 h-5" />
            <span>{todayFormatted}</span>
            {todayEntry && (
              <span className="ml-auto text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                Editing today's entry
              </span>
            )}
          </div>

          {/* Mood Selection */}
          <div className="mb-6">
            <p className="text-sm text-muted-foreground mb-4">Select how you're feeling:</p>
            <div className="flex justify-between gap-2">
              {moodOptions.map((mood) => (
                <button
                  key={mood.value}
                  onClick={() => setSelectedMood(mood.value)}
                  className={cn(
                    "flex-1 flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all duration-300",
                    selectedMood === mood.value
                      ? `${mood.color} scale-105 shadow-card`
                      : "border-transparent bg-muted/50 hover:bg-muted"
                  )}
                >
                  <span className="text-3xl">{mood.emoji}</span>
                  <span className="text-xs font-medium text-foreground">{mood.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div className="mb-6">
            <label className="text-sm text-muted-foreground mb-2 block">Add a note (optional)</label>
            <textarea
              placeholder="What's on your creative mind today?"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 rounded-xl bg-muted border border-border focus:ring-2 focus:ring-primary focus:outline-none resize-none text-foreground placeholder:text-muted-foreground"
            />
          </div>

          <Button
            variant={saved ? "success" : "gradient"}
            size="lg"
            onClick={saveMood}
            disabled={selectedMood === null}
            className="w-full gap-2"
          >
            {saved ? (
              <><Heart className="w-5 h-5" />Mood Saved! ✨</>
            ) : (
              <><Save className="w-5 h-5" />{todayEntry ? "Update Today's Mood" : "Save Today's Mood"}</>
            )}
          </Button>
        </div>

        {/* Mood History */}
        <div className="animate-slide-up" style={{ animationDelay: "0.1s" }}>
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-primary" />
            <h2 className="font-display text-xl font-semibold text-foreground">Recent History</h2>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-card rounded-xl border border-border/50 h-16 animate-pulse" />
              ))}
            </div>
          ) : moodHistory.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No mood entries yet. Log your first one above! 💜</p>
            </div>
          ) : (
            <div className="space-y-3">
              {moodHistory.map((entry, index) => {
                const moodData = moodOptions.find((m) => m.value === entry.mood);
                return (
                  <div
                    key={entry.id}
                    className="bg-card rounded-xl border border-border/50 shadow-soft p-4 flex items-center gap-4 animate-slide-up"
                    style={{ animationDelay: `${(index + 2) * 0.1}s` }}
                  >
                    <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center text-2xl", moodData?.color)}>
                      {moodData?.emoji}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">{entry.note || "No note added"}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(entry.entry_date + "T12:00:00").toLocaleDateString("en-US", {
                          weekday: "short", month: "short", day: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
