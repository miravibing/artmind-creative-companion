import { useState } from "react";
import { BookOpen, Play, FileText, Search, Clock, ExternalLink } from "lucide-react";
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
  platform: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  link: string;
  source: string;
}

const resources: Resource[] = [
  // Anatomy & Figure Drawing
  {
    id: 1,
    title: "Figure Drawing Basics",
    description: "A clear introduction to gesture and figure construction for beginners. Covers line of action, proportions, and quick poses.",
    type: "video",
    category: "Anatomy & Figure Drawing",
    duration: "12 min",
    rating: 4.9,
    image: "🦴",
    platform: "YouTube",
    level: "Beginner",
    link: "https://www.youtube.com/watch?v=74HR59yFZ7Y",
    source: "Proko",
  },
  {
    id: 2,
    title: "Anatomy for Artists – Full Course",
    description: "Comprehensive free anatomy course covering skeletal and muscular structure for realistic figure drawing.",
    type: "course",
    category: "Anatomy & Figure Drawing",
    duration: "3+ hours",
    rating: 4.8,
    image: "🏋️",
    platform: "YouTube",
    level: "Intermediate",
    link: "https://www.youtube.com/playlist?list=PLtG4P3lq4RDnBocKSAEgUvat3lIK1uSrW",
    source: "Proko",
  },
  // Perspective
  {
    id: 3,
    title: "Perspective Drawing – The Basics",
    description: "Learn 1-point, 2-point, and 3-point perspective with easy-to-follow demonstrations and exercises.",
    type: "video",
    category: "Perspective",
    duration: "18 min",
    rating: 4.8,
    image: "📐",
    platform: "YouTube",
    level: "Beginner",
    link: "https://www.youtube.com/watch?v=nAlCyQqEZSU",
    source: "Art of Wei",
  },
  {
    id: 4,
    title: "DrawABox – Perspective Lessons",
    description: "Structured free curriculum for building solid perspective and construction skills through deliberate practice.",
    type: "course",
    category: "Perspective",
    duration: "Self-paced",
    rating: 4.9,
    image: "📦",
    platform: "Website",
    level: "Beginner",
    link: "https://drawabox.com/lesson/1",
    source: "DrawABox",
  },
  // Form & Structure
  {
    id: 5,
    title: "How to Draw Basic Forms",
    description: "Break down complex subjects into simple 3D forms — spheres, boxes, and cylinders — to build confident drawings.",
    type: "video",
    category: "Form & Structure",
    duration: "15 min",
    rating: 4.7,
    image: "🧊",
    platform: "YouTube",
    level: "Beginner",
    link: "https://www.youtube.com/watch?v=3uEtdDvK6Xo",
    source: "ModerndayJames",
  },
  {
    id: 6,
    title: "Construction Drawing Techniques",
    description: "Learn to construct complex objects and characters from simple geometric primitives with a structured approach.",
    type: "article",
    category: "Form & Structure",
    duration: "10 min read",
    rating: 4.6,
    image: "🔷",
    platform: "Website",
    level: "Intermediate",
    link: "https://drawabox.com/lesson/2",
    source: "DrawABox",
  },
  // Lighting & Shadow
  {
    id: 7,
    title: "Understanding Light and Shadow",
    description: "Master the five elements of shading: cast shadow, core shadow, midtone, reflected light, and highlight.",
    type: "video",
    category: "Lighting & Shadow",
    duration: "20 min",
    rating: 4.9,
    image: "💡",
    platform: "YouTube",
    level: "Beginner",
    link: "https://www.youtube.com/watch?v=V3WmrWUEIJo",
    source: "Proko",
  },
  {
    id: 8,
    title: "Painting Light & Color – Marco Bucci",
    description: "A free 10-part video series on painting realistic light, color temperature, and atmospheric depth.",
    type: "course",
    category: "Lighting & Shadow",
    duration: "2+ hours",
    rating: 4.9,
    image: "🌅",
    platform: "YouTube",
    level: "Intermediate",
    link: "https://www.youtube.com/playlist?list=PLLmXZMqb_9sbNLM83NrM005vRQHw1yTKn",
    source: "Marco Bucci",
  },
  // Color Theory
  {
    id: 9,
    title: "Color Theory for Artists",
    description: "Learn how hue, saturation, and value work together to create harmonious and expressive color palettes.",
    type: "video",
    category: "Color Theory",
    duration: "14 min",
    rating: 4.8,
    image: "🎨",
    platform: "YouTube",
    level: "Beginner",
    link: "https://www.youtube.com/watch?v=AvgCkHrcj90",
    source: "Blender Guru",
  },
  {
    id: 10,
    title: "Color and Light – Free Resource Guide",
    description: "Comprehensive written guide to understanding warm/cool relationships, limited palettes, and color mixing.",
    type: "article",
    category: "Color Theory",
    duration: "12 min read",
    rating: 4.7,
    image: "🌈",
    platform: "Website",
    level: "Intermediate",
    link: "https://www.ctrlpaint.com/library/color",
    source: "Ctrl+Paint",
  },
  // Composition
  {
    id: 11,
    title: "Composition in Art – Beginner Guide",
    description: "Understand rule of thirds, leading lines, focal points, and visual flow to create stronger artwork.",
    type: "video",
    category: "Composition",
    duration: "11 min",
    rating: 4.7,
    image: "🖼️",
    platform: "YouTube",
    level: "Beginner",
    link: "https://www.youtube.com/watch?v=wg-So3ElA8g",
    source: "Alphonso Dunn",
  },
  {
    id: 12,
    title: "Advanced Composition Techniques",
    description: "Explore tangents, value grouping, visual hierarchy, and storytelling composition used by professional concept artists.",
    type: "video",
    category: "Composition",
    duration: "22 min",
    rating: 4.8,
    image: "🎯",
    platform: "YouTube",
    level: "Advanced",
    link: "https://www.youtube.com/watch?v=wg-So3ElA8g",
    source: "ModerndayJames",
  },
];

const categories = ["All", "Anatomy & Figure Drawing", "Perspective", "Form & Structure", "Lighting & Shadow", "Color Theory", "Composition"];
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
            <a
              href={resource.link}
              target="_blank"
              rel="noopener noreferrer"
              key={resource.id}
              className="bg-card rounded-2xl border border-border/50 shadow-card overflow-hidden hover:shadow-deep transition-all duration-300 hover:-translate-y-1 cursor-pointer animate-slide-up group block"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Header with emoji/image */}
              <div className="h-24 bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center">
                <span className="text-5xl group-hover:scale-110 transition-transform duration-300">
                  {resource.image}
                </span>
              </div>

              <div className="p-5">
                {/* Type, Category & Level */}
                <div className="flex items-center gap-2 mb-3 flex-wrap">
                  <span
                    className={cn(
                      "flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium",
                      getTypeColor(resource.type)
                    )}
                  >
                    {getTypeIcon(resource.type)}
                    {resource.type}
                  </span>
                  <span className="px-2 py-1 rounded-lg text-xs font-medium bg-muted text-muted-foreground">
                    {resource.level}
                  </span>
                </div>

                {/* Title & Description */}
                <h3 className="font-display text-lg font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">
                  {resource.title}
                </h3>
                <p className="text-xs text-muted-foreground mb-2">{resource.platform} · {resource.source}</p>
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
                    <span className="text-xs text-muted-foreground">{resource.category}</span>
                  </div>
                  <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
              </div>
            </a>
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
