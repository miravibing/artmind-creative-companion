import { Link } from "react-router-dom";
import { Plus, Sparkles, BookOpen, Smile, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";

const actions = [
  {
    label: "Log Habit",
    icon: Plus,
    href: "/habits",
    color: "bg-primary/10 text-primary hover:bg-primary/20",
  },
  {
    label: "Get Prompt",
    icon: Sparkles,
    href: "/prompt",
    color: "bg-accent/10 text-accent hover:bg-accent/20",
  },
  {
    label: "Learn",
    icon: BookOpen,
    href: "/resources",
    color: "bg-success/10 text-success hover:bg-success/20",
  },
  {
    label: "Log Mood",
    icon: Smile,
    href: "/mood",
    color: "bg-warning/10 text-warning hover:bg-warning/20",
  },
  {
    label: "Challenges",
    icon: Trophy,
    href: "/challenges",
    color: "bg-destructive/10 text-destructive hover:bg-destructive/20",
  },
];

export function QuickActions() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
      {actions.map((action) => (
        <Link
          key={action.label}
          to={action.href}
          className={cn(
            "flex flex-col items-center gap-2 p-4 rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-card",
            action.color
          )}
        >
          <action.icon className="w-6 h-6" />
          <span className="text-sm font-medium">{action.label}</span>
        </Link>
      ))}
    </div>
  );
}
