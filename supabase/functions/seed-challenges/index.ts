import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const EXTERNAL_CHALLENGES = [
  {
    title: "Inktober Daily Ink Challenge",
    source_url: "https://inktober.com",
    publisher_name: "Inktober Official",
    season: "Autumn",
    category: "Drawing",
    base_tags: ["ink", "daily", "sketch"],
  },
  {
    title: "Mermay: Mermaid Illustration Month",
    source_url: "https://mermay.com",
    publisher_name: "MerMay Community",
    season: "Spring",
    category: "Digital Art",
    base_tags: ["mermaid", "fantasy", "character-design"],
  },
  {
    title: "Huevember: Color Gradient Challenge",
    source_url: "https://twitter.com/hashtag/huevember",
    publisher_name: "Art Twitter Community",
    season: "Autumn",
    category: "Painting",
    base_tags: ["color-study", "daily", "gradient"],
  },
  {
    title: "Drawcember: Winter Art Advent",
    source_url: "https://twitter.com/hashtag/drawcember",
    publisher_name: "Drawcember Community",
    season: "Winter",
    category: "Drawing",
    base_tags: ["winter", "daily", "holiday"],
  },
  {
    title: "Abstract April: Non-Representational Art",
    source_url: "https://www.instagram.com/explore/tags/abstractapril",
    publisher_name: "Abstract Art Collective",
    season: "Spring",
    category: "Mixed Media",
    base_tags: ["abstract", "experimental", "mixed-media"],
  },
  {
    title: "Portrait Party: Weekly Face Studies",
    source_url: "https://www.reddit.com/r/SketchDaily",
    publisher_name: "r/SketchDaily",
    season: null,
    category: "Drawing",
    base_tags: ["portrait", "weekly", "face"],
  },
  {
    title: "Landscape Legends: Paint the World",
    source_url: "https://www.deviantart.com",
    publisher_name: "DeviantArt Featured",
    season: "Summer",
    category: "Painting",
    base_tags: ["landscape", "plein-air", "nature"],
  },
  {
    title: "Sculpt January: 31 Days of 3D",
    source_url: "https://sculptjanuary.com",
    publisher_name: "SculptJanuary",
    season: "Winter",
    category: "Sculpture",
    base_tags: ["3d", "daily", "sculpting"],
  },
  {
    title: "Photo-a-Day: Street Photography Sprint",
    source_url: "https://www.flickr.com/groups/streetphotography",
    publisher_name: "Flickr Street Collective",
    season: null,
    category: "Photography",
    base_tags: ["street", "daily", "documentary"],
  },
  {
    title: "Summer Sketchbook Tour",
    source_url: "https://www.instagram.com/explore/tags/sketchbooktour",
    publisher_name: "Sketchbook Community",
    season: "Summer",
    category: "Drawing",
    base_tags: ["sketchbook", "travel", "watercolor"],
  },
  {
    title: "Digital Dreamscapes: Surreal Art Month",
    source_url: "https://www.artstation.com/challenges",
    publisher_name: "ArtStation Challenges",
    season: null,
    category: "Digital Art",
    base_tags: ["surreal", "digital", "concept-art"],
  },
  {
    title: "Botanical Illustration Week",
    source_url: "https://www.instagram.com/explore/tags/botanicalart",
    publisher_name: "Botanical Artists Guild",
    season: "Spring",
    category: "Painting",
    base_tags: ["botanical", "watercolor", "nature"],
  },
];

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = claimsData.claims.sub as string;
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    // Check which challenges already exist to avoid duplicates
    const { data: existing } = await supabaseAdmin
      .from("challenges")
      .select("source_url")
      .eq("is_external", true);

    const existingUrls = new Set((existing || []).map((c: any) => c.source_url));
    const newChallenges = EXTERNAL_CHALLENGES.filter((c) => !existingUrls.has(c.source_url));

    if (newChallenges.length === 0) {
      return new Response(
        JSON.stringify({ message: "All external challenges already seeded", count: 0 }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const results: any[] = [];

    for (const challenge of newChallenges) {
      // Use AI to enhance description
      const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash-lite",
          messages: [
            {
              role: "system",
              content: `You are an art challenge curator. Write a compelling, structured description for an art challenge. The description should be:
- 2-3 sentences
- Clear and actionable
- Inspiring and motivating
- Include what participants will create and learn

Also assign a difficulty level (Beginner, Intermediate, or Advanced) based on the challenge complexity.

Return ONLY a JSON object: { "description": "...", "difficulty": "..." }`,
            },
            {
              role: "user",
              content: `Challenge: "${challenge.title}". Category: ${challenge.category}. Tags: ${challenge.base_tags.join(", ")}. Season: ${challenge.season || "year-round"}.`,
            },
          ],
        }),
      });

      let description = `Join the ${challenge.title} and push your creative boundaries! Create daily artworks and share your progress with the community.`;
      let difficulty = "Intermediate";

      if (aiResponse.ok) {
        const aiData = await aiResponse.json();
        const content = aiData.choices?.[0]?.message?.content ?? "";
        try {
          const cleaned = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
          const parsed = JSON.parse(cleaned);
          if (parsed.description) description = parsed.description;
          if (parsed.difficulty) difficulty = parsed.difficulty;
        } catch {
          // Use defaults
        }
      }

      // Generate cover image
      let coverImageUrl: string | null = null;
      try {
        const imageResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${LOVABLE_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-3.1-flash-image-preview",
            messages: [
              {
                role: "user",
                content: `Create a beautiful, artistic cover image for an art challenge called "${challenge.title}". Style: vibrant, inspiring, artistic. Category: ${challenge.category}. Tags: ${challenge.base_tags.join(", ")}. The image should look like a professional challenge banner with artistic elements. No text in the image.`,
              },
            ],
            modalities: ["image", "text"],
          }),
        });

        if (imageResponse.ok) {
          const imageData = await imageResponse.json();
          const base64Image = imageData.choices?.[0]?.message?.images?.[0]?.image_url?.url;

          if (base64Image) {
            // Extract base64 data and upload to storage
            const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, "");
            const imageBytes = Uint8Array.from(atob(base64Data), (c) => c.charCodeAt(0));
            const fileName = `external/${challenge.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now()}.png`;

            const { error: uploadError } = await supabaseAdmin.storage
              .from("challenge-covers")
              .upload(fileName, imageBytes, { contentType: "image/png", upsert: true });

            if (!uploadError) {
              const { data: urlData } = supabaseAdmin.storage.from("challenge-covers").getPublicUrl(fileName);
              coverImageUrl = urlData.publicUrl;
            }
          }
        }
      } catch (imgErr) {
        console.error("Image generation failed for:", challenge.title, imgErr);
      }

      // Calculate a deadline ~30 days from now
      const deadline = new Date();
      deadline.setDate(deadline.getDate() + 30);

      const { data: inserted, error: insertError } = await supabaseAdmin
        .from("challenges")
        .insert({
          user_id: userId,
          title: challenge.title,
          description,
          category: challenge.category,
          difficulty,
          tags: challenge.base_tags,
          season: challenge.season,
          source_url: challenge.source_url,
          is_external: true,
          publisher_name: challenge.publisher_name,
          cover_image_url: coverImageUrl,
          deadline: deadline.toISOString(),
        })
        .select()
        .single();

      if (insertError) {
        console.error("Insert error:", insertError);
      } else {
        results.push(inserted);
      }

      // Small delay to avoid rate limits
      await new Promise((r) => setTimeout(r, 1500));
    }

    return new Response(
      JSON.stringify({ message: `Seeded ${results.length} external challenges`, count: results.length }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("seed-challenges error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
