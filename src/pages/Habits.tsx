import { useState } from "react";
import { Plus, Check, Flame, Target, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Habit {
  id: number;
  name: string;
  icon: string;
  completed: boolean;
  streak: number;
}

const habitIcons = ["🎨", "✏️", "📚", "🎭", "🎵", "📷", "💡", "🌟"];

export default function Habits() {
  const [habits, setHabits] = useState<Habit[]>([
    { id: 1, name: "30-min daily sketch", icon: "✏️", completed: true, streak: 7 },
    { id: 2, name: "Study anatomy", icon: "📚", completed: true, streak: 5 },
    { id: 3, name: "Color theory practice", icon: "🎨", completed: false, streak: 3 },
    { id: 4, name: "Watch art tutorial", icon: "📷", completed: false, streak: 2 },
  ]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newHabitName, setNewHabitName] = useState("");
  const [selectedIcon, setSelectedIcon] = useState("🎨");

  const toggleHabit = (id: number) => {
    setHabits((prev) =>
      prev.map((h) =>
        h.id === id
          ? { ...h, completed: !h.completed, streak: !h.completed ? h.streak + 1 : h.streak }
          : h
      )
    );
  };

  const addHabit = () => {
    if (!newHabitName.trim()) return;
    setHabits((prev) => [
      ...prev,
      {
        id: Date.now(),
        name: newHabitName,
        icon: selectedIcon,
        completed: false,
        streak: 0,
      },
    ]);
    setNewHabitName("");
    setShowAddForm(false);
  };

  const deleteHabit = (id: number) => {
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
          {progress === 100 && (
            <p className="text-sm text-success mt-2 flex items-center gap-2">
              <Flame className="w-4 h-4" /> Amazing! All habits completed! 🎉
            </p>
          )}
        </div>

        {/* Habits List */}
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
                  <h3
                    className={cn(
                      "font-medium text-foreground transition-all",
                      habit.completed && "line-through opacity-60"
                    )}
                  >
                    {habit.name}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Flame className="w-3 h-3 text-accent" />
                    <span className="text-xs text-muted-foreground">{habit.streak} day streak</span>
                  </div>
                </div>

                <button
                  onClick={() => deleteHabit(habit.id)}
                  className="p-2 text-muted-foreground hover:text-destructive transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

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
                      selectedIcon === icon
                        ? "bg-primary/20 ring-2 ring-primary"
                        : "bg-muted hover:bg-muted/80"
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
              <Button variant="ghost" onClick={() => setShowAddForm(false)} className="flex-1">
                Cancel
              </Button>
              <Button variant="gradient" onClick={addHabit} className="flex-1">
                Add Habit
              </Button>
            </div>
          </div>
        ) : (
          <Button
            variant="outline"
            size="lg"
            onClick={() => setShowAddForm(true)}
            className="w-full gap-2"
          >
            <Plus className="w-5 h-5" />
            Add New Habit
          </Button>
        )}
      </div>
    </div>
  );
}
