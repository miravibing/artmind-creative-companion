import { useState } from "react";
import { Sparkles, RefreshCw, Copy, Heart, Wand2, Flame, BookOpen, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { PromptCategorySelector } from "@/components/prompt/PromptCategorySelector";
import { PromptDifficultySelector } from "@/components/prompt/PromptDifficultySelector";
import { StructuredPromptDisplay } from "@/components/prompt/StructuredPromptDisplay";
import { PromptFavorites } from "@/components/prompt/PromptFavorites";

export interface StructuredPrompt {
  category: string;
  difficulty: string;
  warmup: string;
  study: string;
  challenge: string;
}

const CATEGORIES = [
  "Anatomy & Figure Drawing",
  "Perspective",
  "Form & Structure",
  "Lighting & Shadow",
  "Color Theory",
  "Composition",
  "Character Design",
  "Environment Art",
];

const DIFFICULTIES = ["Beginner", "Intermediate", "Advanced"] as const;

export type Difficulty = (typeof DIFFICULTIES)[number];

export default function Prompt() {
  const { user } = useAuth();
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [difficulty, setDifficulty] = useState<Difficulty>("Intermediate");
  const [structuredPrompt, setStructuredPrompt] = useState<StructuredPrompt | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [favorites, setFavorites] = useState<Array<{ id: string; prompt_text: string; category: string | null }>>([]);
  const { toast } = useToast();

  const toggleCategory = (cat: string) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  const generatePrompts = async () => {
    if (selectedCategories.length === 0) {
      toast({ title: "Select categories", description: "Pick at least one art fundamental to generate prompts.", variant: "destructive" });
      return;
    }

    setIsGenerating(true);
    setIsAnimating(true);

    try {
      const { data, error } = await supabase.functions.invoke("generate-prompt", {
        body: { categories: selectedCategories, difficulty, mode: "structured" },
      });

      if (error) throw error;
      if (data?.error) {
        toast({ title: "AI Error", description: data.error, variant: "destructive" });
        setIsAnimating(false);
        setIsGenerating(false);
        return;
      }

      setTimeout(() => {
        setStructuredPrompt(data as StructuredPrompt);
        setIsAnimating(false);
        setIsGenerating(false);
      }, 300);
    } catch (err) {
      console.error("Failed to generate prompts:", err);
      // Fallback
      setTimeout(() => {
        setStructuredPrompt({
          category: selectedCategories[0],
          difficulty,
          warmup: "Draw 10 quick gesture sketches of everyday objects around you.",
          study: "Create a detailed study focusing on form and structure using basic shapes.",
          challenge: "Design an original composition applying today's fundamentals.",
        });
        setIsAnimating(false);
        setIsGenerating(false);
      }, 300);
    }
  };

  const savePrompt = async (type: "warmup" | "study" | "challenge") => {
    if (!user || !structuredPrompt) {
      toast({ title: "Sign in required", description: "Please sign in to save prompts." });
      return;
    }

    const text = structuredPrompt[type];
    const label = type === "warmup" ? "Warm-up" : type === "study" ? "Study" : "Challenge";

    const { data, error } = await supabase
      .from("prompt_favorites")
      .insert({ user_id: user.id, prompt_text: `[${label}] ${text}`, category: structuredPrompt.category })
      .select()
      .single();

    if (!error && data) {
      setFavorites((prev) => [data, ...prev]);
      toast({ title: "Saved! ⭐", description: `${label} prompt added to favorites` });
    }
  };

  const removeFavorite = async (id: string) => {
    await supabase.from("prompt_favorites").delete().eq("id", id);
    setFavorites((prev) => prev.filter((f) => f.id !== id));
  };

  // Fetch favorites on mount
  useState(() => {
    if (user) {
      supabase
        .from("prompt_favorites")
        .select("*")
        .order("created_at", { ascending: false })
        .then(({ data }) => setFavorites(data ?? []));
    }
  });

  return (
    <div className="min-h-screen gradient-hero pb-24 md:pb-8 md:pt-24">
      <div className="container mx-auto px-4 py-6 md:py-8 max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl gradient-primary shadow-glow mb-4">
            <Sparkles className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-2">
            Art Practice Studio
          </h1>
          <p className="text-muted-foreground text-lg flex items-center justify-center gap-2">
            <Wand2 className="w-4 h-4 text-primary" />
            AI-powered skill-building prompts
          </p>
        </div>

        {/* Category Selector */}
        <div className="mb-6 animate-slide-up">
          <PromptCategorySelector
            categories={CATEGORIES}
            selected={selectedCategories}
            onToggle={toggleCategory}
          />
        </div>

        {/* Difficulty Selector */}
        <div className="mb-6 animate-slide-up" style={{ animationDelay: "0.1s" }}>
          <PromptDifficultySelector
            difficulties={DIFFICULTIES as unknown as string[]}
            selected={difficulty}
            onSelect={(d) => setDifficulty(d as Difficulty)}
          />
        </div>

        {/* Generate Button */}
        <div className="mb-8 animate-slide-up" style={{ animationDelay: "0.15s" }}>
          <Button
            variant="gradient"
            size="lg"
            onClick={generatePrompts}
            disabled={isGenerating || selectedCategories.length === 0}
            className="w-full gap-2 text-base"
          >
            {isGenerating ? (
              <Sparkles className="w-5 h-5 animate-pulse" />
            ) : (
              <RefreshCw className={cn("w-5 h-5", isAnimating && "animate-spin")} />
            )}
            {isGenerating ? "Generating…" : "Generate Practice Prompts"}
          </Button>
        </div>

        {/* Structured Prompt Display */}
        {structuredPrompt && (
          <div className="mb-8 animate-slide-up" style={{ animationDelay: "0.2s" }}>
            <StructuredPromptDisplay
              prompt={structuredPrompt}
              isAnimating={isAnimating}
              onSave={savePrompt}
              onCopy={(text) => {
                navigator.clipboard.writeText(text);
                toast({ title: "Copied! ✨", description: "Prompt copied to clipboard" });
              }}
            />
          </div>
        )}

        {/* Favorites */}
        <PromptFavorites favorites={favorites} onRemove={removeFavorite} />
      </div>
    </div>
  );
}
