import { useState } from "react";
import { Heart, Bookmark, Users, MessageCircle, Calendar } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import type { Challenge } from "@/pages/Challenges";
import { ChallengeDetailDialog } from "./ChallengeDetailDialog";

const difficultyColor: Record<string, string> = {
  Beginner: "bg-success/15 text-success border-success/30",
  Intermediate: "bg-warning/15 text-warning border-warning/30",
  Advanced: "bg-accent/15 text-accent border-accent/30",
};

export function ChallengeCard({ challenge, onUpdate }: { challenge: Challenge; onUpdate: () => void }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [detailOpen, setDetailOpen] = useState(false);

  const toggle = async (table: "challenge_likes" | "challenge_bookmarks" | "challenge_participants", active: boolean) => {
    if (!user) return;
    if (active) {
      await supabase.from(table).delete().eq("user_id", user.id).eq("challenge_id", challenge.id);
    } else {
      await supabase.from(table).insert({ user_id: user.id, challenge_id: challenge.id });
    }
    onUpdate();
  };

  return (
    <>
      <Card className="group overflow-hidden border-border/50 hover:shadow-card transition-all duration-300 cursor-pointer" onClick={() => setDetailOpen(true)}>
        {challenge.cover_image_url && (
          <div className="h-40 overflow-hidden">
            <img src={challenge.cover_image_url} alt={challenge.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          </div>
        )}
        <CardContent className={cn("p-5 space-y-3", !challenge.cover_image_url && "pt-5")}>
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-display font-semibold text-foreground text-lg leading-tight line-clamp-2">{challenge.title}</h3>
            <Badge variant="outline" className={cn("shrink-0 text-xs", difficultyColor[challenge.difficulty] || "")}>
              {challenge.difficulty}
            </Badge>
          </div>

          <p className="text-muted-foreground text-sm line-clamp-2">{challenge.description}</p>

          <div className="flex flex-wrap gap-1.5">
            <Badge variant="secondary" className="text-xs">{challenge.category}</Badge>
            {challenge.season && <Badge variant="outline" className="text-xs">{challenge.season}</Badge>}
            {challenge.tags.slice(0, 2).map((t) => (
              <Badge key={t} variant="outline" className="text-xs text-muted-foreground">{t}</Badge>
            ))}
          </div>

          {challenge.deadline && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Calendar className="w-3.5 h-3.5" />
              <span>Due {format(new Date(challenge.deadline), "MMM d, yyyy")}</span>
            </div>
          )}

          <div className="flex items-center justify-between pt-2 border-t border-border/50">
            <div className="flex items-center gap-3">
              <button
                onClick={(e) => { e.stopPropagation(); toggle("challenge_likes", challenge.user_liked); }}
                className={cn("flex items-center gap-1 text-sm transition-colors", challenge.user_liked ? "text-accent" : "text-muted-foreground hover:text-accent")}
              >
                <Heart className={cn("w-4 h-4", challenge.user_liked && "fill-current")} />
                {challenge.likes_count}
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); toggle("challenge_participants", challenge.user_participating); }}
                className={cn("flex items-center gap-1 text-sm transition-colors", challenge.user_participating ? "text-success" : "text-muted-foreground hover:text-success")}
              >
                <Users className="w-4 h-4" />
                {challenge.participants_count}
              </button>
              <span className="flex items-center gap-1 text-sm text-muted-foreground">
                <MessageCircle className="w-4 h-4" />
                {challenge.comments_count}
              </span>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); toggle("challenge_bookmarks", challenge.user_bookmarked); }}
              className={cn("transition-colors", challenge.user_bookmarked ? "text-primary" : "text-muted-foreground hover:text-primary")}
            >
              <Bookmark className={cn("w-4 h-4", challenge.user_bookmarked && "fill-current")} />
            </button>
          </div>
        </CardContent>
      </Card>

      <ChallengeDetailDialog challenge={challenge} open={detailOpen} onOpenChange={setDetailOpen} onUpdate={onUpdate} />
    </>
  );
}
