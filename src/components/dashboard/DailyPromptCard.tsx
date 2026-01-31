import { useState } from "react";
import { Sparkles, RefreshCw, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const prompts = [
  "Create a character who embodies the feeling of a Sunday morning.",
  "Design an impossible architecture that defies gravity.",
  "Illustrate a memory you can almost taste.",
  "Draw your emotions as weather patterns.",
  "Sketch a scene from a dream you recently had.",
  "Create a portrait using only geometric shapes.",
  "Design a creature that lives between two worlds.",
  "Illustrate the sound of silence.",
];

export function DailyPromptCard() {
  const [currentPrompt, setCurrentPrompt] = useState(prompts[0]);
  const [isAnimating, setIsAnimating] = useState(false);

  const refreshPrompt = () => {
    setIsAnimating(true);
    setTimeout(() => {
      const randomIndex = Math.floor(Math.random() * prompts.length);
      setCurrentPrompt(prompts[randomIndex]);
      setIsAnimating(false);
    }, 500);
  };

  return (
    <div className="relative overflow-hidden rounded-2xl gradient-card border border-border/50 shadow-card p-6 md:p-8">
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-accent/5 rounded-full blur-2xl" />
      
      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-xl bg-primary/10">
            <Lightbulb className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-display text-lg font-semibold text-foreground">Daily Inspiration</h3>
            <p className="text-sm text-muted-foreground">Your creative spark for today</p>
          </div>
        </div>

        <div className={cn(
          "bg-secondary/50 rounded-xl p-5 mb-5 transition-all duration-500",
          isAnimating ? "opacity-0 scale-95" : "opacity-100 scale-100"
        )}>
          <p className="font-display text-xl md:text-2xl text-foreground leading-relaxed italic">
            "{currentPrompt}"
          </p>
        </div>

        <Button
          variant="soft"
          onClick={refreshPrompt}
          disabled={isAnimating}
          className="gap-2"
        >
          <RefreshCw className={cn("w-4 h-4", isAnimating && "animate-spin")} />
          New Inspiration
        </Button>
      </div>
    </div>
  );
}
