import { cn } from "@/lib/utils";

interface Props {
  categories: string[];
  selected: string[];
  onToggle: (cat: string) => void;
}

export function PromptCategorySelector({ categories, selected, onToggle }: Props) {
  return (
    <div className="bg-card rounded-2xl border border-border/50 shadow-card p-5">
      <h3 className="font-display text-base font-semibold text-foreground mb-3">
        🎯 Art Fundamentals
      </h3>
      <p className="text-sm text-muted-foreground mb-4">Select one or more categories to practice</p>
      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => {
          const isSelected = selected.includes(cat);
          return (
            <button
              key={cat}
              onClick={() => onToggle(cat)}
              className={cn(
                "px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 border",
                isSelected
                  ? "bg-primary text-primary-foreground border-primary shadow-sm"
                  : "bg-secondary text-secondary-foreground border-border/50 hover:border-primary/40 hover:bg-primary/5"
              )}
            >
              {cat}
            </button>
          );
        })}
      </div>
    </div>
  );
}
