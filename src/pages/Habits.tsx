import { useState, useEffect } from "react";
import { Plus, Check, Flame, Target, Trash2, Pencil, X, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface Habit {
  id: string;
  name: string;
  icon: string;
  streak: number;
  completed: boolean;
  lastCompletedDate: string | null;
}

const habitIcons = ["🎨", "✏️", "📚", "🎭", "🎵", "📷", "💡", "🌟"];
const today = new Date().toISOString().split("T")[0];

function getYesterday() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().split("T")[0];
}

export default function Habits() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newHabitName, setNewHabitName] = useState("");
  const [selectedIcon, setSelectedIcon] = useState("🎨");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editIcon, setEditIcon] = useState("");

  useEffect(() => {
    if (user) fetchHabits();
  }, [user]);

  const fetchHabits = async () => {
    setLoading(true);
    const { data: habitsData, error } = await supabase
      .from("habits")
      .select("*")
      .order("created_at", { ascending: true });

    if (error) { toast({ title: "Error loading habits", variant: "destructive" }); setLoading(false); return; }

    const { data: completions } = await supabase
      .from("habit_completions")
      .select("habit_id")
      .eq("completed_date", today);

    const completedIds = new Set(completions?.map((c) => c.habit_id) ?? []);

    setHabits(
      (habitsData ?? []).map((h) => ({
        id: h.id,
        name: h.name,
        icon: h.icon,
        streak: h.streak,
        completed: completedIds.has(h.id),
        lastCompletedDate: h.last_completed_date,
      }))
    );
    setLoading(false);
  };

  const toggleHabit = async (id: string) => {
    const habit = habits.find((h) => h.id === id);
    if (!habit) return;

    if (!habit.completed) {
      const { error: compError } = await supabase.from("habit_completions").insert({
        habit_id: id,
        user_id: user!.id,
        completed_date: today,
      });
      if (compError) { toast({ title: "Error saving completion", variant: "destructive" }); return; }

      // Proper streak: if last completed was yesterday, continue streak; otherwise reset to 1
      const yesterday = getYesterday();
      const newStreak = habit.lastCompletedDate === yesterday ? habit.streak + 1 : 1;

      await supabase.from("habits").update({ streak: newStreak, last_completed_date: today }).eq("id", id);
      setHabits((prev) => prev.map((h) => h.id === id ? { ...h, completed: true, streak: newStreak, lastCompletedDate: today } : h));
    } else {
      await supabase.from("habit_completions").delete().eq("habit_id", id).eq("completed_date", today);

      // When uncompleting today, restore streak: if there was a completion yesterday, recalc; otherwise 0
      const yesterday = getYesterday();
      // Check if yesterday had a completion
      const { data: yesterdayComp } = await supabase
        .from("habit_completions")
        .select("id")
        .eq("habit_id", id)
        .eq("completed_date", yesterday)
        .maybeSingle();

      const prevLastDate = yesterdayComp ? yesterday : null;
      // We need to recalculate the streak from yesterday backwards
      let newStreak = 0;
      if (yesterdayComp) {
        // Count consecutive days backwards from yesterday
        newStreak = await countStreakBackwards(id, yesterday);
      }

      await supabase.from("habits").update({ streak: newStreak, last_completed_date: prevLastDate }).eq("id", id);
      setHabits((prev) => prev.map((h) => h.id === id ? { ...h, completed: false, streak: newStreak, lastCompletedDate: prevLastDate } : h));
    }
  };

  const countStreakBackwards = async (habitId: string, fromDate: string): Promise<number> => {
    // Fetch recent completions ordered desc
    const { data } = await supabase
      .from("habit_completions")
      .select("completed_date")
      .eq("habit_id", habitId)
      .order("completed_date", { ascending: false })
      .limit(365);

    if (!data || data.length === 0) return 0;

    const dates = new Set(data.map((d) => d.completed_date));
    let count = 0;
    const current = new Date(fromDate);

    while (dates.has(current.toISOString().split("T")[0])) {
      count++;
      current.setDate(current.getDate() - 1);
    }
    return count;
  };

  const addHabit = async () => {
    if (!newHabitName.trim()) return;
    const { data, error } = await supabase
      .from("habits")
      .insert({ name: newHabitName, icon: selectedIcon, user_id: user!.id })
      .select()
      .single();

    if (error) { toast({ title: "Error adding habit", variant: "destructive" }); return; }

    setHabits((prev) => [...prev, { id: data.id, name: data.name, icon: data.icon, streak: 0, completed: false, lastCompletedDate: null }]);
    setNewHabitName("");
    setShowAddForm(false);
    toast({ title: "Habit added! 🎯" });
  };

  const startEditing = (habit: Habit) => {
    setEditingId(habit.id);
    setEditName(habit.name);
    setEditIcon(habit.icon);
  };

  const saveEdit = async () => {
    if (!editingId || !editName.trim()) return;
    const { error } = await supabase
      .from("habits")
      .update({ name: editName, icon: editIcon })
      .eq("id", editingId);

    if (error) { toast({ title: "Error updating habit", variant: "destructive" }); return; }

    setHabits((prev) => prev.map((h) => h.id === editingId ? { ...h, name: editName, icon: editIcon } : h));
    setEditingId(null);
    toast({ title: "Habit updated! ✏️" });
  };

  const cancelEdit = () => setEditingId(null);

  const deleteHabit = async (id: string) => {
    await supabase.from("habits").delete().eq("id", id);
    setHabits((prev) => prev.filter((h) => h.id !== id));
  };

  const completedCount = habits.filter((h) => h.completed).length;
  const progress = habits.length > 0 ? (completedCount / habits.length) * 100 : 0;

  return (
    <div className="min-h-screen gradient-hero pb-24 md:pb-8 md:pt-24">
      <div className="container mx-auto px-4 py-6 md:py-8 max-w-2xl">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <div className="flex items-center gap-3 mb-2">
            <Target className="w-8 h-8 text-primary" />
            <h1 className="font-display text-3xl font-bold text-foreground">Creative Habits</h1>
          </div>
          <p className="text-muted-foreground">Build your artistic discipline, one day at a time.</p>
        </div>

        {/* Progress Overview */}
        <div className="bg-card rounded-2xl border border-border/50 shadow-card p-6 mb-6 animate-slide-up">
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm text-muted-foreground">Today's Progress</span>
            <span className="font-semibold text-foreground">
              {completedCount}/{habits.length} completed
            </span>
          </div>
          <div className="h-3 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full gradient-primary rounded-full transition-all duration-700 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          {progress === 100 && habits.length > 0 && (
            <p className="text-sm text-success mt-2 flex items-center gap-2">
              <Flame className="w-4 h-4" /> Amazing! All habits completed! 🎉
            </p>
          )}
        </div>

        {/* Habits List */}
        {loading ? (
          <div className="space-y-3 mb-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-card rounded-2xl border border-border/50 h-20 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="space-y-3 mb-6">
            {habits.map((habit, index) => (
              <div
                key={habit.id}
                className={cn(
                  "bg-card rounded-2xl border border-border/50 shadow-soft p-4 transition-all duration-300 animate-slide-up hover:shadow-card",
                  habit.completed && "bg-success/5 border-success/20"
                )}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {editingId === habit.id ? (
                  /* Edit Mode */
                  <div className="space-y-3">
                    <div className="flex gap-2 flex-wrap">
                      {habitIcons.map((icon) => (
                        <button
                          key={icon}
                          onClick={() => setEditIcon(icon)}
                          className={cn(
                            "w-9 h-9 rounded-lg text-lg flex items-center justify-center transition-all",
                            editIcon === icon ? "bg-primary/20 ring-2 ring-primary" : "bg-muted hover:bg-muted/80"
                          )}
                        >
                          {icon}
                        </button>
                      ))}
                    </div>
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-muted border border-border focus:ring-2 focus:ring-primary focus:outline-none text-foreground"
                      onKeyDown={(e) => e.key === "Enter" && saveEdit()}
                      autoFocus
                    />
                    <div className="flex gap-2 justify-end">
                      <Button variant="ghost" size="sm" onClick={cancelEdit}>
                        <X className="w-4 h-4 mr-1" /> Cancel
                      </Button>
                      <Button variant="gradient" size="sm" onClick={saveEdit}>
                        <Save className="w-4 h-4 mr-1" /> Save
                      </Button>
                    </div>
                  </div>
                ) : (
                  /* Display Mode */
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => toggleHabit(habit.id)}
                      className={cn(
                        "w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300",
                        habit.completed
                          ? "bg-success text-success-foreground shadow-soft"
                          : "bg-muted hover:bg-primary/10"
                      )}
                    >
                      {habit.completed ? (
                        <Check className="w-6 h-6" />
                      ) : (
                        <span className="text-2xl">{habit.icon}</span>
                      )}
                    </button>
                    <div className="flex-1">
                      <h3 className={cn("font-medium text-foreground transition-all", habit.completed && "line-through opacity-60")}>
                        {habit.name}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Flame className="w-3 h-3 text-accent" />
                        <span className="text-xs text-muted-foreground">{habit.streak} day streak</span>
                      </div>
                    </div>
                    <button
                      onClick={() => startEditing(habit)}
                      className="p-2 text-muted-foreground hover:text-primary transition-colors"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteHabit(habit.id)}
                      className="p-2 text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            ))}
            {habits.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <p>No habits yet. Add your first one below! 🎨</p>
              </div>
            )}
          </div>
        )}

        {/* Add Habit Form */}
        {showAddForm ? (
          <div className="bg-card rounded-2xl border border-border/50 shadow-card p-6 animate-slide-up">
            <h3 className="font-display text-lg font-semibold mb-4">New Creative Habit</h3>
            <div className="mb-4">
              <label className="text-sm text-muted-foreground mb-2 block">Choose an icon</label>
              <div className="flex gap-2 flex-wrap">
                {habitIcons.map((icon) => (
                  <button
                    key={icon}
                    onClick={() => setSelectedIcon(icon)}
                    className={cn(
                      "w-10 h-10 rounded-lg text-xl flex items-center justify-center transition-all",
                      selectedIcon === icon ? "bg-primary/20 ring-2 ring-primary" : "bg-muted hover:bg-muted/80"
                    )}
                  >
                    {icon}
                  </button>
                ))}
              </div>
            </div>
            <input
              type="text"
              placeholder="e.g., Practice gesture drawing"
              value={newHabitName}
              onChange={(e) => setNewHabitName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-muted border border-border focus:ring-2 focus:ring-primary focus:outline-none mb-4 text-foreground placeholder:text-muted-foreground"
              onKeyDown={(e) => e.key === "Enter" && addHabit()}
            />
            <div className="flex gap-3">
              <Button variant="ghost" onClick={() => setShowAddForm(false)} className="flex-1">Cancel</Button>
              <Button variant="gradient" onClick={addHabit} className="flex-1">Add Habit</Button>
            </div>
          </div>
        ) : (
          <Button variant="outline" size="lg" onClick={() => setShowAddForm(true)} className="w-full gap-2">
            <Plus className="w-5 h-5" />
            Add New Habit
          </Button>
        )}
      </div>
    </div>
  );
}
