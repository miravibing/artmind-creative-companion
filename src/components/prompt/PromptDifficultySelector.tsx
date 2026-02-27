import { cn } from "@/lib/utils";

interface Props {
  difficulties: string[];
  selected: string;
  onSelect: (d: string) => void;
}

export function PromptDifficultySelector({ difficulties, selected, onSelect }: Props) {
  return (
    <div className="bg-card rounded-2xl border border-border/50 shadow-card p-5">
      <h3 className="font-display text-base font-semibold text-foreground mb-3">
        📊 Difficulty
      </h3>
      <div className="flex gap-2">
        {difficulties.map((d) => (
          <button
            key={d}
            onClick={() => onSelect(d)}
            className={cn(
              "flex-1 py-2 rounded-xl text-sm font-medium transition-all duration-200 border",
              selected === d
                ? "bg-primary text-primary-foreground border-primary shadow-sm"
                : "bg-secondary text-secondary-foreground border-border/50 hover:border-primary/40"
            )}
          >
            {d}
          </button>
        ))}
      </div>
    </div>
  );
}
