import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ChallengeCard } from "@/components/challenges/ChallengeCard";
import { CreateChallengeDialog } from "@/components/challenges/CreateChallengeDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Flame, Leaf, Clock, Bookmark } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Challenge {
  id: string;
  user_id: string;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  tags: string[];
  deadline: string | null;
  cover_image_url: string | null;
  season: string | null;
  created_at: string;
  likes_count: number;
  participants_count: number;
  comments_count: number;
  user_liked: boolean;
  user_bookmarked: boolean;
  user_participating: boolean;
  creator_username: string | null;
}

const categories = ["All", "Drawing", "Painting", "Digital Art", "Sculpture", "Photography", "Mixed Media"];
const tabs = [
  { id: "trending", label: "Trending", icon: Flame },
  { id: "seasonal", label: "Seasonal", icon: Leaf },
  { id: "new", label: "New", icon: Clock },
  { id: "bookmarked", label: "Bookmarked", icon: Bookmark },
] as const;

type TabId = (typeof tabs)[number]["id"];

function getSeason(): string {
  const month = new Date().getMonth();
  if (month >= 2 && month <= 4) return "Spring";
  if (month >= 5 && month <= 7) return "Summer";
  if (month >= 8 && month <= 10) return "Autumn";
  return "Winter";
}

export default function Challenges() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<TabId>("trending");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [createOpen, setCreateOpen] = useState(false);

  const fetchChallenges = useCallback(async () => {
    if (!user) { setLoading(false); return; }
    setLoading(true);

    const { data: rawChallenges, error } = await supabase
      .from("challenges")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast({ title: "Error loading challenges", description: error.message, variant: "destructive" });
      setLoading(false);
      return;
    }

    if (!rawChallenges || rawChallenges.length === 0) {
      setChallenges([]);
      setLoading(false);
      return;
    }

    const challengeIds = rawChallenges.map((c) => c.id);

    // Fetch creator usernames
    const creatorIds = [...new Set(rawChallenges.map((c) => c.user_id))];
    const { data: profilesData } = await supabase.from("profiles").select("id, username").in("id", creatorIds);
    const profileMap: Record<string, string> = {};
    (profilesData || []).forEach((p: any) => { profileMap[p.id] = p.username || "unknown"; });

    const [likesRes, participantsRes, commentsRes, userLikesRes, userBookmarksRes, userParticipatingRes] = await Promise.all([
      supabase.from("challenge_likes").select("challenge_id").in("challenge_id", challengeIds),
      supabase.from("challenge_participants").select("challenge_id").in("challenge_id", challengeIds),
      supabase.from("challenge_comments").select("challenge_id").in("challenge_id", challengeIds),
      supabase.from("challenge_likes").select("challenge_id").eq("user_id", user.id).in("challenge_id", challengeIds),
      supabase.from("challenge_bookmarks").select("challenge_id").eq("user_id", user.id),
      supabase.from("challenge_participants").select("challenge_id").eq("user_id", user.id).in("challenge_id", challengeIds),
    ]);

    const countBy = (data: { challenge_id: string }[] | null) => {
      const map: Record<string, number> = {};
      (data || []).forEach((r) => { map[r.challenge_id] = (map[r.challenge_id] || 0) + 1; });
      return map;
    };

    const likesCounts = countBy(likesRes.data);
    const participantsCounts = countBy(participantsRes.data);
    const commentsCounts = countBy(commentsRes.data);
    const userLikedSet = new Set((userLikesRes.data || []).map((r) => r.challenge_id));
    const userBookmarkedSet = new Set((userBookmarksRes.data || []).map((r) => r.challenge_id));
    const userParticipatingSet = new Set((userParticipatingRes.data || []).map((r) => r.challenge_id));

    const enriched: Challenge[] = rawChallenges.map((c) => ({
      ...c,
      tags: c.tags || [],
      likes_count: likesCounts[c.id] || 0,
      participants_count: participantsCounts[c.id] || 0,
      comments_count: commentsCounts[c.id] || 0,
      user_liked: userLikedSet.has(c.id),
      user_bookmarked: userBookmarkedSet.has(c.id),
      user_participating: userParticipatingSet.has(c.id),
      creator_username: profileMap[c.user_id] || null,
    }));

    setChallenges(enriched);
    setLoading(false);
  }, [user, toast]);

  useEffect(() => { fetchChallenges(); }, [fetchChallenges]);

  const filtered = challenges.filter((c) => {
    const matchesSearch = !search || c.title.toLowerCase().includes(search.toLowerCase()) || c.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === "All" || c.category === selectedCategory;
    if (!matchesSearch || !matchesCategory) return false;

    if (activeTab === "seasonal") return c.season === getSeason();
    if (activeTab === "bookmarked") return c.user_bookmarked;
    return true;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (activeTab === "trending") return (b.likes_count + b.participants_count) - (a.likes_count + a.participants_count);
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  if (!user) {
    return (
      <main className="min-h-screen pt-24 pb-24 md:pb-8 flex items-center justify-center">
        <p className="text-muted-foreground">Please sign in to view Community Challenges.</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen pt-24 pb-24 md:pb-8">
      <div className="container mx-auto px-4 md:px-6 max-w-6xl">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 animate-fade-in">
          <div>
            <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-2">
              Community Challenges
            </h1>
            <p className="text-muted-foreground">Discover, create, and participate in art challenges</p>
          </div>
          <Button variant="gradient" className="gap-2 shrink-0" onClick={() => setCreateOpen(true)}>
            <Plus className="w-4 h-4" />
            Create Challenge
          </Button>
        </div>

        {/* Search + Tabs */}
        <div className="space-y-4 mb-8 animate-slide-up" style={{ animationDelay: "0.1s" }}>
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search challenges..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {tabs.map((tab) => (
              <Button
                key={tab.id}
                variant={activeTab === tab.id ? "soft" : "ghost"}
                size="sm"
                onClick={() => setActiveTab(tab.id)}
                className={cn("gap-2", activeTab === tab.id && "shadow-soft")}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </Button>
            ))}
          </div>

          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <Badge
                key={cat}
                variant={selectedCategory === cat ? "default" : "outline"}
                className={cn(
                  "cursor-pointer transition-all",
                  selectedCategory === cat ? "bg-primary text-primary-foreground" : "hover:bg-secondary"
                )}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </Badge>
            ))}
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-72 rounded-xl bg-muted animate-pulse" />
            ))}
          </div>
        ) : sorted.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <p className="text-lg mb-2">No challenges found</p>
            <p className="text-sm">Be the first to create one!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sorted.map((challenge, i) => (
              <div key={challenge.id} className="animate-slide-up" style={{ animationDelay: `${0.05 * i}s` }}>
                <ChallengeCard challenge={challenge} onUpdate={fetchChallenges} />
              </div>
            ))}
          </div>
        )}
      </div>

      <CreateChallengeDialog open={createOpen} onOpenChange={setCreateOpen} onCreated={fetchChallenges} />
    </main>
  );
}
