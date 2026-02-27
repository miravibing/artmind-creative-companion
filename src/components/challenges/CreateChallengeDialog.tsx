import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { X, Upload } from "lucide-react";

const categoriesOptions = ["Drawing", "Painting", "Digital Art", "Sculpture", "Photography", "Mixed Media"];
const difficultyOptions = ["Beginner", "Intermediate", "Advanced"];
const seasonOptions = ["Spring", "Summer", "Autumn", "Winter"];
const suggestedTags = ["portrait", "landscape", "abstract", "color-study", "sketch", "ink", "watercolor", "charcoal", "daily", "weekly"];

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: () => void;
}

export function CreateChallengeDialog({ open, onOpenChange, onCreated }: Props) {
  const { user } = useAuth();
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
  const [coverFile, setCoverFile] = useState<File | null>(null);

  const addTag = (tag: string) => {
    const t = tag.trim().toLowerCase();
    if (t && !tags.includes(t) && tags.length < 5) setTags([...tags, t]);
    setTagInput("");
  };

  const reset = () => {
    setTitle(""); setDescription(""); setCategory("Drawing"); setDifficulty("Beginner");
    setTags([]); setTagInput(""); setDeadline(""); setSeason(""); setCoverFile(null);
  };

  const handleSubmit = async () => {
    if (!user || !title.trim() || !description.trim()) {
      toast({ title: "Please fill in title and description", variant: "destructive" });
      return;
    }
    setLoading(true);

    let cover_image_url: string | null = null;
    if (coverFile) {
      const ext = coverFile.name.split(".").pop();
      const path = `${user.id}/${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage.from("challenge-covers").upload(path, coverFile);
      if (uploadError) {
        toast({ title: "Image upload failed", description: uploadError.message, variant: "destructive" });
        setLoading(false);
        return;
      }
      const { data: urlData } = supabase.storage.from("challenge-covers").getPublicUrl(path);
      cover_image_url = urlData.publicUrl;
    }

    const { error } = await supabase.from("challenges").insert({
      user_id: user.id,
      title: title.trim(),
      description: description.trim(),
      category,
      difficulty,
      tags,
      deadline: deadline || null,
      season: season || null,
      cover_image_url,
    });

    if (error) {
      toast({ title: "Failed to create challenge", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Challenge published!" });
      reset();
      onOpenChange(false);
      onCreated();
    }
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display">Create a Challenge</DialogTitle>
          <DialogDescription>Publish a new art challenge for the community</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input id="title" placeholder="e.g. 30-Day Ink Drawing Challenge" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={100} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="desc">Description *</Label>
            <Textarea id="desc" placeholder="Describe the challenge rules, goals, and inspiration..." value={description} onChange={(e) => setDescription(e.target.value)} maxLength={500} rows={3} />
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
              <Label htmlFor="deadline">Deadline (optional)</Label>
              <Input id="deadline" type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
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

          <div className="space-y-2">
            <Label>Cover Image (optional)</Label>
            <label className="flex items-center gap-2 p-3 border border-dashed border-border rounded-lg cursor-pointer hover:bg-secondary/50 transition-colors">
              <Upload className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">{coverFile ? coverFile.name : "Choose an image..."}</span>
              <input type="file" accept="image/*" className="hidden" onChange={(e) => setCoverFile(e.target.files?.[0] || null)} />
            </label>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button variant="gradient" onClick={handleSubmit} disabled={loading}>
            {loading ? "Publishing..." : "Publish Challenge"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
