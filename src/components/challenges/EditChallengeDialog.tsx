import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { X, ImagePlus, Trash2 } from "lucide-react";
import type { Challenge } from "@/pages/Challenges";

const categoriesOptions = ["Drawing", "Painting", "Digital Art", "Sculpture", "Photography", "Mixed Media"];
const difficultyOptions = ["Beginner", "Intermediate", "Advanced"];
const seasonOptions = ["Spring", "Summer", "Autumn", "Winter"];
const suggestedTags = ["portrait", "landscape", "abstract", "color-study", "sketch", "ink", "watercolor", "charcoal", "daily", "weekly"];

interface Props {
  challenge: Challenge;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdated: () => void;
}

export function EditChallengeDialog({ challenge, open, onOpenChange, onUpdated }: Props) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Drawing");
  const [difficulty, setDifficulty] = useState("Beginner");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [deadline, setDeadline] = useState("");
  const [season, setSeason] = useState("");

  useEffect(() => {
    if (open) {
      setTitle(challenge.title);
      setDescription(challenge.description);
      setCategory(challenge.category);
      setDifficulty(challenge.difficulty);
      setTags(challenge.tags || []);
      setDeadline(challenge.deadline ? challenge.deadline.split("T")[0] : "");
      setSeason(challenge.season || "");
      setTagInput("");
    }
  }, [open, challenge]);

  const addTag = (tag: string) => {
    const t = tag.trim().toLowerCase();
    if (t && !tags.includes(t) && tags.length < 5) setTags([...tags, t]);
    setTagInput("");
  };

  const handleSubmit = async () => {
    if (!title.trim() || !description.trim()) {
      toast({ title: "Please fill in title and description", variant: "destructive" });
      return;
    }
    setLoading(true);

    const { error } = await supabase.from("challenges").update({
      title: title.trim(),
      description: description.trim(),
      category,
      difficulty,
      tags,
      deadline: deadline || null,
      season: season || null,
    }).eq("id", challenge.id);

    if (error) {
      toast({ title: "Failed to update challenge", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Challenge updated!" });
      onOpenChange(false);
      onUpdated();
    }
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display">Edit Challenge</DialogTitle>
          <DialogDescription>Update your challenge details</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="edit-title">Title *</Label>
            <Input id="edit-title" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={100} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-desc">Description *</Label>
            <Textarea id="edit-desc" value={description} onChange={(e) => setDescription(e.target.value)} maxLength={500} rows={3} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {categoriesOptions.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Difficulty</Label>
              <Select value={difficulty} onValueChange={setDifficulty}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {difficultyOptions.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Season (optional)</Label>
              <Select value={season} onValueChange={setSeason}>
                <SelectTrigger><SelectValue placeholder="None" /></SelectTrigger>
                <SelectContent>
                  {seasonOptions.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-deadline">Deadline (optional)</Label>
              <Input id="edit-deadline" type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Tags (up to 5)</Label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {suggestedTags.filter((t) => !tags.includes(t)).slice(0, 6).map((t) => (
                <Badge key={t} variant="outline" className="cursor-pointer hover:bg-secondary text-xs" onClick={() => addTag(t)}>{t}</Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Add custom tag..."
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag(tagInput); } }}
                maxLength={20}
              />
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {tags.map((t) => (
                  <Badge key={t} variant="secondary" className="gap-1">
                    {t}
                    <X className="w-3 h-3 cursor-pointer" onClick={() => setTags(tags.filter((x) => x !== t))} />
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button variant="gradient" onClick={handleSubmit} disabled={loading}>
            {loading ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
