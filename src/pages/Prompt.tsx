import { useState } from "react";
import { Sparkles, RefreshCw, Copy, Heart, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

const prompts = [
  {
    text: "Create a character who embodies the feeling of a Sunday morning.",
    category: "Character Design",
  },
  {
    text: "Design an impossible architecture that defies gravity but feels livable.",
    category: "Environment",
  },
  {
    text: "Illustrate a memory you can almost taste.",
    category: "Abstract",
  },
  {
    text: "Draw your emotions as weather patterns over a landscape.",
    category: "Conceptual",
  },
  {
    text: "Sketch a scene from a dream you recently had.",
    category: "Surreal",
  },
  {
    text: "Create a portrait using only geometric shapes and bold colors.",
    category: "Portrait",
  },
  {
    text: "Design a creature that lives between two worlds.",
    category: "Creature Design",
  },
  {
    text: "Illustrate the sound of silence in a bustling city.",
    category: "Conceptual",
  },
  {
    text: "Paint your favorite song as if it were a place you could visit.",
    category: "Abstract",
  },
  {
    text: "Draw what courage looks like as a tangible object.",
    category: "Symbolic",
  },
];

export default function Prompt() {
  const [currentPrompt, setCurrentPrompt] = useState(prompts[0]);
  const [isAnimating, setIsAnimating] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);
  const { toast } = useToast();

  const refreshPrompt = () => {
    setIsAnimating(true);
    setTimeout(() => {
      const randomIndex = Math.floor(Math.random() * prompts.length);
      setCurrentPrompt(prompts[randomIndex]);
      setIsAnimating(false);
    }, 600);
  };

  const copyPrompt = () => {
    navigator.clipboard.writeText(currentPrompt.text);
    toast({
      title: "Copied! ✨",
      description: "Prompt copied to clipboard",
    });
  };

  const toggleFavorite = () => {
    if (favorites.includes(currentPrompt.text)) {
      setFavorites((prev) => prev.filter((p) => p !== currentPrompt.text));
    } else {
      setFavorites((prev) => [...prev, currentPrompt.text]);
      toast({
        title: "Saved! 💜",
        description: "Added to your favorites",
      });
    }
  };

  const isFavorited = favorites.includes(currentPrompt.text);

  return (
    <div className="min-h-screen gradient-hero pb-24 md:pb-8 md:pt-24">
      <div className="container mx-auto px-4 py-6 md:py-8 max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl gradient-primary shadow-glow mb-4">
            <Sparkles className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-2">
            Creative Inspiration
          </h1>
          <p className="text-muted-foreground text-lg">
            Let your imagination run wild with AI-powered prompts
          </p>
        </div>

        {/* Main Prompt Card */}
        <div className="relative mb-8 animate-slide-up">
          {/* Decorative background */}
          <div className="absolute inset-0 gradient-primary rounded-3xl opacity-10 blur-xl scale-105" />

          <div className="relative bg-card rounded-3xl border border-border/50 shadow-deep overflow-hidden">
            {/* Category Badge */}
            <div className="absolute top-4 left-4">
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                {currentPrompt.category}
              </span>
            </div>

            {/* Prompt Content */}
            <div className="pt-16 pb-8 px-6 md:px-10">
              <div
                className={cn(
                  "min-h-[200px] flex items-center justify-center transition-all duration-500",
                  isAnimating ? "opacity-0 scale-95 blur-sm" : "opacity-100 scale-100"
                )}
              >
                <p className="font-display text-2xl md:text-3xl text-center text-foreground leading-relaxed">
                  "{currentPrompt.text}"
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="border-t border-border/50 p-4 flex items-center justify-between bg-muted/30">
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleFavorite}
                  className={cn(isFavorited && "text-accent")}
                >
                  <Heart className={cn("w-5 h-5", isFavorited && "fill-current")} />
                </Button>
                <Button variant="ghost" size="icon" onClick={copyPrompt}>
                  <Copy className="w-5 h-5" />
                </Button>
              </div>

              <Button
                variant="gradient"
                onClick={refreshPrompt}
                disabled={isAnimating}
                className="gap-2"
              >
                <RefreshCw className={cn("w-4 h-4", isAnimating && "animate-spin")} />
                New Prompt
              </Button>
            </div>
          </div>
        </div>

        {/* Tips Section */}
        <div
          className="bg-card rounded-2xl border border-border/50 shadow-card p-6 animate-slide-up"
          style={{ animationDelay: "0.2s" }}
        >
          <h3 className="font-display text-lg font-semibold text-foreground mb-3">
            💡 Creative Tips
          </h3>
          <ul className="space-y-2 text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              Set a timer and sketch whatever comes to mind first
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              Don't aim for perfection – embrace the exploration
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              Try a medium you don't usually work with
            </li>
          </ul>
        </div>

        {/* Favorites Section */}
        {favorites.length > 0 && (
          <div
            className="mt-6 animate-slide-up"
            style={{ animationDelay: "0.3s" }}
          >
            <h3 className="font-display text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
              <Heart className="w-5 h-5 text-accent" />
              Your Favorites ({favorites.length})
            </h3>
            <div className="space-y-2">
              {favorites.map((prompt, index) => (
                <div
                  key={index}
                  className="bg-card rounded-xl border border-border/50 p-4 text-sm text-foreground"
                >
                  "{prompt}"
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
