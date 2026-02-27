import { Flame, BookOpen, Zap, Copy, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { StructuredPrompt } from "@/pages/Prompt";

interface Props {
  prompt: StructuredPrompt;
  isAnimating: boolean;
  onSave: (type: "warmup" | "study" | "challenge") => void;
  onCopy: (text: string) => void;
}

const sections = [
  { key: "warmup" as const, label: "Warm-up", icon: Flame, color: "text-warning", bg: "bg-warning/10", time: "2–5 min" },
  { key: "study" as const, label: "Focused Study", icon: BookOpen, color: "text-success", bg: "bg-success/10", time: "15–30 min" },
  { key: "challenge" as const, label: "Creative Challenge", icon: Zap, color: "text-accent", bg: "bg-accent/10", time: "30–60 min" },
];

export function StructuredPromptDisplay({ prompt, isAnimating, onSave, onCopy }: Props) {
  return (
    <div className={cn(
      "transition-all duration-500",
      isAnimating ? "opacity-0 scale-95" : "opacity-100 scale-100"
    )}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <span className="px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
          {prompt.category}
        </span>
        <span className="px-3 py-1 rounded-full text-xs font-medium bg-secondary text-secondary-foreground">
          {prompt.difficulty}
        </span>
      </div>

      <div className="space-y-3">
        {sections.map(({ key, label, icon: Icon, color, bg, time }) => (
          <div
            key={key}
            className="bg-card rounded-2xl border border-border/50 shadow-card p-5 group"
          >
            <div className="flex items-center gap-2 mb-2">
              <div className={cn("p-1.5 rounded-lg", bg)}>
                <Icon className={cn("w-4 h-4", color)} />
              </div>
              <h4 className="font-display text-sm font-semibold text-foreground">{label}</h4>
              <span className="text-xs text-muted-foreground ml-auto">{time}</span>
            </div>
            <p className="text-foreground leading-relaxed mb-3">{prompt[key]}</p>
            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button variant="ghost" size="sm" onClick={() => onCopy(prompt[key])} className="gap-1.5 text-xs">
                <Copy className="w-3 h-3" /> Copy
              </Button>
              <Button variant="ghost" size="sm" onClick={() => onSave(key)} className="gap-1.5 text-xs">
                <Star className="w-3 h-3" /> Save
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
