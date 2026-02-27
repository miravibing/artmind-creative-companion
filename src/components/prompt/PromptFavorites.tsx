import { Heart } from "lucide-react";

interface Favorite {
  id: string;
  prompt_text: string;
  category: string | null;
}

interface Props {
  favorites: Favorite[];
  onRemove: (id: string) => void;
}

export function PromptFavorites({ favorites, onRemove }: Props) {
  if (favorites.length === 0) return null;

  return (
    <div className="animate-slide-up" style={{ animationDelay: "0.3s" }}>
      <h3 className="font-display text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
        <Heart className="w-5 h-5 text-accent" />
        Saved Prompts ({favorites.length})
      </h3>
      <div className="space-y-2">
        {favorites.map((fav) => (
          <div
            key={fav.id}
            className="bg-card rounded-xl border border-border/50 p-4 text-sm text-foreground flex items-start justify-between gap-3"
          >
            <div className="flex-1">
              {fav.category && (
                <span className="text-xs font-medium text-primary mr-2">{fav.category}</span>
              )}
              <span>{fav.prompt_text}</span>
            </div>
            <button
              onClick={() => onRemove(fav.id)}
              className="text-muted-foreground hover:text-destructive transition-colors shrink-0"
            >
              <Heart className="w-4 h-4 fill-current text-accent" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
