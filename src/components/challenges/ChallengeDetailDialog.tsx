import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Heart, Bookmark, Users, Send, Trash2, Calendar, Pencil } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import type { Challenge } from "@/pages/Challenges";
import { EditChallengeDialog } from "./EditChallengeDialog";

interface Comment {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
}

export function ChallengeDetailDialog({ challenge, open, onOpenChange, onUpdate }: { challenge: Challenge; open: boolean; onOpenChange: (o: boolean) => void; onUpdate: () => void }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [sending, setSending] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const isOwner = user?.id === challenge.user_id;

  useEffect(() => {
    if (open) fetchComments();
  }, [open]);

  const fetchComments = async () => {
    const { data } = await supabase
      .from("challenge_comments")
      .select("*")
      .eq("challenge_id", challenge.id)
      .order("created_at", { ascending: true });
    setComments(data || []);
  };

  const toggle = async (table: "challenge_likes" | "challenge_bookmarks" | "challenge_participants", active: boolean) => {
    if (!user) return;
    if (active) {
      await supabase.from(table).delete().eq("user_id", user.id).eq("challenge_id", challenge.id);
    } else {
      await supabase.from(table).insert({ user_id: user.id, challenge_id: challenge.id });
    }
    onUpdate();
  };

  const postComment = async () => {
    if (!user || !newComment.trim()) return;
    setSending(true);
    const { error } = await supabase.from("challenge_comments").insert({
      user_id: user.id,
      challenge_id: challenge.id,
      content: newComment.trim(),
    });
    if (error) toast({ title: "Error posting comment", variant: "destructive" });
    else { setNewComment(""); fetchComments(); onUpdate(); }
    setSending(false);
  };

  const deleteComment = async (id: string) => {
    await supabase.from("challenge_comments").delete().eq("id", id);
    fetchComments();
    onUpdate();
  };

  const deleteChallenge = async () => {
    setDeleting(true);
    const { error } = await supabase.from("challenges").delete().eq("id", challenge.id);
    if (error) {
      toast({ title: "Failed to delete challenge", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Challenge deleted" });
      setDeleteConfirmOpen(false);
      onOpenChange(false);
      onUpdate();
    }
    setDeleting(false);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          {challenge.cover_image_url && (
            <div className="-mx-6 -mt-6 mb-4 h-48 overflow-hidden rounded-t-lg">
              <img src={challenge.cover_image_url} alt={challenge.title} className="w-full h-full object-cover" />
            </div>
          )}

          <DialogHeader>
            <div className="flex items-start justify-between gap-2">
              <DialogTitle className="font-display text-xl">{challenge.title}</DialogTitle>
              {isOwner && (
                <div className="flex items-center gap-1 shrink-0">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setEditOpen(true)}>
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => setDeleteConfirmOpen(true)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>
            <DialogDescription className="sr-only">Challenge details</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {challenge.creator_username && (
              <p className="text-sm text-muted-foreground">Creator: <span className="text-foreground font-medium">@{challenge.creator_username}</span></p>
            )}

            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">{challenge.category}</Badge>
              <Badge variant="outline" className={cn(
                challenge.difficulty === "Beginner" && "text-success",
                challenge.difficulty === "Intermediate" && "text-warning",
                challenge.difficulty === "Advanced" && "text-accent"
              )}>{challenge.difficulty}</Badge>
              {challenge.season && <Badge variant="outline">{challenge.season}</Badge>}
              {challenge.tags.map((t) => <Badge key={t} variant="outline" className="text-xs">{t}</Badge>)}
            </div>

            {challenge.deadline && (
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Calendar className="w-4 h-4" />
                Due {format(new Date(challenge.deadline), "MMMM d, yyyy")}
              </div>
            )}

            <p className="text-foreground leading-relaxed">{challenge.description}</p>

            {/* Actions */}
            <div className="flex items-center gap-2 pt-2">
              <Button
                variant={challenge.user_liked ? "default" : "outline"}
                size="sm"
                className="gap-1.5"
                onClick={() => toggle("challenge_likes", challenge.user_liked)}
              >
                <Heart className={cn("w-4 h-4", challenge.user_liked && "fill-current")} />
                {challenge.likes_count}
              </Button>
              <Button
                variant={challenge.user_participating ? "default" : "outline"}
                size="sm"
                className={cn("gap-1.5", challenge.user_participating && "bg-success hover:bg-success/90 text-success-foreground")}
                onClick={() => toggle("challenge_participants", challenge.user_participating)}
              >
                <Users className="w-4 h-4" />
                {challenge.user_participating ? "Participating" : "Join"}
              </Button>
              <Button
                variant={challenge.user_bookmarked ? "default" : "outline"}
                size="sm"
                className="gap-1.5"
                onClick={() => toggle("challenge_bookmarks", challenge.user_bookmarked)}
              >
                <Bookmark className={cn("w-4 h-4", challenge.user_bookmarked && "fill-current")} />
                Save
              </Button>
            </div>

            {/* Comments */}
            <div className="space-y-3 pt-2 border-t border-border/50">
              <h4 className="font-display font-semibold text-foreground">Comments</h4>
              {comments.length === 0 ? (
                <p className="text-sm text-muted-foreground">No comments yet. Be the first!</p>
              ) : (
                <div className="space-y-3 max-h-48 overflow-y-auto">
                  {comments.map((c) => (
                    <div key={c.id} className="flex items-start gap-2 group">
                      <div className="flex-1 bg-secondary/50 rounded-lg p-3">
                        <p className="text-sm text-foreground">{c.content}</p>
                        <span className="text-xs text-muted-foreground">{format(new Date(c.created_at), "MMM d, h:mm a")}</span>
                      </div>
                      {user?.id === c.user_id && (
                        <button onClick={() => deleteComment(c.id)} className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
              <div className="flex gap-2">
                <Input
                  placeholder="Write a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") postComment(); }}
                  maxLength={300}
                />
                <Button size="icon" variant="ghost" onClick={postComment} disabled={sending || !newComment.trim()}>
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {isOwner && (
        <EditChallengeDialog
          challenge={challenge}
          open={editOpen}
          onOpenChange={setEditOpen}
          onUpdated={() => { onUpdate(); setEditOpen(false); }}
        />
      )}

      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Challenge</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{challenge.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={deleteChallenge}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
