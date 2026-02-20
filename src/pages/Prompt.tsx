import { useState, useEffect } from "react";
import { Sparkles, RefreshCw, Copy, Heart, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const fallbackPrompts = [
  { text: "Create a character who embodies the feeling of a Sunday morning.", category: "Character Design" },
  { text: "Design an impossible architecture that defies gravity but feels livable.", category: "Environment" },
  { text: "Illustrate a memory you can almost taste.", category: "Abstract" },
  { text: "Draw your emotions as weather patterns over a landscape.", category: "Conceptual" },
  { text: "Sketch a scene from a dream you recently had.", category: "Surreal" },
  { text: "Create a portrait using only geometric shapes and bold colors.", category: "Portrait" },
  { text: "Design a creature that lives between two worlds.", category: "Creature Design" },
  { text: "Illustrate the sound of silence in a bustling city.", category: "Conceptual" },
  { text: "Paint your favorite song as if it were a place you could visit.", category: "Abstract" },
  { text: "Draw what courage looks like as a tangible object.", category: "Symbolic" },
];

interface Prompt { text: string; category: string; }
interface Favorite {
  id: string;
  prompt_text: string;
  category: string | null;
}

export default function Prompt() {
  const { user } = useAuth();
  const [currentPrompt, setCurrentPrompt] = useState<Prompt>(fallbackPrompts[0]);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    if (user) fetchFavorites();
  }, [user]);

  // Generate an AI prompt on first load
  useEffect(() => {
    generateAIPrompt();
  }, []);

  const fetchFavorites = async () => {
    const { data } = await supabase
      .from("prompt_favorites")
      .select("*")
      .order("created_at", { ascending: false });
    setFavorites(data ?? []);
  };

  const generateAIPrompt = async () => {
    setIsGenerating(true);
    setIsAnimating(true);

    try {
      const { data, error } = await supabase.functions.invoke("generate-prompt", {
        body: {},
      });

      if (error) throw error;

      if (data?.error) {
        // Surface rate limit / payment errors to user
        toast({
          title: "AI Error",
          description: data.error,
          variant: "destructive",
        });
        // Fall back to a random local prompt
        const randomIndex = Math.floor(Math.random() * fallbackPrompts.length);
        setTimeout(() => {
          setCurrentPrompt(fallbackPrompts[randomIndex]);
          setIsAnimating(false);
        }, 300);
        return;
      }

      setTimeout(() => {
        setCurrentPrompt({ text: data.text, category: data.category });
        setIsAnimating(false);
      }, 300);
    } catch (err) {
      console.error("Failed to generate AI prompt:", err);
      // Silent fallback to local prompts
      const randomIndex = Math.floor(Math.random() * fallbackPrompts.length);
      setTimeout(() => {
        setCurrentPrompt(fallbackPrompts[randomIndex]);
        setIsAnimating(false);
      }, 300);
    } finally {
      setIsGenerating(false);
    }
  };

  const copyPrompt = () => {
    navigator.clipboard.writeText(currentPrompt.text);
    toast({ title: "Copied! ✨", description: "Prompt copied to clipboard" });
  };

  const toggleFavorite = async () => {
    if (!user) {
      toast({ title: "Sign in required", description: "Please sign in to save favorites." });
      return;
    }

    const existing = favorites.find((f) => f.prompt_text === currentPrompt.text);

    if (existing) {
      await supabase.from("prompt_favorites").delete().eq("id", existing.id);
      setFavorites((prev) => prev.filter((f) => f.id !== existing.id));
    } else {
      const { data, error } = await supabase
        .from("prompt_favorites")
        .insert({ user_id: user.id, prompt_text: currentPrompt.text, category: currentPrompt.category })
        .select()
        .single();
      if (!error && data) {
        setFavorites((prev) => [data, ...prev]);
        toast({ title: "Saved! 💜", description: "Added to your favorites" });
      }
    }
  };

  const removeFavorite = async (id: string) => {
    await supabase.from("prompt_favorites").delete().eq("id", id);
    setFavorites((prev) => prev.filter((f) => f.id !== id));
  };

  const isFavorited = favorites.some((f) => f.prompt_text === currentPrompt.text);

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
          <p className="text-muted-foreground text-lg flex items-center justify-center gap-2">
            <Wand2 className="w-4 h-4 text-primary" />
            AI-powered prompts, uniquely yours
          </p>
        </div>

        {/* Main Prompt Card */}
        <div className="relative mb-8 animate-slide-up">
          <div className="absolute inset-0 gradient-primary rounded-3xl opacity-10 blur-xl scale-105" />
          <div className="relative bg-card rounded-3xl border border-border/50 shadow-deep overflow-hidden">
            <div className="absolute top-4 left-4">
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                {currentPrompt.category}
              </span>
            </div>
            <div className="absolute top-4 right-4">
              <span className="px-2 py-1 rounded-full text-xs font-medium bg-accent/10 text-accent flex items-center gap-1">
                <Wand2 className="w-3 h-3" />
                AI
              </span>
            </div>
            <div className="pt-16 pb-8 px-6 md:px-10">
              <div
                className={cn(
                  "min-h-[200px] flex items-center justify-center transition-all duration-500",
                  isAnimating ? "opacity-0 scale-95 blur-sm" : "opacity-100 scale-100"
                )}
              >
                {isGenerating && !isAnimating ? (
                  <div className="flex flex-col items-center gap-3 text-muted-foreground">
                    <Sparkles className="w-8 h-8 animate-pulse text-primary" />
                    <span className="text-sm">Generating your prompt…</span>
                  </div>
                ) : (
                  <p className="font-display text-2xl md:text-3xl text-center text-foreground leading-relaxed">
                    "{currentPrompt.text}"
                  </p>
                )}
              </div>
            </div>
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
                onClick={generateAIPrompt}
                disabled={isGenerating || isAnimating}
                className="gap-2"
              >
                {isGenerating ? (
                  <Sparkles className="w-4 h-4 animate-pulse" />
                ) : (
                  <RefreshCw className={cn("w-4 h-4", isAnimating && "animate-spin")} />
                )}
                New Prompt
              </Button>
            </div>
          </div>
        </div>

        {/* Tips Section */}
        <div className="bg-card rounded-2xl border border-border/50 shadow-card p-6 animate-slide-up" style={{ animationDelay: "0.2s" }}>
          <h3 className="font-display text-lg font-semibold text-foreground mb-3">💡 Creative Tips</h3>
          <ul className="space-y-2 text-muted-foreground">
            <li className="flex items-start gap-2"><span className="text-primary">•</span>Set a timer and sketch whatever comes to mind first</li>
            <li className="flex items-start gap-2"><span className="text-primary">•</span>Don't aim for perfection – embrace the exploration</li>
            <li className="flex items-start gap-2"><span className="text-primary">•</span>Try a medium you don't usually work with</li>
          </ul>
        </div>

        {/* Favorites Section */}
        {favorites.length > 0 && (
          <div className="mt-6 animate-slide-up" style={{ animationDelay: "0.3s" }}>
            <h3 className="font-display text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
              <Heart className="w-5 h-5 text-accent" />
              Your Favorites ({favorites.length})
            </h3>
            <div className="space-y-2">
              {favorites.map((fav) => (
                <div key={fav.id} className="bg-card rounded-xl border border-border/50 p-4 text-sm text-foreground flex items-start justify-between gap-3">
                  <span>"{fav.prompt_text}"</span>
                  <button
                    onClick={() => removeFavorite(fav.id)}
                    className="text-muted-foreground hover:text-destructive transition-colors shrink-0"
                  >
                    <Heart className="w-4 h-4 fill-current text-accent" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
