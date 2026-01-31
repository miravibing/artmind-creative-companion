import { useState } from "react";
import { BookOpen, Play, FileText, Search, Star, Clock, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

interface Resource {
  id: number;
  title: string;
  description: string;
  type: "video" | "article" | "course";
  category: string;
  duration: string;
  rating: number;
  image: string;
}

const resources: Resource[] = [
  {
    id: 1,
    title: "Mastering Color Theory",
    description: "Learn how to create harmonious color palettes that evoke emotion.",
    type: "video",
    category: "Fundamentals",
    duration: "15 min",
    rating: 4.9,
    image: "🎨",
  },
  {
    id: 2,
    title: "Gesture Drawing Essentials",
    description: "Capture movement and life in your figure drawings with quick gesture techniques.",
    type: "course",
    category: "Drawing",
    duration: "2 hours",
    rating: 4.8,
  image: "✏️",
  },
  {
    id: 3,
    title: "Digital Painting Workflow",
    description: "Professional techniques for creating stunning digital illustrations.",
    type: "video",
    category: "Digital Art",
    duration: "25 min",
    rating: 4.7,
    image: "🖌️",
  },
  {
    id: 4,
    title: "Overcoming Creative Block",
    description: "Mental strategies and exercises to reignite your creative spark.",
    type: "article",
    category: "Wellness",
    duration: "8 min read",
    rating: 4.9,
    image: "💡",
  },
  {
    id: 5,
    title: "Anatomy for Artists",
    description: "Understanding human anatomy to draw more realistic figures.",
    type: "course",
    category: "Drawing",
    duration: "4 hours",
    rating: 4.8,
    image: "🦴",
  },
  {
    id: 6,
    title: "Building a Creative Routine",
    description: "How to establish habits that support your artistic growth.",
    type: "article",
    category: "Wellness",
    duration: "6 min read",
    rating: 4.6,
    image: "📅",
  },
];

const categories = ["All", "Fundamentals", "Drawing", "Digital Art", "Wellness"];
const types = ["all", "video", "article", "course"] as const;

export default function Resources() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedType, setSelectedType] = useState<typeof types[number]>("all");

  const filteredResources = resources.filter((resource) => {
    const matchesSearch =
      resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "All" || resource.category === selectedCategory;
    const matchesType = selectedType === "all" || resource.type === selectedType;
    return matchesSearch && matchesCategory && matchesType;
  });

  const getTypeIcon = (type: Resource["type"]) => {
    switch (type) {
      case "video":
        return <Play className="w-4 h-4" />;
      case "article":
        return <FileText className="w-4 h-4" />;
      case "course":
        return <BookOpen className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type: Resource["type"]) => {
    switch (type) {
      case "video":
        return "bg-accent/10 text-accent";
      case "article":
        return "bg-success/10 text-success";
      case "course":
        return "bg-primary/10 text-primary";
    }
  };

  return (
    <div className="min-h-screen gradient-hero pb-24 md:pb-8 md:pt-24">
      <div className="container mx-auto px-4 py-6 md:py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <div className="flex items-center gap-3 mb-2">
            <BookOpen className="w-8 h-8 text-success" />
            <h1 className="font-display text-3xl font-bold text-foreground">Learn & Grow</h1>
          </div>
          <p className="text-muted-foreground">
            Curated resources to elevate your artistic journey.
          </p>
        </div>

        {/* Search & Filters */}
        <div className="space-y-4 mb-8 animate-slide-up">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search resources..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl bg-card border border-border focus:ring-2 focus:ring-primary focus:outline-none text-foreground placeholder:text-muted-foreground shadow-soft"
            />
          </div>

          {/* Category Pills */}
          <div className="flex gap-2 flex-wrap">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={cn(
                  "px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300",
                  selectedCategory === category
                    ? "bg-primary text-primary-foreground shadow-soft"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                )}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Type Filters */}
          <div className="flex gap-2">
            {types.map((type) => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={cn(
                  "flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-all",
                  selectedType === type
                    ? "bg-secondary text-secondary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {type === "all" ? "All Types" : type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Resources Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredResources.map((resource, index) => (
            <div
              key={resource.id}
              className="bg-card rounded-2xl border border-border/50 shadow-card overflow-hidden hover:shadow-deep transition-all duration-300 hover:-translate-y-1 cursor-pointer animate-slide-up group"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Header with emoji/image */}
              <div className="h-24 bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center">
                <span className="text-5xl group-hover:scale-110 transition-transform duration-300">
                  {resource.image}
                </span>
              </div>

              <div className="p-5">
                {/* Type & Category */}
                <div className="flex items-center gap-2 mb-3">
                  <span
                    className={cn(
                      "flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium",
                      getTypeColor(resource.type)
                    )}
                  >
                    {getTypeIcon(resource.type)}
                    {resource.type}
                  </span>
                  <span className="text-xs text-muted-foreground">{resource.category}</span>
                </div>

                {/* Title & Description */}
                <h3 className="font-display text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                  {resource.title}
                </h3>
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                  {resource.description}
                </p>

                {/* Meta */}
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {resource.duration}
                    </span>
                    <span className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-warning fill-warning" />
                      {resource.rating}
                    </span>
                  </div>
                  <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredResources.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No resources found. Try adjusting your filters.</p>
          </div>
        )}
      </div>
    </div>
  );
}
